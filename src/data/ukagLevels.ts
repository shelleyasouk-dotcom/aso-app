export interface CoachingTechnique {
  title: string
  detail: string
}

export interface CoachingAid {
  name: string
  purpose: string
}

export interface CoachingGuide {
  intro: string
  techniques: CoachingTechnique[]
  supportIdeas: string[]
  coachingAids: CoachingAid[]
  whatToWatch: string[]
  howToDevelop: string[]
  motivationTips: string[]
}

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
  coachingGuide: CoachingGuide
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
    coachingGuide: {
      intro: 'Level 1 is about building trust, confidence, and the foundations of gymnastics movement. Many children will never have done gymnastics before. Your role is to create a safe, enjoyable environment where every child feels successful from the very first session.',
      techniques: [
        { title: 'Show Before You Tell', detail: 'Always demonstrate skills visually before explaining. Children at this age learn by watching and mimicking — exaggerate your shapes so they are easy to copy.' },
        { title: 'Use Shape Names as Triggers', detail: 'Teach "Dish", "Arch", "Tuck", "Pike", "Straddle" as vocabulary triggers. Call out a shape name and see who can make it fastest — instant engagement.' },
        { title: 'Count Together', detail: 'Use counting (1–5 or 1–10) for holds. This gives children a clear endpoint and builds body tension naturally: "Hold it… 1, 2, 3, 4, 5 — brilliant!"' },
        { title: 'One Instruction at a Time', detail: 'Give one cue, watch, correct, then move on. Overloading children causes confusion. Simple, visual, specific — then repeat.' },
        { title: 'Pair Demonstrations With a Child', detail: 'Ask a child to demonstrate while you describe what they are doing well. This builds confidence in the demonstrator and attention in the group.' },
      ],
      supportIdeas: [
        'Support rolls from the side — one hand under the shoulder, one at the hip. Never push from behind.',
        'For beam balances, hover hands close without touching to build confidence without creating dependency.',
        'On bars, support the hips in forward circles with both hands from the side.',
        'Use "magic hands" language — "I am just here in case — you are doing all the work."',
        'Gradually remove contact: count holds and step back one small step each time.',
        'For floor shapes, sit in front of the child and model the shape while they copy you.',
      ],
      coachingAids: [
        { name: 'Foam Wedge Mat', purpose: 'Use to assist forward rolls — reduces fear and builds rolling confidence through a gentle incline.' },
        { name: 'Coloured Tape on Floor', purpose: 'Mark beam lines, take-off zones, and landing targets to give clear spatial guidance.' },
        { name: 'Bean Bags on Feet', purpose: 'Place a bean bag on each foot during dish/arch holds — encourages pointed toes and body tension through a simple tactile goal.' },
        { name: 'Hula Hoops', purpose: 'Use as landing targets for jumps — "land in the hoop" creates a clear visual goal for two-foot landings.' },
        { name: 'Wall or Mirror', purpose: 'If available, let children check their own shapes — builds body awareness without verbal correction.' },
      ],
      whatToWatch: [
        'Floppy arms and legs in shapes — cue "squeeze like a robot" to switch on body tension.',
        'Children who rush — speed before control creates unsafe landings. Slow everything down.',
        'Fear or reluctance on apparatus — never force. Use floor-level alternatives and build up slowly.',
        'Collapsed knees on jump landings — reinforce "soft knees — not locked straight, not sitting down."',
        'Eyes wandering rather than focused forward — "eyes up, look where you are going."',
        'Thumbs on top of the bar rather than full grip — always correct to thumb-around grip from day one.',
      ],
      howToDevelop: [
        'Progress shapes to rolls: Dish → rock to dish → forward rock → guided forward roll → independent forward roll.',
        'Progress jumps: standing jump → half-turn jump → tuck jump → star jump → land and present every time.',
        'Progress beam: floor line → chalk line → 10 cm mat strip → low beam (supported) → low beam (independent).',
        'Progress bars: floor bar shapes → hang and drop → 3 swings → 5 swings → forward circle (supported).',
        'Once a child holds a shape for 5 seconds, increase to 10 — then introduce moving into and out of the shape.',
      ],
      motivationTips: [
        '"You got it — now can you make it even stronger?"',
        'Give each child a "skill of the day" shout-out at the end of the session.',
        'Use team challenges: "Can the whole group hold dish for 5 seconds together?"',
        '"I love how still you held that — let\'s try 3 more seconds."',
        'Celebrate small wins loudly — every child should hear specific praise at least once per session.',
      ],
    },
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
    coachingGuide: {
      intro: 'Level 2 gymnasts have some gymnastics experience and are building on their foundational shapes. The focus shifts from exploration to repetition with purpose — more control, cleaner shapes, and the first real movement sequences. Precision and confidence grow together at this level.',
      techniques: [
        { title: 'Precision Over Repetition', detail: 'Rather than 10 sloppy rolls, do 3 excellent ones. Set a quality standard and hold to it: "That was good — let\'s do one more exactly like that."' },
        { title: 'Before and After Coaching', detail: 'Help children plan the skill: "What position are you starting in? What shape do you land in?" This builds spatial and body awareness.' },
        { title: 'Mirror and Match', detail: 'Have children mirror your shapes in real time — particularly useful for stretching and arm placements. It trains accuracy without verbal correction.' },
        { title: 'Name the Specific Fix', detail: 'Instead of "nearly right," name exactly what needs to change: "legs straight" or "chin tucked" or "arms by your ears." Be specific every time.' },
        { title: 'Countdown to Independence', detail: 'Use a decreasing support system: full support → one finger → hover → no contact. Announce each step so the child understands you are reducing help intentionally.' },
      ],
      supportIdeas: [
        'For backward rolls: guide hands to the floor from behind the head — never push the hips over.',
        'For beam turns: hold the wrist (not the hand) to guide the pivot without transferring your weight to them.',
        'For bar swings: stand to the side with one hand lightly on the lower back to initiate the first dish position.',
        'Never pull a child through a skill — guide the movement and let them feel the weight shift themselves.',
        'Spot from the side on vault approaches so you can react to both contact and landing.',
        'Use a "hover hand" — close enough to catch but not touching — to build confidence through presence alone.',
      ],
      coachingAids: [
        { name: 'Wedge Mat', purpose: 'Essential for backward rolls — position behind the child so they roll down a gentle slope naturally.' },
        { name: 'Low Beam (10–15 cm)', purpose: 'Step up from floor lines for turn and balance work without significant fall risk.' },
        { name: 'Springboard Blocks (2–3 stacked)', purpose: 'Reduce vault height for controlled squat-on/squat-off work before full height.' },
        { name: 'Floor Bar', purpose: 'Use a floor-level bar for front support and grip drills before children move to height.' },
        { name: 'Spot Belt', purpose: 'Optional for early jump progressions on rebound — gives coach full control of rotation.' },
      ],
      whatToWatch: [
        'Rounded back in forward rolls — chin should tuck, not push forward.',
        '"Banana back" in dish holds — lower back off the floor means core is not engaged.',
        'Arms collapsing in front support — shoulder shrug is the sign; locked elbows and pressed shoulders is the goal.',
        'No control in tuck/straddle jumps — feet together and arms in position before every take-off.',
        'Gripping beam with thighs — encourage light touch on toes, not a pinch grip.',
        'Rushing the landing — every skill must finish in Block and Present before the next one begins.',
      ],
      howToDevelop: [
        'Progress rolls: forward roll → forward roll to standing → forward roll to straddle stand → dive roll.',
        'Progress beam: tiptoe walk → step-turn → half pivot → star jump dismount (with control).',
        'Progress bars: 5 swings → 10 swings → re-grasp → first static half turn.',
        'Progress vault: squat-on from floor → springboard approach → squat on 2 blocks → add tuck dismount.',
        'When a child does a skill 3 times in a row with control, reduce support and increase the challenge.',
      ],
      motivationTips: [
        '"Remember when you could not do that? Look at you now."',
        '"Three more perfect ones and you have really got it."',
        'Set a personal challenge: "Last week was 5 swings — can you do 7 today?"',
        '"Show me your very best version of that."',
        'End sessions with a group skills count: how many things did we work on today?',
      ],
    },
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
    coachingGuide: {
      intro: 'Level 3 gymnasts are gaining real confidence and are ready for inversions, independence, and more complex movements. Your coaching shifts toward quality and technique — helping gymnasts understand WHY a skill looks right, not just WHAT to do. Self-awareness begins here.',
      techniques: [
        { title: 'Teach Skills as Three Phases', detail: 'Break every skill into entry, action, and exit: "What shape are you in before the cartwheel? During? After?" This builds understanding and trains self-correction.' },
        { title: 'Use Drill Sequences', detail: 'Rather than repeating a full skill, isolate its components. Kick-to-wall drills before a freestanding handstand. Cartwheel entry drills before the full movement.' },
        { title: 'Give Gymnasts Ownership', detail: 'Ask: "How did that feel? What would you change?" This reduces coach dependency and trains the gymnast to observe and correct themselves.' },
        { title: 'Visual Reference Points', detail: 'Use marks, cones, or tape as targets: "Land between these two marks." Removes guesswork and creates measurable progress.' },
        { title: 'Graduated Challenge', detail: 'Once a skill is achieved, extend it immediately: "Can you do two in a row? Can you do it on the other side?" Keeps motivated gymnasts moving forward.' },
      ],
      supportIdeas: [
        'Handstand support: stand to the side, one hand on the hip, one at the knee — guide alignment, do not carry weight.',
        'Cartwheel support: hold the waist lightly and step alongside the gymnast through the movement. Release before the landing phase.',
        'Hip circle on bars: both hands on hips from behind, guide the rotation — never push from the back or shoulders.',
        'Backward roll: guide the head down after hands push — never push hips over.',
        'For turns on beam: hold one wrist loosely as an anchor, let the child transfer the weight themselves.',
        'Use a crash mat as a confidence ladder: start it flat, then raise it so the gymnast safely feels the sensation of a new skill.',
      ],
      coachingAids: [
        { name: 'Wall for Handstands', purpose: 'A wall gives gymnasts a safe, predictable landing surface and helps them feel the correct vertical line of the body.' },
        { name: 'Wedge Mat', purpose: 'For backward roll assistance and cartwheel entry practice — the angled surface helps gymnasts feel the correct weight transfer.' },
        { name: 'Incline / Cheese Mat', purpose: 'For bridge and back bend work — reduces shoulder and spine loading while building the flexibility and confidence needed for walkovers.' },
        { name: 'Coloured Spot Marks', purpose: 'Place hand and foot targets for cartwheel and handstand work — removes spatial guessing and creates clear feedback.' },
        { name: 'Low Crash Mat Stack', purpose: 'Build a landing zone at the end of bars for dismounts — raising the floor gives gymnasts confidence to commit fully.' },
      ],
      whatToWatch: [
        'Bent arms in handstands — "lock out your elbows and push the floor away from you."',
        'Dropping hips in cartwheels — look for a smooth arc; a collapse in the middle means the kick was too low.',
        'Head back in backward rolls — chin should tuck to chest first, every time.',
        'Twisting on vault landings — block with both hands, land on two feet together before adding any shape.',
        'Over-gripping on bars — tight knuckles waste energy; "relax the hands, squeeze only as you pass the bar."',
        'Fear at height on beam — never hurry a nervous gymnast. Build confidence with lower apparatus before progressing.',
      ],
      howToDevelop: [
        'Progress handstands: kick to wall → hold 3 sec → hold 5 sec → lower to floor under control → free balance.',
        'Progress cartwheels: side cartwheel → both sides → kick through → round-off preparation.',
        'Progress bars: 10 swings → up-hip circle (supported) → cast to front support → half turn.',
        'Progress beam: floor routine → low beam → full beam with turns and dismount.',
        'Once inversions are stable, start linking: cartwheel → straight jump → Block and Present.',
      ],
      motivationTips: [
        '"That is a Level 3 skill — you just did it."',
        '"I need you to trust your arms — they are stronger than you think."',
        'Use peer learning: "Watch how [name] keeps her arms straight — that is exactly it."',
        '"Let\'s see if you can do it with no support this time."',
        'At Level 3 celebrate the attempt as much as the success — courage earns praise too.',
      ],
    },
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
  {
    level: 6,
    name: 'Advanced Gymnastics',
    subtitle: 'Lead Coaches Only',
    ageGroup: '4–11 yrs',
    delivery: 'Lead Coaches only',
    duration: '45 mins active (65–70 mins total)',
    emoji: '🏆',
    color: '#0e7490',
    bgColor: 'bg-cyan-700',
    borderColor: 'border-cyan-700',
    textColor: 'text-cyan-700',
    overview: [
      { stage: 'Pre-Session Setup', time: '15 min before', description: 'Lead coach sets up full apparatus layout (Floor, Beam, Bars, Vault/Trampette). Check all mats, spot zones, and crash landings.', coachingFocus: 'Secure high-impact areas, ensure adequate spotting staff.' },
      { stage: 'Welcome & Safety Brief', time: '5 min', description: 'Introduce theme: "Control + Creativity." Review safety, spotting zones, and expectations for independence.', coachingFocus: 'Model aerial or linking skill visually; explain controlled exits.' },
      { stage: 'Heart Raiser', time: '5 min', description: 'Power-based warm-up (Sprint Circuit / Tuck Jump Relay / Shape Chase).', coachingFocus: 'Activate legs and shoulders; emphasise posture and focus.' },
      { stage: 'Official UKAG Stretch Sequence', time: '10 min', description: 'Advanced version — Pike, Straddle, Japana, Bridge to Kick-Over, Dish/Arch, Shoulder openers, Full Splits (20 s holds).', coachingFocus: 'Increase precision and range of motion.' },
      { stage: 'Skill Rotations (2–3 stations)', time: '25–30 min', description: 'Level 6 apparatus skills and sequences. Rotate every 8 min; encourage self-coaching.', coachingFocus: 'Teach dynamic connection between power and control.' },
      { stage: 'Cool Down & Reflection', time: '5 min', description: 'Static stretching and breathing. Group reflection on focus and creativity.', coachingFocus: 'Praise mastery and goal-setting for next session.' },
      { stage: 'Pack Down & Change/Snack', time: '10–15 min', description: 'Coaches clear equipment; children change and have snack.', coachingFocus: 'Maintain calm, structured handover; check safety.' },
    ],
    objectives: [
      'Consolidate technical skill accuracy and power.',
      'Introduce safe aerial and twisting movements.',
      'Perform linked mini-routines confidently.',
      'Develop body awareness, rhythm, and artistry.',
      'Reinforce independence, self-correction, and peer support.',
    ],
    progressions: [
      {
        apparatus: 'Floor',
        coreSkills: [
          'Round-off Back Tuck',
          'Round-off → Back Handspring (multi)',
          'Flyspring',
          'Aerial Cartwheel',
        ],
        pathway: 'Round-off → Handspring → Tuck → Layout → Aerial link',
        cues: '"Fast run – block through shoulders – tight core – land and present."',
      },
      {
        apparatus: 'Beam / Line',
        coreSkills: [
          'Individual Routine (travels, leaps, balances, turns, tumble dismount)',
        ],
        pathway: 'Low beam sequence → full beam travel → link leaps & turns → dismount',
        cues: '"Focus eyes – breathe steady – control each transition."',
      },
      {
        apparatus: 'Bars',
        coreSkills: [
          'Upstart from 2 feet',
          'Clear Hip Circle',
          'Squat/Straddle Swing to Upstart',
          'Forward Swing → Back Tuck Dismount',
        ],
        pathway: 'Low bar cast → clear hip → upstart → swing + release',
        cues: '"Hips open – squeeze bar – extend on release – block finish."',
      },
      {
        apparatus: 'Vault / Rebound',
        coreSkills: [
          'Handspring ½ Turn B&P',
          'Front Tuck (Trampette)',
          'Back Tuck (Platform)',
        ],
        pathway: 'Handspring flat-back → ½ turn → front/back tuck',
        cues: '"Fast run – explode off board – tight tuck – soft landing."',
      },
    ],
    teachingFocus: [
      'Emphasise safe power and precise technique.',
      'Develop routine building — encourage creative linking of 3–5 skills.',
      'Reinforce strength control in aerial movements.',
      'Allow gymnasts to problem-solve and self-coach corrections.',
      'Highlight artistry, performance quality, and presentation.',
    ],
    assistantRoles: [
      { area: 'Warm-Up', responsibility: 'May assist with stretch demonstration only under Lead supervision.' },
      { area: 'Floor / Beam', responsibility: 'Manage safety spacing; no spotting aerials or flight elements.' },
      { area: 'Bars / Vault', responsibility: 'Support setup and visual feedback only.' },
      { area: 'Admin', responsibility: 'Record attendance, photos, and progress for Awards.' },
    ],
    safetyChecklist: [
      'Extra mats for aerial and vault landings',
      '1 gymnast per apparatus at a time',
      'Spotter assigned for every flight station',
      'Vault run clear and non-slip',
      'Equipment re-checked before and after each class',
    ],
    coachingReminders: [
      'Only Lead Coaches may deliver Level 6 independently.',
      'Prioritise safe progression over skill difficulty.',
      'Always reinforce "Block & Present" at each dismount.',
      'Celebrate creativity — allow gymnasts to design short routines.',
      'Ensure calm post-session change/snack routine and clear handover.',
    ],
  },
]
