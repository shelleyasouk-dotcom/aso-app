import { Download } from 'lucide-react'
import { PortalLayout } from '../../components/layout/PortalLayout'

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-extrabold text-[#1a3a6b] border-b-2 border-[#1a3a6b] pb-2 mb-4">
        {number}. {title}
      </h2>
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="font-bold text-[#e07b00] mb-1.5 text-sm">{title}</h3>
      {children}
    </div>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border-l-4 border-[#1a3a6b] px-4 py-3 my-3 text-sm text-gray-700 leading-relaxed">
      {children}
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 leading-relaxed">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}

function TableRow({ cells, header }: { cells: string[]; header?: boolean }) {
  const Tag = header ? 'th' : 'td'
  return (
    <tr className={header ? 'bg-[#1a3a6b] text-white' : 'even:bg-gray-50'}>
      {cells.map((c, i) => (
        <Tag key={i} className="px-3 py-2 text-sm text-left border border-gray-200 align-top">{c}</Tag>
      ))}
    </tr>
  )
}

export function PortalTermsPage() {
  return (
    <PortalLayout>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">Version 1.0 | 2026</p>
          <h1 className="text-3xl font-extrabold mb-1">Parent Terms &amp; Conditions</h1>
          <p className="text-white/70 text-sm">After-School Gymnastics &amp; Multi-Sport Clubs</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['Fun', 'Safety', 'Inclusion', 'Development', 'Professionalism'].map(v => (
              <span key={v} className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{v}</span>
            ))}
          </div>
          <a
            href="/ASO_Parent_Terms_and_Conditions_v1_2026.pdf"
            download
            className="inline-flex items-center gap-2 mt-5 bg-[#f5c518] text-[#1a3a6b] font-bold text-sm px-4 py-2 rounded-xl hover:bg-yellow-400 transition-colors"
          >
            <Download size={15} />
            Download PDF
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Callout>
          <strong>Please read these terms carefully before completing your registration.</strong> By submitting your booking and payment you confirm that you have read, understood, and agreed to these Terms &amp; Conditions in full.
        </Callout>

        {/* 1 */}
        <Section number="1" title="About Us">
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">Active School Org (ASO) delivers structured, high-quality gymnastics and multi-sport after-school clubs in UK primary schools. We operate using the UKAG Awards Framework, providing children with a safe, fun, and progressive activity programme.</p>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">We work in partnership with your child's school to deliver sessions as part of their enrichment programme. The school hosts our sessions free of charge and supports us in communicating with families.</p>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <TableRow cells={['Contact', 'Details']} header />
              <TableRow cells={['General Enquiries', 'info@activeschool.org.uk']} />
              <TableRow cells={['Website', 'www.activeschool.org.uk']} />
              <TableRow cells={['Complaints', 'info@activeschool.org.uk']} />
              <TableRow cells={['Accounts & Billing', 'info@activeschool.org.uk']} />
            </tbody>
          </table>
        </Section>

        {/* 2 */}
        <Section number="2" title="How Booking Works">
          <SubSection title="2.1 First-Time Booking">
            <p className="text-sm text-gray-600 leading-relaxed">Your child's school will send out a Letter of Interest at the start of a new programme. Once you have confirmed your interest, you will receive an invoice for the upcoming half-term block. Your place is not confirmed until payment has been received in full.</p>
          </SubSection>
          <SubSection title="2.2 Returning Families">
            <p className="text-sm text-gray-600 leading-relaxed">Returning families receive priority booking at the end of each term. You will be contacted directly with details of how to re-enrol for the following half-term before spaces are opened to new families.</p>
          </SubSection>
          <SubSection title="2.3 Booking Platform">
            <p className="text-sm text-gray-600 leading-relaxed">All bookings are managed through our online booking system at www.activeschool.org.uk, powered by Wix. You will need to create an account to register your child and complete all required forms.</p>
          </SubSection>
          <SubSection title="2.4 Registration Forms">
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">As part of booking, you are required to complete:</p>
            <BulletList items={[
              'Child registration and contact details',
              'Emergency contact information',
              'Medical information form',
              'Photo and media consent form',
              'Agreement to these Terms & Conditions',
            ]} />
            <Callout>Your child's place cannot be confirmed until all registration forms are fully completed and payment has been received.</Callout>
          </SubSection>
        </Section>

        {/* 3 */}
        <Section number="3" title="Fees and Payment">
          <SubSection title="3.1 Session Fees">
            <p className="text-sm text-gray-600 leading-relaxed">Sessions are charged at <strong>£9 per session</strong>. Clubs run in half-term blocks of 6 sessions, making the standard block fee <strong>£54 per child</strong>.</p>
            <Callout>The number of sessions per block may vary slightly depending on the school term calendar. Any variation will be communicated clearly at the point of booking.</Callout>
          </SubSection>
          <SubSection title="3.2 Payment Schedule">
            <p className="text-sm text-gray-600 leading-relaxed">Payment is required upfront at the start of each half-term block. Your place is not confirmed until payment is received in full.</p>
          </SubSection>
          <SubSection title="3.3 Payment Methods">
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">We accept the following payment methods via our Wix booking platform:</p>
            <BulletList items={['Debit or credit card', 'PayPal']} />
            <Callout>We do not currently accept childcare vouchers. We will update families if this changes in future.</Callout>
          </SubSection>
          <SubSection title="3.4 Late Payment">
            <p className="text-sm text-gray-600 leading-relaxed">If payment is not received before the start of the block, your child's place may be released to another family on the waiting list. If you are experiencing difficulties with payment, please contact us as early as possible at info@activeschool.org.uk.</p>
          </SubSection>
        </Section>

        {/* 4 */}
        <Section number="4" title="Cancellations and Refunds">
          <SubSection title="4.1 Cancellation by Parent">
            <Callout><strong>We operate a no refund policy once a booking has been confirmed and payment received.</strong> Places are limited and your booking removes the opportunity for another child to attend.</Callout>
            <p className="text-sm text-gray-600 mt-2 mb-1 font-semibold">Exception — Injury or Medical Reason:</p>
            <p className="text-sm text-gray-600 leading-relaxed">If your child is unable to attend due to injury or a medical condition, we will offer a transfer of their remaining sessions to the following half-term block, subject to availability. A medical note may be required. We are unable to offer cash refunds in these circumstances.</p>
          </SubSection>
          <SubSection title="4.2 Cancellation by Active School Org">
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">In the rare event that we need to cancel a session due to coach absence, school closure, or circumstances outside our control, we will:</p>
            <BulletList items={[
              'Where possible, transfer the session to the end of the current block or reduce the following term\'s fee by one session',
              'Where this is not possible, issue a pro-rata refund for the cancelled session only',
            ]} />
          </SubSection>
          <SubSection title="4.3 School Closures">
            <p className="text-sm text-gray-600 leading-relaxed">If a school closes unexpectedly (e.g. due to adverse weather or an emergency), the session will be cancelled. ASO is not liable for school-led closures. We will follow the same process as 4.2 above.</p>
          </SubSection>
        </Section>

        {/* 5 */}
        <Section number="5" title="Attendance">
          <SubSection title="5.1 Your Responsibility">
            <p className="text-sm text-gray-600 leading-relaxed">Once booked, you are responsible for ensuring your child attends regularly. We do not offer refunds or transfers for sessions missed due to holidays, other commitments, or simply not attending.</p>
          </SubSection>
          <SubSection title="5.2 Letting Us Know">
            <p className="text-sm text-gray-600 leading-relaxed">If your child will not be attending a session, please let us know in advance by emailing info@activeschool.org.uk. This helps our coaches plan effectively and manage registers accurately.</p>
          </SubSection>
          <SubSection title="5.3 Late Arrival">
            <p className="text-sm text-gray-600 leading-relaxed">Sessions begin promptly. Children arriving more than 15 minutes late may be unable to join the session for safety reasons, at the Lead Coach's discretion. No refund will be issued for sessions missed due to late arrival.</p>
          </SubSection>
        </Section>

        {/* 6 */}
        <Section number="6" title="Collection and Dismissal">
          <SubSection title="6.1 Collection Policy">
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">Children will only be released to a named adult listed on their registration form. Please ensure your collection contacts are kept up to date at all times.</p>
            <Callout>If someone different is collecting your child on a particular day, you must notify us in advance by emailing info@activeschool.org.uk or by informing the Lead Coach at the start of the session. We will not release a child to an unknown adult without prior confirmation.</Callout>
          </SubSection>
          <SubSection title="6.2 Late Collection">
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">If your child has not been collected within 15 minutes of the session ending, our coaches will:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Attempt to contact the parent or guardian on the registered number</li>
              <li>Attempt the secondary emergency contact if no answer</li>
              <li>Contact the Area Lead for further guidance</li>
            </ol>
            <Callout>Persistent late collection may result in your child's place being reviewed.</Callout>
          </SubSection>
          <SubSection title="6.3 No Self-Dismissal">
            <p className="text-sm text-gray-600 leading-relaxed">Children will not be permitted to leave the session unaccompanied, regardless of age, unless written permission has been provided in advance and agreed by the Area Lead and school.</p>
          </SubSection>
        </Section>

        {/* 7 */}
        <Section number="7" title="Health, Safety and Medical Information">
          <SubSection title="7.1 Medical Information">
            <p className="text-sm text-gray-600 leading-relaxed">You are required to provide full and accurate medical information for your child at the point of registration. This includes any allergies, medical conditions, medications, or physical needs that may affect their participation.</p>
            <Callout><strong>It is your responsibility to keep this information up to date.</strong> If your child's medical needs change at any point during the term, please notify us immediately at info@activeschool.org.uk.</Callout>
          </SubSection>
          <SubSection title="7.2 Allergies and Epi-Pens">
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">If your child has a severe allergy and requires an epi-pen or other emergency medication:</p>
            <BulletList items={[
              'This must be disclosed fully at the point of registration',
              'The medication must be brought to every session in a clearly labelled bag',
              'Our Lead Coach will ensure it is kept courtside and within reach throughout the session',
              'Medication will be returned directly to you at the end of every session — it does not stay at the school',
            ]} />
            <Callout>If your child's epi-pen or medication is not present at the start of a session, we may not be able to allow your child to participate. Your child's safety comes first.</Callout>
          </SubSection>
          <SubSection title="7.3 First Aid">
            <p className="text-sm text-gray-600 leading-relaxed">Every session is led by a qualified Lead Coach holding a valid Paediatric First Aid certificate. A fully stocked first aid kit is present at every session. By registering your child, you give consent for our coaches to administer basic first aid in the event of a minor injury.</p>
          </SubSection>
          <SubSection title="7.4 Illness">
            <p className="text-sm text-gray-600 leading-relaxed">Please do not send your child to a session if they are unwell.</p>
            <Callout>We follow the standard 48-hour rule for sickness and diarrhoea — children should not attend within 48 hours of their last episode.</Callout>
          </SubSection>
          <SubSection title="7.5 Medication During Sessions">
            <p className="text-sm text-gray-600 leading-relaxed">Our coaches are not able to administer prescription medication. If your child requires medication during a session, please contact us before the term begins so we can assess what support is possible.</p>
          </SubSection>
        </Section>

        {/* 8 */}
        <Section number="8" title="Additional Needs and Inclusion">
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">Active School Org is committed to being inclusive. We welcome children of all abilities, backgrounds, and needs.</p>
          <SubSection title="8.1 Disclosing Additional Needs">
            <p className="text-sm text-gray-600 leading-relaxed">If your child has additional needs, a disability, or a condition that may affect their participation, please disclose this fully on the registration form and contact us directly at info@activeschool.org.uk before the term begins.</p>
            <Callout>Early disclosure allows us to plan appropriately and ensure your child has the best possible experience with us.</Callout>
          </SubSection>
          <SubSection title="8.2 Trial Period">
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">Where additional support may be needed, we may offer a trial period to assess whether our sessions are the right fit for your child.</p>
            <Callout><strong>Due to coach-to-child ratios and safeguarding requirements, our coaches are unable to provide one-to-one dedicated support during sessions.</strong> If you attend as a parent supporter, this is to support your child only — not to coach or manage other children.</Callout>
          </SubSection>
          <SubSection title="8.3 Our Commitment">
            <p className="text-sm text-gray-600 leading-relaxed">We will always try to make reasonable adjustments. If we do not feel we are able to meet your child's needs safely within our current structure, we will tell you honestly and help you explore alternative options.</p>
          </SubSection>
        </Section>

        {/* 9 */}
        <Section number="9" title="Behaviour">
          <SubSection title="9.1 Expected Behaviour">
            <p className="text-sm text-gray-600 leading-relaxed">We expect all children to treat coaches and fellow participants with respect. Our coaches work hard to create a positive, inclusive environment and behaviour that disrupts this will not be tolerated.</p>
          </SubSection>
          <SubSection title="9.2 Managing Behaviour">
            <p className="text-sm text-gray-600 leading-relaxed">Our coaches are trained to manage behaviour calmly, positively, and without physical intervention. We use encouragement, redirection, and structured activities to keep children engaged and happy.</p>
          </SubSection>
          <SubSection title="9.3 Serious or Persistent Behaviour">
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">In cases of persistent disruptive behaviour, physical aggression, or behaviour that puts others at risk, we will:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Speak with the parent or guardian after the session</li>
              <li>Agree a behaviour plan where possible</li>
              <li>If behaviour continues, we reserve the right to suspend or permanently remove a child from the programme</li>
            </ol>
            <Callout>No refund will be issued in cases of removal due to behaviour.</Callout>
          </SubSection>
          <SubSection title="9.4 Parent Behaviour">
            <p className="text-sm text-gray-600 leading-relaxed">We expect all parents and guardians to treat our coaches, school staff, and other families with respect. Aggressive, threatening, or abusive behaviour toward our team will result in immediate removal from the programme without refund.</p>
          </SubSection>
        </Section>

        {/* 10 */}
        <Section number="10" title="Photography and Media">
          <SubSection title="10.1 Photo Consent">
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">At the point of registration, you will be asked to give or withhold consent for your child to be photographed or filmed during sessions. Photos and videos may be used for:</p>
            <BulletList items={[
              'Our weekly school newsletter insert',
              'Our website and social media channels',
              'Internal training and quality purposes',
            ]} />
          </SubSection>
          <SubSection title="10.2 No Consent">
            <p className="text-sm text-gray-600 leading-relaxed">If you do not give consent, your child will not be photographed or filmed. Please ensure you update us if your consent preference changes during the year.</p>
          </SubSection>
          <SubSection title="10.3 Photography During Sessions">
            <p className="text-sm text-gray-600 leading-relaxed">Parents and coaches are not permitted to take personal photographs or videos during sessions. All media is managed centrally by ASO. This policy is in place to protect all children in our care.</p>
          </SubSection>
        </Section>

        {/* 11 */}
        <Section number="11" title="Data Protection and Privacy">
          <SubSection title="11.1 How We Use Your Data">
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">We collect and store personal data about you and your child in order to:</p>
            <BulletList items={[
              'Manage bookings and payments',
              'Communicate about sessions and programme updates',
              'Ensure the safety and wellbeing of your child',
              'Meet our safeguarding and legal obligations',
            ]} />
          </SubSection>
          <SubSection title="11.2 Where Data is Stored">
            <p className="text-sm text-gray-600 leading-relaxed">Your data is stored securely within our Wix booking platform. We do not share your personal data with third parties without your consent, except where required by law or for safeguarding purposes.</p>
          </SubSection>
          <SubSection title="11.3 Your Rights">
            <p className="text-sm text-gray-600 leading-relaxed">You have the right to access, correct, or request deletion of your personal data at any time. To make a request, email info@activeschool.org.uk. We retain data in line with our GDPR policy and statutory obligations (typically 6 years).</p>
          </SubSection>
          <SubSection title="11.4 Communication">
            <p className="text-sm text-gray-600 leading-relaxed">By registering, you agree to receive communications from ASO relating to your booking, session updates, and programme information. You may opt out of marketing communications at any time by emailing info@activeschool.org.uk.</p>
          </SubSection>
        </Section>

        {/* 12 */}
        <Section number="12" title="School Communication">
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">Active School Org works closely with your child's school throughout each term. Here is how we communicate:</p>
          <table className="w-full border-collapse text-sm mb-3">
            <tbody>
              <TableRow cells={['Communication', 'Who Sends It', 'When']} header />
              <TableRow cells={['Letter of Interest', 'School (on behalf of ASO)', 'Start of new programme']} />
              <TableRow cells={['Booking Confirmation', 'ASO directly', 'After payment received']} />
              <TableRow cells={['Weekly Update Email', 'ASO to school reception', 'Each week, optional newsletter insert']} />
              <TableRow cells={['End of Term Priority Booking', 'School (on behalf of ASO)', '2–3 weeks before end of term']} />
              <TableRow cells={['Session Cancellation Notice', 'ASO directly', 'As soon as known']} />
            </tbody>
          </table>
          <p className="text-sm text-gray-600 leading-relaxed">If you have a question about your booking or your child's progress, please contact us directly at info@activeschool.org.uk rather than through the school office.</p>
        </Section>

        {/* 13 */}
        <Section number="13" title="Complaints">
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">We welcome feedback and take all concerns seriously. If you are unhappy with any aspect of our service, please follow the process below.</p>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <TableRow cells={['Step', 'Action', 'Timescale']} header />
              <TableRow cells={['Step 1 — Informal', 'Speak to the Lead Coach at the session or email info@activeschool.org.uk. Most concerns can be resolved quickly through discussion.', 'Immediately']} />
              <TableRow cells={['Step 2 — Formal', 'If unresolved, submit a written complaint to admin@activeschool.org.uk including your child\'s name, school, dates, and nature of the concern.', 'Within 5 working days']} />
              <TableRow cells={['Step 3 — Review', 'The Operations Director will investigate and respond in writing.', 'Within 10 working days']} />
              <TableRow cells={['Step 4 — Escalation', 'If still unresolved, you may escalate to ops@activeschool.org.uk.', 'Within 14 working days']} />
            </tbody>
          </table>
        </Section>

        {/* 14 */}
        <Section number="14" title="Changes to These Terms">
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">Active School Org reserves the right to update these Terms &amp; Conditions. You will be notified of any significant changes by email. Continued enrolment following notification of changes constitutes acceptance of the updated terms.</p>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <TableRow cells={['Document', 'Details']} header />
              <TableRow cells={['Current version', '1.0 | 2026']} />
              <TableRow cells={['Next scheduled review', 'September 2026']} />
              <TableRow cells={['Owned by', 'Active School Org Operations Team']} />
            </tbody>
          </table>
        </Section>

        {/* 15 */}
        <Section number="15" title="Parent Agreement">
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">By completing your registration and submitting payment, you confirm that you have read and agreed to these Terms &amp; Conditions in full.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Please read each statement below to confirm your agreement:</p>
            <div className="space-y-2.5">
              {[
                'I have read and understood these Terms & Conditions in full',
                'All information provided on my child\'s registration form is accurate and complete',
                'I agree to the collection and use of my data as described in Section 11',
                'I give consent for basic first aid to be administered to my child if required',
                'I understand and accept the booking, payment, and refund policy',
                'I have provided full and accurate medical information for my child',
                'I understand that my child will only be released to named adults on my registration form',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded mt-0.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#1a3a6b] text-white rounded-xl p-6 text-center">
            <p className="font-bold text-lg mb-1">Thank you for choosing Active School Org.</p>
            <p className="text-white/70 text-sm">We look forward to welcoming your child to the team.</p>
            <p className="text-white/50 text-xs mt-2">www.activeschool.org.uk | info@activeschool.org.uk</p>
          </div>
        </Section>

        {/* Download again at bottom */}
        <div className="text-center pt-4 border-t border-gray-100">
          <a
            href="/ASO_Parent_Terms_and_Conditions_v1_2026.pdf"
            download
            className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#142f58] transition-colors"
          >
            <Download size={15} />
            Download PDF copy
          </a>
        </div>
      </div>
    </PortalLayout>
  )
}
