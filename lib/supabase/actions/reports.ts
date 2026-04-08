'use server'

import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function submitReport(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createClient()
  const { userId } = await auth()

  if (!userId) return { error: '로그인이 필요합니다.' }

  const targetType = formData.get('targetType') as 'post' | 'user' | 'chat'
  const targetId = formData.get('targetId') as string
  const reason = formData.get('reason') as string
  const detail = formData.get('detail') as string | null

  if (!reason) return { error: '신고 사유를 선택해주세요.' }

  const { error } = await supabase.from('reports').insert({
    reporter_id: userId,
    target_type: targetType || 'post',
    target_id: targetId || '',
    reason,
    detail: detail || null,
  })

  if (error) return { error: error.message }
  return {}
}