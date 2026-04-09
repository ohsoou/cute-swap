'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export type ChatRoomWithDetails = {
  id: number
  status: 'active' | 'agreed' | 'ended'
  post_id: number
  post_title: string | null
  post_image: string | null
  partner_id: string
  partner_nickname: string
  partner_avatar: string | null
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  created_at: string
}

export async function createChatRoom(
  postId: number
): Promise<{ error?: string } | never> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return { error: '로그인이 필요합니다.' }

  // Check for existing room (prevent duplicates)
  const { data: existing } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('post_id', postId)
    .eq('requester_id', userId)
    .maybeSingle()

  if (existing) {
    redirect(`/chat/${existing.id}`)
  }

  // Use atomic RPC to enforce 3-chat limit safely
  const { data: roomId, error: rpcError } = await supabase.rpc(
    'create_chat_room',
    { p_post_id: postId, p_requester_id: userId }
  )

  if (rpcError) {
    if (rpcError.message.includes('chat_limit_reached')) {
      return { error: '채팅 신청이 마감되었습니다. (최대 3개)' }
    }
    return { error: rpcError.message }
  }

  // Send initial system message
  await supabase.from('chat_messages').insert({
    room_id: roomId,
    sender_id: userId,
    content: '채팅이 시작되었습니다. 교환 조건을 협의해보세요!',
    type: 'system',
  })

  // Notify post owner
  const { data: post } = await supabase
    .from('item_posts')
    .select('owner_id:author_id, title')
    .eq('id', postId)
    .single()

  if (post) {
    await supabase.from('notifications').insert({
      user_id: (post as any).owner_id,
      type: 'chat',
      title: '새 채팅 요청',
      message: `"${(post as any).title}" 게시글에 새로운 교환 채팅 요청이 왔습니다.`,
      link: `/chat/${roomId}`,
    })
  }

  redirect(`/chat/${roomId}`)
}

export async function getChatRooms(
  status?: 'active' | 'agreed' | 'ended'
): Promise<ChatRoomWithDetails[]> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return []

  let query = supabase
    .from('chat_rooms')
    .select(
      `
      id, status, post_id, created_at,
      requester_id, owner_id,
      item_posts(title, post_images(url, display_order)),
      requester:profiles!chat_rooms_requester_id_fkey(nickname, avatar_url),
      owner:profiles!chat_rooms_owner_id_fkey(nickname, avatar_url),
      chat_messages(content, created_at, sender_id, is_read)
    `
    )
    .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error || !data) return []

  return data.map((room: any) => {
    const isRequester = room.requester_id === userId
    const partner = isRequester ? room.owner : room.requester

    const images = room.item_posts?.post_images ?? []
    const sortedImages = [...images].sort(
      (a: any, b: any) => a.display_order - b.display_order
    )

    const messages = room.chat_messages ?? []
    const lastMsg = [...messages].sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]

    const unread_count = messages.filter(
      (m: any) => m.sender_id !== userId && !m.is_read
    ).length

    return {
      id: room.id,
      status: room.status,
      post_id: room.post_id,
      post_title: room.item_posts?.title ?? null,
      post_image: sortedImages[0]?.url ?? null,
      partner_id: isRequester ? room.owner_id : room.requester_id,
      partner_nickname: partner?.nickname ?? '알 수 없음',
      partner_avatar: partner?.avatar_url ?? null,
      last_message: lastMsg?.content ?? null,
      last_message_at: lastMsg?.created_at ?? null,
      unread_count,
      created_at: room.created_at,
    }
  })
}

