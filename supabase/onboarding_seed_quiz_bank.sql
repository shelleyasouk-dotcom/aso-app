-- =============================================================================
-- ASO Onboarding - Quiz Bank Seed (one INSERT per question)
-- Source: Coach Work Handbook v1.0 + Operations Manual v1.0
-- Run after: onboarding_seed_content.sql
-- Idempotent: deletes existing entries for these tasks then re-inserts
-- correct_index is 0-based and is NEVER returned to the browser
-- =============================================================================

-- Delete existing entries so re-runs are safe
DELETE FROM onboarding_quiz_banks
WHERE task_id IN (
  SELECT id FROM onboarding_tasks
  WHERE title IN (
    'Role and Responsibilities Quiz',
    'Safeguarding Knowledge Check',
    'Handbook Knowledge Check',
    'SOP Knowledge Check',
    'Health and Safety Quiz',
    'Role-Specific Knowledge Check',
    'Communication Standards Quiz',
    'Final Knowledge Assessment'
  )
);

-- =============================================================================
-- STAGE 4 - Role and Responsibilities Quiz (6 questions)
-- =============================================================================

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Role and Responsibilities Quiz' AND s.title = 'Role, Responsibilities and Reporting Structure' LIMIT 1),
  'Which role holds full on-site responsibility for the session, including the register, medical protocol, and dismissal?',
  '["Junior Coach","Assistant Coach","Lead Coach","Area Lead"]'::jsonb,
  2, 'The Lead Coach carries full on-site responsibility. Junior and Assistant Coaches support but are not responsible for registers, medical checks, or dismissal.', 'roles', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Role and Responsibilities Quiz' AND s.title = 'Role, Responsibilities and Reporting Structure' LIMIT 1),
  'Who is your first point of contact for any question or concern at ASO?',
  '["Naima, the Operations Director","The school headteacher","Your Area Lead","A fellow Lead Coach"]'::jsonb,
  2, 'Your Area Lead is your first point of contact. Only contact Naima directly if your Area Lead is unavailable and the matter is urgent.', 'structure', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Role and Responsibilities Quiz' AND s.title = 'Role, Responsibilities and Reporting Structure' LIMIT 1),
  'Which of these best describes the responsibilities of an Assistant Coach?',
  '["They lead sessions independently and manage the register","They attend sessions to observe only, with no active role","They support the Lead Coach by running warm-ups and managing stations under direction","They hold Deputy DSL responsibilities for their area"]'::jsonb,
  2, 'Assistant Coaches support the Lead Coach by running warm-ups and managing stations under direction. They are not responsible for registers, medical checks, or safeguarding decisions.', 'roles', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Role and Responsibilities Quiz' AND s.title = 'Role, Responsibilities and Reporting Structure' LIMIT 1),
  'An Area Lead holds which additional responsibility that a Lead Coach does not?',
  '["They complete the Daily Risk Assessment for their area","They serve as the Deputy Designated Safeguarding Lead for their area","They are responsible for collecting children from classrooms","They design the UKAG curriculum for each school"]'::jsonb,
  1, 'Area Leads hold Deputy DSL responsibilities for their area. This is a formal safeguarding role requiring a Level 2 Safeguarding Certificate.', 'roles', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Role and Responsibilities Quiz' AND s.title = 'Role, Responsibilities and Reporting Structure' LIMIT 1),
  'What is the correct escalation order at ASO?',
  '["Coach to Naima to Area Lead","Area Lead to Coach to Naima","Coach to Lead Coach to Area Lead to Operations Director","Coach to School to Area Lead"]'::jsonb,
  2, 'The correct chain is: Coach to Lead Coach to Area Lead to Operations Director (Naima). Issues should be resolved at the lowest appropriate level before moving up.', 'structure', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Role and Responsibilities Quiz' AND s.title = 'Role, Responsibilities and Reporting Structure' LIMIT 1),
  'If you cannot resolve an issue as a Lead Coach, what should you do?',
  '["Contact Naima directly to resolve it quickly","Handle it alone to avoid escalating","Escalate to your Area Lead","Call the school headteacher for support"]'::jsonb,
  2, 'Escalate to your Area Lead. They are the first escalation point. Only contact Naima directly if your Area Lead is unavailable and the matter is urgent.', 'structure', 'easy'
);


