import type { CourseModule } from './leadershipCourse'

export interface AreaLeadCourse {
  id: string
  title: string
  subtitle: string
  description: string
  certificateTitle: string
  modules: CourseModule[]
}

export const AREA_LEAD_COURSE: AreaLeadCourse = {
  id: 'area_lead_v1',
  title: 'Area Lead Development Course',
  subtitle: 'Regional Leadership, Coach Support & Quality Assurance',
  description: 'A professional development course for experienced Lead Coaches taking on regional leadership responsibilities within the UKAG framework. Covers school relationships, coach support, quality assurance, and reporting.',
  certificateTitle: 'UKAG Area Lead Award',
  modules: [
    {
      id: 'regional-leadership',
      number: 1,
      title: 'Regional Leadership',
      subtitle: 'Responsibilities, mindset and leading across multiple schools',
      emoji: '🗺️',
      gradient: 'from-violet-700 to-purple-800',
      accent: 'text-violet-200',
      cardBg: 'bg-violet-50',
      cardBorder: 'border-violet-200',
      cardText: 'text-violet-700',
      duration: '12 mins',
      passThreshold: 3,
      sections: [
        {
          heading: 'The Area Lead Role',
          body: 'An Area Lead is the bridge between the coaching teams on the ground and the strategic direction set by directors. You are responsible for the performance, wellbeing, and development of every coach in your region — and for the quality of every session delivered in every school under your remit.',
          bullets: [
            'You are accountable for outcomes across multiple schools — not just your own delivery',
            'Your primary tools are visibility, relationships, and standards — not direct delivery',
            'Directors set direction; Area Leads translate that into on-the-ground action',
            'You are the first escalation point for lead coaches, school staff, and parents',
          ],
        },
        {
          heading: 'Leading Across a Region',
          body: 'Regional leadership is fundamentally different from leading a single school. You cannot be everywhere at once — you lead through the people you develop and the standards you set.',
          bullets: [
            'Visit each school in your region at least once per half-term — more if issues arise',
            'Hold monthly one-to-ones with each lead coach: performance, wellbeing, and development',
            'Create a shared regional calendar so you can anticipate crises before they happen',
            'Delegate decisions that belong at school level — micromanaging coaches undermines their authority',
          ],
        },
        {
          heading: 'Setting Regional Standards',
          body: 'Your region will perform to the standard you personally model and consistently enforce. Vague expectations produce inconsistent delivery — clear, repeated standards produce consistent quality.',
          bullets: [
            'Define what "excellent" looks like for your region in writing — share it with all lead coaches',
            'Enforce standards calmly and consistently — praise publicly, correct privately',
            'Conduct at least one unannounced observation per school per term',
            'Use the ASO app reports to identify schools falling behind before problems escalate',
          ],
        },
        {
          heading: 'Working With Your Director',
          body: 'Your relationship with your director is a two-way professional partnership. Your director needs accurate, timely information to make good decisions — and you need their support and authority to manage escalations.',
          bullets: [
            'Report upward proactively — do not wait for problems to reach your director before flagging',
            'Bring solutions, not just problems: "I\'ve identified an issue and here is what I propose"',
            'Escalate immediately for safeguarding, serious incidents, or school relationship breakdowns',
            'Agree on your regional targets, KPIs, and reporting cadence at the start of each semester',
          ],
        },
      ],
      quiz: [
        {
          question: 'What is the primary difference between a Lead Coach role and an Area Lead role?',
          options: [
            'Area Leads deliver more gymnastics sessions each week',
            'Area Leads are accountable for outcomes across multiple schools, not just their own delivery',
            'Area Leads report directly to school headteachers',
            'Area Leads only manage administrative tasks, not coaching quality',
          ],
          correct: 1,
          explanation: 'The Area Lead role shifts from direct delivery to leadership — you are accountable for every school in your region, leading through the coaches you develop rather than through your own sessions.',
        },
        {
          question: 'How often should an Area Lead visit each school in their region as a minimum?',
          options: [
            'Once per year',
            'Once per term',
            'Once per half-term',
            'Every week',
          ],
          correct: 2,
          explanation: 'At minimum, visit each school once per half-term. This frequency allows you to stay close to delivery quality and catch issues before they escalate — increase visits if concerns arise.',
        },
        {
          question: 'When should you escalate an issue to your director?',
          options: [
            'Only after you have fully resolved it',
            'Only when a parent makes a formal complaint',
            'Immediately for safeguarding, serious incidents, or school relationship breakdowns',
            'At the end of the semester in the written report',
          ],
          correct: 2,
          explanation: 'Safeguarding, serious incidents, and school relationship breakdowns must be escalated immediately — never hold these until a scheduled review. Your director needs timely information to act.',
        },
        {
          question: 'What is the most effective approach when raising a concern with your director?',
          options: [
            'Wait until you are certain before saying anything',
            'Share the problem and ask the director to solve it',
            'Bring the issue alongside a proposed solution',
            'Copy all affected coaches into the message',
          ],
          correct: 2,
          explanation: 'Bring solutions, not just problems — "I\'ve identified an issue and here is what I propose." This demonstrates leadership judgment and makes it easier for your director to act quickly.',
        },
      ],
    },
    {
      id: 'supporting-coaches',
      number: 2,
      title: 'Supporting Coaches',
      subtitle: 'Observation, mentoring, CPD and managing performance',
      emoji: '🤝',
      gradient: 'from-violet-700 to-purple-800',
      accent: 'text-violet-200',
      cardBg: 'bg-violet-50',
      cardBorder: 'border-violet-200',
      cardText: 'text-violet-700',
      duration: '12 mins',
      passThreshold: 3,
      sections: [
        {
          heading: 'Observing Lead Coaches',
          body: 'Observation is your most powerful quality assurance tool. Done well, it supports development and raises standards. Done poorly, it creates anxiety and resentment. Your approach matters as much as your presence.',
          bullets: [
            'Observe at least one full session per lead coach per term — record your findings using the ASO observation form',
            'Observe from a non-intrusive position — do not interrupt the session or undermine the coach\'s authority in front of children',
            'Look for: session structure, safety management, coaching language, child engagement, and UKAG cue consistency',
            'Complete and share written feedback the same day — delayed feedback loses impact',
          ],
        },
        {
          heading: 'Giving Structured Feedback',
          body: 'Your feedback shapes how coaches grow. Vague feedback produces no change — specific, structured feedback produces measurable improvement.',
          bullets: [
            'Use the feedback structure: what went well → what to develop → one clear action for next session',
            'Ground every point in specific observations: "At 14:10 when Jamie struggled with the forward roll…" not "the spotting could be better"',
            'Give the coach time to respond — listen to their perspective before concluding',
            'Follow up at the next observation: did they act on the feedback from last time?',
          ],
        },
        {
          heading: 'Supporting CPD & Development',
          body: 'Every coach in your region should have an active development focus. Coaches who are growing stay engaged — stagnation breeds complacency.',
          bullets: [
            'Review each coach\'s completed courses and certificates in the ASO app — identify gaps',
            'Recommend the Apparatus CPD courses to Level 1 coaches who have not yet completed them',
            'Encourage eligible coaches to work toward the Leadership Programme if they are not already enrolled',
            'Identify your most capable lead coaches as future area leads and begin supporting their development explicitly',
          ],
        },
        {
          heading: 'Managing Underperformance',
          body: 'Underperformance must be addressed early, calmly, and consistently. Allowing poor standards to continue is a disservice to children, schools, and the rest of your coaching team.',
          bullets: [
            'Address concerns at the first observation — do not wait for a pattern to build over several terms',
            'Have a private, specific conversation: "I noticed X. Here is what I need to see instead. Let\'s agree a plan."',
            'Document every performance conversation in writing and share a copy with the coach',
            'Escalate to your director if performance does not improve after two documented conversations with a clear plan',
          ],
        },
      ],
      quiz: [
        {
          question: 'How often should an Area Lead observe each lead coach as a minimum?',
          options: [
            'Once per year',
            'At least once per term',
            'Only when a concern has been raised',
            'Twice per week',
          ],
          correct: 1,
          explanation: 'At minimum, observe each lead coach once per term. This frequency provides consistent oversight and developmental support — increase if a concern has been raised.',
        },
        {
          question: 'What is the correct structure for coach observation feedback?',
          options: [
            'List everything that needs to improve, then close the meeting',
            'What went well → what to develop → one clear action for next session',
            'General comments → score out of 10 → file the form',
            'Feedback is verbal only — writing it down creates unnecessary pressure',
          ],
          correct: 1,
          explanation: 'Structured feedback — what went well, what to develop, one clear action — is specific, balanced, and actionable. Always close with a single, clear next step the coach can act on immediately.',
        },
        {
          question: 'When should underperformance first be addressed?',
          options: [
            'After a third observation confirms the pattern',
            'When a school formally complains',
            'At the first observation where a concern is identified',
            'Only when it reaches the director\'s attention',
          ],
          correct: 2,
          explanation: 'Address underperformance at the first observation — do not wait for a pattern. Early, calm, private conversations prevent issues from escalating and give the coach the best chance to improve.',
        },
        {
          question: 'What must happen if a coach\'s performance does not improve after two documented conversations?',
          options: [
            'Move them to a different school and see if performance improves',
            'Conduct a third observation and wait another term',
            'Escalate to your director with full documentation',
            'Remove them from the schedule immediately',
          ],
          correct: 2,
          explanation: 'After two documented conversations with a clear plan, if performance has not improved, escalate to your director. Always have documentation ready — verbal conversations alone are not sufficient evidence.',
        },
      ],
    },
    {
      id: 'school-relationships',
      number: 3,
      title: 'School Relationships',
      subtitle: 'Building partnerships, managing expectations, and retaining schools',
      emoji: '🏫',
      gradient: 'from-violet-700 to-purple-800',
      accent: 'text-violet-200',
      cardBg: 'bg-violet-50',
      cardBorder: 'border-violet-200',
      cardText: 'text-violet-700',
      duration: '12 mins',
      passThreshold: 3,
      sections: [
        {
          heading: 'Building School Partnerships',
          body: 'Schools are your customers and your partners. The quality of your relationship with each school determines retention, reputation, and the platform your coaches have to do their best work.',
          bullets: [
            'Introduce yourself to every headteacher and PE lead in your region within your first half-term',
            'Make contact proactively — not only when there is a problem',
            'Understand each school\'s priorities: their Ofsted outcomes, PE curriculum goals, and community context',
            'Share regular progress updates: how many children have progressed through UKAG levels, register attendance, notable achievements',
          ],
        },
        {
          heading: 'Managing School Expectations',
          body: 'Unmet expectations — not poor delivery — are the most common cause of school dissatisfaction. Expectations must be set clearly and maintained consistently from the first conversation.',
          bullets: [
            'Walk new schools through exactly what they will receive: session frequency, UKAG level delivery, reporting, communication cadence',
            'Never over-promise — it is far better to deliver more than expected than less',
            'When something goes wrong (staff absence, rescheduled session), communicate immediately before the school notices',
            'Ask for explicit feedback at the end of each half-term: "Is there anything we could do better?"',
          ],
        },
        {
          heading: 'Handling School Concerns',
          body: 'A school concern handled well can strengthen the relationship. A concern handled poorly — or ignored — will almost certainly end it.',
          bullets: [
            'Acknowledge every concern within 24 hours — even if you don\'t yet have a resolution',
            'Meet in person for serious concerns — do not attempt to resolve them by email',
            'Never be defensive: listen fully, acknowledge the school\'s experience, then explain what you will do',
            'Follow up after resolution: "I wanted to check back and make sure the concern has been fully addressed"',
          ],
        },
        {
          heading: 'Contract Renewals & Retention',
          body: 'Retaining schools is far more cost-effective than winning new ones. Renewals should be proactive and values-driven — not a last-minute commercial conversation.',
          bullets: [
            'Begin renewal conversations at least 6 weeks before the contract end date',
            'Frame the renewal around the outcomes achieved: UKAG levels, attendance growth, teacher feedback',
            'If a school is considering leaving, request a face-to-face meeting before they make a decision',
            'Share new developments — Apparatus CPD, updated UKAG curriculum, extended timetable options — to demonstrate continued investment',
          ],
        },
      ],
      quiz: [
        {
          question: 'What is the most common cause of school dissatisfaction with a provider?',
          options: [
            'Poor coaching quality',
            'Unmet expectations',
            'Safeguarding concerns',
            'High staff turnover',
          ],
          correct: 1,
          explanation: 'Unmet expectations — not poor delivery — are the most common cause of school dissatisfaction. Setting expectations clearly and maintaining them consistently prevents the majority of school relationship problems.',
        },
        {
          question: 'How quickly should a school concern be acknowledged?',
          options: [
            'Within 1 week',
            'At the next scheduled meeting',
            'Within 24 hours',
            'Only once you have a full resolution',
          ],
          correct: 2,
          explanation: 'Acknowledge every concern within 24 hours — even if you don\'t yet have a resolution. Silence feels like indifference to a school. A prompt acknowledgement buys you time to find the right solution.',
        },
        {
          question: 'When should you begin a contract renewal conversation with a school?',
          options: [
            'On the day the contract expires',
            'In the final week of the contract',
            'At least 6 weeks before the contract end date',
            'Only if the school brings it up',
          ],
          correct: 2,
          explanation: 'Begin renewal conversations at least 6 weeks before the contract ends. This gives time for meaningful discussion, negotiation if needed, and proper planning — not a last-minute scramble.',
        },
        {
          question: 'A school raises a serious concern about a recent session. What is the correct response?',
          options: [
            'Reply by email with a full written explanation',
            'Ask the lead coach to contact the school directly',
            'Wait until you have all the facts before responding',
            'Acknowledge within 24 hours and arrange a face-to-face meeting',
          ],
          correct: 3,
          explanation: 'Serious concerns require in-person resolution — email creates distance and can escalate misunderstandings. Acknowledge promptly, then meet in person to listen, acknowledge, and agree on a resolution.',
        },
      ],
    },
    {
      id: 'recruitment-support',
      number: 4,
      title: 'Recruitment Support',
      subtitle: 'Identifying talent, supporting hiring, and onboarding new coaches',
      emoji: '🔍',
      gradient: 'from-violet-700 to-purple-800',
      accent: 'text-violet-200',
      cardBg: 'bg-violet-50',
      cardBorder: 'border-violet-200',
      cardText: 'text-violet-700',
      duration: '10 mins',
      passThreshold: 3,
      sections: [
        {
          heading: 'Identifying Coaching Talent',
          body: 'The best coaches are often found by the people closest to the work. As Area Lead, you are ideally positioned to identify talented individuals before a vacancy exists.',
          bullets: [
            'Note exceptional assistant coaches or Level 1s who demonstrate potential for lead roles',
            'Look for: initiative, natural communication with children, self-correction, reliability, and coachability',
            'Recommend promising individuals to your director and invite them to shadow a lead coach session',
            'Build a regional talent pipeline — do not wait for a vacancy to start thinking about who is next',
          ],
        },
        {
          heading: 'Supporting the Hiring Process',
          body: 'You may be asked to contribute to or lead parts of the recruitment process. Know the standards required and apply them consistently.',
          bullets: [
            'Communicate the role requirements clearly in all outreach — be specific about UKAG level, hours, and schools',
            'Assess practical delivery skills in a supervised session observation — not just interview performance',
            'Check for a valid, enhanced DBS certificate before any offer is confirmed',
            'Follow ASO\'s safer recruitment policy at every stage — this is a non-negotiable safeguarding requirement',
          ],
        },
        {
          heading: 'Induction & Onboarding',
          body: 'A structured induction ensures new coaches feel confident, supported, and clear on standards from day one. Poor onboarding leads to early departures and delivery inconsistencies.',
          bullets: [
            'Complete a formal induction meeting covering: safety protocols, ASO app setup, UKAG delivery expectations, and communication channels',
            'Assign a buddy coach for the first half-term — an experienced local coach who can answer day-to-day questions',
            'Observe the new coach in their first session and provide written feedback within 48 hours',
            'Confirm that mandatory training (safeguarding, first aid) is completed within the first 4 weeks',
          ],
        },
        {
          heading: 'Managing Probation',
          body: 'The probation period is your structured opportunity to confirm that a new coach is meeting the required standard — and to intervene early if they are not.',
          bullets: [
            'Conduct a formal mid-probation check-in (at 6 weeks) and an end-of-probation review',
            'Document all probation meetings and share written summaries with the coach',
            'If a coach is not meeting the standard at mid-probation, create a specific support plan with clear targets',
            'Do not extend probation indefinitely — if the standard is not met after a supported second chance, escalate to your director',
          ],
        },
      ],
      quiz: [
        {
          question: 'What qualities should you look for when identifying potential lead coaches?',
          options: [
            'Strong gymnastics skills and competition experience',
            'Initiative, natural communication with children, self-correction, reliability, and coachability',
            'Availability to work full-time hours immediately',
            'Previous management experience in sport',
          ],
          correct: 1,
          explanation: 'The best coaching talent shows initiative, natural rapport with children, willingness to self-correct, reliability, and openness to coaching. Gymnastics skill matters less than the ability to teach and lead.',
        },
        {
          question: 'When must a DBS check be confirmed in the recruitment process?',
          options: [
            'Within the first month of starting',
            'Before any offer is confirmed',
            'At the 3-month probation review',
            'Only for coaches working with GCSE groups',
          ],
          correct: 1,
          explanation: 'A valid, enhanced DBS certificate must be confirmed before any offer is made. This is a non-negotiable safeguarding requirement — no exceptions.',
        },
        {
          question: 'What should happen within 48 hours of a new coach\'s first session?',
          options: [
            'A salary review',
            'A meeting with the school headteacher',
            'A formal observation with written feedback',
            'Completion of the leadership course',
          ],
          correct: 2,
          explanation: 'Observe the new coach in their first session and provide written feedback within 48 hours. Early, specific feedback sets standards immediately and shows the coach they are supported from day one.',
        },
        {
          question: 'What action should be taken if a coach is not meeting standard at the mid-probation check-in?',
          options: [
            'End employment immediately',
            'Continue to the end of probation and then decide',
            'Create a specific support plan with clear targets',
            'Move them to a different school with less demanding requirements',
          ],
          correct: 2,
          explanation: 'A specific support plan with clear, measurable targets gives the coach a structured opportunity to improve. Document it in writing and review at the end of probation.',
        },
      ],
    },
    {
      id: 'quality-assurance',
      number: 5,
      title: 'Quality Assurance',
      subtitle: 'Observation frameworks, UKAG standards, and consistent delivery',
      emoji: '✅',
      gradient: 'from-violet-700 to-purple-800',
      accent: 'text-violet-200',
      cardBg: 'bg-violet-50',
      cardBorder: 'border-violet-200',
      cardText: 'text-violet-700',
      duration: '12 mins',
      passThreshold: 3,
      sections: [
        {
          heading: 'What Quality Assurance Means for Area Leads',
          body: 'Quality assurance is not about catching coaches out — it is about ensuring every child in your region receives a consistently excellent gymnastics experience. It is a system of improvement, not surveillance.',
          bullets: [
            'QA covers: session safety, UKAG curriculum delivery, coaching language and technique, child engagement and behaviour management',
            'You are responsible for QA across all schools in your region — even schools you are not observing today',
            'QA data informs your coaching development priorities — use it to plan CPD, not just to grade sessions',
            'Share positive QA findings with the whole team — celebrate what excellent looks like as much as you correct what poor looks like',
          ],
        },
        {
          heading: 'Conducting Session Observations',
          body: 'A session observation is a structured, evidence-based process. Your job is to gather specific evidence against defined criteria — not to form a general impression.',
          bullets: [
            'Use the ASO observation form for every session observation — do not rely on informal notes alone',
            'Observe the full session where possible — partial observations miss context',
            'Record specific examples: times, skill names, exact coaching language used, child responses',
            'Evaluate against UKAG criteria: correct cues, safe spotting technique, progression pathway used',
          ],
        },
        {
          heading: 'UKAG Delivery Standards',
          body: 'UKAG delivery standards define the minimum quality expected at every level. As Area Lead, you are the keeper of these standards in your region.',
          bullets: [
            'Level 1–3 sessions must use the correct UKAG coreSkills, pathways, and coaching cues — not coach-invented alternatives',
            'Every session must begin with the UKAG warm-up sequence and end with Block & Present',
            'All skills must be appropriately supported — no unsupported inversions or flight skills without a qualified spotter',
            'UKAG Award progress must be accurately recorded and updated in the app — fabricated award data is a serious misconduct issue',
          ],
        },
        {
          heading: 'Acting on QA Findings',
          body: 'QA data is only valuable if it drives change. A completed observation form that sits in a folder and changes nothing has no value.',
          bullets: [
            'Grade each observation using the four-point scale (Outstanding / Good / Requires Improvement / Inadequate) and record it in the ASO app',
            'Any "Requires Improvement" grading triggers a targeted support plan — agree actions within one week',
            'Any "Inadequate" grading must be escalated to your director immediately and the coach placed on a structured support plan',
            'Review QA trends across your region quarterly — identify whether improvement actions are having the intended effect',
          ],
        },
      ],
      quiz: [
        {
          question: 'What is the primary purpose of quality assurance in the Area Lead role?',
          options: [
            'To create a record that can be used in disciplinary proceedings',
            'To ensure every child receives a consistently excellent gymnastics experience',
            'To measure session attendance and register compliance',
            'To rank coaches against each other for pay decisions',
          ],
          correct: 1,
          explanation: 'QA is a system of improvement — its purpose is to ensure consistent quality for every child in every session. It informs development priorities and celebrates excellent practice, not just corrects poor practice.',
        },
        {
          question: 'What should you do when you observe a session?',
          options: [
            'Form a general impression and rate it out of 10',
            'Interrupt the session to correct the coach in real time',
            'Use the ASO observation form and record specific evidence against defined UKAG criteria',
            'Ask the lead coach to self-assess and submit their own rating',
          ],
          correct: 2,
          explanation: 'Always use the ASO observation form and record specific evidence — times, skill names, coaching language, child responses. Evidence-based observations are fair, developmental, and defensible.',
        },
        {
          question: 'What triggers a targeted support plan following an observation?',
          options: [
            'Any observation below Outstanding',
            'A "Requires Improvement" grading',
            'A third consecutive "Good" grading',
            'Only when a parent complaint accompanies the observation',
          ],
          correct: 1,
          explanation: 'Any "Requires Improvement" grading triggers a targeted support plan — agree specific actions within one week. Waiting for multiple poor gradings allows standards to deteriorate further.',
        },
        {
          question: 'What should happen when UKAG Award progress data is found to be inaccurate?',
          options: [
            'Correct it quietly without raising it with the coach',
            'Note it in the end-of-term report',
            'Treat it as a serious misconduct issue and escalate immediately',
            'Ask the school to verify it independently',
          ],
          correct: 2,
          explanation: 'Fabricated award data is a serious misconduct issue — it misrepresents children\'s progress, undermines UKAG credibility, and potentially defrauds the school. It must be escalated to your director immediately.',
        },
      ],
    },
    {
      id: 'problem-solving',
      number: 6,
      title: 'Problem Solving',
      subtitle: 'Handling difficult situations, safeguarding, and conflict resolution',
      emoji: '🧩',
      gradient: 'from-violet-700 to-purple-800',
      accent: 'text-violet-200',
      cardBg: 'bg-violet-50',
      cardBorder: 'border-violet-200',
      cardText: 'text-violet-700',
      duration: '12 mins',
      passThreshold: 3,
      sections: [
        {
          heading: 'A Framework for Difficult Situations',
          body: 'Every Area Lead will face difficult situations — staff conflicts, school complaints, safeguarding concerns, and operational failures. Having a clear framework prevents panic and ensures the right outcome.',
          bullets: [
            'Step 1: Pause and gather facts before acting — do not respond to the first account without checking it',
            'Step 2: Identify who needs to know immediately (director? DSL? school?) and inform them',
            'Step 3: Separate the immediate safety response from the longer-term resolution — these are two different tasks',
            'Step 4: Document everything in writing as close to the event as possible',
          ],
        },
        {
          heading: 'Safeguarding as Area Lead',
          body: 'As Area Lead, you are a senior figure in the safeguarding chain for your region. Your responsibility goes beyond knowing the policy — you must ensure it is being followed by every coach in your region.',
          bullets: [
            'Know your organisation\'s Designated Safeguarding Lead (DSL) and how to contact them out of hours',
            'Ensure every coach in your region has completed mandatory safeguarding training and that records are current in the app',
            'If you receive a disclosure or witness a concern: listen, do not promise confidentiality, do not investigate — refer immediately to the DSL',
            'Never allow concerns about coaching relationships or friendships to delay a safeguarding referral',
          ],
        },
        {
          heading: 'Resolving Staff Conflicts',
          body: 'Interpersonal conflicts between coaches — or between a coach and a school — are one of the most common and draining problems an Area Lead faces. Early, calm intervention almost always produces better outcomes than avoidance.',
          bullets: [
            'Speak to each party separately before any joint conversation — establish the facts and each person\'s perspective',
            'Focus the resolution conversation on the professional behaviour required, not on who is right or wrong',
            'Agree specific behavioural commitments from each party and record them in writing',
            'If a conflict is between a coach and a school contact, position yourself as a neutral problem-solver — not a defender of your coach',
          ],
        },
        {
          heading: 'Operational Failures & Recovery',
          body: 'Coaches will miss sessions, equipment will fail, and schools will complain. How you recover from operational failures defines your reputation far more than the failure itself.',
          bullets: [
            'When a session is missed: inform the school immediately, apologise unreservedly, and arrange cover or a make-up session within 48 hours',
            'Identify the root cause — one-off absence, systemic cover gap, or recurring coach reliability issue — and address it specifically',
            'Do not blame individual coaches publicly — manage performance issues privately',
            'Follow up with the school after every significant operational failure: "I want to make sure we have fully put this right"',
          ],
        },
      ],
      quiz: [
        {
          question: 'What is the first step when facing a difficult situation as Area Lead?',
          options: [
            'Contact the school immediately and apologise',
            'Send a written account to your director before doing anything else',
            'Pause, gather facts, and identify who needs to know immediately',
            'Ask the coach involved to write a self-assessment',
          ],
          correct: 2,
          explanation: 'Pause and gather facts before acting — responding immediately to a single account without checking is one of the most common Area Lead errors. Then identify who needs to know and inform them promptly.',
        },
        {
          question: 'If a child makes a disclosure to a coach in your region, what should happen?',
          options: [
            'The coach investigates the concern and reports findings to you',
            'The coach listens without promising confidentiality and refers immediately to the DSL',
            'You collect the information and decide whether to escalate',
            'The school\'s headteacher is notified before the DSL',
          ],
          correct: 1,
          explanation: 'On receiving a disclosure: listen, do not promise confidentiality, do not investigate — refer immediately to the Designated Safeguarding Lead. No Area Lead or coach should investigate safeguarding concerns themselves.',
        },
        {
          question: 'When resolving a conflict between two coaches, what should the conversation focus on?',
          options: [
            'Establishing which person was objectively right',
            'The professional behaviour required from each person going forward',
            'Identifying which coach has more seniority and deferring to them',
            'Finding a compromise that each person is happy with',
          ],
          correct: 1,
          explanation: 'Focus on the professional behaviour required — not on who is right or wrong. Agree specific behavioural commitments from each party, record them in writing, and follow up.',
        },
        {
          question: 'A coach misses a session without cover arranged. What is the correct immediate response?',
          options: [
            'Wait until the coach explains themselves before contacting the school',
            'Contact the school immediately, apologise unreservedly, and arrange cover or a make-up within 48 hours',
            'Send the coach a formal written warning before making any contact with the school',
            'Ask the school to reschedule at their convenience',
          ],
          correct: 1,
          explanation: 'Contact the school immediately — before they contact you. Apologise unreservedly and arrange a make-up session within 48 hours. Schools accept mistakes; what they do not accept is silence or delay.',
        },
      ],
    },
    {
      id: 'reporting-systems',
      number: 7,
      title: 'Reporting Systems',
      subtitle: 'ASO app tools, semester reviews, KPIs, and communicating upward',
      emoji: '📊',
      gradient: 'from-violet-700 to-purple-800',
      accent: 'text-violet-200',
      cardBg: 'bg-violet-50',
      cardBorder: 'border-violet-200',
      cardText: 'text-violet-700',
      duration: '10 mins',
      passThreshold: 3,
      sections: [
        {
          heading: 'Using the ASO App as Area Lead',
          body: 'The ASO app is your regional management dashboard. It gives you real-time visibility of attendance, UKAG progress, coach certifications, absences, and session feedback across every school in your region.',
          bullets: [
            'Check registers weekly — if a school shows repeated low attendance, investigate the cause before the school flags it to you',
            'Review UKAG Award progress monthly — identify schools where children are not progressing and investigate why',
            'Use the Coach Zone to check each coach\'s CPD certificates — flag any mandatory training that is approaching expiry',
            'Monitor absence requests and expense claims for your region — approve promptly and flag anomalies',
          ],
        },
        {
          heading: 'Semester Plan Reviews',
          body: 'Semester plans and coach feedback reports are the primary written record of what is being delivered in each school. As Area Lead, you review these reports and act on what they reveal.',
          bullets: [
            'Review every lead coach\'s semester plan submission — not just a summary. Read the weekly reports',
            'Look for: sessions not delivered, skills not covered, children repeatedly absent, and coach concerns about school behaviour or facilities',
            'Respond to every semester plan with written feedback within one week of submission',
            'Use semester plan patterns to inform your observation calendar — focus visits on schools showing delivery concerns',
          ],
        },
        {
          heading: 'Key Performance Indicators',
          body: 'As Area Lead, you are accountable for a set of regional KPIs. Understanding these — and being able to explain movement in them — is a core part of your director relationship.',
          bullets: [
            'Attendance rate per school — target and actual; investigate any school below 80% average',
            'UKAG Award completions per term — compared to targets set at semester start',
            'Coach session delivery rate — sessions delivered vs sessions scheduled across the region',
            'School retention rate — how many schools renewed vs how many were lost; reason codes for any non-renewals',
          ],
        },
        {
          heading: 'Communicating Upward to Directors',
          body: 'Your director depends on your regional reporting to make good decisions. High-quality upward communication is a professional skill that defines effective Area Leads.',
          bullets: [
            'Submit your regional report on time, every time — late reports signal poor organisation to your director',
            'Lead with exceptions: "3 schools are below 80% attendance this half-term. Here is why and what I am doing about it."',
            'Include both numbers and narrative — a table of figures without context forces your director to guess the story',
            'Flag risks before they become incidents: "School X has a new PE lead who seems uncertain about the partnership — I am meeting them next week"',
          ],
        },
      ],
      quiz: [
        {
          question: 'What should you do if a school shows repeated low attendance in the register?',
          options: [
            'Wait for the school to contact you about it',
            'Investigate the cause and address it proactively before the school raises it',
            'Reduce the number of sessions scheduled at that school',
            'Note it in the end-of-semester report',
          ],
          correct: 1,
          explanation: 'Repeated low attendance signals a problem — with engagement, scheduling, or the school relationship. Investigate and act before the school raises it. Proactivity is what separates strong Area Leads.',
        },
        {
          question: 'What is the target response time for written feedback on a lead coach\'s semester plan?',
          options: [
            'Same day',
            'Within one week of submission',
            'Within one month',
            'At the next face-to-face meeting',
          ],
          correct: 1,
          explanation: 'Respond to every semester plan with written feedback within one week of submission. Delayed feedback on semester plans signals that they are not read or valued — coaches disengage from the process.',
        },
        {
          question: 'Which of these is a key KPI an Area Lead is accountable for?',
          options: [
            'Number of Instagram followers for the ASO account',
            'Number of new coaching techniques introduced per term',
            'School retention rate — schools renewed vs lost',
            'Personal session delivery hours per week',
          ],
          correct: 2,
          explanation: 'School retention rate — how many schools renewed versus how many were lost, with reason codes for non-renewals — is a core Area Lead KPI. It reflects the overall quality of your school relationships and regional management.',
        },
        {
          question: 'How should you structure your regional report to your director?',
          options: [
            'A detailed narrative without numbers — numbers are less meaningful without context',
            'Numbers only — directors want data, not opinions',
            'Lead with exceptions plus both numbers and narrative context, flagging risks before they become incidents',
            'A list of positive outcomes only — problems should be discussed verbally',
          ],
          correct: 2,
          explanation: 'Lead with exceptions (what is outside expected ranges), provide both numbers and narrative context, and flag emerging risks before they become incidents. This gives your director what they need to make good decisions and support you effectively.',
        },
      ],
    },
  ],
}