export async function getChatRoom(roomId: number) {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return null

  const { data, error } = await supabase
    .from('chat_rooms')
    .select(
      `
      id, status, post_id, requester_id, owner_id, created_at,
      item_posts(id, title, status, post_images(url, display_order)),
      requester:profiles!chat_rooms_requester_id_fkey(id, nickname, avatar_url),
      owner:profiles!chat_rooms_owner_id_fkey(id, nickname, avatar_url)
    `
    )
    .eq('id', roomId)
    .single()

  if (error || !data) return null

  const room = data as any

  // Authorization: only participants can view the chat room
  if (room.owner_id !== userId && room.requester_id !== userId) return null

  const isRequester = room.requester_id === userId
  const partner = isRequester ? room.owner : room.requester

  const images = room.item_posts?.post_images ?? []
  const sortedImages = [...images].sort(
    (a: any, b: any) => a.display_order - b.display_order
  )

  return {
    id: room.id,
    status: room.status as 'active' | 'agreed' | 'ended',
    post: {
      id: room.item_posts?.id,
      title: room.item_posts?.title,
      status: room.item_posts?.status,
      image: sortedImages[0]?.url ?? null,
    },
    partner: {
      id: partner?.id,
      nickname: partner?.nickname ?? '알 수 없음',
      avatar_url: partner?.avatar_url ?? null,
    },
    currentUserId: userId,
    isOwner: room.owner_id === userId,
  }
}

export async function getChatMessages(roomId: number) {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return []

  // Authorization: verify user is a participant in this room
  const { data: room } = await supabase
    .from('chat_rooms')
    .select('owner_id, requester_id')
    .eq('id', roomId)
    .single()

  if (!room || (room.owner_id !== userId && room.requester_id !== userId)) {
    return []
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, room_id, sender_id, content, type, is_read, created_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  if (error) return []
  return data ?? []
}

export async function sendMessage(
  roomId: number,
  content: string,
  type: 'text' | 'image' | 'system' = 'text'
): Promise<{ error?: string }> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return { error: '로그인이 필요합니다.' }

  const { error } = await supabase.from('chat_messages').insert({
    room_id: roomId,
    sender_id: userId,
    content,
    type,
  })

  if (error) return { error: error.message }
  return {}
}

export async function agreeChatRoom(
  roomId: number
): Promise<{ error?: string }> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return { error: '로그인이 필요합니다.' }

  // Get room info
  const { data: room } = await supabase
    .from('chat_rooms')
    .select('post_id, requester_id, owner_id, status')
    .eq('id', roomId)
    .single()

  if (!room) return { error: '채팅방을 찾을 수 없습니다.' }
  if (room.requester_id !== userId && room.owner_id !== userId) {
    return { error: '권한이 없습니다.' }
  }

  const { error } = await supabase
    .from('chat_rooms')
    .update({ status: 'agreed' })
    .eq('id', roomId)

  if (error) return { error: error.message }

  // Update post status to in_progress
  await supabase
    .from('item_posts')
    .update({ status: 'in_progress' })
    .eq('id', room.post_id)

  // System message
  await supabase.from('chat_messages').insert({
    room_id: roomId,
    sender_id: userId,
    content: '교환 합의가 완료되었습니다. 🎉',
    type: 'system',
  })

  // Notify the other participant
  const otherUserId =
    room.requester_id === userId ? room.owner_id : room.requester_id
  await supabase.from('notifications').insert({
    user_id: otherUserId,
    type: 'trade',
    title: '교환 합의 완료',
    message: '상대방이 교환에 합의했습니다.',
    link: `/chat/${roomId}`,
  })

  revalidatePath(`/chat/${roomId}`)
  return {}
}

export async function endChatRoom(
  roomId: number
): Promise<{ error?: string }> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return { error: '로그인이 필요합니다.' }

  const { data: room } = await supabase
    .from('chat_rooms')
    .select('post_id, requester_id, owner_id')
    .eq('id', roomId)
    .single()

  if (!room) return { error: '채팅방을 찾을 수 없습니다.' }
  if (room.requester_id !== userId && room.owner_id !== userId) {
    return { error: '권한이 없습니다.' }
  }

  await supabase.from('chat_rooms').update({ status: 'ended' }).eq('id', roomId)

  // Decrement chat_count to re-open slot
  await supabase.rpc('decrement_chat_count', { p_post_id: room.post_id })

  await supabase.from('chat_messages').insert({
    room_id: roomId,
    sender_id: userId,
    content: '채팅이 종료되었습니다.',
    type: 'system',
  })

  revalidatePath(`/chat/${roomId}`)
  return {}
}