-- =============================================================================
-- STAGE 6 - Safeguarding Knowledge Check (10 questions)
-- =============================================================================

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Safeguarding Knowledge Check' AND s.title = 'Safeguarding Training' LIMIT 1),
  'Which safeguarding rule applies at all times, without exception?',
  '["Always take photos to show parents what children are learning","Never be alone with a child in a closed or isolated space","Children may manage their own behaviour where possible","Safeguarding concerns can be shared with parents to keep them informed"]'::jsonb,
  1, 'Never being alone with a child in a closed or isolated space is non-negotiable. It applies regardless of staffing levels, circumstances, or how well you know the child.', 'basics', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Safeguarding Knowledge Check' AND s.title = 'Safeguarding Training' LIMIT 1),
  'A child tells you something worrying during a session. What should you do first?',
  '["Promise confidentiality so they feel safe to speak","Call the police immediately","Ask detailed questions to gather as much information as possible","Stay calm, listen carefully, and let them speak without asking leading questions"]'::jsonb,
  3, 'Stay calm and listen. Do not ask leading questions, do not show alarm, and do not make any promises. Let the child speak in their own words.', 'disclosure', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Safeguarding Knowledge Check' AND s.title = 'Safeguarding Training' LIMIT 1),
  'After a child makes a disclosure, when should you write down exactly what was said?',
  '["At the end of the working week","When you get home that evening","As soon as the session ends, word for word","Only if you believe it is serious enough to report"]'::jsonb,
  2, 'Write down exactly what was said as soon as the session ends, word for word. Delay leads to inaccuracy and the written record must capture the exact words the child used.', 'disclosure', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Safeguarding Knowledge Check' AND s.title = 'Safeguarding Training' LIMIT 1),
  'Can you promise a child confidentiality if they want to share something with you?',
  '["Yes, it helps them feel safe enough to speak","Yes, but only for concerns that are not safeguarding-related","No, you must never promise confidentiality to a child","Only if you judge the concern to be minor"]'::jsonb,
  2, 'You must never promise confidentiality. You cannot keep that promise. Be honest: you will listen, and you may need to tell someone who can help.', 'disclosure', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Safeguarding Knowledge Check' AND s.title = 'Safeguarding Training' LIMIT 1),
  'Which form must be completed on the same day as a safeguarding concern?',
  '["The Incident Report Form","The Daily Risk Assessment","The Safeguarding Concern Form","The session register"]'::jsonb,
  2, 'The Safeguarding Concern Form must be completed the same day. The Incident Report Form is for operational incidents such as injuries or late collection. These are separate documents.', 'reporting', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Safeguarding Knowledge Check' AND s.title = 'Safeguarding Training' LIMIT 1),
  'What is the correct safeguarding escalation chain at ASO?',
  '["Coach to Area Lead to DSL (Naima)","Coach to Naima to Area Lead","Coach to School to Area Lead","Coach to Lead Coach to School DSL"]'::jsonb,
  0, 'You report to your Lead Coach or Area Lead immediately. The Area Lead escalates to the DSL (Naima). Naima escalates to external agencies where required.', 'escalation', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Safeguarding Knowledge Check' AND s.title = 'Safeguarding Training' LIMIT 1),
  'Which of the following is always prohibited at ASO, regardless of circumstances?',
  '["Using a child first name during sessions","Contacting children or their families via your personal social media or messaging accounts","Working alongside other adults in the hall","Running a station without the Lead Coach present"]'::jsonb,
  1, 'You must never contact children or their families via personal accounts. All communication with families goes through ASO official channels. This rule has no exceptions.', 'basics', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Safeguarding Knowledge Check' AND s.title = 'Safeguarding Training' LIMIT 1),
  'You are lone working. A child needs to use the toilet. What is the correct action?',
  '["Send the child alone as they know the way","Take the child yourself and leave the group unattended briefly","Follow the school procedure and ensure the group remains in a safe supervised position","Cancel the session to avoid a safeguarding risk"]'::jsonb,
  2, 'Follow the school toilet procedure and ensure the group is safe and supervised. Never leave the group unattended, and never be alone with a single child in an isolated space.', 'lone_working', 'hard'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Safeguarding Knowledge Check' AND s.title = 'Safeguarding Training' LIMIT 1),
  'Does lone working change your safeguarding responsibilities?',
  '["Yes, with fewer staff fewer safeguarding rules apply","Yes, you can use your own judgement in unusual circumstances","No, safeguarding responsibilities remain exactly the same regardless of staffing","Only if the Area Lead has not been informed of the staffing situation"]'::jsonb,
  2, 'Safeguarding responsibilities never change based on staffing levels. If anything, lone working requires extra vigilance. All the same rules apply.', 'lone_working', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Safeguarding Knowledge Check' AND s.title = 'Safeguarding Training' LIMIT 1),
  'Who should you report a safeguarding concern to immediately after the session?',
  '["The child parent or guardian","Your Lead Coach or Area Lead","Naima directly, bypassing the Area Lead","The school headteacher"]'::jsonb,
  1, 'Report to your Lead Coach or Area Lead immediately after the session. They will escalate to the DSL. Never inform the parent of a safeguarding concern as this could put the child at greater risk.', 'reporting', 'medium'
);


