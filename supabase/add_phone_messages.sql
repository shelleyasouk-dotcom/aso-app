-- Phone messages (voicemail inbox) for the Twilio answering-service integration.
-- Run in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.phone_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid text UNIQUE NOT NULL,
  from_number text,
  to_number text,
  recording_url text,
  recording_duration_seconds integer,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'handled')),
  handled_by uuid REFERENCES public.profiles(id),
  handled_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_phone_messages_status ON public.phone_messages (status, received_at DESC);

ALTER TABLE public.phone_messages ENABLE ROW LEVEL SECURITY;

-- The Twilio webhook (Edge Function) writes using the service role key, which
-- bypasses RLS entirely — these policies only govern what staff can see/do
-- from inside the app.
DROP POLICY IF EXISTS "phone_messages_admin_all" ON public.phone_messages;
CREATE POLICY "phone_messages_admin_all" ON public.phone_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('director', 'operations_manager', 'operations_assistant')
    )
  );
