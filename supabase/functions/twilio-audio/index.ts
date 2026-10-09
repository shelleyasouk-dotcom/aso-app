// Supabase Edge Function — twilio-audio
//
// Proxies a voicemail recording from Twilio (which requires Twilio account
// credentials to fetch) so it can be played in the app. The browser can't
// supply Twilio's auth itself, so this function fetches the file
// server-side and streams it back — only to logged-in ops/director users.
//
// Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (already present in every project)
// Keep "Enforce JWT Verification" ON for this function (unlike twilio-voice
// and twilio-recording) — it must only serve logged-in app users.

import { createClient } from 'npm:@supabase/supabase-js@2'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('unauthorized', { status: 401 })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['director', 'operations_manager', 'operations_assistant'].includes(profile.role)) {
    return new Response('forbidden', { status: 403 })
  }

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return new Response('missing id', { status: 400 })

  const { data: message } = await supabase.from('phone_messages').select('recording_url').eq('id', id).single()
  if (!message?.recording_url) return new Response('not found', { status: 404 })

  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
  const twilioRes = await fetch(`${message.recording_url}.mp3`, {
    headers: { Authorization: `Basic ${auth}` },
  })
  if (!twilioRes.ok || !twilioRes.body) return new Response('failed to fetch recording', { status: 502 })

  return new Response(twilioRes.body, { headers: { 'Content-Type': 'audio/mpeg' } })
})