-- =============================================================================
-- STAGE 9 - Handbook Knowledge Check (8 questions)
-- =============================================================================

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Handbook Knowledge Check' AND s.title = 'Staff Handbook' LIMIT 1),
  'What is the ASO rule for phone use during sessions?',
  '["Phones may be used freely between activities","Phones must stay in your kit bag at all times","Phones may only be used for the register or in an emergency","Phone use is permitted if children are engaged in an activity"]'::jsonb,
  2, 'Phones may only be used for the session register or in an emergency. Using your phone for any other reason during a session is not acceptable.', 'conduct', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Handbook Knowledge Check' AND s.title = 'Staff Handbook' LIMIT 1),
  'How many unplanned absences in a term are considered understandable at ASO?',
  '["None, any unplanned absence triggers a review","One","Two","Three"]'::jsonb,
  1, 'One unplanned absence per term is understandable. Two or more will trigger a review with your Area Lead. Three or more may result in removal from the rota.', 'absence', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Handbook Knowledge Check' AND s.title = 'Staff Handbook' LIMIT 1),
  'What must you wear for every ASO session?',
  '["Any clean sportswear","ASO branded top, plain black or navy sports bottoms, and trainers with good grip","Your own gym kit with an ASO lanyard","Whatever is practical for the activity that week"]'::jsonb,
  1, 'You must wear an ASO branded t-shirt or hoodie, plain black or navy sports bottoms, and trainers with good grip. Casual clothing and non-branded hoodies are not acceptable.', 'uniform', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Handbook Knowledge Check' AND s.title = 'Staff Handbook' LIMIT 1),
  'If you cannot attend a session, what must you do?',
  '["Send a text message to your Lead Coach at any time on the day","Contact your Lead Coach by phone call or voice note before 9:00am on the day of the session","Post in the WhatsApp group and wait for cover to be arranged","Arrange your own cover before informing your Area Lead"]'::jsonb,
  1, 'Contact your Lead Coach by phone call or voice note, not text, before 9:00am on the day of the session. Early notice gives time to find cover and keeps the session running.', 'absence', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Handbook Knowledge Check' AND s.title = 'Staff Handbook' LIMIT 1),
  'What UKAG training does ASO fund for eligible coaches?',
  '["BTEC qualifications in sports science","UKAG Level 0, 1, and 2 coaching qualifications","First aid courses only, coaches fund these themselves","Online CPD only, with no formal qualifications"]'::jsonb,
  1, 'ASO funds UKAG Level 0, 1, and 2 for eligible coaches. To qualify you must complete onboarding, work at least one full term, remain on the active rota, and attend required sessions.', 'development', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Handbook Knowledge Check' AND s.title = 'Staff Handbook' LIMIT 1),
  'How should you raise a query about your pay?',
  '["Post a message in the staff WhatsApp group","Ask your Area Lead to deal with it verbally","Email accounts@activeschool.org.uk with your timesheet attached","Call Naima directly"]'::jsonb,
  2, 'Email accounts@activeschool.org.uk with your timesheet attached and a clear description of the issue. Do not raise pay queries via WhatsApp.', 'pay', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Handbook Knowledge Check' AND s.title = 'Staff Handbook' LIMIT 1),
  'What is the staff WhatsApp group for?',
  '["Work and social communication, it is a team chat","Work communication only, not social chat or sharing personal content","Arranging cover between coaches only","Sharing session photos with parents who request them"]'::jsonb,
  1, 'The staff WhatsApp group is for work communication only. Do not share personal content, session photos, or children details in personal chats.', 'communication', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Handbook Knowledge Check' AND s.title = 'Staff Handbook' LIMIT 1),
  'What happens after three or more unplanned absences in a term?',
  '["A written warning is issued automatically","You are suspended from sessions pending review","You may be removed from the rota","Your pay rate is reviewed"]'::jsonb,
  2, 'Three or more unplanned absences in a term may result in removal from the rota. The progression is: one (understandable), two or more (Area Lead review), three or more (possible removal from rota).', 'absence', 'medium'
);


