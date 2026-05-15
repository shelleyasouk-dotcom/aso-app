-- Allow session registers to be created without a lead coach (e.g. via bulk import)
alter table session_registers alter column lead_coach_id drop not null;
