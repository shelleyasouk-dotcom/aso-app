export interface SessionStage {
  stage: string
  time: string
  description: string
  coachFocus: string
}

export interface AssistantRole {
  area: string
  responsibility: string
}

export interface ApparatusSection {
  apparatus: string
  skills: string[]
  progression?: string
  coachingCues?: string
  awardLink?: string
}

export interface WallFrameGuidance {
  before: string[]
  during: string[]
  after: string[]
}

export interface AssessmentRow {
  skill: string
  level: string
  note: string
}

export interface WeeklyLessonPlan {
  week: number
  theme: string
  focus: string
  duration: string
  emoji: string
  headerGradient: string
  accentText: string
  cardBg: string
  cardBorder: string
  cardText: string
  pillBg: string
  overview: SessionStage[]
  objectives: string[]
  coachingFocus: string[]
  assistantRoles: AssistantRole[]
  safetyChecklist: string[]
  coachingReminders: string[]
  skillProgressions?: ApparatusSection[]
  skillOptions?: ApparatusSection[]
  circuitIdeas?: ApparatusSection[]
  assessmentRows?: AssessmentRow[]
  assessmentTip?: string
  wallFrameGuidance?: WallFrameGuidance
  celebrations?: string[]
}

export const LESSON_PLANS: WeeklyLessonPlan[] = [
  // ─────────────────────────────────────────────
  // WEEK 1 — Settle-In & Safety
  // ─────────────────────────────────────────────
  {
    week: 1,
    theme: 'Settle-In & Safety',
    focus: 'Confidence, routines, body shapes, and safety awareness',
    duration: '65–70 mins (includes transitions & setup)',
    emoji: '👋',
    headerGradient: 'from-[#1a3a6b] to-[#1e4a8c]',
    accentText: 'text-[#f5c518]',
    cardBg: 'bg-[#1a3a6b]/5',
    cardBorder: 'border-[#1a3a6b]/20',
    cardText: 'text-[#1a3a6b]',
    pillBg: 'bg-[#1a3a6b] text-white',

    overview: [
      {
        stage: 'Pre-Session Setup',
        time: '15 min before start',
        description:
          'Set up equipment safely (Floor + one apparatus station). Complete register and safety checks. Brief assistant on stations and spotting. Children to change and have a snack.',
        coachFocus:
          'Mats secure, pathways clear, wall frames locked unless in use. Confirm emergency exits and behaviour expectations.',
      },
      {
        stage: 'Arrival & Welcome',
        time: '5 min',
        description:
          'Greet children as they enter. Explain the routine, safety, and show "Stop / Look / Listen" signal.',
        coachFocus:
          'Keep tone warm and organised. Engage attention quickly with a visual demo.',
      },
      {
        stage: 'Heart Raiser',
        time: '5 min',
        description:
          'Coach choice — pick any aerobic starter from your Heart Raiser Library. Examples: Shape Tag, Shuttle Runs, Bean Game, Star Jump Challenge.',
        coachFocus: 'Encourage smiles and movement. Focus on raising heart rate safely.',
      },
      {
        stage: 'Official UKAG Stretch Routine',
        time: '10 min',
        description:
          'Follow the standard UKAG Stretch & Shapes Sequence: Pike Fold x3 (5 sec hold), Straddle Side Leans x3 each side, Japana Middle Stretch x3 (5 sec hold), Cat Series x3 (Happy/Sad/Lazy/Seal/Gymnast), Bridge x3 (5 sec hold), Dish/Arch Holds (10 sec x3 each), Front/Side/Back Supports (10 sec each).',
        coachFocus:
          'Emphasise correct posture, full extension, and controlled breathing. Encourage focus and body tension.',
      },
      {
        stage: 'Skill Rotations',
        time: '25–30 min',
        description:
          '2–3 Stations (adapted to equipment available): Floor (basic shapes — Dish/Arch/Pike/Straddle/Tuck), Beam/Line (walking/balancing/tiptoe travel), Vault/Rebound (Straight Jump & Landing drills), Bar (supporting themselves and landing safely, forward circles). Lead coach on Floor for core shapes. Assistant supervises balance or vault area. Rotate groups every 7–8 minutes.',
        coachFocus:
          'Lead coach on Floor for core shapes. Assistant supervises balance or vault area.',
      },
      {
        stage: 'Cool-Down & Reflection',
        time: '5 min',
        description:
          'Partner stretch & "Freeze Balance" game (hold favourite shape for 5 seconds). Encourage calm breathing and reflection.',
        coachFocus:
          'Praise effort and teamwork. Ask: "What was your favourite part today?"',
      },
      {
        stage: 'Pack-Down & Feedback',
        time: '5–10 min',
        description:
          'Children put shoes/socks on while coaches tidy up. Parent collection — no adult recognised, no leaving. Submit online feedback to unlock Week 2.',
        coachFocus:
          'Equipment check. Attendance recorded. Feedback form completed.',
      },
    ],

    objectives: [
      'Establish trust, structure, and safety signals with all children',
      'Teach core body shapes with strong tension and posture',
      'Reinforce teamwork and listening skills',
      'Introduce the Stop / Look / Listen signal and club routines',
      'Keep tone fun but controlled throughout',
    ],

    coachingFocus: [
      'Establish trust, structure, and safety signals',
      'Teach core body shapes with strong tension and posture',
      'Reinforce teamwork and listening skills',
      'Keep tone fun but controlled',
    ],

    assistantRoles: [
      { area: 'Warm-Up', responsibility: 'Manage register and supervise warm-up.' },
      { area: 'Beam / Vault', responsibility: 'Support station (hands ready).' },
      { area: 'General', responsibility: 'Encourage children and praise effort.' },
      { area: 'Admin', responsibility: 'Record attendance and notes.' },
    ],

    safetyChecklist: [
      'Mats flat and stable',
      'No jewellery or socks on apparatus',
      'Water bottles off the floor',
      'Wall frames locked unless used',
      'Clear emergency exits',
    ],

    coachingReminders: [
      'Lead Coaches deliver Levels 1–6; Assistants support 1–3 only.',
      'Submit feedback form after each session to unlock Week 2.',
      'Parent/guardian collection: no recognised adult = no leaving.',
      'Keep tone warm, fun, and structured throughout.',
      'Record attendance and notes after every session.',
    ],

    skillProgressions: [
      {
        apparatus: 'Floor',
        skills: ['Dish', 'Arch', 'Pike', 'Straddle', 'Tuck'],
        progression: 'Shapes → Supports → Controlled Rolls → Jump Sequence',
        coachingCues: 'Tight tummy – long body – stretch to finish.',
      },
      {
        apparatus: 'Beam / Balance Line',
        skills: ['Tiptoe Walk', 'Diddy Walk', 'T-Balance', 'Straight Jump off'],
        progression: 'Floor line → low beam → supported tiptoe → jump landing',
        coachingCues: 'Arms out – eyes forward – soft knees.',
      },
      {
        apparatus: 'Vault / Rebound',
        skills: ['Run → Hurdle → Jump → Land (B&P)', 'Star Jump off'],
        progression: 'Floor run → springboard → low box jump → soft landing + present',
        coachingCues: 'Run – Hop – Jump – Land – Present.',
      },
      {
        apparatus: 'Bar',
        skills: ['Support hold', 'Forward circles (supported)', 'Safe landing'],
        progression: 'Floor bar → low bar → support hold → forward circle prep',
        coachingCues: 'Squeeze bar – straight arms – land and freeze.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // WEEK 2 — Core Basics & Body Control
  // ─────────────────────────────────────────────
  {
    week: 2,
    theme: 'Core Basics & Body Control',
    focus: 'Shapes · Balance · Landings',
    duration: '45 mins active (65–70 mins total incl. change & setup)',
    emoji: '💪',
    headerGradient: 'from-green-700 to-green-600',
    accentText: 'text-green-200',
    cardBg: 'bg-green-50',
    cardBorder: 'border-green-200',
    cardText: 'text-green-800',
    pillBg: 'bg-green-700 text-white',

    overview: [
      {
        stage: 'Pre-Session Setup',
        time: '15 min before start',
        description:
          'Coaches prepare floor + 1–2 apparatus stations, complete risk check, brief assistant coach on roles.',
        coachFocus:
          'Check equipment layout and safety zones; confirm register ready.',
      },
      {
        stage: 'Welcome & Safety Brief',
        time: '5 min',
        description: 'Gather children, recap Week 1 routines and signals (Stop–Look–Listen).',
        coachFocus: 'Keep tone positive and focused; remind of safe landing posture.',
      },
      {
        stage: 'Heart Raiser',
        time: '5 min',
        description:
          'Coach-choice (e.g. Shape Relay / Star Jump Circuit / Bean Game).',
        coachFocus: 'Raise pulse & engage core muscles early.',
      },
      {
        stage: 'Official UKAG Stretch Sequence',
        time: '10 min',
        description:
          'Pike / Straddle / Japana stretches · Cat Series · Bridge · Dish & Arch · Front/Back Supports.',
        coachFocus: 'Hold each position 5–10 sec; focus on form and breathing.',
      },
      {
        stage: 'Skill Rotations (2–3 stations)',
        time: '25–30 min',
        description: 'Rotate between Floor, Beam or Vault/Rebound stations.',
        coachFocus: '6–8 min per station; coach precision and shape correction.',
      },
      {
        stage: 'Cool Down & Reflection',
        time: '5 min',
        description: 'Partner stretch and group recap.',
        coachFocus: 'Discuss "what felt strong today?"',
      },
      {
        stage: 'Pack Down & Feedback',
        time: '5–10 min',
        description: 'Tidy equipment, record attendance & feedback.',
        coachFocus: 'Submit feedback form to unlock Week 3.',
      },
    ],

    objectives: [
      'Reinforce safe entry/exit and landing routines',
      'Strengthen core stability and posture',
      'Improve floor shape precision and balance control',
      'Develop confidence moving between stations',
      'Prepare gymnasts for Week 3 (Awards Focus 1)',
    ],

    coachingFocus: [
      'Correct body alignment and shape definition',
      'Introduce counting rhythm in rolls and jumps',
      'Reinforce core engagement in all movements',
      'Praise effort and consistency over difficulty',
    ],

    assistantRoles: [
      { area: 'Warm-Up', responsibility: 'Lead heart raiser or stretch demo.' },
      { area: 'Floor', responsibility: 'Spot forward rolls and straight jumps.' },
      { area: 'Beam/Vault', responsibility: 'Supervise landings and turn-taking.' },
      { area: 'Admin', responsibility: 'Help record attendance and coach notes.' },
    ],

    safetyChecklist: [
      'Mats secure under apparatus',
      'Springboard aligned correctly',
      'Beam height appropriate for age group',
      'No loose clothing or jewellery',
      'Clear landing and exit zones',
    ],

    coachingReminders: [
      'Lead Coaches deliver Levels 1–6; Assistants support 1–3 only.',
      'Use positive reinforcement and specific praise.',
      'Always finish with "Block & Present."',
      'Upload feedback to unlock Week 3.',
    ],

    skillProgressions: [
      {
        apparatus: 'Floor',
        skills: [
          'Dish & Arch (5 sec)',
          'Front/Back Support',
          'Forward Roll (supported)',
          'Straight Jump + Present',
        ],
        progression: 'Shapes → Supports → Controlled Rolls → Jump Sequence',
        coachingCues: 'Tight tummy – long body – stretch to finish.',
      },
      {
        apparatus: 'Beam / Balance Line',
        skills: ['Tiptoe Walk', 'Diddy Walk', 'T-Balance', 'Straight Jump off'],
        progression: 'Floor line → low beam → supported tiptoe → jump landing',
        coachingCues: 'Arms out – eyes forward – soft knees.',
      },
      {
        apparatus: 'Vault / Rebound',
        skills: ['Run → Hurdle → Jump → Land (B&P)', 'Star Jump off'],
        progression: 'Floor run → springboard → low box jump → soft landing + present',
        coachingCues: 'Run – Hop – Jump – Land – Present.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // WEEK 3 — Awards Focus (Part 1)
  // ─────────────────────────────────────────────
  {
    week: 3,
    theme: 'Awards Focus (Part 1)',
    focus: 'Teaching & Assessing Core Award Skills',
    duration: '45 mins active (65–70 mins total incl. transitions)',
    emoji: '🏅',
    headerGradient: 'from-amber-600 to-amber-500',
    accentText: 'text-amber-100',
    cardBg: 'bg-amber-50',
    cardBorder: 'border-amber-200',
    cardText: 'text-amber-800',
    pillBg: 'bg-amber-600 text-white',

    overview: [
      {
        stage: 'Pre-Session Setup',
        time: '15 min before',
        description:
          'Coaches set up floor + 1–2 apparatus stations from Award criteria. Prepare clipboards or Award books.',
        coachFocus: 'Review Level 1–6 skill lists; choose 2–3 key skills per group.',
      },
      {
        stage: 'Welcome & Safety Brief',
        time: '5 min',
        description:
          'Welcome gymnasts; explain that today\'s focus is "working toward your next Award."',
        coachFocus: 'Encourage effort and confidence — progress, not perfection.',
      },
      {
        stage: 'Heart Raiser',
        time: '5 min',
        description:
          'Coach-choice warm-up (Shape Relay / Floor Circuit / Balance Game).',
        coachFocus: 'Prepare body and mind for focused work.',
      },
      {
        stage: 'UKAG Stretch Sequence',
        time: '10 min',
        description:
          'Pike / Straddle / Japana · Cat Series · Bridge · Dish / Arch · Front/Back Supports.',
        coachFocus: 'Hold shapes with control; emphasise good form for assessment.',
      },
      {
        stage: 'Skill Rotations (2–3 stations)',
        time: '25–30 min',
        description:
          'Each group works through chosen Award skills (Floor / Beam / Bars / Vault). Rotate every 8–10 min.',
        coachFocus: 'Demonstrate → practice → assess → record progress.',
      },
      {
        stage: 'Cool Down & Reflection',
        time: '5 min',
        description:
          'Partner stretch; group share: "Which skill did you feel proud of today?"',
        coachFocus: 'Reinforce effort, celebrate progress.',
      },
      {
        stage: 'Pack Down & Feedback',
        time: '5–10 min',
        description: 'Tidy equipment and complete Award notes.',
        coachFocus: 'Record skill completion and confidence ratings in Award book.',
      },
    ],

    objectives: [
      'Begin formal assessment for current UKAG Award Level',
      'Identify individual strengths and skill gaps',
      'Build confidence through guided practice and constructive feedback',
      'Record progress consistently for next week\'s continuation',
      'Reinforce focus, concentration, and self-awareness in movement',
    ],

    coachingFocus: [
      'Demonstrate each Award skill slowly and clearly',
      'Use verbal + visual breakdowns for every progression',
      'Encourage gymnasts to "show your best version" — assessment should feel positive',
      'Record partial achievements ("working toward") as progress',
      'Highlight safe landings and control as key to passing each skill',
    ],

    assistantRoles: [
      { area: 'Warm-Up', responsibility: 'Lead heart raiser or demonstrate stretches.' },
      {
        area: 'Floor / Beam',
        responsibility: 'Support demonstrations and spotting during assessment.',
      },
      {
        area: 'Bars / Vault',
        responsibility: 'Observe safety, count repetitions, record skill notes.',
      },
      { area: 'Admin', responsibility: 'Help complete Award progress sheets.' },
    ],

    safetyChecklist: [
      'Equipment aligned with Award skill requirements',
      'Mats secure under bars, vault, and beam dismounts',
      'Clear one-way travel paths around hall',
      'Coaches supervise 1:6 ratio maximum on apparatus',
      'No socks, jewellery, or loose clothing',
    ],

    coachingReminders: [
      'Lead Coaches deliver Levels 1–6 assessments.',
      'Assistants support and record only Levels 1–3 under supervision.',
      'Focus on individual progress, not comparison.',
      'Always finish with positive reinforcement: "You\'re one step closer to your next Award!"',
      'Upload progress notes before Week 4.',
    ],

    skillProgressions: [
      {
        apparatus: 'Floor',
        skills: [
          'Forward Roll',
          'Dish / Arch Hold',
          'Straight Jump & Present',
          'Handstand (supported)',
        ],
        progression: 'Clean transitions and pointed toes',
        awardLink: 'Levels 1–3 Floor',
      },
      {
        apparatus: 'Beam',
        skills: ['Tiptoe Walk', 'T-Balance', 'Straight Jump Dismount', '½ Pivot Turn'],
        progression: 'Posture, arms out, control',
        awardLink: 'Levels 1–3 Beam',
      },
      {
        apparatus: 'Bars',
        skills: [
          'Tuck / Straddle / Pike Hold',
          '5 Swings',
          'Forward Circle (supported)',
        ],
        progression: 'Strong grip, shoulder swing, dish–arch rhythm',
        awardLink: 'Levels 1–3 Bars',
      },
      {
        apparatus: 'Vault / Rebound',
        skills: [
          'Run → Hurdle → Jump → Safe Landing',
          'Star Jump off Box',
        ],
        progression: 'Power + control; land softly in Block & Present',
        awardLink: 'Levels 1–3 Rebound/Vault',
      },
    ],

    assessmentRows: [
      { skill: 'Forward Roll', level: 'Level 1', note: 'Clean roll, chin tucked' },
      { skill: 'Tiptoe Walk', level: 'Level 1', note: 'Good posture, small steps' },
      { skill: '5 Swings', level: 'Level 2', note: 'Dish/arch rhythm improving' },
    ],

    assessmentTip:
      'If unsure, mark Working Toward — gymnasts can re-attempt in Week 4 (Awards Part 2).',
  },

  // ─────────────────────────────────────────────
  // WEEK 4 — Awards Focus (Part 2)
  // ─────────────────────────────────────────────
  {
    week: 4,
    theme: 'Awards Focus (Part 2)',
    focus: 'Assessment · Confidence · Completion',
    duration: '45 mins active (65–70 mins total incl. transitions)',
    emoji: '🏆',
    headerGradient: 'from-orange-600 to-orange-500',
    accentText: 'text-orange-100',
    cardBg: 'bg-orange-50',
    cardBorder: 'border-orange-200',
    cardText: 'text-orange-800',
    pillBg: 'bg-orange-600 text-white',

    overview: [
      {
        stage: 'Pre-Session Setup',
        time: '15 min before start',
        description:
          'Coaches prepare stations for final Award assessments and clipboards for marking progress. Review Week 3 notes.',
        coachFocus: 'Select skills that need final observation or re-assessment.',
      },
      {
        stage: 'Welcome & Safety Brief',
        time: '5 min',
        description:
          'Welcome gymnasts and explain that today is the continuation of their Award assessment.',
        coachFocus:
          'Remind them it\'s about doing their best and showing control and confidence.',
      },
      {
        stage: 'Heart Raiser',
        time: '5 min',
        description:
          'Coach-choice game with focus on precision (e.g. Balance Relay / Shape Sequence Challenge).',
        coachFocus: 'Calm energy – transition from fun to focus.',
      },
      {
        stage: 'UKAG Stretch Sequence',
        time: '10 min',
        description:
          'Pike · Straddle · Japana · Cat Series · Bridge · Dish/Arch · Front/Back Support.',
        coachFocus: 'Encourage focus on shape accuracy – link to Award skills.',
      },
      {
        stage: 'Skill Rotations (2–3 stations)',
        time: '25–30 min',
        description:
          'Groups rotate through apparatus to complete remaining skills for their level. Coach records final results.',
        coachFocus: 'Observe · Record · Give verbal feedback · Celebrate progress.',
      },
      {
        stage: 'Cool Down & Reflection',
        time: '5 min',
        description:
          'Group stretch + reflection circle: "What are you most proud of today?"',
        coachFocus: 'Positive reinforcement and recognition.',
      },
      {
        stage: 'Pack Down & Feedback',
        time: '5–10 min',
        description:
          'Coaches tidy equipment while children help collect mats and get ready to change/snack. Complete Award records and upload feedback.',
        coachFocus:
          'Identify those ready for certificates and those continuing next block.',
      },
    ],

    objectives: [
      'Complete remaining Award skill assessments for each gymnast',
      'Provide individual feedback and motivation for next goals',
      'Ensure accurate recording for certificate issue',
      'Encourage self-reflection and ownership of progress',
      'Maintain focus on safety and confidence throughout',
    ],

    coachingFocus: [
      'Encourage independent performance without verbal prompting',
      'Acknowledge effort and progress before accuracy',
      'Observe for consistency across multiple attempts',
      'Provide specific, constructive feedback',
      'Celebrate successes as a team',
    ],

    assistantRoles: [
      { area: 'Warm-Up', responsibility: 'Lead heart raiser or stretch demo.' },
      {
        area: 'Floor/Beam',
        responsibility: 'Support supervision and record skill completion.',
      },
      { area: 'Bars/Vault', responsibility: 'Count reps and note safety observations.' },
      {
        area: 'Admin',
        responsibility: 'Assist Lead Coach with Award tick sheets.',
      },
    ],

    safetyChecklist: [
      'All apparatus aligned and matted appropriately',
      'Springboard and vault checked for movement or looseness',
      'One gymnast per apparatus in rotation',
      'All children aware of safe landing zones',
      'Certificates stored away until end of session to avoid distraction',
    ],

    coachingReminders: [
      'Lead Coaches finalise and sign Award records for Levels 1–6.',
      'Assistant Coaches may record but not sign certificates.',
      'Ensure every child is acknowledged for effort and progress.',
      'Certificates handed out at end of Week 6 Fun Week Celebration.',
      'Upload final feedback after session.',
    ],

    skillProgressions: [
      {
        apparatus: 'Floor',
        skills: [
          'Forward Roll',
          'Dish/Arch Hold',
          'Handstand (supported)',
          'Cartwheel or V-Sit',
        ],
        progression: 'Accuracy and smooth transition between skills',
        awardLink: 'Levels 1–3 Floor',
      },
      {
        apparatus: 'Beam',
        skills: [
          'Tiptoe Walk',
          '½ Pivot Turn',
          'Star Jump Dismount',
          'T-Balance',
        ],
        progression: 'Controlled travel and safe dismount presentation',
        awardLink: 'Levels 1–3 Beam',
      },
      {
        apparatus: 'Bars',
        skills: [
          'Tuck/Straddle/Pike Hold',
          '5 Swings',
          'Forward Circle (supported)',
        ],
        progression: 'Grip strength and consistent rhythm',
        awardLink: 'Levels 1–3 Bars',
      },
      {
        apparatus: 'Vault / Rebound',
        skills: [
          'Run → Springboard Jump → Safe Landing',
          'Straddle Jump off Box',
        ],
        progression: 'Confidence in approach and soft, stable landing',
        awardLink: 'Levels 1–3 Rebound/Vault',
      },
    ],

    assessmentRows: [
      { skill: 'Forward Roll', level: 'Level 1', note: 'Clean roll, chin tucked' },
      { skill: 'Tiptoe Walk', level: 'Level 1', note: 'Good posture, small steps' },
      { skill: '5 Swings', level: 'Level 2', note: 'Dish/arch rhythm improving' },
    ],

    assessmentTip:
      'Certificates handed out at end of Week 6 Fun Week Celebration — keep Award records safe.',
  },

  // ─────────────────────────────────────────────
  // WEEK 5 — Try a New Skill Week
  // ─────────────────────────────────────────────
  {
    week: 5,
    theme: 'Try a New Skill Week',
    focus: 'Exploration · Confidence · Choice',
    duration: '45 mins active (65–70 mins total incl. transitions)',
    emoji: '🌟',
    headerGradient: 'from-violet-700 to-violet-600',
    accentText: 'text-violet-200',
    cardBg: 'bg-violet-50',
    cardBorder: 'border-violet-200',
    cardText: 'text-violet-800',
    pillBg: 'bg-violet-700 text-white',

    overview: [
      {
        stage: 'Pre-Session Setup',
        time: '15 min before start',
        description:
          'Coaches set up 2–3 "choice stations" based on school equipment: Floor, Beam, Vault/Rebound, or Bars. Prepare safe low-level progressions.',
        coachFocus: 'Select skills that are safe, fun, and manageable for all levels.',
      },
      {
        stage: 'Welcome & Safety Brief',
        time: '5 min',
        description:
          'Explain that today gymnasts will choose a new skill or apparatus to experience. Review safety and spot zones.',
        coachFocus:
          'Encourage bravery + safety: "We\'re trying new things, not dangerous things."',
      },
      {
        stage: 'Heart Raiser',
        time: '5 min',
        description:
          'Coach-choice high-energy warm-up (Shape Chase / Jump Relay / Power Circuit).',
        coachFocus: 'Build excitement + confidence.',
      },
      {
        stage: 'UKAG Stretch Sequence',
        time: '10 min',
        description:
          'Pike, Straddle, Japana · Cat Series · Bridge · Dish/Arch · Front/Back Supports.',
        coachFocus: 'Prepare the body for new or more challenging skills.',
      },
      {
        stage: 'Try-a-New-Skill Rotations',
        time: '25–30 min',
        description:
          'Gymnasts choose from 2–3 apparatus stations and try a new skill under supervision. Rotate every 8–10 mins.',
        coachFocus: 'Keep it safe, simple, progressive and fun.',
      },
      {
        stage: 'Cool Down & Reflection',
        time: '5 min',
        description:
          'Group stretch and reflection circle: "What new skill did you enjoy today?"',
        coachFocus: 'Build confidence and positive memories.',
      },
      {
        stage: 'Pack Down & Feedback',
        time: '5–10 min',
        description: 'Tidy equipment, complete coach notes, upload feedback.',
        coachFocus: 'Identify children ready for Fun Week achievements.',
      },
    ],

    objectives: [
      'Give children the chance to try a new apparatus or skill safely',
      'Build confidence, bravery and curiosity within a structured environment',
      'Encourage independence in choosing activities',
      'Support gymnasts through simple, safe progressions',
      'Increase engagement before Fun Week (Week 6)',
    ],

    coachingFocus: [
      'Keep choices clear and simple',
      'Children should choose only one new skill at a time',
      'Keep progressions low-level and achievable',
      'Celebrate courage, not difficulty',
      'Reinforce safe landings and spotting at all times',
      'Use lots of positive language: "Give it a try," "I\'ll guide you," "That was brave!"',
    ],

    assistantRoles: [
      {
        area: 'Warm-Up',
        responsibility: 'Support heart raiser and stretch demonstration.',
      },
      {
        area: 'All Stations',
        responsibility: 'Assist with spotting and safety supervision.',
      },
      { area: 'General', responsibility: 'Encourage bravery and effort at every station.' },
      {
        area: 'Admin',
        responsibility: 'Record which skills children attempted and confidence levels.',
      },
    ],

    safetyChecklist: [
      'Mats under every apparatus',
      'Spotting positions agreed before session',
      'Clear travel/landing zones',
      'All new skills delivered low-level and controlled',
      'Gymnasts choose only one station at a time',
    ],

    coachingReminders: [
      'Keep it fun, positive and exploratory.',
      'Celebrate effort: "You tried something new today — that\'s huge."',
      'Keep spotting low-level and supportive.',
      'Upload feedback to unlock Week 6: Fun Week.',
      'This week is not for Award assessment — focus on confidence building.',
    ],

    skillOptions: [
      {
        apparatus: 'Floor (New Skills)',
        skills: [
          'Cartwheel (supported)',
          'Kick to Handstand (supported/wall)',
          'Back Bend or Bridge to Kick-Over prep',
          'Bunny hops → handstand prep sequence',
          'Round-off preparation drills',
        ],
        progression: 'Shapes → Rocks → Support → Assisted → Attempt',
      },
      {
        apparatus: 'Beam (New Skills)',
        skills: [
          'T-Balance or Y-Balance',
          'Simple mount sequence (straddle/lever)',
          '½ Pivot Turn',
          'Cat Leap onto beam line',
          'Straight Jump dismount from low beam',
        ],
        progression: 'Floor line → low beam → supported → independent',
      },
      {
        apparatus: 'Bars (New Skills)',
        skills: [
          '5 Swings → Re-grasp',
          'Tuck Hold (longer duration)',
          'Up-Hip Circle preparation',
          'Cast to front support',
          'Supported dish–arch swing patterns',
        ],
        progression: 'Floor bar → low bar → swing rhythm → dismount finish',
      },
      {
        apparatus: 'Vault / Rebound (New Skills)',
        skills: [
          'Run → Hurdle → Jump → Land with shape',
          'Straddle on from springboard, straddle jump off',
          'Star or tuck jump off box',
          'Dive roll onto crash mat',
          'Springboard punch jump sequencing',
        ],
        progression: 'Run → two-foot take-off → shape → land + present',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // WEEK 6 — Fun Week: Circuits & Celebration
  // ─────────────────────────────────────────────
  {
    week: 6,
    theme: 'Fun Week – Circuits & Celebration',
    focus: 'Enjoyment · Teamwork · Confidence · Safe Use of Wall Frames',
    duration: '45 mins active (65–70 mins incl. transitions)',
    emoji: '🎉',
    headerGradient: 'from-rose-600 to-rose-500',
    accentText: 'text-rose-100',
    cardBg: 'bg-rose-50',
    cardBorder: 'border-rose-200',
    cardText: 'text-rose-800',
    pillBg: 'bg-rose-600 text-white',

    overview: [
      {
        stage: 'Pre-Session Setup',
        time: '15 min before start',
        description:
          'Coaches set up 6–10 circuit stations including floor, beam, vault/rebound, bars, soft-play obstacles and optional wall frame activities.',
        coachFocus:
          'Check wall frames are fully locked, anchored and safe before use. Confirm assistant roles.',
      },
      {
        stage: 'Welcome & Briefing',
        time: '5 min',
        description:
          'Explain Fun Week, safety expectations, and the layout of the circuit.',
        coachFocus:
          'Clear rules around wall-frame use and safe climbing/touching zones.',
      },
      {
        stage: 'Heart Raiser',
        time: '5 min',
        description:
          'Coach-choice warm-up (Jump Relay / Circle Tag / Obstacle Sprint).',
        coachFocus: 'Light, energising, fun.',
      },
      {
        stage: 'Mini Stretch Sequence',
        time: '5 min',
        description: 'Pike · Straddle · Dish/Arch · Bridge · Shoulder rolls.',
        coachFocus: 'Keep it quick and dynamic.',
      },
      {
        stage: 'Main Circuit (including Wall Frames)',
        time: '25–30 min',
        description:
          'Rotate around stations including floor, beam, vault, bars, shapes, and wall frames (secured and supervised).',
        coachFocus:
          'Supervise closely, maintain flow, keep wall frame activities low-level.',
      },
      {
        stage: 'Team Challenge',
        time: '5 min',
        description: 'Small group relay or shape game.',
        coachFocus: 'Boost teamwork and energy.',
      },
      {
        stage: 'Cool Down & Celebration',
        time: '5 min',
        description: 'Group stretch, clap-out and positive reflection.',
        coachFocus: 'Recognise effort and progress.',
      },
      {
        stage: 'Pack Down & Certificates',
        time: '5–10 min',
        description:
          'Coaches pack down equipment, children change/snack. Hand out awards, stickers or praise notes.',
        coachFocus: 'Hand out certificates/stickers. Clear handover to parents.',
      },
    ],

    objectives: [
      'Celebrate the end of term with positive, enjoyable activities',
      'Use apparatus safely — including secured wall frames',
      'Give children confidence to explore a range of gymnastics movements',
      'Encourage teamwork through group challenges',
      'Provide a joyful ending to the semester',
    ],

    coachingFocus: [
      'Keep everything fun but controlled',
      'Encourage children to try a range of stations',
      'Focus on safe landings and positive movement',
      'Reinforce sharing, turn-taking and teamwork',
    ],

    assistantRoles: [
      {
        area: 'Wall Frames',
        responsibility: 'Stand beside frame, supervise climbing + enforce rules.',
      },
      { area: 'Stations', responsibility: 'Monitor 1–2 stations each.' },
      { area: 'Demos', responsibility: 'Show simple, safe versions of each activity.' },
      { area: 'Admin', responsibility: 'Support with certificates/stickers.' },
    ],

    safetyChecklist: [
      'Mats under all apparatus (including wall frames)',
      'Clear directional flow around circuit',
      'No socks on apparatus',
      'Wall frames checked, locked & mats placed correctly',
      'No overcrowding at any station',
      'Children reminded: "Controlled, not crazy!"',
    ],

    coachingReminders: [
      'Every wall frame station must have an assistant coach present.',
      'Keep wall frame activities low-level only.',
      'Certificates and stickers handed out at end of session.',
      'Ensure calm, structured handover to parents after snack/change.',
      'Upload final semester feedback report before end of day.',
    ],

    circuitIdeas: [
      {
        apparatus: 'Floor Stations',
        skills: [
          'Straight jump → tuck jump combo',
          'Forward roll wedge',
          'Cartwheel strip',
          'Shape dice / freeze shapes',
        ],
      },
      {
        apparatus: 'Beam Stations',
        skills: [
          'Tiptoe balance walk',
          'T-balance challenge',
          'Straight jump off → Block & Present',
        ],
      },
      {
        apparatus: 'Bars',
        skills: [
          '5 swings → dish/arch rhythm',
          'Tuck hold challenge',
          'Under-bar monkey walk',
        ],
      },
      {
        apparatus: 'Vault / Rebound',
        skills: [
          'Springboard → straight jump',
          'Box jump onto crash mat',
          'Mini hurdle → star jump',
        ],
      },
      {
        apparatus: 'Wall Frame Stations (all low-level + supervised)',
        skills: [
          'Controlled climbing to first section only',
          'Hanging shape hold (3 seconds)',
          'Sideways travel along safe bar',
          'Cat hang → drop to crash mat',
          'Climb up → step down with control',
        ],
      },
    ],

    wallFrameGuidance: {
      before: [
        'Wall frame locking pins fully engaged',
        'No wobble or gap at hinge points',
        'Mats placed directly under all climbing/holding areas',
        'Cross-beams and ladders checked for stability',
        'No sharp edges or loose bolts',
      ],
      during: [
        'Only 1–2 children on the frame at a time',
        'No swinging from top bars',
        'Only low-level climbing permitted (coach discretion)',
        'Hands only — no hanging from knees',
        'Assistant coach positioned directly beside frame',
        'Clear verbal cue: "One at a time, controlled climbing."',
      ],
      after: [
        'Frame re-locked',
        'Mats removed safely',
        'Any concerns logged in feedback form',
      ],
    },

    celebrations: [
      'Certificates',
      'Stickers',
      '"Gymnast of the Week/Term"',
      '"Most Improved"',
      '"Best Listener"',
      '"Kindest Team Member"',
    ],
  },
]