-- =============================================================================
-- STAGE 10 - SOP Knowledge Check (8 questions)
-- =============================================================================

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'SOP Knowledge Check' AND s.title = 'Standard Operating Procedures' LIMIT 1),
  'What is the first thing you must do when you arrive at a school?',
  '["Set up equipment in the hall","Go directly to the hall without stopping","Sign in at school reception and follow the school visitor procedure","Check in with the class teacher before the session"]'::jsonb,
  2, 'Always sign in at school reception first and follow the school visitor procedure. You are a visitor. Some schools require you to wait for an escort before going to the hall.', 'arrival', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'SOP Knowledge Check' AND s.title = 'Standard Operating Procedures' LIMIT 1),
  'A child arrives who is not on the register. What do you do?',
  '["Allow them to join, their parent has probably just forgotten to register","Turn them away and ask the parent to re-book online","Do not turn them away. Contact your Area Lead immediately and record their details. Do not allow participation until confirmed.","Call Naima and wait for instructions before doing anything else"]'::jsonb,
  2, 'Never turn a child away. Contact your Area Lead immediately. Record the child name, time of arrival, and who brought them. Do not allow participation until your Area Lead confirms.', 'register', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'SOP Knowledge Check' AND s.title = 'Standard Operating Procedures' LIMIT 1),
  'During dismissal, a parent you do not recognise arrives to collect a child. What is the correct action?',
  '["Release the child if the parent knows the child name","Ask for the parent name and check it against the register","Release the child and report it to the Area Lead later","Hold the child until the session officially ends"]'::jsonb,
  1, 'Ask for the adult name and check it against the register. No name, no go. If they are not on the contact list, call your Area Lead before releasing the child.', 'dismissal', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'SOP Knowledge Check' AND s.title = 'Standard Operating Procedures' LIMIT 1),
  'A child has not been collected 15 minutes after the session ends. What must you do first?',
  '["Take the child to the school office for supervision","Call your Area Lead immediately","Stay with the child and check the register for the parent emergency contact number","Wait a further 15 minutes before taking any action"]'::jsonb,
  2, 'Stay with the child, never leave them alone. Then check the register for the parent emergency contact and call them directly. If no answer, call the secondary contact, then your Area Lead.', 'late_collection', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'SOP Knowledge Check' AND s.title = 'Standard Operating Procedures' LIMIT 1),
  'Can you take a child off the premises if their parent cannot be reached?',
  '["Yes, if you can reach the Area Lead for authorisation","Yes, but only to the school office","No, do not take the child off the premises under any circumstances","Yes, if a school teacher agrees it is safe to do so"]'::jsonb,
  2, 'Under no circumstances take a child off the premises. Stay with them at the location. Your Area Lead and the school late collection policy govern what happens next.', 'late_collection', 'hard'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'SOP Knowledge Check' AND s.title = 'Standard Operating Procedures' LIMIT 1),
  'When must the register be submitted to your Area Lead or Naima?',
  '["On the Friday of the same week","By the end of the next working day","Within 24 hours of the session","Within 48 hours if there were no incidents"]'::jsonb,
  2, 'The register must be submitted within 24 hours of the session. This is an operational requirement for safeguarding and attendance tracking.', 'register', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'SOP Knowledge Check' AND s.title = 'Standard Operating Procedures' LIMIT 1),
  'Someone arrives to collect a child who is not on the contact list. What is the correct response?',
  '["Release the child if they appear to know the adult","Call your Area Lead before releasing the child","Ask the parent to sign a consent form on the spot","Release the child as long as the child is happy to go"]'::jsonb,
  1, 'Call your Area Lead before releasing the child. No name on the list, no release. Do not make exceptions regardless of how plausible the explanation seems.', 'dismissal', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'SOP Knowledge Check' AND s.title = 'Standard Operating Procedures' LIMIT 1),
  'At what point should you open the hall doors to begin dismissal?',
  '["When the session ends at 4:00pm","Once all children are lined up inside the hall","Only when a parent or guardian is visible outside","When the school gives you permission to dismiss"]'::jsonb,
  2, 'Children must be lined up inside the hall and the door should only open once a parent or guardian is visible outside. Never dismiss into an empty space.', 'dismissal', 'medium'
);


