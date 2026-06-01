export interface CourseSection {
  heading: string
  body: string
  bullets?: string[]
}

export interface CourseQuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export interface CourseModule {
  id: string
  number: number
  title: string
  subtitle: string
  emoji: string
  gradient: string
  accent: string
  cardBg: string
  cardBorder: string
  cardText: string
  duration: string
  passThreshold: number
  sections: CourseSection[]
  quiz: CourseQuizQuestion[]
}

export interface LeadershipCourse {
  id: string
  title: string
  subtitle: string
  description: string
  certificateTitle: string
  modules: CourseModule[]
}

export const LEADERSHIP_COURSE: LeadershipCourse = {
  id: 'leadership_v1',
  title: 'ASO Lead Coach Programme',
  subtitle: 'Leadership, Communication & Professional Practice',
  description: 'A complete professional development course for lead coaches, area leads, and directors covering leadership, class management, safeguarding, and using the ASO app.',
  certificateTitle: 'Certificate of Completion — ASO Lead Coach Leadership Programme',
  modules: [
    {
      id: 'role',
      number: 1,
      title: 'Your Role as Lead Coach',
      subtitle: 'Responsibility, accountability and setting the standard',
      emoji: '🎯',
      gradient: 'from-[#1a3a6b] to-[#1e4a8c]',
      accent: 'text-[#f5c518]',
      cardBg: 'bg-[#1a3a6b]/5',
      cardBorder: 'border-[#1a3a6b]/20',
      cardText: 'text-[#1a3a6b]',
      duration: '12 mins',
      passThreshold: 3,
      sections: [
        {
          heading: 'What Sets You Apart',
          body: 'As a Lead Coach you are responsible for everything that happens in your session — the safety, the quality, the energy, and the outcomes for every child. You are not just a coach who is more experienced — you are the accountable professional in the room.',
          bullets: [
            'You design and deliver the session plan',
            'You manage your assistant and junior coaches',
            'You make the final call on all safety and behaviour decisions',
            'You are the first point of contact for the school and parents',
          ],
        },
        {
          heading: 'Your Core Responsibilities',
          body: 'Your role has three layers: delivering great gymnastics, managing your team, and representing ASO professionally at all times.',
          bullets: [
            'Arrive 15 minutes early to set up safely',
            'Complete the register and attendance record every session',
            'Submit your weekly report through the app after each week',
            'Report any incidents through the app the same day',
            'Ensure your team follow ASO policies at all times',
          ],
        },
        {
          heading: 'Setting the Standard from Day One',
          body: 'Children, parents, and your team take their lead from you. If you are calm, organised, and confident — your whole session will feel that way. If you are flustered or unsure, that energy spreads.',
          bullets: [
            'Start every session with a clear welcome and safety brief',
            'Use your Stop–Look–Listen signal consistently from week one',
            'Introduce yourself and your team at the first session',
            'Establish routines early — they become invisible when repeated',
          ],
        },
        {
          heading: 'Working With Area Leads and Directors',
          body: 'Your area lead is your support system, not a supervisor in the traditional sense. They want to help you succeed — use them. If something is going wrong, tell your area lead early, not after it becomes a problem.',
          bullets: [
            'Submit all reports on time so your area lead has the full picture',
            'Flag safeguarding concerns to your area lead immediately',
            'Ask for support with difficult parents or behaviour situations',
            'Share your successes — your app feedback forms are your professional record',
          ],
        },
      ],
      quiz: [
        {
          question: 'What is the primary responsibility of a Lead Coach during a session?',
          options: [
            'Delivering skills and gymnastics content only',
            'Being accountable for safety, quality, and the whole team\'s conduct',
            'Supporting the assistant coach with spotting',
            'Managing admin after the session',
          ],
          correct: 1,
          explanation: 'Lead Coaches are responsible for the whole session — including safety, team management, and delivery quality.',
        },
        {
          question: 'When should you arrive before a session?',
          options: [
            '5 minutes before',
            'On time when children arrive',
            '15 minutes before',
            '30 minutes before',
          ],
          correct: 2,
          explanation: '15 minutes gives you time to set up safely, complete safety checks, and brief your team.',
        },
        {
          question: 'A parent approaches you aggressively after a session. What should you do?',
          options: [
            'Argue your point firmly to maintain authority',
            'Stay calm, listen, and if unresolved escalate to your area lead',
            'Ignore them and continue packing up',
            'Ask your junior coach to deal with it',
          ],
          correct: 1,
          explanation: 'Staying calm and escalating to your area lead protects both you and the parent relationship.',
        },
        {
          question: 'Which of these is NOT a Lead Coach responsibility?',
          options: [
            'Submitting weekly reports',
            'Recruiting new coaching staff',
            'Completing registers',
            'Briefing assistant coaches',
          ],
          correct: 1,
          explanation: 'Recruitment is an area lead or director function — your job is delivery, management, and reporting.',
        },
      ],
    },
    {
      id: 'team',
      number: 2,
      title: 'Leading Your Team',
      subtitle: 'Briefing, delegating, and developing your coaching staff',
      emoji: '👥',
      gradient: 'from-violet-700 to-violet-600',
      accent: 'text-violet-200',
      cardBg: 'bg-violet-50',
      cardBorder: 'border-violet-200',
      cardText: 'text-violet-800',
      duration: '15 mins',
      passThreshold: 3,
      sections: [
        {
          heading: 'Know Your Team\'s Levels',
          body: 'Not all coaches are the same. Lead Coaches can deliver all UKAG Levels 1–6 independently. Assistant Coaches can support Levels 1–3 under your supervision. Junior Coaches are learning — they should never deliver skills independently.',
          bullets: [
            'Lead Coach — full independent delivery of all levels',
            'Assistant Coach — Levels 1–3 under supervision only',
            'Junior Coach — observation, admin, and supported warm-up activities',
            'Never leave a junior coach alone with a group on apparatus',
          ],
        },
        {
          heading: 'The Pre-Session Briefing',
          body: 'Two minutes before a session starts is too late to delegate. Brief your team before children arrive — during setup. Tell each person exactly where they are and what they are doing.',
          bullets: [
            '"You\'re on beam and vault — watch landing technique"',
            '"Count swings and hold times on bars"',
            '"You\'re running the heart raiser today"',
            '"If something goes wrong, look at me first"',
          ],
        },
        {
          heading: 'Delegating Without Losing Control',
          body: 'Delegation is not abandoning — it is directing. You are still watching the whole room. Give clear instructions, check understanding, and scan constantly. Your job is to see everything.',
          bullets: [
            'Give specific tasks, not vague roles: "spot the cartwheel" not "just watch them"',
            'Check in with your team every rotation',
            'Correct your assistants privately, not in front of children',
            'If an assistant is unsafe — step in immediately and debrief later',
          ],
        },
        {
          heading: 'Developing Your Junior Coaches',
          body: 'Part of your role is building the next generation of coaches. When you explain why you made a decision — the spotting choice, the drill selection, the group split — you are training future lead coaches.',
          bullets: [
            'Let junior coaches observe your technique before attempting their own',
            'Debrief after sessions: "What did you notice? What would you change?"',
            'Give them increasing responsibility as their confidence grows',
            'Recommend them to your area lead for development opportunities',
          ],
        },
        {
          heading: 'When Things Go Wrong In The Team',
          body: 'Conflict or underperformance in your coaching team is your responsibility to address — not to ignore. Address it quickly, calmly, and in private.',
          bullets: [
            'Never correct a colleague in front of children or parents',
            'Use "I noticed" rather than "You did" language',
            'Ask questions before making assumptions',
            'If it continues, escalate to your area lead with specific examples',
          ],
        },
      ],
      quiz: [
        {
          question: 'An Assistant Coach starts teaching a Level 4 skill to a group without you present. What do you do?',
          options: [
            'Let them continue — they know what they\'re doing',
            'Step in, take over the station, and debrief privately after the session',
            'Tell them off in front of the children',
            'Ignore it and mention it next week',
          ],
          correct: 1,
          explanation: 'Assistants can only deliver up to Level 3 under supervision. You must step in immediately for safety.',
        },
        {
          question: 'When is the best time to brief your coaching team?',
          options: [
            'At the start of the session when children are present',
            'During equipment setup, before children arrive',
            'Via text message the night before',
            'During the heart raiser',
          ],
          correct: 1,
          explanation: 'Briefing during setup — before children arrive — means your team starts the session knowing exactly what to do.',
        },
        {
          question: 'A junior coach makes a spotting error. How do you address it?',
          options: [
            'Correct them immediately and loudly so everyone learns',
            'Say nothing — mistakes happen',
            'Calmly step in during the session, then give specific feedback privately afterwards',
            'Report them to the area lead straightaway',
          ],
          correct: 2,
          explanation: 'Correcting publicly undermines confidence. Step in for safety, then debrief privately with specific, constructive feedback.',
        },
        {
          question: 'What does effective delegation look like?',
          options: [
            'Telling someone to "keep an eye on things" and focusing on your own station',
            'Giving specific tasks, checking understanding, and monitoring from the whole room',
            'Only giving tasks to people you trust completely',
            'Doing everything yourself to maintain quality',
          ],
          correct: 1,
          explanation: 'Effective delegation is specific, monitored, and maintains your overview of the whole session.',
        },
      ],
    },
    {
      id: 'communication',
      number: 3,
      title: 'Assertive Communication',
      subtitle: 'Voice, presence, and managing difficult situations',
      emoji: '💬',
      gradient: 'from-amber-600 to-amber-500',
      accent: 'text-amber-100',
      cardBg: 'bg-amber-50',
      cardBorder: 'border-amber-200',
      cardText: 'text-amber-800',
      duration: '14 mins',
      passThreshold: 4,
      sections: [
        {
          heading: 'What Assertiveness Actually Means',
          body: 'Assertiveness is not loudness. It is clarity, consistency, and confidence in your communication. An assertive coach says what they mean, means what they say, and follows through — calmly and without apology.',
          bullets: [
            'Assertive: "I need everyone to stop and look at me now."',
            'Aggressive: "Will you lot just LISTEN!"',
            'Passive: "If you don\'t mind... could you maybe... stop?"',
            'Assertiveness earns respect — the other two erode it',
          ],
        },
        {
          heading: 'Your Voice is a Tool',
          body: 'Volume, pace, and tone all carry meaning. Lower your voice to demand attention. Slow down when giving important instructions. A warm, calm, confident tone builds trust faster than any technique.',
          bullets: [
            'Drop volume slightly to get attention — don\'t shout over noise',
            'Pause before key instructions so children know something important is coming',
            'Match tone to the moment: energetic for warm-up, focused for skills, warm for cool-down',
            'Use children\'s names when giving individual corrections',
          ],
        },
        {
          heading: 'The Stop–Look–Listen Signal',
          body: 'The Stop–Look–Listen signal is ASO\'s universal management tool. It only works if you use it consistently, every session, and hold the pause until everyone complies. If you let one child ignore it, you lose it.',
          bullets: [
            'Practice it in week one — make it a game',
            'Hold the signal visually until the last child stops',
            'Use it before every instruction, not just emergencies',
            'If a child repeatedly ignores it, address them directly and privately after',
          ],
        },
        {
          heading: 'Managing Difficult Behaviour',
          body: 'Difficult behaviour in children almost always comes from one of three things: they need attention, they need more challenge, or something is wrong outside the hall. Respond with curiosity before discipline.',
          bullets: [
            'Get to their level physically when speaking one-to-one',
            'Use "I" statements: "I need you to listen so I can keep you safe"',
            'Give a clear, simple choice: "You can join in properly, or sit out for two minutes"',
            'Always follow through — if you don\'t, the boundary disappears',
            'Record persistent behavioural concerns in an incident report',
          ],
        },
        {
          heading: 'Communicating With Parents',
          body: 'Parent conversations can be the most challenging part of the job. Go in calm, stay factual, and keep your body language open. Most concerns come from caring, not conflict.',
          bullets: [
            'Never have a difficult conversation in front of children',
            'Thank them for raising it: "Thank you for telling me"',
            'Stick to facts: "I noticed X" not "Your child always..."',
            'If unresolved, take their contact and follow up with your area lead',
            'Never make promises you cannot keep',
          ],
        },
      ],
      quiz: [
        {
          question: 'A child keeps talking while you are giving instructions. What is the most assertive response?',
          options: [
            'Stop, use Stop–Look–Listen, wait for silence, then continue',
            'Talk louder over them',
            'Continue and hope they listen eventually',
            'Ask another child to tell them to be quiet',
          ],
          correct: 0,
          explanation: 'Stopping and using the signal — then waiting — is the most powerful tool. It makes compliance visible to the whole group.',
        },
        {
          question: 'What does assertive communication look like?',
          options: [
            'Firm, aggressive tone to maintain authority',
            'Quiet and apologetic to avoid conflict',
            'Clear, calm, and consistent — following through on what you say',
            'Loud and energetic at all times',
          ],
          correct: 2,
          explanation: 'Assertiveness is about clarity and consistency, not volume or aggression.',
        },
        {
          question: 'A parent is upset about their child not receiving a certificate. What is the best first response?',
          options: [
            'Explain why they do not deserve it yet',
            'Promise the certificate will come soon',
            '"Thank you for raising this — can we talk privately after the session?"',
            'Tell them to speak to the area lead',
          ],
          correct: 2,
          explanation: 'Acknowledging the concern calmly and creating a private space to discuss it is always the right first move.',
        },
        {
          question: 'When managing persistent difficult behaviour, what should you do?',
          options: [
            'Ask the school to remove them from the class',
            'Ignore it to avoid making things worse',
            'Address it one-to-one, give a clear choice, follow through, and log persistent concerns',
            'Have your assistant deal with it',
          ],
          correct: 2,
          explanation: 'One-to-one, consistent follow-through, and documentation are the three pillars of effective behaviour management.',
        },
        {
          question: 'Which of these is an assertive instruction?',
          options: [
            '"Could you maybe try to stop running...?"',
            '"If you don\'t mind, please..."',
            '"STOP running or you\'re out!"',
            '"I need everyone walking by the time I count to three."',
          ],
          correct: 3,
          explanation: 'Clear, specific, calm, and with a timeframe — that is an assertive instruction.',
        },
      ],
    },
    {
      id: 'sessions',
      number: 4,
      title: 'Session & Class Management',
      subtitle: 'Setup, rotations, energy, and handling incidents',
      emoji: '🏫',
      gradient: 'from-green-700 to-green-600',
      accent: 'text-green-200',
      cardBg: 'bg-green-50',
      cardBorder: 'border-green-200',
      cardText: 'text-green-800',
      duration: '13 mins',
      passThreshold: 3,
      sections: [
        {
          heading: 'Setup Is Coaching',
          body: 'The 15 minutes before a session begins are as important as the session itself. A well-set room tells children and parents that this is a professional, safe environment.',
          bullets: [
            'Check every mat is flat, joined, and positioned correctly',
            'Confirm wall frames are locked if not in use',
            'Set your equipment before children enter the space',
            'Assign your team their stations during setup — not once children arrive',
          ],
        },
        {
          heading: 'Transitions and Rotations',
          body: 'Lost time in transitions is lost coaching time. Every rotation should take 30 seconds or less if planned. Use a clear signal, give a specific destination, and move with purpose.',
          bullets: [
            'Tell children where they are going before they move',
            'Use Stop–Look–Listen before every rotation',
            'Keep groups of roughly equal size across stations',
            'If a rotation is taking too long, simplify the instruction next time',
          ],
        },
        {
          heading: 'Energy Management',
          body: 'Managing the energy in the room is a skill. You want high energy in the warm-up, focused intensity in skill work, and calm in the cool-down. You set the dial.',
          bullets: [
            'Raise your energy during Heart Raiser — children mirror you',
            'Drop to a quieter, focused tone for skill progressions',
            'Use music or a timer if available to signal transitions',
            'If energy is too high and unsafe — stop everything and reset before continuing',
          ],
        },
        {
          heading: 'When Things Go Wrong',
          body: 'Incidents happen. Children fall, equipment wobbles, coaches make mistakes. What matters is how you respond — calmly, clearly, and in control.',
          bullets: [
            'If a child is hurt: stop the session, apply first aid, keep others calm',
            'If equipment is unsafe: remove it immediately and adapt the session',
            'Never continue if something feels genuinely unsafe',
            'Complete an incident report in the app the same day — every time',
          ],
        },
        {
          heading: 'Ending Well',
          body: 'The end of a session is your last impression on children, parents, and staff. A good cool-down and handover leaves everyone feeling safe and positive about next week.',
          bullets: [
            'Always end with Block and Present — finish with pride',
            'Use cool-down to acknowledge effort: "What was your favourite part today?"',
            'Have children ready at the collection point before parents arrive',
            'Do not let children leave with an unrecognised adult',
          ],
        },
      ],
      quiz: [
        {
          question: 'A mat comes loose during a skills rotation. What do you do?',
          options: [
            'Continue and keep an eye on it',
            'Stop that station, fix the mat, check everyone is safe, then resume',
            'Ask your assistant to fix it while you continue coaching',
            'Note it down and fix it after the session',
          ],
          correct: 1,
          explanation: 'Safety issues are always stop-and-fix. Never continue with a known hazard.',
        },
        {
          question: 'How long should a group rotation between apparatus stations take?',
          options: [
            'As long as needed',
            'About 5 minutes',
            '30 seconds or less if planned correctly',
            'Whatever the children decide',
          ],
          correct: 2,
          explanation: 'Smooth transitions come from clear instructions and preparation — 30 seconds should be achievable every time.',
        },
        {
          question: 'The energy in the room is getting too high and feels unsafe. What do you do?',
          options: [
            'Raise your voice over the noise',
            'Let them burn it off naturally',
            'Stop everything, use Stop–Look–Listen, and reset the room before continuing',
            'Send the most energetic children to sit out',
          ],
          correct: 2,
          explanation: 'Resetting the room is always safer than continuing. You can restart with full control.',
        },
        {
          question: 'A child has a minor fall and is upset but not seriously hurt. What is your first step?',
          options: [
            'Comfort the child, stop the session briefly, and apply basic first aid',
            'Tell them they are fine and keep the session going',
            'Ask a parent to come in',
            'Have your junior coach deal with it while you continue',
          ],
          correct: 0,
          explanation: 'Even minor incidents need your direct attention. Stop, assess, comfort, and complete an incident report.',
        },
      ],
    },
    {
      id: 'app',
      number: 5,
      title: 'Using the ASO Coaching App',
      subtitle: 'Your digital coaching record — what to submit and when',
      emoji: '📱',
      gradient: 'from-cyan-700 to-cyan-600',
      accent: 'text-cyan-200',
      cardBg: 'bg-cyan-50',
      cardBorder: 'border-cyan-200',
      cardText: 'text-cyan-800',
      duration: '10 mins',
      passThreshold: 4,
      sections: [
        {
          heading: 'Your Digital Coaching Record',
          body: 'The ASO app is your professional coaching record. Everything you submit — feedback, incidents, registers, awards — builds a picture of your work over time. It protects you as much as it informs your area lead.',
          bullets: [
            'Complete your weekly report every week — not at the end of semester',
            'Submit incident reports the same day',
            'Your app record is reviewed by area leads and directors',
            'Incomplete records reflect on your professionalism',
          ],
        },
        {
          heading: 'Semester Plans & Weekly Feedback',
          body: 'The Semester Plans section holds your 6-week coaching template. Each week has a plan — review it before the session, then submit feedback after.',
          bullets: [
            'Lead Coaches submit a Weekly Report: days worked, skills covered, award sign-offs',
            'Assistant and junior coaches leave brief Session Notes',
            'Reports unlock access to the next week for your team',
            'Use the UKAG Library link within each plan to reference skill criteria',
          ],
        },
        {
          heading: 'The UKAG Awards System',
          body: 'The Awards section is where you track each child\'s progress through UKAG Levels 1–6 across Floor, Bars, Beam, and Vault.',
          bullets: [
            'Add your class list by school and semester (first and last name)',
            'Tap any child to begin skill sign-offs',
            'Lead Coaches can see all coaches\' class lists at their school',
            'When all skills in a level are completed — award the certificate',
          ],
        },
        {
          heading: 'Registers',
          body: 'Registers track who is in each session. They link to your class list. Always complete your register — it is your safeguarding record.',
          bullets: [
            'Take the register before starting skill work',
            'Record absent children — do not leave blank',
            'If an unknown adult tries to collect a child — do not release them and log an incident',
          ],
        },
        {
          heading: 'Incident Reports',
          body: 'An incident report is not an admission of fault — it is a professional record. File one for any accident, near-miss, safeguarding concern, or unusual event.',
          bullets: [
            'Submit the same day — memory fades quickly',
            'Include facts only: what you saw, what happened, what action you took',
            'Your area lead sees all reports — they are your protection too',
          ],
        },
      ],
      quiz: [
        {
          question: 'When should you submit a Weekly Report?',
          options: [
            'At the end of the semester',
            'After each week of delivery',
            'Only if something went wrong',
            'Once a month',
          ],
          correct: 1,
          explanation: 'Weekly reports are submitted after each week. They are your coaching record and unlock the next week for your team.',
        },
        {
          question: 'What does the UKAG Awards tracker in the app allow you to do?',
          options: [
            'Book holiday camps',
            'Track and sign off each child\'s UKAG Level progress per apparatus',
            'Message parents directly',
            'Submit timesheets',
          ],
          correct: 1,
          explanation: 'The Awards section tracks UKAG Level 1–6 skill completions and certificate sign-offs per child.',
        },
        {
          question: 'When must an incident report be filed?',
          options: [
            'Only for serious injuries',
            'At the end of the week',
            'The same day — for any accident, near-miss, or unusual event',
            'Only if a parent complains',
          ],
          correct: 2,
          explanation: 'Same-day reporting captures accurate detail. It is a professional safeguard for you and the organisation.',
        },
        {
          question: 'A child is on your register but does not show up. What do you do?',
          options: [
            'Nothing — they probably just forgot',
            'Mark them as absent in the register',
            'Call the parents yourself',
            'Remove them from the class list',
          ],
          correct: 1,
          explanation: 'Recording absence is a safeguarding responsibility. Always mark who was and was not present.',
        },
        {
          question: 'Who submits Weekly Reports in the app?',
          options: [
            'All coaches regardless of role',
            'Lead Coaches, Area Leads, and Directors only',
            'Assistant coaches only',
            'Directors only',
          ],
          correct: 1,
          explanation: 'Weekly Reports are a Lead Coach responsibility. Assistants and juniors leave Session Notes.',
        },
      ],
    },
    {
      id: 'safety',
      number: 6,
      title: 'Health, Safety & First Aid',
      subtitle: 'Pre-session checks, first aid kit management, and safeguarding',
      emoji: '🩺',
      gradient: 'from-red-700 to-red-600',
      accent: 'text-red-200',
      cardBg: 'bg-red-50',
      cardBorder: 'border-red-200',
      cardText: 'text-red-800',
      duration: '14 mins',
      passThreshold: 4,
      sections: [
        {
          heading: 'Your Safety Responsibility',
          body: 'As Lead Coach you own the safety of every person in your session — children, staff, and visitors. Safety is not a checklist — it is a mindset. Before every session, you should be actively looking for risk.',
          bullets: [
            'Walk the space before children enter',
            'Check all apparatus, mats, and landing zones',
            'Confirm wall frames are locked if unused',
            'Know where the first aid kit is before you need it',
            'Know the emergency exits and evacuation point',
          ],
        },
        {
          heading: 'Pre-Session Safety Checks',
          body: 'Use the safety checklist in the Semester Plans section of the app as your guide every session — not just in week one.',
          bullets: [
            'Mats flat, joined, and secure under all apparatus',
            'Springboard aligned and locked before every vault run',
            'No jewellery, socks, or loose clothing on apparatus',
            'Water bottles off the floor area',
            '1 gymnast per apparatus station at a time',
          ],
        },
        {
          heading: 'First Aid Kit — What Should Be There',
          body: 'Your first aid kit must be stocked and accessible at every session. Check it at the start of each new semester and refill anything used the previous week.',
          bullets: [
            'Adhesive plasters (assorted sizes)',
            'Sterile wound dressings (small and large)',
            'Sterile eye wash',
            'Disposable gloves (several pairs)',
            'Triangular bandage and cold pack (instant)',
            'Incident/accident record forms',
          ],
        },
        {
          heading: 'When to Refill and Who to Tell',
          body: 'Every time you use something from the kit, refill it before the next session. Never deliver a session without a properly stocked kit present.',
          bullets: [
            'Check kit contents at the start of each semester',
            'Refill after any usage — do not wait',
            'Record kit usage in your weekly report',
            'Alert your area lead if the kit is incomplete before a session',
          ],
        },
        {
          heading: 'Safeguarding Awareness',
          body: 'Safeguarding is everyone\'s responsibility — but as Lead Coach you are the first line of response. Trust your instincts. If something feels wrong with a child\'s wellbeing, it probably needs attention.',
          bullets: [
            'Watch for changes in a child\'s mood, behaviour, or presentation over weeks',
            'Never dismiss a child\'s disclosure — listen, do not promise confidentiality',
            'Report concerns to your area lead the same day',
            'Do not investigate yourself — record and refer',
          ],
        },
      ],
      quiz: [
        {
          question: 'You notice a mat has shifted and there is a gap under the bars. What do you do?',
          options: [
            'Continue and keep an eye on it',
            'Stop that station, fix the mat, check everyone is safe, then resume',
            'Ask your assistant to watch the area',
            'Note it for next time',
          ],
          correct: 1,
          explanation: 'Equipment hazards are always stop-and-fix. Never continue with a known safety issue.',
        },
        {
          question: 'Which of these should always be in your first aid kit?',
          options: [
            'Medication prescribed by a doctor',
            'Disposable gloves, plasters, sterile dressings, cold pack, and eye wash',
            'Just plasters and antiseptic cream',
            'Whatever was there when you started',
          ],
          correct: 1,
          explanation: 'A complete kit includes dressings, gloves, cold pack, eye wash, and a bandage as a minimum.',
        },
        {
          question: 'When should you refill the first aid kit?',
          options: [
            'At the end of semester',
            'Whenever you remember',
            'After every usage — before the next session',
            'When your area lead asks you to',
          ],
          correct: 2,
          explanation: 'Refilling immediately after use ensures the kit is always ready. Never leave it depleted.',
        },
        {
          question: 'A child tells you something concerning about their home situation. What do you do?',
          options: [
            'Promise to keep it between you and try to help them',
            'Ignore it unless they say more',
            'Listen, do not promise confidentiality, and report to your area lead the same day',
            'Tell their parent when they come to collect',
          ],
          correct: 2,
          explanation: 'Listen, do not promise confidentiality, and always refer to your area lead. Never investigate or tell the parent yourself.',
        },
        {
          question: 'When must you notify your area lead about an incomplete first aid kit?',
          options: [
            'At your next scheduled check-in',
            'Before delivering the session — not after',
            'At the end of the semester',
            'Only if you actually need to use it',
          ],
          correct: 1,
          explanation: 'Delivering a session without a properly stocked kit is a safety risk. Notify your area lead before — not after.',
        },
      ],
    },
    {
      id: 'leadership',
      number: 7,
      title: 'Developing Your Leadership Style',
      subtitle: 'Reflection, growth, and building the coaches around you',
      emoji: '⭐',
      gradient: 'from-rose-600 to-rose-500',
      accent: 'text-rose-100',
      cardBg: 'bg-rose-50',
      cardBorder: 'border-rose-200',
      cardText: 'text-rose-800',
      duration: '12 mins',
      passThreshold: 3,
      sections: [
        {
          heading: 'What Kind of Coach Do You Want to Be?',
          body: 'Leadership style is not fixed — it evolves with experience and intentional reflection. The most effective coaches know who they are, what they stand for, and keep improving.',
          bullets: [
            'Do children feel safe and motivated in your sessions?',
            'Does your team know what you expect of them?',
            'Are you consistent — the same coach every week?',
            'What would your area lead say is your biggest strength and growth area?',
          ],
        },
        {
          heading: 'Reflective Practice',
          body: 'The best coaches do not just deliver sessions — they review them. After every session, take two minutes to think about what worked and what you would change. Over a semester, this compounds into real development.',
          bullets: [
            '"What went really well today?"',
            '"What would I do differently?"',
            '"Did every child get something from the session?"',
            '"Did my team know what they were doing?"',
            'Use Session Notes in the app as a reflective tool — not just a compliance form',
          ],
        },
        {
          heading: 'Your Weekly Report as a Development Tool',
          body: 'Your weekly report is not just admin — it is a record of your professional growth. Over six semesters, it becomes a coaching portfolio.',
          bullets: [
            'Write honestly — if the session was hard, say so',
            'Include one thing you tried differently or improved this week',
            'Your area lead reads these — they are your development conversation in writing',
            'If you would be proud to show it to a director, submit it',
          ],
        },
        {
          heading: 'Working With Your Area Lead',
          body: 'Your area lead is there to develop you — not just monitor you. Build a real working relationship. Ask for observations. Ask for feedback. Be honest about what you need.',
          bullets: [
            'Request an observation session at least once per semester',
            'Ask for specific feedback on a skill you are developing',
            'Tell your area lead what you are working on — they can help',
            'Use area lead announcements in the app to stay informed',
          ],
        },
        {
          heading: 'Growing the People Around You',
          body: 'Your legacy as a Lead Coach is not just what you deliver — it is what you build. If every junior coach you work with becomes a better coach because of you, that is leadership.',
          bullets: [
            'Share your knowledge generously — it does not diminish you',
            'Give specific, genuine praise as much as you give correction',
            'Nominate your assistants for development opportunities when they are ready',
            'Model the standard you want — every week, every session',
          ],
        },
      ],
      quiz: [
        {
          question: 'What does effective reflective practice look like?',
          options: [
            'Thinking about what went wrong at the end of semester',
            'Reviewing each session briefly and honestly — what worked and what to change',
            'Only reflecting when asked to by your area lead',
            'Focusing only on positives to build confidence',
          ],
          correct: 1,
          explanation: 'Brief, honest reflection after each session compounds into real development over time.',
        },
        {
          question: 'How should you use your Weekly Report as a Lead Coach?',
          options: [
            'As a quick compliance form to complete as fast as possible',
            'Only when the semester is going well',
            'As an honest professional record of your delivery and development',
            'To report on what your assistants did wrong',
          ],
          correct: 2,
          explanation: 'Your weekly report is your professional voice — write it as if your director will read it, because they might.',
        },
        {
          question: 'A junior coach on your team is showing real potential. What is the best thing you can do?',
          options: [
            'Keep them in supporting roles — they are not ready',
            'Give them increasing responsibility, specific feedback, and recommend them to your area lead',
            'Let them lead a whole session alone to build confidence',
            'Nothing — development is the area lead\'s job',
          ],
          correct: 1,
          explanation: 'Great lead coaches develop their team. Increasing responsibility, specific feedback, and escalating to your area lead is the right path.',
        },
        {
          question: 'When should you request an observation from your area lead?',
          options: [
            'Never — observations are stressful',
            'Only when required',
            'At least once per semester — to get real feedback on your coaching',
            'Only in your first year',
          ],
          correct: 2,
          explanation: 'Observations are one of the most powerful development tools available. Request them proactively.',
        },
      ],
    },
  ],
}
