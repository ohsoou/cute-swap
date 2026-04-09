'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export type PostWithDetails = {
  id: number
  title: string
  description: string
  category: string
  condition: string
  status: 'posting' | 'chat_closed' | 'in_progress' | 'completed'
  chat_count: number
  max_chat: number
  created_at: string
  author_id: string
  profiles: { nickname: string; avatar_url: string | null } | null
  post_images: { url: string; display_order: number }[]
  have_tags: string[]
  want_tags: string[]
}

export async function getPosts(params?: {
  search?: string
  category?: string
  sortBy?: 'latest' | 'popular' | 'chat'
  limit?: number
  offset?: number
}): Promise<PostWithDetails[]> {
  const supabase = createClient()

  let query = supabase
    .from('item_posts')
    .select(
      `
      id, title, description, category, condition, status,
      chat_count, max_chat, created_at, author_id,
      profiles(nickname, avatar_url),
      post_images(url, display_order),
      item_post_tags(tag_type, tags(name))
    `
    )

  if (params?.category && params.category !== 'all') {
    query = query.eq('category', params.category)
  }

  if (params?.search) {
    query = query.ilike('title', `%${params.search}%`)
  }

  if (params?.sortBy === 'popular' || params?.sortBy === 'chat') {
    query = query.order('chat_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  if (params?.limit !== undefined) {
    const offset = params.offset ?? 0
    query = query.range(offset, offset + params.limit - 1)
  }

  const { data, error } = await query

  if (error || !data) return []

  return data.map((post: any) => ({
    ...post,
    post_images: (post.post_images ?? []).sort(
      (a: any, b: any) => a.display_order - b.display_order
    ),
    have_tags: (post.item_post_tags ?? [])
      .filter((t: any) => t.tag_type === 'have')
      .map((t: any) => t.tags?.name)
      .filter(Boolean),
    want_tags: (post.item_post_tags ?? [])
      .filter((t: any) => t.tag_type === 'want')
      .map((t: any) => t.tags?.name)
      .filter(Boolean),
  }))
}

export async function getPostById(
  id: string | number
): Promise<PostWithDetails | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('item_posts')
    .select(
      `
      id, title, description, category, condition, status,
      chat_count, max_chat, created_at, author_id,
      profiles(nickname, avatar_url),
      post_images(url, display_order),
      item_post_tags(tag_type, tags(name))
    `
    )
    .eq('id', Number(id))
    .single()

  if (error || !data) return null

  return {
    ...(data as any),
    post_images: ((data as any).post_images ?? []).sort(
      (a: any, b: any) => a.display_order - b.display_order
    ),
    have_tags: ((data as any).item_post_tags ?? [])
      .filter((t: any) => t.tag_type === 'have')
      .map((t: any) => t.tags?.name)
      .filter(Boolean),
    want_tags: ((data as any).item_post_tags ?? [])
      .filter((t: any) => t.tag_type === 'want')
      .map((t: any) => t.tags?.name)
      .filter(Boolean),
  }
}

async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  userId: string
): Promise<{ path: string; url: string }> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('post-images')
    .upload(path, file)

  if (error) throw new Error(`Image upload failed: ${error.message}`)

  const {
    data: { publicUrl },
  } = supabase.storage.from('post-images').getPublicUrl(path)

  return { path, url: publicUrl }
}

async function upsertTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tagNames: string[],
  postId: number,
  tagType: 'have' | 'want'
) {
  for (const name of tagNames) {
    if (!name.trim()) continue

    // Upsert the tag
    const { data: tag } = await supabase
      .from('tags')
      .upsert({ name: name.trim() }, { onConflict: 'name' })
      .select('id')
      .single()

    if (tag) {
      await supabase
        .from('item_post_tags')
        .upsert({ post_id: postId, tag_id: tag.id, tag_type: tagType })
    }
  }
}

export async function createPost(
  formData: FormData
): Promise<{ error?: string } | never> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return { error: '로그인이 필요합니다.' }
  const user = { id: userId }

  // Ensure profile row exists (webhook may not have fired for this user)
  const clerkUser = await currentUser()
  if (clerkUser) {
    const primaryEmail = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress
    const nickname =
      (clerkUser.unsafeMetadata?.nickname as string | undefined) ||
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      primaryEmail?.split('@')[0] ||
      'user'
    await supabase.from('profiles').upsert(
      { id: userId, email: primaryEmail, nickname, avatar_url: clerkUser.imageUrl },
      { onConflict: 'id', ignoreDuplicates: true }
    )
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const condition = formData.get('condition') as string
  const wantTagsRaw = formData.get('wantTags') as string
  const haveTagsRaw = formData.get('haveTags') as string
  const imageFiles = (formData.getAll('images') as File[]).filter((f) => f.size > 0)

  // Server-side validation
  if (!title || title.length < 1 || title.length > 100) return { error: '제목은 1~100자 이내로 입력해주세요.' }
  if (!category) return { error: '카테고리를 선택해주세요.' }
  if (!condition) return { error: '상품 상태를 선택해주세요.' }
  if (!description || description.length < 10 || description.length > 2000) return { error: '설명은 10~2000자 이내로 입력해주세요.' }
  if (imageFiles.length < 1 || imageFiles.length > 5) return { error: '사진을 1~5장 추가해주세요.' }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  for (const file of imageFiles) {
    if (!ALLOWED_TYPES.includes(file.type)) return { error: `${file.name}: jpg, png, webp 형식만 업로드 가능합니다.` }
    if (file.size > 5 * 1024 * 1024) return { error: `${file.name}: 5MB 이하의 파일만 업로드 가능합니다.` }
  }

  const wantTags = wantTagsRaw ? wantTagsRaw.split(',').filter(Boolean) : []
  const haveTags = haveTagsRaw ? haveTagsRaw.split(',').filter(Boolean) : []

  // Insert post first
  const { data: post, error: postError } = await supabase
    .from('item_posts')
    .insert({ author_id: user.id, title, description, category, condition })
    .select('id')
    .single()

  if (postError || !post) return { error: postError?.message ?? '게시글 생성 실패' }

  // Upload images with cleanup on failure
  const uploadedPaths: string[] = []
  const uploadedUrls: string[] = []
  for (const file of imageFiles) {
    try {
      const { path, url } = await uploadImage(supabase, file, user.id)
      uploadedPaths.push(path)
      uploadedUrls.push(url)
    } catch (e: any) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from('post-images').remove(uploadedPaths)
      }
      await supabase.from('item_posts').delete().eq('id', post.id)
      return { error: e.message }
    }
  }

  // Insert post images
  if (uploadedUrls.length > 0) {
    await supabase.from('post_images').insert(
      uploadedUrls.map((url, i) => ({
        post_id: post.id,
        url,
        display_order: i,
      }))
    )
  }

  // Insert tags
  await upsertTags(supabase, haveTags, post.id, 'have')
  await upsertTags(supabase, wantTags, post.id, 'want')

  revalidatePath('/posts')
  redirect(`/posts/${post.id}`)
}

