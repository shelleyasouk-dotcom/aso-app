// Supabase Edge Function — twilio-transcription
//
// Twilio calls this once speech-to-text on a voicemail finishes (a few
// seconds after the recording itself). Saves the transcribed text and
// texts the ops team the actual message, not just "check the app".
//
// Required secrets: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER,
// OPS_ALERT_NUMBERS, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

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
  const form = await req.formData()
  const callSid = form.get('CallSid')?.toString()
  const transcriptionStatus = form.get('TranscriptionStatus')?.toString()
  const transcriptionText = form.get('TranscriptionText')?.toString()
  const from = form.get('From')?.toString()

  if (!callSid || transcriptionStatus !== 'completed' || !transcriptionText) {
    return new Response('ignored', { status: 200 })
  }

  await supabase.from('phone_messages').update({ transcription: transcriptionText }).eq('call_sid', callSid)

  const fromLine = from ? `From ${from}: ` : ''
  const alertBody = `Voicemail: ${fromLine}"${transcriptionText}"`.slice(0, 1500)
  await Promise.all(OPS_ALERT_NUMBERS.map(num => sendSms(num, alertBody)))

  return new Response('ok', { status: 200 })
})
