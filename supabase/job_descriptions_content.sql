-- Populate job_descriptions table with content from the 2025/26 academic year Word documents.
-- Run this AFTER job_descriptions.sql (table + seed rows must exist).

-- ── JUNIOR COACH ──────────────────────────────────────────────────────────────

UPDATE public.job_descriptions
SET
  title      = $$Junior Coach — Job Description$$,
  version    = $$v26-27$$,
  content    = $$[
    {
      "heading": "Role Overview",
      "items": [
        {"type":"text","text":"Reports to: Lead Coach / Assistant Coach (supervised at all times)"},
        {"type":"text","text":"Primary focus: Developing coaching experience under supervision"}
      ]
    },
    {
      "heading": "Purpose",
      "items": [
        {"type":"text","text":"To develop coaching experience and skills while supporting Lead and Assistant Coaches, always under appropriate supervision."}
      ]
    },
    {
      "heading": "Key Responsibilities",
      "items": [
        {"type":"bullet","text":"Assist with session set-up and pack-down"},
        {"type":"bullet","text":"Support small-group activities under direct supervision"},
        {"type":"bullet","text":"Observe and learn session delivery, safeguarding practice, and behaviour management from senior coaches"},
        {"type":"bullet","text":"Flag any concerns to the supervising coach immediately — never manage a concern independently"}
      ]
    },
    {
      "heading": "What Success Looks Like",
      "items": [
        {"type":"bullet","text":"Reliable attendance and a visibly growing set of coaching skills over the term"},
        {"type":"bullet","text":"Always working within supervision — never left managing children alone"}
      ]
    },
    {
      "heading": "What You'll Need",
      "items": [
        {"type":"bullet","text":"Enhanced DBS certificate including children's barred list check"},
        {"type":"bullet","text":"UKAG Level 0 (Junior Coach) qualification"},
        {"type":"bullet","text":"Safeguarding in Sport, minimum Level 1"},
        {"type":"bullet","text":"Typically aged 13–16, working under close and constant supervision"}
      ]
    },
    {
      "heading": "Where This Role Can Lead",
      "items": [
        {"type":"text","text":"Assistant Coach, once age, training, and experience requirements are met."}
      ]
    }
  ]$$::jsonb,
  updated_at = now()
WHERE role = 'junior_coach';


-- ── ASSISTANT COACH ───────────────────────────────────────────────────────────

UPDATE public.job_descriptions
SET
  title      = $$Assistant Coach — Job Description$$,
  version    = $$v26-27$$,
  content    = $$[
    {
      "heading": "Role Overview",
      "items": [
        {"type":"text","text":"Reports to: Lead Coach (session), Area Lead (overall)"},
        {"type":"text","text":"Primary focus: Supporting safe, engaging session delivery"}
      ]
    },
    {
      "heading": "Purpose",
      "items": [
        {"type":"text","text":"To support session delivery, children's development, behaviour management, and the safe operation of the programme alongside the Lead Coach."}
      ]
    },
    {
      "heading": "Key Responsibilities",
      "items": [
        {"type":"bullet","text":"Support warm-up, main activity, and cool-down delivery under the Lead Coach's direction"},
        {"type":"bullet","text":"Support behaviour management calmly and positively"},
        {"type":"bullet","text":"Support the register, medical awareness, and dismissal processes as directed"},
        {"type":"bullet","text":"Flag any concerns to the Lead Coach immediately"}
      ]
    },
    {
      "heading": "What Success Looks Like",
      "items": [
        {"type":"bullet","text":"Reliable attendance and punctuality"},
        {"type":"bullet","text":"Positive engagement from children in the sessions supported"},
        {"type":"bullet","text":"No unsupervised gaps in coverage during a session"}
      ]
    },
    {
      "heading": "What You'll Need",
      "items": [
        {"type":"bullet","text":"Enhanced DBS certificate including children's barred list check"},
        {"type":"bullet","text":"UKAG Level 1 (Assistant Coach) qualification"},
        {"type":"bullet","text":"Safeguarding in Sport, minimum Level 1"},
        {"type":"bullet","text":"Completed shadow session"}
      ]
    },
    {
      "heading": "Where This Role Can Lead",
      "items": [
        {"type":"text","text":"Lead Coach, once training requirements are met and a shadow session is signed off by the Area Lead."}
      ]
    }
  ]$$::jsonb,
  updated_at = now()
WHERE role = 'assistant_coach';


-- ── LEAD COACH ────────────────────────────────────────────────────────────────

