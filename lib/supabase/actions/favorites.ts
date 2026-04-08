'use server'

import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function toggleFavorite(
  postId: number
): Promise<{ error?: string; isFavorited: boolean }> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return { error: '로그인이 필요합니다.', isFavorited: false }

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle()

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id)
    return { isFavorited: false }
  } else {
    await supabase
      .from('favorites')
      .insert({ user_id: userId, post_id: postId })
    return { isFavorited: true }
  }
}

export async function isFavorited(postId: number): Promise<boolean> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return false

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle()

  return !!data
}

export async function getFavorites() {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return []

  const { data, error } = await supabase
    .from('favorites')
    .select(
      `
      id, post_id, created_at,
      item_posts(
        id, title, category, status, chat_count, max_chat,
        profiles(nickname),
        post_images(url, display_order)
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((fav: any) => ({
    id: fav.id,
    post_id: fav.post_id,
    post: {
      id: fav.item_posts?.id,
      title: fav.item_posts?.title,
      category: fav.item_posts?.category,
      status: fav.item_posts?.status,
      chat_count: fav.item_posts?.chat_count,
      max_chat: fav.item_posts?.max_chat,
      author_nickname: fav.item_posts?.profiles?.nickname,
      image:
        (fav.item_posts?.post_images ?? []).sort(
          (a: any, b: any) => a.display_order - b.display_order
        )[0]?.url ?? null,
    },
  }))
}