-- =============================================================================
-- STAGE 11 - Health and Safety Quiz (8 questions)
-- =============================================================================

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Health and Safety Quiz' AND s.title = 'Health, Safety and Risk Management' LIMIT 1),
  'Where must the medical bag be kept during a session?',
  '["In the coach kit bag so it is secure","In the school medical room where first aiders can access it","Courtside and within reach at all times","At the hall entrance near the exit"]'::jsonb,
  2, 'The medical bag must remain courtside and within reach at all times. It must never be locked away, left in a kit bag, or kept in another room during the session.', 'medical', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Health and Safety Quiz' AND s.title = 'Health, Safety and Risk Management' LIMIT 1),
  'Before any session begins, what must the Lead Coach check?',
  '["Only check if the school nurse has flagged any concerns","Open the register, check for allergies and medical needs, and confirm epi-pens and medication are courtside","Ask the children directly if anyone has an allergy","Review the previous week session notes for known conditions"]'::jsonb,
  1, 'Before any child enters the hall the Lead Coach must open the register, check for allergies and medical needs, locate the medical bag, and check that epi-pens and medication are courtside.', 'medical', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Health and Safety Quiz' AND s.title = 'Health, Safety and Risk Management' LIMIT 1),
  'A child with a known severe allergy arrives and their epi-pen is not present. What should you do?',
  '["Continue with the session but watch the child closely","Call 999 as a precaution","Contact the parent immediately and do not start the session until this is resolved","Ask the school nurse to lend a spare epi-pen"]'::jsonb,
  2, 'Contact the parent immediately. Do not start the session. A child with a severe allergy must not participate without their medication present and accessible.', 'allergy', 'hard'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Health and Safety Quiz' AND s.title = 'Health, Safety and Risk Management' LIMIT 1),
  'A child needs their epi-pen during a session. What is the correct sequence?',
  '["Call the Area Lead, then use the epi-pen, then call 999","Use the epi-pen immediately, then call 999, then notify the Area Lead and parent","Call 999 first, wait for instructions, then use the epi-pen","Call the parent first to confirm before using the epi-pen"]'::jsonb,
  1, 'Use the epi-pen immediately, do not delay for any reason. Then call 999. After that, notify the Area Lead and parent without delay. Record the incident on the Incident Report Form the same day.', 'allergy', 'hard'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Health and Safety Quiz' AND s.title = 'Health, Safety and Risk Management' LIMIT 1),
  'What must happen to the medical bag at the end of every session?',
  '["It stays at the school for the following week session","It is left with the school first aid lead","The Lead Coach takes it with them, it must not be left at the school","It is locked in the school office between sessions"]'::jsonb,
  2, 'The medical bag must leave with the Lead Coach every time. It does not stay at the school. This ensures it remains stocked, secure, and in the hands of a responsible coach.', 'medical', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Health and Safety Quiz' AND s.title = 'Health, Safety and Risk Management' LIMIT 1),
  'At the end of a session, what must happen to a child epi-pen or medication?',
  '["It stays in the medical bag for the following session","The child takes it home in their own bag","It is returned directly to the parent or guardian, not left with the child alone","It is locked in the school medical room until the parent arrives"]'::jsonb,
  2, 'Medication must be returned directly to the parent or guardian. Do not leave it with the child alone. Do not leave it at the school.', 'medical', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Health and Safety Quiz' AND s.title = 'Health, Safety and Risk Management' LIMIT 1),
  'When must a medical incident be recorded on the Incident Report Form?',
  '["Only if the incident required calling 999","Within 48 hours of the session","The same day as the incident, even if it seemed minor","At the end of the working week"]'::jsonb,
  2, 'All medical incidents must be recorded on the Incident Report Form the same day, even if the incident seemed minor at the time.', 'reporting', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Health and Safety Quiz' AND s.title = 'Health, Safety and Risk Management' LIMIT 1),
  'Before making any decision about snacks, what must you do?',
  '["Ask the children what they have brought with them","Check the register for known allergies","Wait until you are in the hall before reviewing any allergy information","Confirm with the school whether snacks are permitted that week"]'::jsonb,
  1, 'Always check the register before making any decision about snacks. Never rely on memory for allergy information. Always check the register each time.', 'allergy', 'easy'
);


