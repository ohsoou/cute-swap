import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ClerkUserCreatedEvent = {
  type: 'user.created'
  data: {
    id: string
    email_addresses: { email_address: string; id: string }[]
    primary_email_address_id: string
    image_url: string | null
    unsafe_metadata: { nickname?: string }
    first_name: string | null
    last_name: string | null
  }
}

type ClerkEvent = ClerkUserCreatedEvent | { type: string; data: unknown }

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload = await req.text()

  let event: ClerkEvent
  try {
    const wh = new Webhook(webhookSecret)
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkEvent
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  if (event.type !== 'user.created') {
    return NextResponse.json({ received: true })
  }

  const { id, email_addresses, primary_email_address_id, image_url, unsafe_metadata, first_name, last_name } =
    (event as ClerkUserCreatedEvent).data

  const primaryEmail = email_addresses.find((e) => e.id === primary_email_address_id)?.email_address ?? null

  // Derive nickname: prefer unsafeMetadata (email signup), then full name, then email prefix
  const nickname =
    unsafe_metadata?.nickname ||
    [first_name, last_name].filter(Boolean).join(' ') ||
    (primaryEmail ? primaryEmail.split('@')[0] : 'user')

  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id,
        email: primaryEmail ?? undefined,
        nickname,
        avatar_url: image_url ?? undefined,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )

  if (error) {
    console.error('[clerk-webhook] profile sync failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}