export async function updatePost(
  id: string | number,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return { error: '로그인이 필요합니다.' }
  const user = { id: userId }

  // Ownership check
  const { data: existing } = await supabase
    .from('item_posts')
    .select('author_id')
    .eq('id', Number(id))
    .single()

  if (!existing || existing.author_id !== user.id) {
    return { error: '수정 권한이 없습니다.' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const condition = formData.get('condition') as string
  const wantTagsRaw = formData.get('wantTags') as string
  const haveTagsRaw = formData.get('haveTags') as string
  const imageFiles = formData.getAll('images') as File[]
  const keepImageUrls = (formData.get('keepImages') as string)
    ?.split(',')
    .filter(Boolean) ?? []

  const { error: updateError } = await supabase
    .from('item_posts')
    .update({ title, description, category, condition, updated_at: new Date().toISOString() })
    .eq('id', Number(id))

  if (updateError) return { error: updateError.message }

  // Replace tags: delete old, insert new
  await supabase.from('item_post_tags').delete().eq('post_id', Number(id))

  const wantTags = wantTagsRaw ? wantTagsRaw.split(',').filter(Boolean) : []
  const haveTags = haveTagsRaw ? haveTagsRaw.split(',').filter(Boolean) : []
  await upsertTags(supabase, haveTags, Number(id), 'have')
  await upsertTags(supabase, wantTags, Number(id), 'want')

  // Handle images: delete removed ones, add new ones
  const { data: currentImages } = await supabase
    .from('post_images')
    .select('id, url')
    .eq('post_id', Number(id))

  if (currentImages) {
    const toDelete = currentImages.filter((img) => !keepImageUrls.includes(img.url))
    if (toDelete.length > 0) {
      // Delete from Storage
      const storagePaths = toDelete
        .map((img) => {
          const marker = 'post-images/'
          const idx = img.url.indexOf(marker)
          return idx !== -1 ? img.url.slice(idx + marker.length) : null
        })
        .filter(Boolean) as string[]
      if (storagePaths.length > 0) {
        await supabase.storage.from('post-images').remove(storagePaths)
      }
      await supabase
        .from('post_images')
        .delete()
        .in('id', toDelete.map((i) => i.id))
    }
  }

  let nextOrder = keepImageUrls.length
  for (const file of imageFiles) {
    if (file.size > 0) {
      try {
        const { url } = await uploadImage(supabase, file, user.id)
        await supabase.from('post_images').insert({
          post_id: Number(id),
          url,
          display_order: nextOrder++,
        })
      } catch (e: any) {
        return { error: e.message }
      }
    }
  }

  revalidatePath(`/posts/${id}`)
  revalidatePath('/posts')
  return {}
}

export async function deletePost(
  id: string | number
): Promise<{ error?: string } | never> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return { error: '로그인이 필요합니다.' }
  const user = { id: userId }

  const { data: existing } = await supabase
    .from('item_posts')
    .select('author_id')
    .eq('id', Number(id))
    .single()

  if (!existing || existing.author_id !== user.id) {
    return { error: '삭제 권한이 없습니다.' }
  }

  // Delete images from Storage before deleting the post
  const { data: images } = await supabase
    .from('post_images')
    .select('url')
    .eq('post_id', Number(id))

  if (images && images.length > 0) {
    const storagePaths = images
      .map((img) => {
        const marker = 'post-images/'
        const idx = img.url.indexOf(marker)
        return idx !== -1 ? img.url.slice(idx + marker.length) : null
      })
      .filter(Boolean) as string[]
    if (storagePaths.length > 0) {
      await supabase.storage.from('post-images').remove(storagePaths)
    }
  }

  const { error } = await supabase
    .from('item_posts')
    .delete()
    .eq('id', Number(id))

  if (error) return { error: error.message }

  revalidatePath('/posts')
  redirect('/mypage')
}

export type PopularTag = { name: string; count: number }

export async function getPopularTags(limit = 10): Promise<PopularTag[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('item_post_tags')
    .select('tags(name)')

  if (error || !data) return []

  const countMap = new Map<string, number>()
  for (const row of data as any[]) {
    const name = row.tags?.name
    if (name) countMap.set(name, (countMap.get(name) ?? 0) + 1)
  }

  return Array.from(countMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