-- =============================================================================
-- STAGE 12 - Role-Specific Knowledge Check (6 questions)
-- =============================================================================

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Role-Specific Knowledge Check' AND s.title = 'Role Specific Training' LIMIT 1),
  'Which qualifications must a Lead Coach hold before working independently?',
  '["Enhanced DBS, Paediatric First Aid, UKAG Level 1","Enhanced DBS, Paediatric First Aid or FAW, Safeguarding Level 1, UKAG Level 2, and a signed-off shadow session","Enhanced DBS and Safeguarding Level 2 only","UKAG Level 2 only"]'::jsonb,
  1, 'A Lead Coach must hold all five: Enhanced DBS (including barred list), Paediatric First Aid or First Aid at Work, Safeguarding in Sport Level 1 (renewed annually), UKAG Level 2, and a shadow session signed off by their Area Lead.', 'qualifications', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Role-Specific Knowledge Check' AND s.title = 'Role Specific Training' LIMIT 1),
  'How often must a Lead Coach renew their Safeguarding in Sport training?',
  '["Every three years","Every two years","Annually, in line with KCSIE","Only when required by the school"]'::jsonb,
  2, 'Safeguarding in Sport must be renewed annually in line with Keeping Children Safe in Education (KCSIE). This is a legal requirement, not optional.', 'qualifications', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Role-Specific Knowledge Check' AND s.title = 'Role Specific Training' LIMIT 1),
  'What additional qualification does an Area Lead need that a Lead Coach does not?',
  '["Level 2 Safeguarding Certificate for their Deputy DSL function","UKAG Level 3 Lead Coach award","Paediatric First Aid Level 2","School-specific safeguarding approval"]'::jsonb,
  0, 'Area Leads must hold a Level 2 Safeguarding Certificate for their Deputy DSL function. This must be obtained before or as soon as possible after taking on the role.', 'qualifications', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Role-Specific Knowledge Check' AND s.title = 'Role Specific Training' LIMIT 1),
  'How often is a DBS certificate renewed at ASO?',
  '["Annually","Every two years","Every three years, or maintained via the DBS Update Service","Only when changing schools"]'::jsonb,
  2, 'DBS certificates are renewed every three years. Alternatively, staff may maintain their certificate via the DBS Update Service. Inform Naima if you use this service.', 'dbs', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Role-Specific Knowledge Check' AND s.title = 'Role Specific Training' LIMIT 1),
  'What must happen before a new Lead Coach can lead a session independently?',
  '["Complete three trial sessions with any coach present","Complete a shadow session signed off by their Area Lead","Pass the UKAG Level 2 theory assessment only","Be approved by the school headteacher"]'::jsonb,
  1, 'A shadow session signed off by the Area Lead is a mandatory requirement for Lead Coaches. No Lead Coach may work independently before this is completed.', 'qualifications', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Role-Specific Knowledge Check' AND s.title = 'Role Specific Training' LIMIT 1),
  'A session is running with just one coach. When is this acceptable?',
  '["It is never acceptable, sessions must always have two coaches","As a one-off exception when cover cannot be found in time","As a regular model if the school is small","Only if the Area Lead is on-site"]'::jsonb,
  1, 'Minimum staffing (one coach) is acceptable as a one-off exception when cover cannot be found. It is not a regular operating model. If a school regularly runs minimum staffing, escalate to Naima.', 'lone_working', 'medium'
);


