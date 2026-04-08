'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Called immediately after Clerk signup to ensure a profile row exists.
// Uses explicit userId + nickname so it works before the Next.js session is
// fully established. Skips if a profile already exists (idempotent).
export async function syncProfile(
  userId: string,
  nickname: string
): Promise<{ error?: string }> {
  if (!userId || !nickname) return { error: 'Missing required fields' }

  const supabase = createClient()

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, nickname }, { onConflict: 'id', ignoreDuplicates: true })

  if (error) return { error: error.message }
  return {}
}

export async function getProfile(userId?: string) {
  const supabase = createClient()

  let targetId = userId

  if (!targetId) {
    const { userId: clerkUserId } = await auth()
    targetId = clerkUserId ?? undefined
  }

  if (!targetId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetId)
    .single()

  if (error) return null
  return data
}

export async function updateProfile(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return { error: '로그인이 필요합니다.' }

  const nickname = formData.get('nickname') as string
  const bio = formData.get('bio') as string | null
  const avatarFile = formData.get('avatar') as File | null

  const updates: { nickname: string; bio: string | null; avatar_url?: string } = {
    nickname,
    bio: bio || null,
  }

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop() ?? 'jpg'
    const path = `avatars/${userId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(path, avatarFile, { upsert: true })

    if (uploadError) return { error: uploadError.message }

    const {
      data: { publicUrl },
    } = supabase.storage.from('post-images').getPublicUrl(path)

    updates.avatar_url = publicUrl
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates }, { onConflict: 'id' })

  if (error) return { error: error.message }

  revalidatePath('/mypage')
  return {}
}

export async function getUserPosts(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('item_posts')
    .select(
      `
      id, title, category, status, chat_count, max_chat, created_at,
      post_images(url, display_order)
    `
    )
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  if (error) return []

  return (data ?? []).map((post: any) => ({
    ...post,
    image:
      (post.post_images ?? []).sort(
        (a: any, b: any) => a.display_order - b.display_order
      )[0]?.url ?? null,
  }))
}