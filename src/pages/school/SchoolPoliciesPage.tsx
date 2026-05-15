import { useState } from 'react'
import { ChevronDown, ChevronRight, ShieldCheck } from 'lucide-react'
import { SchoolLayout } from '../../components/layout/SchoolLayout'

type ContentItem =
  | { type: 'text'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'numbered'; items: string[] }
  | { type: 'subheading'; text: string }
  | { type: 'table'; rows: string[][] }
  | { type: 'note'; text: string }

interface PolicySection {
  heading: string
  content: ContentItem[]
}

interface Policy {
  number: number
  title: string
  intro?: string
  sections: PolicySection[]
}

const POLICIES: Policy[] = [
  {
    number: 1,
    title: 'Safeguarding & Child Protection',
    intro: 'Active School Org is committed to safeguarding and promoting the welfare of all children in our care. This commitment applies to every member of staff, at every session, without exception.',
    sections: [
      {
        heading: '1.1 Our Safeguarding Commitment',
        content: [{ type: 'bullets', items: [
          'All staff complete annual safeguarding training in line with Keeping Children Safe in Education (KCSIE)',
          'All sessions follow ASO\'s Safeguarding and Child Protection Policy, reviewed annually',
          'Our provision meets Section 175/157 safeguarding duties as an after-school activity',
          'All staff hold Enhanced DBS certificates including the children\'s barred list check',
          'Safeguarding concerns are reported to the school\'s DSL on the same day — joint working is maintained at all times',
          'ASO recognises that ultimate site safeguarding responsibility during term time remains with the school',
        ]}],
      },
      {
        heading: '1.2 Named Safeguarding Leads',
        content: [{ type: 'table', rows: [
          ['Role', 'Name', 'Contact'],
          ['Designated Safeguarding Lead (DSL)', 'Shelley Wood / Naima Clarke', 'Shelley.asouk@asouk.com | 07814 899151 / Naima.asouk@gmail.com'],
          ['Deputy DSL — South Wiltshire & Somerset', 'Mandy Woolford', 'mandy.asouk@gmail.com'],
          ['Deputy DSL — Hampshire', 'Mia Craig', 'mia.asouk@gmail.com'],
          ['Deputy DSL — Dorset', 'Cally Rigby', 'cally.asouk@gmail.com'],
        ]}],
      },
      {
        heading: '1.3 Safeguarding Disclosure Process',
        content: [
          { type: 'text', text: 'If a child makes a disclosure or a concern arises during a session:' },
          { type: 'numbered', items: [
            'The coach listens calmly, does not ask leading questions, and does not promise confidentiality',
            'The coach records exactly what was said — word for word — as soon as the session ends',
            'The concern is reported to the Area Lead (Deputy DSL) the same day',
            'The Area Lead reports to the ASO DSL and the school\'s DSL on the same day',
            'ASO follows KCSIE and local authority referral routes where required',
            'All concerns are recorded on the ASO Safeguarding Concern Form and stored securely',
          ]},
          { type: 'note', text: 'If a child is in immediate danger — call 999 first. Then notify the ASO DSL and the school\'s DSL immediately.' },
        ],
      },
      {
        heading: '1.4 Local Referral Routes',
        content: [{ type: 'text', text: 'ASO coaches and Area Leads are briefed on local referral routes into children\'s social care at the point of area onboarding. The specific local authority referral pathway for each area is confirmed with the school\'s DSL at the start of each partnership. In all cases, if there is immediate risk of harm, the police and emergency services are contacted first (999), followed by notification to the school\'s DSL and the ASO DSL.' }],
      },
      {
        heading: '1.5 Online Safety',
        content: [{ type: 'text', text: 'All ASO staff are trained on online safeguarding risks as part of their annual safeguarding training. Staff are prohibited from communicating with children or families via personal social media accounts or personal messaging apps. All digital communication with parents is managed through ASO\'s official channels.' }],
      },
      {
        heading: '1.6 Safer Recruitment',
        content: [{ type: 'text', text: 'ASO operates a safer recruitment process for all staff. This includes enhanced DBS checks, reference checks, identity verification, and structured interviews. See Policy 5 for full details.' }],
      },
      {
        heading: '1.7 Policy Review',
        content: [{ type: 'text', text: 'This policy is reviewed annually and updated in line with KCSIE guidance. The current version applies for the academic year 2025–2026. Schools will be notified of any significant changes.' }],
      },
    ],
  },
  {
    number: 2,
    title: 'Staff Behaviour & Code of Conduct',
    intro: 'All ASO staff are required to read, sign, and abide by the ASO Code of Conduct before working in any school. This policy sets out the standards of behaviour expected at all times.',
    sections: [
      {
        heading: '2.1 Expected Standards',
        content: [{ type: 'bullets', items: [
          'Treat all children with dignity, respect, and patience at all times',
          'Arrive punctually and in correct ASO uniform for every session',
          'Behave professionally in front of children, parents, and school staff',
          'Follow all ASO safeguarding, health and safety, and operational procedures',
          'Report any concerns — safeguarding, safety, or conduct — promptly through the correct channels',
          'Maintain confidentiality regarding children, families, and school information',
        ]}],
      },
      {
        heading: '2.2 Prohibited Conduct',
        content: [{ type: 'bullets', items: [
          'Physical contact with children beyond what is required for safety purposes',
          'Communicating with children or families via personal social media or messaging apps',
          'Photographing or filming children without explicit authorisation from ASO management',
          'Being alone with a single child in a closed or unsupervised space',
          'Using inappropriate language in the presence of children, parents, or school staff',
          'Consuming alcohol or controlled substances before or during sessions',
          'Sharing confidential information about children, families, or schools',
          'Making commitments to schools or parents on behalf of ASO without authorisation',
        ]}],
      },
      {
        heading: '2.3 Consequences of Breach',
        content: [
          { type: 'text', text: 'Any breach of this Code of Conduct will be taken seriously. Depending on the nature of the breach:' },
          { type: 'bullets', items: [
            'Minor breaches — informal conversation with Lead Coach or Area Lead',
            'Repeated or moderate breaches — formal written warning from the Operations Director',
            'Serious breaches — immediate suspension pending investigation',
            'Safeguarding breaches — immediate suspension and referral to relevant authorities',
          ]},
          { type: 'text', text: 'All ASO staff sign a copy of the Code of Conduct at the point of onboarding. A copy is held on their staff file and is available to schools on request.' },
        ],
      },
    ],
  },
  {
    number: 3,
    title: 'Whistleblowing Policy',
    intro: 'Active School Org is committed to the highest standards of conduct and accountability. We encourage all staff to raise concerns about malpractice, unsafe practices, or breaches of policy without fear of detriment.',
    sections: [
      {
        heading: '3.1 What This Policy Covers',
        content: [
          { type: 'text', text: 'This policy applies to concerns about:' },
          { type: 'bullets', items: [
            'Safeguarding or child protection failures',
            'Health and safety risks not being properly managed',
            'Fraudulent or dishonest behaviour',
            'Breaches of legal obligations',
            'Cover-up of any of the above',
            'Any conduct that puts children, staff, or the public at risk',
          ]},
        ],
      },
      {
        heading: '3.2 How to Raise a Concern',
        content: [{ type: 'numbered', items: [
          'In the first instance, raise the concern with your Area Lead',
          'If the concern involves the Area Lead, raise it directly with Naima at info@activeschool.org.uk',
          'If the concern involves senior management, raise it with the Operations Director at ops@activeschool.org.uk',
          'For safeguarding concerns, always contact the DSL directly: safeguarding@activeschool.org.uk',
          'Concerns can be raised verbally or in writing — written is preferred so there is a clear record',
        ]}],
      },
      {
        heading: '3.3 Protection for Whistleblowers',
        content: [{ type: 'bullets', items: [
          'ASO will not tolerate victimisation, harassment, or disciplinary action against anyone who raises a genuine concern in good faith',
          'Concerns raised anonymously will still be investigated where possible',
          'If a member of staff feels their concern has not been addressed, they may contact the relevant local authority, Ofsted, or the NSPCC Whistleblowing Helpline: 0800 028 0285',
        ]}],
      },
      {
        heading: '3.4 External Reporting',
        content: [
          { type: 'text', text: 'Staff and partners are not prevented from reporting concerns directly to external bodies including:' },
          { type: 'bullets', items: [
            'The Local Authority Designated Officer (LADO) — for concerns about adults working with children',
            'Ofsted — for concerns about the quality or safety of provision',
            'The police — where there is an immediate risk of harm',
            'NSPCC Whistleblowing Helpline — 0800 028 0285',
          ]},
        ],
      },
    ],
  },
  {
    number: 4,
    title: 'Collection & Dismissal Policy',
    intro: 'The safe handover of every child at the end of every session is a non-negotiable safeguarding requirement. This policy sets out how ASO manages collection and dismissal.',
    sections: [
      {
        heading: '4.1 Standard Dismissal',
        content: [{ type: 'bullets', items: [
          'Children are lined up inside the hall — the door is not opened until a parent or guardian is visible',
          'Each child is called individually by name',
          'Children are only released to a named adult listed on their registration form',
          'If the collecting adult is not recognised, their name is checked against the register before release',
          'No child leaves the premises unaccompanied under any circumstances',
        ]}],
      },
      {
        heading: '4.2 Alternative Collection',
        content: [
          { type: 'text', text: 'If a child is to be collected by someone other than their registered contact:' },
          { type: 'numbered', items: [
            'The parent must notify ASO in advance — in writing via email to info@activeschool.org.uk, or by informing the Lead Coach directly at the start of the session',
            'If no prior notification has been received, the child will not be released to an unconfirmed adult',
            'The Lead Coach will contact the registered parent or guardian to confirm the arrangement before any release',
            'Any unconfirmed collection attempts are logged on the Incident Report Form the same day',
          ]},
        ],
      },
      {
        heading: '4.3 Late Collection',
        content: [
          { type: 'text', text: 'If a child has not been collected within 15 minutes of the session ending:' },
          { type: 'numbered', items: [
            'The Lead Coach stays with the child — the child is never left alone',
            'The Lead Coach contacts the parent or guardian on the registered number',
            'If no answer, the secondary emergency contact is called immediately',
            'If still no answer, the Area Lead is contacted',
            'The Area Lead contacts Naima and follows the school\'s late collection protocol',
            'Under no circumstances is the child taken off the premises',
            'Under no circumstances is the child released to an adult not on their contact list',
            'The incident is logged on the Incident Report Form the same day',
          ]},
          { type: 'note', text: 'Persistent late collection will result in a formal conversation with the parent and may result in the child\'s place being reviewed.' },
        ],
      },
      {
        heading: '4.4 Self-Dismissal',
        content: [{ type: 'text', text: 'Children will not be permitted to leave a session unaccompanied regardless of age, unless written permission has been provided in advance by the parent and formally agreed by the ASO Area Lead and the school.' }],
      },
    ],
  },
  {
    number: 5,
    title: 'Staff Suitability — DBS, Identity & Right to Work',
    intro: 'Active School Org operates a robust safer recruitment and staff suitability process for all staff before they work with children.',
    sections: [
      {
        heading: '5.1 DBS Checks',
        content: [{ type: 'bullets', items: [
          'All staff hold an Enhanced DBS certificate including the children\'s barred list check',
          'DBS certificates are renewed every three years or maintained via the DBS Update Service',
          'No member of staff works independently with children without a confirmed, valid Enhanced DBS',
          'DBS certificate numbers are held on each staff member\'s ASO coach profile',
          'Schools are provided with a Named Staff List including DBS certificate numbers before sessions begin',
          'Coaches present their physical DBS certificate to the school\'s named contact on their first session',
        ]}],
      },
      {
        heading: '5.2 Identity Verification & Right to Work',
        content: [{ type: 'text', text: 'Right to Work is verified as part of the ASO DBS application process. Identity documents presented and verified for DBS purposes are copied and retained on the staff member\'s ASO coach profile. This satisfies Right to Work check requirements for British and Irish nationals. On their first session at any school, coaches present their photo ID and DBS certificate in person to the school\'s named contact, providing direct verification of the individual delivering on their premises.' }],
      },
      {
        heading: '5.3 References',
        content: [{ type: 'bullets', items: [
          'A minimum of two references are obtained for every new staff member before they begin working',
          'References are retained on the staff member\'s coach profile',
          'References are available to schools on request',
        ]}],
      },
      {
        heading: '5.4 Performance Reviews',
        content: [{ type: 'bullets', items: [
          'All coaches receive a termly review conducted by their Area Lead',
          'Reviews assess delivery quality, safeguarding awareness, reliability, and professional conduct',
          'Any concerns identified at review are addressed through a structured support and improvement process',
          'Review records are maintained on the staff member\'s coach profile',
        ]}],
      },
      {
        heading: '5.5 Single Central Record',
        content: [{ type: 'text', text: 'ASO maintains an internal staff record equivalent to a Single Central Record (SCR) containing confirmation of DBS checks, identity verification, qualifications, and safeguarding training for all staff. Schools may request confirmation of SCR entries for any member of staff delivering on their premises.' }],
      },
    ],
  },
  {
    number: 6,
    title: 'Health & Safety Policy',
    intro: 'Active School Org is committed to ensuring the health, safety, and welfare of all children, staff, and visitors during our sessions. We comply with the Health and Safety at Work Act 1974 and all relevant regulations.',
    sections: [
      {
        heading: '6.1 Risk Assessment',
        content: [{ type: 'bullets', items: [
          'A site-specific risk assessment is completed by ASO before any sessions begin at a new school',
          'The risk assessment covers: floor surface and condition, equipment setup and storage, fire exits and evacuation routes, access and collection points, safeguarding considerations, and toilet access',
          'Risk assessments are shared with the school and reviewed annually',
          'A Daily Risk Assessment is completed by the Lead Coach before every session',
          'No session commences without an approved, site-specific risk assessment in place',
        ]}],
      },
      {
        heading: '6.2 Equipment Safety',
        content: [{ type: 'bullets', items: [
          'All equipment used in sessions meets current national guidelines and AfPE guidance',
          'Equipment is checked before every session — damaged or unsafe equipment is not used',
          'Any damaged equipment is reported to the Area Lead immediately and removed from use',
          'Equipment is stored safely and securely at the end of every session',
        ]}],
      },
      {
        heading: '6.3 Staffing Ratios',
        content: [{ type: 'table', rows: [
          ['Age Group', 'Minimum Ratio'],
          ['Reception to Year 2 (ages 4–7)', '1 coach to 8 children'],
          ['Year 3 to Year 6 (ages 7–11)', '1 coach to 12 children'],
          ['Maximum group size', '24 children per session'],
        ]}],
      },
      {
        heading: '6.4 Lone Working',
        content: [{ type: 'text', text: 'ASO operates a clear lone working policy. Coaches are never left alone with a single child in a closed space. Where staffing is reduced, sessions are adapted in line with ASO\'s Lone Working Protocol to ensure the safety of all children. Any lone working situation is reported to the Area Lead and logged.' }],
      },
    ],
  },
  {
    number: 7,
    title: 'Fire Safety & Emergency Evacuation',
    sections: [
      {
        heading: '7.1 Pre-Session Checks',
        content: [{ type: 'bullets', items: [
          'The Lead Coach identifies fire exits and evacuation routes before every session as part of the Daily Risk Assessment',
          'On the first session at any school, the Lead Coach is briefed on the school\'s fire evacuation plan by the school\'s named contact',
          'The register is always available and carried during evacuation — it is used to account for every child',
        ]}],
      },
      {
        heading: '7.2 In the Event of a Fire or Emergency Evacuation',
        content: [{ type: 'numbered', items: [
          'The Lead Coach immediately stops the session and calmly directs all children to evacuate via the nearest marked fire exit',
          'The register is taken — every child is accounted for at the designated assembly point',
          'No child is left behind — the Lead Coach is last to leave the space',
          'The Lead Coach reports to the school\'s designated fire marshal or senior member of staff',
          'The Lead Coach calls 999 if the emergency services have not already been alerted',
          'No one re-enters the building until the all-clear is given by the school or emergency services',
          'The incident is logged on the ASO Incident Report Form the same day',
        ]}],
      },
      {
        heading: '7.3 School\'s Responsibility',
        content: [{ type: 'text', text: 'ASO asks that the school provides the Lead Coach with a copy of or briefing on the school\'s fire evacuation plan before the first session. This is part of the ASO School Partnership Agreement.' }],
      },
    ],
  },
  {
    number: 8,
    title: 'First Aid Policy',
    sections: [
      {
        heading: '8.1 First Aid Provision',
        content: [{ type: 'bullets', items: [
          'Every session is led by a qualified Lead Coach holding a valid Paediatric First Aid certificate or First Aid at Work certificate',
          'A fully stocked first aid kit is present and accessible at every session',
          'The first aid kit is checked before every session as part of the Daily Risk Assessment',
          'First aid certificate details are held on the Lead Coach\'s ASO staff profile and are available to schools on request',
        ]}],
      },
      {
        heading: '8.2 In the Event of an Injury',
        content: [
          { type: 'numbered', items: [
            'The Lead Coach assesses the situation calmly and ensures the child is safe',
            'Basic first aid is administered where appropriate',
            'For serious injuries — call 999 immediately. Then notify the Area Lead and parent.',
            'The parent or guardian is notified of any injury as soon as possible',
            'All injuries, however minor, are recorded on the ASO Accident Report Form the same day',
            'The school\'s named contact is informed of any injury occurring on their premises',
          ]},
          { type: 'note', text: 'By registering their child with ASO, parents give consent for coaches to administer basic first aid in the event of a minor injury.' },
        ],
      },
    ],
  },
  {
    number: 9,
    title: 'Accident & Incident Reporting Procedure',
    sections: [
      {
        heading: '9.1 What Must Be Reported',
        content: [
          { type: 'text', text: 'The following must always be recorded on an ASO Incident Report Form on the day they occur:' },
          { type: 'bullets', items: [
            'Any injury to a child — however minor',
            'Any injury to a member of staff',
            'Any safeguarding concern or disclosure',
            'Any near-miss or unsafe situation',
            'Any unconfirmed collection attempt',
            'Any late collection',
            'Any medical incident including use of epi-pen or medication',
            'Any fire, evacuation, or emergency',
          ]},
        ],
      },
      {
        heading: '9.2 Reporting Process',
        content: [{ type: 'numbered', items: [
          'The Lead Coach completes the ASO Incident Report Form on the day of the incident',
          'The form is submitted to the Area Lead within 24 hours',
          'The Area Lead reviews and forwards to Naima the same day',
          'Naima retains all incident records in line with GDPR and data retention requirements',
          'Where required, the school\'s named contact is notified the same day',
          'Serious incidents are escalated to the DSL and Operations Director immediately',
        ]}],
      },
      {
        heading: '9.3 Record Retention',
        content: [{ type: 'text', text: 'All incident and accident records are retained for a minimum of 6 years in line with statutory requirements. Records involving children are retained until the child reaches the age of 25.' }],
      },
      {
        heading: '9.4 Reporting to Schools',
        content: [{ type: 'text', text: 'Schools will be informed of any incident involving a child on their premises on the same day it occurs. ASO will share the relevant section of the Incident Report Form with the school\'s named contact where appropriate.' }],
      },
    ],
  },
  {
    number: 10,
    title: 'Medical Conditions, Allergies & Medication',
    intro: 'This policy is non-negotiable. Children in our sessions may have severe allergies. The correct management of medical information is a safeguarding matter.',
    sections: [
      {
        heading: '10.1 Medical Information Collection',
        content: [{ type: 'bullets', items: [
          'Full medical information for every child is collected at the point of parent registration via the ASO online registration form',
          'This includes any allergies, medical conditions, medications, or physical needs that may affect participation',
          'Parents are required to keep this information up to date — any changes must be notified to ASO immediately at info@activeschool.org.uk',
          'Medical information is held securely and accessed only by relevant ASO staff',
        ]}],
      },
      {
        heading: '10.2 Emergency Medication — Epi-Pens',
        content: [{ type: 'bullets', items: [
          'If a child requires an epi-pen or emergency medication, this must be disclosed fully at registration',
          'The medication must be brought to every session in a clearly labelled bag',
          'The Lead Coach checks for the presence of epi-pens and medication before every session',
          'Medication is kept courtside and within reach throughout the session — never in a bag or cupboard',
          'At the end of every session, medication is returned directly to the parent or guardian — it is never left with the child or at the school',
          'If a child\'s medication is not present, the parent is contacted immediately. The session does not commence until medication is confirmed as available.',
        ]}],
      },
      {
        heading: '10.3 Medical Emergency During a Session',
        content: [{ type: 'numbered', items: [
          'Use epi-pen or emergency medication if prescribed and required',
          'Call 999 immediately',
          'Call the Area Lead immediately',
          'Call the parent or guardian',
          'Inform the school\'s named contact',
          'Complete the ASO Incident Report Form the same day',
        ]}],
      },
      {
        heading: '10.4 Snack and Allergy Protocol',
        content: [{ type: 'table', rows: [
          ['Situation', 'What Happens'],
          ['Any child in the session has a food allergy', 'No snacks permitted in or near the hall. Snacks eaten in a designated separate area only. Hands washed before re-entering the hall.'],
          ['No children have food allergies', 'Small snack permitted in designated snack area before the session. Hands washed before session begins. No food or wrappers in the activity space.'],
          ['All sessions without exception', 'No food or wrappers inside the gymnastics or activity space. Lead Coach enforces this at every session.'],
        ]}],
      },
      {
        heading: '10.5 Prescription Medication',
        content: [{ type: 'text', text: 'ASO coaches are not able to administer prescription medication. If a child requires medication during a session, parents must discuss this with ASO before the term begins so appropriate arrangements can be explored. Where this is not possible, the school\'s own medication policy will be followed in liaison with the school\'s named contact.' }],
      },
    ],
  },
  {
    number: 11,
    title: 'Complaints Procedure',
    intro: 'Active School Org takes all complaints and concerns seriously. We aim to resolve issues quickly, fairly, and transparently.',
    sections: [
      {
        heading: '11.1 Complaints from Parents',
        content: [{ type: 'table', rows: [
          ['Step', 'Action', 'Timescale'],
          ['Step 1 — Informal', 'Speak to the Lead Coach at the session or email info@activeschool.org.uk. Most concerns are resolved quickly at this stage.', 'Immediately'],
          ['Step 2 — Formal', 'Submit a written complaint to admin@activeschool.org.uk. ASO acknowledges within 3 working days.', 'Within 5 working days'],
          ['Step 3 — Review', 'The Operations Director investigates and responds in writing.', 'Within 10 working days'],
          ['Step 4 — Escalation', 'If unresolved, escalate to ops@activeschool.org.uk for director review.', 'Within 14 working days'],
        ]}],
      },
      {
        heading: '11.2 Complaints from Schools',
        content: [
          { type: 'text', text: 'If a school has a concern about ASO\'s provision:' },
          { type: 'numbered', items: [
            'Contact the ASO Area Lead directly in the first instance',
            'If unresolved, contact Naima at info@activeschool.org.uk',
            'If still unresolved, contact the Operations Director at ops@activeschool.org.uk',
            'ASO will acknowledge school complaints within 2 working days and respond in full within 7 working days',
          ]},
        ],
      },
      {
        heading: '11.3 Safeguarding Complaints',
        content: [{ type: 'note', text: 'Complaints relating to safeguarding are handled separately and immediately. Contact the DSL directly: safeguarding@activeschool.org.uk | 07814 899151. These are not subject to the standard complaints timeline.' }],
      },
    ],
  },
  {
    number: 12,
    title: 'Pupil Code of Conduct & Behaviour Policy',
    sections: [
      {
        heading: '12.1 What We Expect from Pupils',
        content: [
          { type: 'text', text: 'All children attending ASO sessions are expected to:' },
          { type: 'bullets', items: [
            'Treat coaches and other children with respect and kindness',
            'Listen to coaches and follow instructions first time',
            'Take turns and include everyone',
            'Look after equipment and use it safely',
            'Stay within the session space at all times',
            'Tell a coach if they feel unwell, upset, or unsafe',
          ]},
        ],
      },
      {
        heading: '12.2 Managing Behaviour',
        content: [
          { type: 'text', text: 'ASO coaches are trained to manage behaviour positively. Our approach is:' },
          { type: 'bullets', items: [
            'Encouragement and praise first — we focus on what children do well',
            'Clear, calm redirection when behaviour needs addressing',
            'Structured activities that keep children engaged and moving',
            'Consistent routines that children understand and respond to',
            'Never physical intervention — coaches use voice and positioning only',
          ]},
        ],
      },
      {
        heading: '12.3 Persistent or Serious Behaviour',
        content: [
          { type: 'text', text: 'In cases of persistent disruptive behaviour, physical aggression, or behaviour that puts others at risk:' },
          { type: 'numbered', items: [
            'The Lead Coach speaks with the parent or guardian after the session',
            'The Area Lead is notified and a behaviour plan is agreed where possible',
            'The school\'s named contact is informed and asked to support where appropriate',
            'If behaviour continues, ASO reserves the right to suspend or permanently remove a child from the programme',
          ]},
          { type: 'note', text: 'ASO will always seek to work with the school and family before removing a child from the programme. Removal is a last resort and will always involve a conversation with the parent.' },
        ],
      },
      {
        heading: '12.4 Parent Conduct',
        content: [{ type: 'text', text: 'ASO expects all parents and guardians to treat coaches, school staff, and other families with respect. Aggressive, threatening, or abusive behaviour toward any member of our team will result in immediate removal from the programme.' }],
      },
    ],
  },
  {
    number: 13,
    title: 'Coach Qualifications & Training Standards',
    intro: 'All ASO coaches hold the appropriate qualifications and training for their role. Qualifications are verified at the point of onboarding and kept up to date throughout employment.',
    sections: [
      {
        heading: '13.1 Qualifications by Role',
        content: [{ type: 'table', rows: [
          ['Qualification', 'Junior Coach', 'Asst. Coach', 'Lead Coach', 'Area Lead'],
          ['Enhanced DBS (incl. barred list)', '✅', '✅', '✅', '✅'],
          ['Safeguarding in Sport (Level 1+)', '✅', '✅', '✅', '✅'],
          ['Annual Safeguarding Refresher (KCSIE)', '✅', '✅', '✅', '✅'],
          ['UKAG Level 0 — Junior Coach', '✅', '—', '—', '—'],
          ['UKAG Level 1 — Assistant Coach', '—', '✅', '—', '—'],
          ['UKAG Level 2 — Lead Coach', '—', '—', '✅', '✅'],
          ['Paediatric First Aid / First Aid at Work', '—', '—', '✅', '✅'],
          ['Level 2 Safeguarding (Deputy DSL)', '—', '—', '—', '✅'],
        ]}],
      },
      {
        heading: '13.2 UKAG Framework',
        content: [
          { type: 'text', text: 'All ASO sessions are delivered in line with the UK Academies of Gymnastics (UKAG) Recreational Awards Framework. This provides:' },
          { type: 'bullets', items: [
            'A structured, age-appropriate curriculum for gymnastics and multi-sport activities',
            'Clear skill progressions that coaches follow at every session',
            'Nationally recognised awards and certificates for children',
            'A quality assurance standard that schools and trusts can rely on',
          ]},
        ],
      },
      {
        heading: '13.3 Continuous Professional Development',
        content: [{ type: 'bullets', items: [
          'All ASO coaches are observed termly by their Area Lead',
          'Annual safeguarding refresher training is mandatory for all staff',
          'ASO funds UKAG qualifications for eligible coaches',
          'CPD records are maintained on each coach\'s staff profile',
        ]}],
      },
    ],
  },
  {
    number: 14,
    title: 'Data Protection & GDPR',
    intro: 'Active School Org processes personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.',
    sections: [
      {
        heading: '14.1 Data We Hold',
        content: [
          { type: 'text', text: 'ASO collects and holds the following data for operational and safeguarding purposes:' },
          { type: 'bullets', items: [
            'Child registration details — name, date of birth, school, medical information, emergency contacts',
            'Parent or guardian contact details',
            'Staff details — identity documents, DBS certificate numbers, qualifications, references',
            'Session records — registers, attendance, incident reports, safeguarding concerns',
            'Payment and booking records',
          ]},
        ],
      },
      {
        heading: '14.2 How Data is Stored',
        content: [{ type: 'bullets', items: [
          'Parent and child data is stored securely within the ASO booking platform',
          'Staff data is held within the ASO internal coach profile system',
          'All data is stored in accordance with UK GDPR and is not shared with third parties without consent, except where required by law or for safeguarding purposes',
          'Data is retained in line with statutory requirements — typically 6 years for financial records and until age 25 for records involving children',
        ]}],
      },
      {
        heading: '14.3 Schools and Data',
        content: [{ type: 'text', text: 'ASO does not share parent or child data with schools beyond what is required for safeguarding or operational purposes. Schools are not given access to ASO\'s booking or registration systems. Any data sharing between ASO and a school is carried out in line with UK GDPR and is limited to what is necessary.' }],
      },
      {
        heading: '14.4 Data Subject Rights',
        content: [{ type: 'text', text: 'Parents, guardians, and staff have the right to access, correct, or request deletion of their personal data. Requests should be directed to info@activeschool.org.uk. ASO will respond within 30 days.' }],
      },
    ],
  },
]