-- =============================================================================
-- STAGE 13 - Communication Standards Quiz (6 questions)
-- =============================================================================

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Communication Standards Quiz' AND s.title = 'School Conduct and Professional Communication' LIMIT 1),
  'A parent asks about their child progress and whether they will move to the next UKAG level. What do you do?',
  '["Give a full update based on your observations from sessions","Promise to look into it and get back to them next week","Be polite and brief, and refer them to your Lead Coach or Naima for anything beyond a quick question","Direct them to email the school"]'::jsonb,
  2, 'Be polite, professional, and brief. Do not make promises about progression. Refer them to your Lead Coach or Naima for anything beyond a quick question.', 'parents', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Communication Standards Quiz' AND s.title = 'School Conduct and Professional Communication' LIMIT 1),
  'A teacher raises a concern about a child after your session. What is the correct response?',
  '["Discuss it in detail and agree an action plan with the teacher","Dismiss it if you have not noticed anything yourself in sessions","Listen, thank them, and report it to your Area Lead the same day","Ask the parent directly at collection that afternoon"]'::jsonb,
  2, 'Listen carefully, thank the teacher, and report it to your Area Lead the same day. Do not make commitments or take action on behalf of ASO. Do not discuss it with the parent.', 'schools', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Communication Standards Quiz' AND s.title = 'School Conduct and Professional Communication' LIMIT 1),
  'A parent asks you to send photos of their child session via WhatsApp. What do you say?',
  '["Yes, share them via your personal WhatsApp if they ask","Decline, you cannot share session photos or children information via personal channels","Share them in the staff group chat so the team can see too","Send them if your Area Lead has not told you not to"]'::jsonb,
  1, 'You cannot share session photos or children information via personal channels. All content from sessions must go through ASO official channels only.', 'social_media', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Communication Standards Quiz' AND s.title = 'School Conduct and Professional Communication' LIMIT 1),
  'A parent complains they have not received a refund for a missed session. What should you do?',
  '["Process it yourself to resolve the situation quickly","Do not make promises about refunds, refer them to Naima","Ask the school to handle the refund","Log it in the session register"]'::jsonb,
  1, 'Do not make any promises about refunds, bookings, or complaints. Refer them to Naima. You are not authorised to commit ASO to financial or booking decisions.', 'parents', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Communication Standards Quiz' AND s.title = 'School Conduct and Professional Communication' LIMIT 1),
  'Which of these is an appropriate use of the staff WhatsApp group?',
  '["Sharing social content and personal updates with the team","Arranging personal meetups between colleagues","Confirming cover, sharing session updates, and passing on messages from your Area Lead","Posting photos of children for team feedback"]'::jsonb,
  2, 'The staff WhatsApp group is for work communication only: confirming cover, sharing session updates, and passing on information. Not for social content or children information.', 'whatsapp', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Communication Standards Quiz' AND s.title = 'School Conduct and Professional Communication' LIMIT 1),
  'What is the rule for communicating with children via social media?',
  '["Permitted on educational platforms with parent consent","Permitted if it relates to ASO session content only","Never, you must not contact children via personal social media or messaging apps","Allowed with permission from your Area Lead"]'::jsonb,
  2, 'You must never contact children via personal social media or messaging apps under any circumstances. All communication with families goes through ASO official channels.', 'social_media', 'easy'
);


