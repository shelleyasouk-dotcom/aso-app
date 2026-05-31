export interface SessionStage {
  stage: string
  time: string
  description: string
  coachingFocus: string
}

export interface ApparatusProgression {
  apparatus: string
  coreSkills: string[]
  pathway: string
  cues: string
}

export interface AssistantRole {
  area: string
  responsibility: string
}

export interface UKAGLevel {
  level: number
  name: string
  subtitle: string
  ageGroup: string
  delivery: string
  duration: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  emoji: string
  overview: SessionStage[]
  objectives: string[]
  progressions: ApparatusProgression[]
  teachingFocus: string[]
  assistantRoles: AssistantRole[]
  safetyChecklist: string[]
  coachingReminders: string[]
}

export const UKAG_LEVELS: UKAGLevel[] = [
  {
    level: 1,
    name: 'Foundation Gymnastics',
    subtitle: 'UKAG Level 1',
    ageGroup: '4 – 11 yrs',
    delivery: 'All Coaches',
    duration: '45 mins active (65–70 mins total incl. changeover)',
    color: '#1a3a6b',
    bgColor: 'bg-[#1a3a6b]',
    borderColor: 'border-[#1a3a6b]',
    textColor: 'text-[#1a3a6b]',
    emoji: '🌱',
    overview: [
      {
        stage: 'Pre-Session Setup',
        time: '15 min before',
        description: 'Coaches prepare equipment, complete safety checks & register while children change/snack.',
        coachingFocus: 'Equipment secure, clear walkways, set rotations.',
      },
      {
        stage: 'Welcome & Safety Brief',
        time: '5 min',
        description: 'Introduce coaches, review safety rules, explain session flow.',
        coachingFocus: 'Use "Stop–Look–Listen" signal, encourage confidence.',
      },
      {
        stage: 'Heart Raiser',
        time: '5 min',
        description: 'Coach-choice fun game (Shape Tag / Bean Game / Relay).',
        coachingFocus: 'Raise pulse, include shapes & coordination.',
      },
      {
        stage: 'Official UKAG Stretch Sequence',
        time: '10 min',
        description: 'Guided dynamic stretches from UKAG warm-up (pike/straddle, cats, bridge, dish/arch, supports).',
        coachingFocus: 'Emphasise posture, body tension, breathing.',
      },
      {
        stage: 'Skill Rotations (2–3 stations)',
        time: '25–30 min',
        description: 'Floor / Beam / Bars / Vault or Rebound rotations. 6–8 min per station; reinforce shapes & safe landings.',
        coachingFocus: 'Consistent cues; watch for safe landings.',
      },
      {
        stage: 'Cool Down & Reflection',
        time: '5 min',
        description: 'Partner stretch + "Freeze Balance" game; recap skills.',
        coachingFocus: 'Positive feedback & team praise.',
      },
      {
        stage: 'Pack Down & Feedback',
        time: '5–10 min',
        description: 'Tidy equipment, update register, submit feedback.',
        coachingFocus: 'Record attendance & notes; upload photo if required.',
      },
    ],
    objectives: [
      'Establish safety routines and classroom management.',
      'Introduce fundamental body shapes and supports.',
      'Build spatial awareness and confidence on all apparatus.',
      'Reinforce "Block & Present" as the universal finishing position.',
      'Encourage teamwork and positive participation.',
    ],
    progressions: [
      {
        apparatus: 'Floor',
        coreSkills: ['Dish & Arch holds (3 s)', 'Front/Back Support', 'Forward Roll (supported)', 'Bunny Hops', 'V-Sit', 'Straight Jump & Present'],
        pathway: 'Shapes → Supports → Rock to Roll → Jump Sequence → Stretch & Split holds',
        cues: '"Tight tummy – point toes – stretch long."',
      },
      {
        apparatus: 'Beam / Balance Line',
        coreSkills: ['Straddle Mount', 'Tiptoe Walk', 'Diddy Walk', 'Leg Lift (sup.)', 'Straight Jump Dismount'],
        pathway: 'Floor line → low beam → supported tiptoe → leg lifts → controlled jump off',
        cues: '"Eyes up – arms out – soft knees on landing."',
      },
      {
        apparatus: 'Bars',
        coreSkills: ['Tuck/Straddle/Pike Hold (3 s)', 'Hang Upside Down (sup.)', 'Forward Circle (sup.)', '5 Swings', 'Dismount & Present'],
        pathway: 'Floor bar shapes → low bar hang → swing → forward circle → present finish',
        cues: '"Thumbs around bar – dish to arch – block to finish."',
      },
      {
        apparatus: 'Vault / Rebound',
        coreSkills: ['Run → Hurdle → Springboard Jump → Safe Landing', 'Star/Tuck Jump Dismounts'],
        pathway: 'Floor take-off → springboard → low block jumps → 2-foot landings → add shape jumps',
        cues: '"Run–Hop–Jump–Land–Present."',
      },
    ],
    teachingFocus: [
      'Keep instructions short & visual.',
      'Emphasise fun and movement exploration for under-7s; precision and technique for 8+.',
      'Use progressions rather than repetition of one skill.',
      'Praise effort > outcome.',
    ],
    assistantRoles: [
      { area: 'Warm-Up & Heart Raiser', responsibility: 'Lead group games; demonstrate stretches.' },
      { area: 'Floor Station', responsibility: 'Spot forward rolls & basic jumps safely.' },
      { area: 'Beam or Vault', responsibility: 'Support balance line & landing technique.' },
      { area: 'Admin & Feedback', responsibility: 'Help record attendance & award notes.' },
    ],
    safetyChecklist: [
      'Mats flat and joined securely',
      'No jewellery or socks on apparatus',
      'Water bottles off floor area',
      'Wall frames locked if unused',
      'Clear exits and first-aid available',
    ],
    coachingReminders: [
      'Lead Coaches may deliver all levels (1–6).',
      'Assistant Coaches may deliver up to Level 3 skills under supervision.',
      'Ensure every child finishes each activity in "Block & Present" position.',
      'Praise small wins and visible progress each week.',
    ],
  },

  {
    level: 2,
    name: 'Development Gymnastics',
    subtitle: 'UKAG Level 2',
    ageGroup: '4 – 11 yrs',
    delivery: 'All Coaches',
    duration: '45 mins active (65–70 mins total incl. changeover)',
    color: '#16a34a',
    bgColor: 'bg-green-700',
    borderColor: 'border-green-700',
    textColor: 'text-green-700',
    emoji: '🌿',
    overview: [
      {
        stage: 'Pre-Session Setup',
        time: '15 min before',
        description: 'Coaches set up apparatus, risk assess, and check spacing while children change/snack.',
        coachingFocus: 'Secure mats, springboard alignment, communication with assistants.',
      },
      {
        stage: 'Welcome & Safety Brief',
        time: '5 min',
        description: 'Review warm-up zones, safety points, and "Stop–Look–Listen" signal.',
        coachingFocus: 'Clear voice, visual demo of safe landings & spotting.',
      },
      {
        stage: 'Heart Raiser',
        time: '5 min',
        description: 'Coach-choice (Shape Tag / Shuttle Relay / Jump Circuits).',
        coachingFocus: 'Build energy and excitement while reinforcing body tension.',
      },
      {
        stage: 'Official UKAG Stretch Sequence',
        time: '10 min',
        description: 'Pike/Straddle/Japana holds, Cat Series, Bridge, Dish/Arch, Front/Back Supports.',
        coachingFocus: 'Emphasise active stretching and longer holds.',
      },
      {
        stage: 'Skill Rotations (2–3 stations)',
        time: '25–30 min',
        description: 'Apparatus-based skill work from the Level 2 Awards. Use progressions and repetition for confidence.',
        coachingFocus: 'Precision over speed.',
      },
      {
        stage: 'Cool Down & Reflection',
        time: '5 min',
        description: 'Team stretches and shape challenge game.',
        coachingFocus: 'Praise improvement and set next week\'s focus.',
      },
      {
        stage: 'Pack Down & Feedback',
        time: '5–10 min',
        description: 'Clear equipment and submit coach reflection in the app.',
        coachingFocus: 'Record progress toward Award Level 2.',
      },
    ],
    objectives: [
      'Reinforce core shapes and body control.',
      'Develop balance, travel, and strength across apparatus.',
      'Introduce jumping, mounting, and landing variations.',
      'Progress toward independent execution of Level 2 Award skills.',
      'Build teamwork, rhythm, and confidence.',
    ],
    progressions: [
      {
        apparatus: 'Floor',
        coreSkills: ['Dish & Arch rocks/rolls', 'Side/Front/Back Support', 'Splits (side/front)', 'Frog Balance', 'Forward & Backward Roll (supported)', 'V-Sit (unsupported)', 'Bridge (supported)', 'Tuck Jump', 'Chassé & Cat Leaps'],
        pathway: 'Shapes → Rocks & Rolls → Frog/T-Balance → Forward Roll → Back Roll (to straddle) → Bridge & Leaps',
        cues: '"Strong arms, tight tummy, toes pointed."',
      },
      {
        apparatus: 'Beam / Balance Line',
        coreSkills: ['Straddle Lever or V-Sit Mount', 'Dips', '½ Pivot Turn (sup.)', 'Arabesque', 'Star Jump Dismount'],
        pathway: 'Mount (supported) → simple travel → pivot turn → arabesque hold → star jump dismount',
        cues: '"Arms out – eyes up – land soft."',
      },
      {
        apparatus: 'Bars',
        coreSkills: ['Tuck/Straddle/Pike Hold (5 s)', 'Jump to Front Support', 'Dish/Arch Swing (10 reps)', 'Static Turns (×2)', 'Re-grasp & Back Release Dismount'],
        pathway: 'Floor-bar grip → front support → 10 swings → small turn re-grasp → dismount & present',
        cues: '"Swing from shoulders, not knees; finish tall."',
      },
      {
        apparatus: 'Vault / Rebound',
        coreSkills: ['Run → Hurdle → Springboard → Squat on low vault (2–3 blocks)', 'Tuck Jump off', 'Straddle Jump off'],
        pathway: 'Floor jump → springboard → squat-on → tuck/straddle dismount → present',
        cues: '"Run–Hop–Push–Land–Present."',
      },
    ],
    teachingFocus: [
      'Precision in shape and form.',
      'Controlled entry and exit from apparatus.',
      'Teaching rhythm in swings, jumps, and turns.',
      'Reinforce safety landing (bend–present).',
      'Build confidence through progressive repetition.',
    ],
    assistantRoles: [
      { area: 'Warm-Up', responsibility: 'Lead or demonstrate stretch sequence.' },
      { area: 'Floor Station', responsibility: 'Spot forward/backward rolls safely.' },
      { area: 'Beam / Vault', responsibility: 'Support dismounts and turns.' },
      { area: 'Bars', responsibility: 'Count swings & hold times; cue "block & present."' },
      { area: 'Admin', responsibility: 'Record notes or photos for feedback.' },
    ],
    safetyChecklist: [
      'Mats secure under each apparatus',
      'Springboard locked and aligned',
      '1 gymnast per bar at a time',
      'Check landings before every jump',
      'No socks, jewellery, or water near equipment',
    ],
    coachingReminders: [
      'Lead Coaches may deliver all levels (1–6).',
      'Assistant Coaches may deliver up to Level 3 skills under supervision.',
      'Ensure every child finishes each activity in "Block & Present" position.',
      'Praise small wins and visible progress each week.',
    ],
  },

  {
    level: 3,
    name: 'Improver Gymnastics',
    subtitle: 'UKAG Level 3',
    ageGroup: '4 – 11 yrs',
    delivery: 'All Coaches',
    duration: '45 mins active (65–70 mins total incl. changeover)',
    color: '#7c3aed',
    bgColor: 'bg-violet-700',
    borderColor: 'border-violet-700',
    textColor: 'text-violet-700',
    emoji: '⭐',
    overview: [
      {
        stage: 'Pre-Session Setup',
        time: '15 min before',
        description: 'Coaches prepare 2–3 apparatus stations, safety check, and register while children change/snack.',
        coachingFocus: 'Secure all mats and wall frames, assign assistant to station setup.',
      },
      {
        stage: 'Welcome & Safety Brief',
        time: '5 min',
        description: 'Recap safety signals and routines; introduce new challenge focus for Level 3.',
        coachingFocus: '"We\'re building strength and confidence to try new shapes & movements."',
      },
      {
        stage: 'Heart Raiser',
        time: '5 min',
        description: 'Coach-choice aerobic starter (Shape Circuits / Floor Relay / Beam Walk Race).',
        coachingFocus: 'Focus on control and alignment — warm muscles, not chaos.',
      },
      {
        stage: 'Official UKAG Stretch Sequence',
        time: '10 min',
        description: 'Full-body stretch: Pike / Straddle / Japana / Cat Series / Dish / Arch / Supports.',
        coachingFocus: 'Hold 10 seconds per shape; encourage precision and breathing.',
      },
      {
        stage: 'Skill Rotations (2–3 stations)',
        time: '25–30 min',
        description: 'Apparatus work using Level 3 Award skills. Rotate every 7–8 minutes.',
        coachingFocus: 'Encourage independence, posture, and clean finishes.',
      },
      {
        stage: 'Cool Down & Reflection',
        time: '5 min',
        description: 'Stretch and breathing cool down; group reflection on achievements.',
        coachingFocus: 'Praise risk-taking and confidence.',
      },
      {
        stage: 'Pack Down & Feedback',
        time: '5–10 min',
        description: 'Tidy equipment, log attendance, and submit feedback in the app.',
        coachingFocus: 'Note children ready for Level 4 prep.',
      },
    ],
    objectives: [
      'Develop strength, precision, and confidence in travelling, jumping, and rolling.',
      'Introduce handstands, cartwheels, and supported beam/bars dismounts.',
      'Encourage independence — children start to self-correct and spot shapes.',
      'Reinforce control in transitions and body alignment.',
      'Prepare gymnasts for intermediate apparatus work (Level 4).',
    ],
    progressions: [
      {
        apparatus: 'Floor',
        coreSkills: ['Dish/Arch Rolls', 'Side/Front/Back Support with press', 'Splits', 'Y-Balance', 'Dive Forward Roll', 'Backward Roll', 'Headstand', 'Handstand (supported)', 'Cartwheel (supported)', 'Bridge → Shoulderstand', 'Backbend into Bridge', 'Chassé & Cat Leaps', 'Straddle Jump'],
        pathway: 'Shapes → Rolls → Balances → Inversions → Cartwheel',
        cues: '"Strong arms – eyes between hands – land & present."',
      },
      {
        apparatus: 'Beam / Balance Line',
        coreSkills: ['V-Sit or Kneeling Mount', 'Dipped Leg Lifts', '½ Pivot Turn (on toe)', 'Y-Balance (supported)', 'Straight Jump & Tuck Jump Dismount', 'Coupe Ankles', 'V-Sit to Shoulderstand Roll'],
        pathway: 'Floor line → low beam → toe travel → supported turns & balances → safe landings',
        cues: '"Arms open – tight core – focus forward."',
      },
      {
        apparatus: 'Bars',
        coreSkills: ['Up-Hip Circle (supported)', 'Cast ×3 → Jump to Front Support', 'Forward Dismount (straight arms & legs)', '10 Swings with Re-grasp', 'Rear Dismount', '2× Half Turns'],
        pathway: 'Hang to swing → cast to front support → up-hip support → release dismount',
        cues: '"Swing dish to arch – squeeze the bar – finish tall."',
      },
      {
        apparatus: 'Vault / Rebound',
        coreSkills: ['Squat On/Over (3–4 blocks)', 'Tuck/Straddle Jump Off', 'Block Hold & Present', 'Dive Roll (low mat)', 'Safe Landing Practice'],
        pathway: 'Run → hurdle → springboard → vault → controlled landings',
        cues: '"Fast run – two-foot jump – land soft – arms up."',
      },
    ],
    teachingFocus: [
      'Encourage independence and self-correction.',
      'Begin introducing dynamic movement sequences (link 2–3 skills).',
      'Increase quality of lines, pointed toes, and arm placement.',
      'Reinforce upright posture in landings and dismounts.',
      'Reward confidence and perseverance when learning new shapes.',
    ],
    assistantRoles: [
      { area: 'Warm-Up', responsibility: 'Lead heart raiser or stretch demonstration.' },
      { area: 'Floor', responsibility: 'Spot cartwheels and supported handstands.' },
      { area: 'Beam', responsibility: 'Support turns and dismounts.' },
      { area: 'Bars', responsibility: 'Supervise swing count; assist hip circle setup.' },
      { area: 'Admin', responsibility: 'Record Award progress; help with end-of-session notes.' },
    ],
    safetyChecklist: [
      'Bar mats and crash mats secure under apparatus',
      'Beam height adjusted for confidence',
      'Springboard placement checked before every use',
      '1 gymnast per bar or vault at a time',
      'Wall frames locked when not in use',
    ],
    coachingReminders: [
      'Lead Coaches can deliver Levels 1–6.',
      'Assistant Coaches can deliver Levels 1–3 under supervision.',
      'Always encourage safe exploration but controlled risk-taking.',
      'Reinforce "Block & Present" at every dismount.',
    ],
  },

  {
    level: 4,
    name: 'Intermediate Gymnastics',
    subtitle: 'UKAG Level 4',
    ageGroup: '4 – 11 yrs',
    delivery: 'All Coaches',
    duration: '45 mins active (65–70 mins total incl. transitions)',
    color: '#d97706',
    bgColor: 'bg-amber-600',
    borderColor: 'border-amber-600',
    textColor: 'text-amber-600',
    emoji: '🔥',
    overview: [
      {
        stage: 'Pre-Session Setup',
        time: '15 min before',
        description: 'Coaches arrive early to set up 2–3 apparatus stations, check equipment, and prepare lesson layout.',
        coachingFocus: 'Prioritise safety, clear run-up zones, adjust beam heights.',
      },
      {
        stage: 'Welcome & Safety Brief',
        time: '5 min',
        description: 'Welcome group, review safety rules and session theme ("linking skills with confidence").',
        coachingFocus: 'Demonstrate landings and spotting techniques visually.',
      },
      {
        stage: 'Heart Raiser',
        time: '5 min',
        description: 'Coach-choice cardio start (Shape Relay / Equipment Chase / Circuit Tag).',
        coachingFocus: 'Raise heart rate and introduce agility.',
      },
      {
        stage: 'Official UKAG Stretch Sequence',
        time: '10 min',
        description: 'Pike/Straddle holds, Japana stretch, Cat series, Bridge, Dish/Arch, Support shapes.',
        coachingFocus: 'Hold longer positions; improve form and control.',
      },
      {
        stage: 'Skill Rotations (2–3 stations)',
        time: '25–30 min',
        description: 'Apparatus-based work from Level 4 Awards. Increase precision, link skills together.',
        coachingFocus: 'Encourage independence and sequencing.',
      },
      {
        stage: 'Cool Down & Reflection',
        time: '5 min',
        description: 'Group stretch and breathing focus; reflect on confidence and control.',
        coachingFocus: 'Discuss what went well / new skill attempted.',
      },
      {
        stage: 'Pack Down & Change/Snack',
        time: '10–15 min',
        description: 'Coaches pack away equipment safely. Children change and have their snack.',
        coachingFocus: 'Maintain supervision; ensure smooth handover to parents/teachers.',
      },
    ],
    objectives: [
      'Develop linking sequences across multiple apparatus.',
      'Improve balance, power, and landing technique.',
      'Strengthen inversions (handstands, bridges, walkovers).',
      'Build independence — gymnasts recall and perform learned skills.',
      'Reinforce safe transitions and preparation for higher-level routines.',
    ],
    progressions: [
      {
        apparatus: 'Floor',
        coreSkills: ['Handstand Forward Roll', 'Dive Forward Roll to Bunny Hop', 'Back Roll to Front Support', 'Cartwheel (1 Hand / Side-to-Side)', 'Shoulderstand', 'Backward Walkover (supported)', 'Handstand → Forward Roll', 'Chassé / Cat Leaps / Stag Leaps', 'Roundoff'],
        pathway: 'Shapes → Rolls → Inversions → Cartwheel → Linked Sequences',
        cues: '"Strong push – arms locked – eyes between hands – stretch to finish."',
      },
      {
        apparatus: 'Beam / Balance Line',
        coreSkills: ['Simple Mount', 'Dipped Leg Lifts on Tiptoes', 'Squat Pivot Turn', 'Forward Roll on Low Beam (optional)', 'Y-Balance', 'Cat Leap', 'Cartwheel (supported)', 'Roundoff Dismount'],
        pathway: 'Floor line → low beam → supported inversion → cartwheel dismount',
        cues: '"Focus forward – core tight – soft landings."',
      },
      {
        apparatus: 'Bars',
        coreSkills: ['Up-Hip Circle (1 leg allowed)', 'Casts to Back Hip Circle (supported)', 'Stand or Straddle Jump to High Bar', '10 Re-grasps', 'German Back Hang (supported)', 'Straight Dismount'],
        pathway: 'Floor bar → low bar → cast/hip circle → transfer → high bar swings',
        cues: '"Swing dish to arch – press hips – finish block."',
      },
      {
        apparatus: 'Vault / Rebound',
        coreSkills: ['Squat Through / Straddle Over (3–4 blocks)', 'Headspring / Handspring (supported)', 'Dive Forward Roll', 'Handstand Flat Back (trampette)'],
        pathway: 'Run → hurdle → board → vault → landing → linking jumps',
        cues: '"Fast run – strong push – land soft – arms up."',
      },
    ],
    teachingFocus: [
      'Link 2–3 skills into short sequences.',
      'Improve technique, posture, and pointed toe control.',
      'Encourage spatial awareness in inversions.',
      'Increase independence — gymnasts take more ownership.',
      'Spot safely but reduce reliance on support as confidence grows.',
    ],
    assistantRoles: [
      { area: 'Warm-Up', responsibility: 'Lead heart raiser or stretch under direction.' },
      { area: 'Floor', responsibility: 'Support rolls, bridges, or cartwheel entries.' },
      { area: 'Beam', responsibility: 'Help gymnasts mount and dismount safely.' },
      { area: 'Bars', responsibility: 'Supervise swing count and spot supported hip circles.' },
      { area: 'Admin', responsibility: 'Record progress for Award tracking.' },
    ],
    safetyChecklist: [
      'Springboard and vault boxes secured before every run',
      'Spotter positioned on active apparatus',
      'Mats cover all dismount and landing areas',
      '1 gymnast per bar at a time',
      'Equipment checked for stability before each rotation',
    ],
    coachingReminders: [
      'Lead Coaches may deliver Levels 1–6.',
      'Assistant Coaches may assist up to Level 3 skills only.',
      'Encourage confidence over perfection — praise visible effort.',
      'End every session with calm, structured change & snack routine.',
      'Reinforce "Block & Present" across all apparatus.',
    ],
  },

  {
    level: 5,
    name: 'Advanced Foundation Gymnastics',
    subtitle: 'UKAG Level 5',
    ageGroup: '4 – 11 yrs',
    delivery: 'Lead Coach (Level 2+)',
    duration: '45 mins active (65–70 mins total incl. transitions)',
    color: '#dc2626',
    bgColor: 'bg-red-600',
    borderColor: 'border-red-600',
    textColor: 'text-red-600',
    emoji: '🏅',
    overview: [
      {
        stage: 'Pre-Session Setup',
        time: '15 min before',
        description: 'Lead coach sets up apparatus (Vault / Beam / Bars / Floor), completes safety checks, briefs assistant coaches.',
        coachingFocus: 'Confirm mats secure, vault height safe, bar supports stable.',
      },
      {
        stage: 'Welcome & Safety Brief',
        time: '5 min',
        description: 'Revisit "controlled power" and focus for the session (e.g., linking power skills).',
        coachingFocus: 'Use visual demo of handspring or hip circle to set goal.',
      },
      {
        stage: 'Heart Raiser',
        time: '5 min',
        description: 'Coach-choice power game (Sprint Tag / Vault Run Relay / Jump Challenge).',
        coachingFocus: 'Focus on leg drive and upper-body activation.',
      },
      {
        stage: 'Official UKAG Stretch Sequence',
        time: '10 min',
        description: 'Dynamic stretches + Bridge to Kick-Over prep + Dish/Arch holds (10 s) + Splits.',
        coachingFocus: 'Hold each shape with accuracy and breath control.',
      },
      {
        stage: 'Skill Rotations (2–3 stations)',
        time: '25–30 min',
        description: 'Apparatus stations from Level 5 Awards. Coach power, control, and safe spotting.',
        coachingFocus: 'Precision, power, and self-correction.',
      },
      {
        stage: 'Cool Down & Reflection',
        time: '5 min',
        description: 'Static stretches and deep breathing; reflect on achievement & confidence.',
        coachingFocus: 'Encourage children to name skills they mastered.',
      },
      {
        stage: 'Pack Down & Change/Snack',
        time: '10–15 min',
        description: 'Coaches tidy equipment safely while children change and have snack.',
        coachingFocus: 'Supervise and support smooth transition to collection.',
      },
    ],
    objectives: [
      'Develop power, speed, and body tension for dynamic skills.',
      'Strengthen foundational inversions (bridges, handsprings, walkovers).',
      'Introduce basic flight skills on vault and trampette.',
      'Build confidence in performing short linked routines.',
      'Reinforce safety and self-awareness through coach-assisted progressions.',
    ],
    progressions: [
      {
        apparatus: 'Floor',
        coreSkills: ['Back Roll → Handstand', 'Handstand Pirouette', 'Cartwheel ×2 (consecutive)', 'Back Handspring (supported)', 'Forward Walkover (supported)'],
        pathway: 'Roll → Handstand → Cartwheel → Link → Walkover',
        cues: '"Strong arms – push through shoulders – finish block and present."',
      },
      {
        apparatus: 'Beam / Line',
        coreSkills: ['Springboard Tuck Mount', 'Full Coupe', '½ and Full Pivot Turns', 'Star Jump (supported)', 'Handstand (supported)', 'Cartwheel / Round-off Dismount'],
        pathway: 'Low beam mount → turns → supported handstand → cartwheel off',
        cues: '"Eyes forward – hips square – land soft."',
      },
      {
        apparatus: 'Bars',
        coreSkills: ['Up Hip Circle (from 2 feet)', 'Clear Hip Circle (assisted)', 'Squat/Straddle Swing to Undershoot', 'Jump to High Bar → 2× ½ Turns', 'German Back Hang Dismount'],
        pathway: 'Low bar hip circle → clear hip → swing transfer → release',
        cues: '"Open shoulders – tight legs – press the bar."',
      },
      {
        apparatus: 'Vault / Rebound',
        coreSkills: ['Squat Through', 'Straddle Over', 'Handspring (¾ Vault)', 'Headspring (Trampette)', 'Dive Forward Roll', 'Front Tuck (Trampette)'],
        pathway: 'Run → Hurdle → Board → Block Vault → Tuck Land',
        cues: '"Fast run – strong block – land soft – arms up."',
      },
    ],
    teachingFocus: [
      'Encourage controlled power and extension.',
      'Teach safe spotting techniques for inversions and flight skills.',
      'Promote linking of 2–3 skills into mini routines.',
      'Strengthen core engagement and balance on apparatus.',
      'Encourage independent self-correction and awareness of form.',
    ],
    assistantRoles: [
      { area: 'Warm-Up', responsibility: 'Lead heart raiser under lead direction; support stretch demo.' },
      { area: 'Floor Station', responsibility: 'Assist with spotting rolls and cartwheel drills only – no handsprings.' },
      { area: 'Beam / Vault', responsibility: 'Supervise mounts and landings; maintain safety spacing.' },
      { area: 'Bars', responsibility: 'Count swings and hold times; never spot flight elements.' },
      { area: 'Admin', responsibility: 'Record attendance & progress notes for feedback.' },
    ],
    safetyChecklist: [
      'Vault run clear and dry',
      'Springboard aligned to vault box',
      'Crash mats cover landing zones',
      'Bar area matted and 1 gymnast at a time',
      'Spotter ready for handsprings or walkovers',
    ],
    coachingReminders: [
      'Only Lead Coaches deliver Level 5 skills independently.',
      'Assistants may support basic progressions only (Levels 1–3).',
      'Prioritise technique over height or speed — quality first.',
      'Always finish every station in "Block & Present."',
      'Ensure children change and snack after class while coaches pack down.',
    ],
  },
]
