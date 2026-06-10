-- Contact form messages — stored while email is down (and permanently as a CRM log)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  email         text        NOT NULL,
  phone         text,
  enquiry_type  text        NOT NULL DEFAULT 'general',
  message       text        NOT NULL,
  is_read       boolean     NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a message (public form)
CREATE POLICY "Public can insert contact messages"
  ON public.contact_messages FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated staff can read messages
CREATE POLICY "Staff can read contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated staff can update (mark read)
CREATE POLICY "Staff can update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (true);