UPDATE public.job_descriptions
SET
  title      = $$Lead Coach — Job Description$$,
  version    = $$v26-27$$,
  content    = $$[
    {
      "heading": "Role Overview",
      "items": [
        {"type":"text","text":"Reports to: Area Lead"},
        {"type":"text","text":"Direct reports: Assistant and Junior Coaches at their allocated session(s)"},
        {"type":"text","text":"Primary focus: Safe, professional delivery of sessions"}
      ]
    },
    {
      "heading": "Purpose",
      "items": [
        {"type":"text","text":"To own the safe, professional delivery of ASO sessions at your allocated school(s), and to lead the coaching team present at each session."}
      ]
    },
    {
      "heading": "Key Responsibilities",
      "items": [
        {"type":"bullet","text":"Deliver sessions to the ASO session structure and UKAG curriculum"},
        {"type":"bullet","text":"Complete the register and medical check before every session — a safeguarding, non-negotiable task"},
        {"type":"bullet","text":"Manage the medical bag and any child-specific medical needs throughout the session"},
        {"type":"bullet","text":"Lead the dismissal process — no child released without a named, confirmed collector"},
        {"type":"bullet","text":"Lead and support Assistant and Junior Coaches present at the session"},
        {"type":"bullet","text":"Report any concerns, incidents, or standards issues to the Area Lead the same day"},
        {"type":"bullet","text":"Submit timesheets and incident reports on time"}
      ]
    },
    {
      "heading": "What Success Looks Like",
      "items": [
        {"type":"bullet","text":"Zero missed or incomplete registers"},
        {"type":"bullet","text":"Zero medical-protocol breaches"},
        {"type":"bullet","text":"Consistent on-time arrival and session start"},
        {"type":"bullet","text":"Positive, consistent feedback from schools and parents"},
        {"type":"bullet","text":"Observations and photo checks consistently meet ASO's quality standards"}
      ]
    },
    {
      "heading": "What You'll Need",
      "items": [
        {"type":"bullet","text":"Enhanced DBS certificate including children's barred list check"},
        {"type":"bullet","text":"UKAG Level 2 (Lead Coach) qualification"},
        {"type":"bullet","text":"Paediatric First Aid or First Aid at Work (current)"},
        {"type":"bullet","text":"Safeguarding in Sport, minimum Level 1, renewed annually"},
        {"type":"bullet","text":"Completed and signed-off shadow session before working independently"}
      ]
    },
    {
      "heading": "Where This Role Can Lead",
      "items": [
        {"type":"text","text":"Area Lead, where regional management aptitude has been demonstrated."}
      ]
    }
  ]$$::jsonb,
  updated_at = now()
WHERE role = 'lead_coach';


-- ── AREA LEAD ─────────────────────────────────────────────────────────────────

UPDATE public.job_descriptions
SET
  title      = $$Area Lead — Job Description$$,
  version    = $$v26-27$$,
  content    = $$[
    {
      "heading": "About This Role",
      "items": [
        {"type":"text","text":"This role is a genuine regional management position, not simply \"senior coach.\""}
      ]
    },
    {
      "heading": "Role Overview",
      "items": [
        {"type":"text","text":"Reports to: Operations Manager"},
        {"type":"text","text":"Direct reports: Lead Coaches in the region (indirectly, all Assistant and Junior Coaches in the region)"},
        {"type":"text","text":"Primary focus: Ownership of a geographical cluster"}
      ]
    },
    {
      "heading": "Purpose",
      "items": [
        {"type":"text","text":"To take full ownership of a region — staffing, quality, coach development, and school relationships — and to solve regional problems directly rather than passing them upward."}
      ]
    },
    {
      "heading": "Key Responsibilities",
      "items": [
        {"type":"bullet","text":"Take responsibility for all allocated schools in the region"},
        {"type":"bullet","text":"Ensure every school is appropriately staffed, every session, every week"},
        {"type":"bullet","text":"Recruit and maintain a pipeline of local coaches — not just fill vacancies reactively"},
        {"type":"bullet","text":"Support and manage coaches within the area, including performance and conduct"},
        {"type":"bullet","text":"Act as the direct, named point of contact for every school in the region — schools should be able to reach you directly for routine matters"},
        {"type":"bullet","text":"Be the first point of contact for every Lead Coach in the region, with a nominated backup Area Lead as a second point of contact"},
        {"type":"bullet","text":"Monitor coaching quality and UKAG standards through observation and remote checks"},
        {"type":"bullet","text":"Identify staffing risks before they become emergencies"},
        {"type":"bullet","text":"Manage absence and cover arrangements within the region"},
        {"type":"bullet","text":"Monitor coach clock in/out records and reconcile them against timesheets before the monthly payroll cut-off"},
        {"type":"bullet","text":"Identify neighbouring schools and growth opportunities and flag them to the Operations Manager"},
        {"type":"bullet","text":"Provide a short weekly regional update to the Operations Manager"},
        {"type":"bullet","text":"Escalate significant issues through Operations, not directly to the Director"}
      ]
    },
    {
      "heading": "What Success Looks Like",
      "items": [
        {"type":"bullet","text":"Zero uncovered sessions across the region in a term, or a documented, timely resolution when cover was at risk"},
        {"type":"bullet","text":"Every school in the region has your direct contact details and uses them as the first port of call"},
        {"type":"bullet","text":"Every Lead Coach in the region can name both their first and second (backup) Area Lead contact without checking"},
        {"type":"bullet","text":"A maintained pipeline of trained reserve coaches, not a scramble when someone leaves"},
        {"type":"bullet","text":"At least one termly observation completed and recorded for every school in the region"},
        {"type":"bullet","text":"Staffing and quality risks are flagged as early warnings, not discovered after they become a problem"}
      ]
    },
    {
      "heading": "Where This Role Stops",
      "items": [
        {"type":"text","text":"Area Leads should increasingly solve regional problems rather than passing them directly to the Director. Escalation goes to the Operations Manager. The Director is never the point of contact for coach cover."}
      ]
    },
    {
      "heading": "What You'll Need",
      "items": [
        {"type":"bullet","text":"Holds Level 2 Safeguarding (Deputy DSL), or is committed to obtaining it immediately on taking the role"},
        {"type":"bullet","text":"Holds UKAG Level 2 and a relevant First Aid qualification if continuing to coach sessions personally"},
        {"type":"bullet","text":"Proven ability to build relationships with schools and manage a team, not just deliver sessions well"},
        {"type":"bullet","text":"Comfortable being the first point of contact for problems — this role absorbs pressure rather than passing it on"}
      ]
    },
    {
      "heading": "Where This Role Can Lead",
      "items": [
        {"type":"text","text":"Regional Manager, once the business is managing multiple regions through a single point of oversight, or into the Operations Manager track."}
      ]
    }
  ]$$::jsonb,
  updated_at = now()
WHERE role = 'area_lead';