function renderContent(items: ContentItem[]) {
  return items.map((item, i) => {
    if (item.type === 'text') {
      return <p key={i} className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
    }
    if (item.type === 'note') {
      return (
        <div key={i} className="bg-amber-50 border-l-4 border-amber-400 px-3 py-2 rounded-r-lg">
          <p className="text-xs text-amber-800 leading-relaxed">{item.text}</p>
        </div>
      )
    }
    if (item.type === 'bullets') {
      return (
        <ul key={i} className="flex flex-col gap-1.5">
          {item.items.map((b, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1a3a6b] shrink-0" />
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      )
    }
    if (item.type === 'numbered') {
      return (
        <ol key={i} className="flex flex-col gap-1.5">
          {item.items.map((n, j) => (
            <li key={j} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="shrink-0 w-5 h-5 rounded-full bg-[#1a3a6b] text-white text-xs flex items-center justify-center font-bold mt-0.5">{j + 1}</span>
              <span className="leading-relaxed flex-1">{n}</span>
            </li>
          ))}
        </ol>
      )
    }
    if (item.type === 'table') {
      const [header, ...rows] = item.rows
      return (
        <div key={i} className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#1a3a6b]/5">
                {header.map((h, j) => (
                  <th key={j} className="px-3 py-2 text-left font-bold text-[#1a3a6b] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, j) => (
                <tr key={j} className={j % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, k) => (
                    <td key={k} className="px-3 py-2 text-gray-700 leading-snug align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    return null
  })
}

function PolicyAccordion({ policy }: { policy: Policy }) {
  const [open, setOpen] = useState(false)
  const [openSection, setOpenSection] = useState<number | null>(null)

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-[#1a3a6b] flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-black">{policy.number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1a3a6b] text-sm leading-snug">{policy.title}</p>
          <p className="text-xs text-gray-400">{policy.sections.length} sections</p>
        </div>
        {open
          ? <ChevronDown size={18} className="text-gray-400 shrink-0" />
          : <ChevronRight size={18} className="text-gray-400 shrink-0" />
        }
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {policy.intro && (
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed italic">{policy.intro}</p>
            </div>
          )}
          {policy.sections.map((section, i) => (
            <div key={i} className="border-b border-gray-50 last:border-0">
              <button
                onClick={() => setOpenSection(openSection === i ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700">{section.heading}</p>
                </div>
                {openSection === i
                  ? <ChevronDown size={16} className="text-gray-300 shrink-0" />
                  : <ChevronRight size={16} className="text-gray-300 shrink-0" />
                }
              </button>
              {openSection === i && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {renderContent(section.content)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SchoolPoliciesPage() {
  return (
    <SchoolLayout title="Partnership Policies" showBack>
      <div className="px-4 pt-6 pb-4 flex flex-col gap-4">

        <div className="rounded-2xl bg-[#1a3a6b] text-white px-4 py-4">
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck size={20} />
            <p className="font-bold">ASO Working with Schools Policy</p>
          </div>
          <p className="text-xs text-white/70">Version 1.0  ·  Academic Year 2025–2026</p>
          <p className="text-xs text-white/60 mt-2 leading-relaxed">
            This document contains all policies and procedures required by schools, trusts, and local
            authorities when commissioning or approving after-school enrichment provision from Active
            School Organisation Ltd.
          </p>
        </div>

        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
          Tap a policy to expand · tap a section to read
        </p>

        {POLICIES.map(policy => (
          <PolicyAccordion key={policy.number} policy={policy} />
        ))}

        <div className="text-center py-4">
          <p className="text-xs text-gray-400">Questions? Contact your ASO coordinator</p>
          <a href="mailto:info@activeschool.org.uk" className="text-xs text-[#1a3a6b] font-semibold">
            info@activeschool.org.uk
          </a>
        </div>

      </div>
    </SchoolLayout>
  )
}
