'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getUnreadCount(): Promise<number> {
  const supabase = createClient()
  const { userId } = await auth()
  if (!userId) return 0

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  return count ?? 0
}

export async function getNotifications() {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}

export async function markAsRead(
  notificationId: number
): Promise<{ error?: string }> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return { error: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)

  if (error) return { error: error.message }
  revalidatePath('/notifications')
  return {}
}

export async function markAllAsRead(): Promise<{ error?: string }> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return { error: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) return { error: error.message }
  revalidatePath('/notifications')
  return {}
}

export async function deleteNotification(
  notificationId: number
): Promise<{ error?: string }> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return { error: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId)

  if (error) return { error: error.message }
  revalidatePath('/notifications')
  return {}
}