-- =============================================================================
-- STAGE 14 - Final Knowledge Assessment (15 questions)
-- =============================================================================

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'What must you NEVER do if a child makes a disclosure to you?',
  '["Listen carefully to what they say","Stay calm and avoid showing alarm","Promise them confidentiality to help them feel safe","Report it to your Lead Coach or Area Lead immediately after the session"]'::jsonb,
  2, 'Never promise confidentiality. You cannot keep that promise. Staying calm and listening are correct. Reporting immediately after the session is required.', 'safeguarding', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'When should you open the hall doors to begin dismissal?',
  '["When the session ends at 4:00pm","Once all children are lined up inside the hall","Only when a parent or guardian is visible outside","When the school gives permission to dismiss"]'::jsonb,
  2, 'Children must be lined up inside the hall and the door should only open once a parent or guardian is visible outside. Never dismiss into an empty space.', 'sop', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'The medical bag must remain where during a session?',
  '["In the school first aid room","In the coach kit bag","Courtside and within reach at all times","At the hall entrance near the exit"]'::jsonb,
  2, 'The medical bag must remain courtside and within reach at all times. It must never be locked away, left in a kit bag, or kept in another room.', 'medical', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'Which safeguarding rule changes when you are lone working?',
  '["You may be alone with a child in a closed space if absolutely necessary","You do not need to complete the register when managing alone","No safeguarding rules change, they apply exactly the same","You can use your own judgement on disclosure reporting"]'::jsonb,
  2, 'No safeguarding rules change when lone working. The same rules apply at all times, regardless of staffing levels.', 'safeguarding', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'By when must you contact your Lead Coach if you cannot attend a session?',
  '["The night before the session","Before 9:00am on the day of the session, by phone call or voice note","Within one hour of the session starting","As soon as you know, any time is acceptable"]'::jsonb,
  1, 'Contact your Lead Coach by phone call or voice note before 9:00am on the day of the session. Not by text. Early notice gives time to find cover.', 'absence', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'Who must hold an Enhanced DBS certificate including the children barred list check?',
  '["Lead Coaches and Area Leads only","Area Leads only","All staff","Only staff who work alone with children"]'::jsonb,
  2, 'All staff must hold an Enhanced DBS certificate including the children barred list check. No exceptions. No member of staff may work independently with children without a confirmed valid DBS.', 'dbs', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'A child with additional needs is becoming distressed during your session. What should you do?',
  '["Ask other children to help calm them down","End the session to protect the other children","Remove the child calmly to a quieter area and notify your Lead Coach","Call the parent immediately to collect the child"]'::jsonb,
  2, 'Remove the child calmly to a quieter area and notify your Lead Coach. Do not single them out in front of peers. Do not end the session or contact the parent without guidance from your Lead Coach.', 'additional_needs', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'Which of the following is always unacceptable at ASO?',
  '["Asking children for feedback at the end of a session","Using physical contact to manage a child behaviour","Finishing a session a few minutes early on occasion","Discussing a minor incident with a teacher after the session"]'::jsonb,
  1, 'Physical contact must never be used to manage behaviour. Use your voice and positioning. This is a non-negotiable rule that applies at all times.', 'conduct', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'A child arrives who is not on the register. What must you do?',
  '["Turn them away, they cannot participate without being pre-registered","Allow them to join and tell the parent to register online after the session","Do not turn them away. Contact your Area Lead, record their details, and do not allow participation until confirmed.","Ask the school office to verify their identity before allowing them in"]'::jsonb,
  2, 'Never turn a child away. Contact your Area Lead immediately. Record the child name, time of arrival, and who brought them. Do not allow participation until your Area Lead confirms.', 'sop', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'After using a child epi-pen and calling 999, what must you do next?',
  '["Wait for parents to arrive before contacting anyone else","Complete the Incident Report Form before anything else","Notify the Area Lead and the parent without delay, and complete the Incident Report Form the same day","Contact Naima directly to report the incident"]'::jsonb,
  2, 'After using the epi-pen and calling 999, notify the Area Lead and the parent without delay. Complete the Incident Report Form the same day. Time and accuracy matter.', 'medical', 'hard'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'A teacher mentions something about a child home situation that worries you. What must you do?',
  '["Raise it with the parent at collection the same day","Report it to your Area Lead the same day and complete a Safeguarding Concern Form","Note it in the session register and review it next session","Share it in the staff WhatsApp group for advice"]'::jsonb,
  1, 'Report it to your Area Lead the same day and complete a Safeguarding Concern Form. Do not approach the parent. Safeguarding concerns follow a formal process.', 'safeguarding', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'Where must children line up before dismissal begins?',
  '["Outside the school entrance where parents can see them","In the school corridor while the hall is cleared","Inside the hall, do not open the door until a parent or guardian is visible outside","In the school reception area"]'::jsonb,
  2, 'Children must be lined up inside the hall. The door does not open until a parent or guardian is visible. No child leaves without being called individually and released to a named adult.', 'sop', 'easy'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'Which role at ASO holds Deputy DSL responsibilities?',
  '["Lead Coach","Junior Coach","Area Lead","Operations Director"]'::jsonb,
  2, 'Area Leads hold Deputy DSL (Designated Safeguarding Lead) responsibilities for their area. This requires a Level 2 Safeguarding Certificate.', 'roles', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'If cover cannot be found within one hour of a Lead Coach reporting absence, who is contacted next?',
  '["Cancel the session immediately","The Lead Coach contacts the Area Lead","Contact Naima directly to resolve it","Inform the school and ask them to arrange cover"]'::jsonb,
  1, 'If cover cannot be found within one hour, the Lead Coach contacts the Area Lead. If still unresolved by 12:00pm, the Area Lead contacts Naima. Naima informs the school and parents if needed.', 'cover', 'medium'
);

INSERT INTO onboarding_quiz_banks (task_id, question, options, correct_index, explanation, category_tag, difficulty)
VALUES (
  (SELECT t.id FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment' LIMIT 1),
  'How do you raise a pay query at ASO?',
  '["Message your Area Lead on WhatsApp","Post in the staff WhatsApp group","Email accounts@activeschool.org.uk with your timesheet attached","Call Naima directly"]'::jsonb,
  2, 'Email accounts@activeschool.org.uk with your timesheet attached and a clear description of the issue. Do not raise pay queries via WhatsApp.', 'pay', 'easy'
);


-- =============================================================================
-- END - 75 questions across 8 quiz tasks
-- Stage 4  (Role):          6  | Stage 6  (Safeguarding): 10
-- Stage 9  (Handbook):      8  | Stage 10 (SOP):           8
-- Stage 11 (H&S):           8  | Stage 12 (Role-Specific): 6
-- Stage 13 (Communication): 6  | Stage 14 (Final):        15
-- =============================================================================
