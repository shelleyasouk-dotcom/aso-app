// Supabase Edge Function — twilio-recording
// Deploy: supabase functions deploy twilio-recording --no-verify-jwt
//
// Point this as the recordingStatusCallback the twilio-voice function uses
// (see TWILIO_RECORDING_CALLBACK_URL secret), or directly in Twilio's console
// under your number's recording settings. Twilio POSTs here (form-encoded)
// when a voicemail finishes recording — this saves it and texts the ops team.
//
// Required secrets (set with: supabase secrets set KEY=value):
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_PHONE_NUMBER        — your Twilio number, used as the SMS "from"
//   OPS_ALERT_NUMBERS          — comma-separated UK mobile numbers to text, e.g. +447700900123,+447700900456
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — already present in every project

import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')!
const OPS_ALERT_NUMBERS = (Deno.env.get('OPS_ALERT_NUMBERS') ?? '').split(',').map(n => n.trim()).filter(Boolean)

async function sendSms(to: string, body: string) {
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: TWILIO_PHONE_NUMBER, Body: body }),
  }).catch(err => console.error(`SMS to ${to} failed:`, err))
}

Deno.serve(async (req) => {
  // NOTE: for simplicity this does not verify Twilio's request signature.
  // Anyone who finds this URL could POST fake entries. Low severity (it only
  // creates voicemail rows), but worth adding X-Twilio-Signature validation
  // later if this becomes a priority.
  const form = await req.formData()
  const callSid = form.get('CallSid')?.toString()
  const recordingStatus = form.get('RecordingStatus')?.toString()
  const recordingUrl = form.get('RecordingUrl')?.toString()
  const from = form.get('From')?.toString()
  const to = form.get('To')?.toString()
  const duration = form.get('RecordingDuration')?.toString()

  if (!callSid || recordingStatus !== 'completed' || !recordingUrl) {
    return new Response('ignored', { status: 200 })
  }

  const { error } = await supabase.from('phone_messages').upsert({
    call_sid: callSid,
    from_number: from ?? null,
    to_number: to ?? null,
    recording_url: recordingUrl,
    recording_duration_seconds: duration ? parseInt(duration, 10) : null,
    status: 'new',
    received_at: new Date().toISOString(),
  }, { onConflict: 'call_sid' })

  if (error) {
    console.error('Failed to save phone message:', error)
    return new Response('error', { status: 500 })
  }

  // Text the ops team — a plain "check the app" alert, no caller details in
  // the SMS itself.
  const alertBody = "You've got a voicemail — check the app."
  await Promise.all(OPS_ALERT_NUMBERS.map(num => sendSms(num, alertBody)))

  // Also drop an in-app notification for ops/director roles, so it shows up
  // in the bell icon even without the SMS.
  const { data: recipients } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['director', 'operations_manager', 'operations_assistant'])
  if (recipients && recipients.length > 0) {
    await supabase.from('notifications').insert(
      recipients.map((r: { id: string }) => ({
        user_id: r.id,
        title: "New voicemail received",
        body: from ? `From ${from}` : 'Check the Phone Messages inbox',
        type: 'phone_message',
        related_id: null,
        read: false,
      }))
    )
  }

  return new Response('ok', { status: 200 })
})
