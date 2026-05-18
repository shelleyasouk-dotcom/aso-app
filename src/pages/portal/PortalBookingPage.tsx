import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, User, CheckCircle, Lock, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { ClubTerm, ParentChild } from '../../types'

type Step = 'child' | 'contacts' | 'medical' | 'consents'
const STEPS: Step[] = ['child', 'contacts', 'medical', 'consents']
const STEP_LABELS: Record<Step, string> = {
  child: 'Child',
  contacts: 'Contacts',
  medical: 'Medical',
  consents: 'Confirm',
}

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(2)}`
}

function bookingWindowStatus(term: ClubTerm): { label: string; open: boolean } {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  if (today > new Date(term.end_date)) return { label: 'Term ended', open: false }
  const openDate = term.open_booking_opens ? new Date(term.open_booking_opens) : null
  const priorityDate = term.priority_booking_opens ? new Date(term.priority_booking_opens) : null
  if (openDate && today >= openDate) return { label: 'Open booking', open: true }
  if (priorityDate && today >= priorityDate) return { label: 'Priority booking open', open: true }
  if (priorityDate) return {
    label: `Opens ${priorityDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
    open: false,
  }
  return { label: 'Booking not yet open', open: false }
}

function isChildProfileComplete(c: ParentChild): boolean {
  return !!(
    c.parent_name && c.parent_phone &&
    c.emergency_contact_name && c.emergency_contact_phone &&
    c.collection_person &&
    c.walk_home_alone !== null && c.walk_home_alone !== undefined &&
    c.photo_consent !== null && c.photo_consent !== undefined
  )
}

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      {[true, false].map(v => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
            value === v
              ? 'border-[#1a3a6b] bg-[#1a3a6b] text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          {v ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">{children}</p>
}

export function PortalBookingPage() {
  const { termId } = useParams<{ termId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [term, setTerm] = useState<ClubTerm | null>(null)
  const [savedChildren, setSavedChildren] = useState<ParentChild[]>([])
  const [confirmedCount, setConfirmedCount] = useState(0)
  const [step, setStep] = useState<Step>('child')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Selected child
  const [selectedChildId, setSelectedChildId] = useState<string | 'new'>('new')

  // Step 1 — Child
  const [childName, setChildName] = useState('')
  const [childDob, setChildDob] = useState('')
  const [yearGroup, setYearGroup] = useState('')
  const [className, setClassName] = useState('')

  // Step 2 — Contacts
  const [parentName, setParentName] = useState('')
  const [parentRelationship, setParentRelationship] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressCity, setAddressCity] = useState('')
  const [addressPostcode, setAddressPostcode] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyRelationship, setEmergencyRelationship] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [secondaryName, setSecondaryName] = useState('')
  const [secondaryPhone, setSecondaryPhone] = useState('')
  const [secondaryEmail, setSecondaryEmail] = useState('')
  const [collectionPerson, setCollectionPerson] = useState('')
  const [walkHomeAlone, setWalkHomeAlone] = useState<boolean | null>(null)

  // Step 3 — Medical
  const [hasAdditionalNeeds, setHasAdditionalNeeds] = useState<boolean | null>(null)
  const [additionalNeedsDetails, setAdditionalNeedsDetails] = useState('')
  const [photoConsent, setPhotoConsent] = useState<boolean | null>(null)

  // Step 4 — Consents
  const [medicallyFit, setMedicallyFit] = useState<boolean | null>(null)
  const [firstAidPermission, setFirstAidPermission] = useState<boolean | null>(null)
  const [feesAcknowledged, setFeesAcknowledged] = useState(false)
  const [policyAgreed, setPolicyAgreed] = useState(false)
  const [tcAgreed, setTcAgreed] = useState(false)
  const [signatureName, setSignatureName] = useState('')

  useEffect(() => {
    if (!termId) return
    Promise.all([
      supabase
        .from('club_terms')
        .select('*, school:schools(id,name,area,session_day,session_time)')
        .eq('id', termId)
        .eq('is_active', true)
        .single(),
      supabase
        .from('parent_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('club_term_id', termId)
        .eq('status', 'confirmed'),
      user
        ? supabase.from('parent_children').select('*').eq('parent_id', user.id).order('full_name')
        : Promise.resolve({ data: [] }),
    ]).then(([termRes, countRes, childrenRes]) => {
      if (!termRes.data) { navigate('/portal/clubs'); return }
      setTerm(termRes.data as ClubTerm)
      setConfirmedCount(countRes.count ?? 0)
      const children = (childrenRes.data ?? []) as ParentChild[]
      setSavedChildren(children)
      if (children.length > 0) {
        populateFromChild(children[0])
        setSelectedChildId(children[0].id)
        if (isChildProfileComplete(children[0])) setStep('consents')
      }
      setLoading(false)
    })
  }, [termId, user])

  function populateFromChild(c: ParentChild) {
    setChildName(c.full_name)
    setChildDob(c.date_of_birth ?? '')
    setYearGroup(c.year_group ?? '')
    setClassName(c.class_name ?? '')
    setParentName(c.parent_name ?? '')
    setParentRelationship(c.parent_relationship ?? '')
    setParentPhone(c.parent_phone ?? '')
    setAddressLine1(c.address_line1 ?? '')
    setAddressCity(c.address_city ?? '')
    setAddressPostcode(c.address_postcode ?? '')
    setEmergencyName(c.emergency_contact_name ?? '')
    setEmergencyRelationship(c.emergency_contact_relationship ?? '')
    setEmergencyPhone(c.emergency_contact_phone ?? '')
    setSecondaryName(c.secondary_emergency_name ?? '')
    setSecondaryPhone(c.secondary_emergency_phone ?? '')
    setSecondaryEmail(c.secondary_emergency_email ?? '')
    setCollectionPerson(c.collection_person ?? '')
    setWalkHomeAlone(c.walk_home_alone ?? null)
    if (c.additional_needs) {
      setHasAdditionalNeeds(true)
      setAdditionalNeedsDetails(c.additional_needs)
    } else {
      setHasAdditionalNeeds(c.additional_needs === '' ? false : null)
    }
    setPhotoConsent(c.photo_consent ?? null)
  }

  function handleChildSelect(id: string) {
    setSelectedChildId(id)
    if (id === 'new') {
      setChildName(''); setChildDob(''); setYearGroup(''); setClassName('')
      setParentName(''); setParentRelationship(''); setParentPhone('')
      setAddressLine1(''); setAddressCity(''); setAddressPostcode('')
      setEmergencyName(''); setEmergencyRelationship(''); setEmergencyPhone('')
      setSecondaryName(''); setSecondaryPhone(''); setSecondaryEmail('')
      setCollectionPerson(''); setWalkHomeAlone(null)
      setHasAdditionalNeeds(null); setAdditionalNeedsDetails('')
      setPhotoConsent(null)
      setStep('child')
    } else {
      const c = savedChildren.find(x => x.id === id)
      if (c) {
        populateFromChild(c)
        setStep(isChildProfileComplete(c) ? 'consents' : 'child')
      }
    }
  }

  const step1Valid = childName.trim().length > 0 && childDob.length > 0 && yearGroup.trim().length > 0
  const step2Valid = (
    parentName.trim() && parentRelationship.trim() && parentPhone.trim() &&
    addressLine1.trim() && addressCity.trim() && addressPostcode.trim() &&
    emergencyName.trim() && emergencyPhone.trim() &&
    secondaryName.trim() && secondaryPhone.trim() && secondaryEmail.trim() &&
    collectionPerson.trim() && walkHomeAlone !== null
  )
  const step3Valid = photoConsent !== null && (hasAdditionalNeeds === false || (hasAdditionalNeeds === true && additionalNeedsDetails.trim().length > 0))
  const step4Valid = (
    medicallyFit === true && firstAidPermission === true &&
    feesAcknowledged && policyAgreed && tcAgreed &&
    signatureName.trim().length > 0
  )

  async function handlePay() {
    if (!term || !user) return
    setError(null)
    setSubmitting(true)

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    if (!token) { setError('Session expired — please log in again.'); setSubmitting(false); return }

    const { data, error: fnErr } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        club_term_id: term.id,
        child: {
          full_name: childName.trim(),
          date_of_birth: childDob || null,
          year_group: yearGroup.trim() || null,
          class_name: className.trim() || null,
          additional_needs: hasAdditionalNeeds ? additionalNeedsDetails.trim() : null,
          parent_name: parentName.trim(),
          parent_relationship: parentRelationship.trim(),
          parent_phone: parentPhone.trim(),
          address_line1: addressLine1.trim(),
          address_city: addressCity.trim(),
          address_postcode: addressPostcode.trim().toUpperCase(),
          emergency_contact_name: emergencyName.trim(),
          emergency_contact_relationship: emergencyRelationship.trim() || null,
          emergency_contact_phone: emergencyPhone.trim(),
          secondary_emergency_name: secondaryName.trim(),
          secondary_emergency_phone: secondaryPhone.trim(),
          secondary_emergency_email: secondaryEmail.trim(),
          collection_person: collectionPerson.trim(),
          walk_home_alone: walkHomeAlone,
          photo_consent: photoConsent,
        },
        consents: {
          medically_fit: medicallyFit,
          first_aid_permission: firstAidPermission,
          fees_acknowledged: feesAcknowledged,
          policy_agreed: policyAgreed,
          signature_name: signatureName.trim(),
        },
      },
    })

    setSubmitting(false)
    if (fnErr || data?.error) {
      setError(data?.error ?? fnErr?.message ?? 'Something went wrong. Please try again.')
      return
    }
    window.location.href = data.url
  }

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex justify-center py-32">
          <div className="w-8 h-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
        </div>
      </PortalLayout>
    )
  }

  if (!term) return null

  const school = term.school as any
  const spotsLeft = term.capacity - confirmedCount
  const status = bookingWindowStatus(term)
  const canBook = status.open && spotsLeft > 0 && !!user
  const stepIndex = STEPS.indexOf(step)

  return (
    <PortalLayout>
      <div className="max-w-lg mx-auto px-4 py-8">

        <button
          onClick={() => navigate(`/portal/clubs/${school.id}`)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a3a6b] mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Back to club
        </button>

        {/* Club summary */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] text-white rounded-2xl p-5 mb-5">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1">Booking for</p>
          <h1 className="text-xl font-extrabold mb-0.5">{school.name}</h1>
          <p className="text-white/70 text-sm">{term.term_name} · {term.num_sessions} sessions</p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-2xl font-extrabold text-[#f5c518]">{formatPrice(term.price_pence)}</span>
            <p className="text-white/60 text-xs">{spotsLeft} of {term.capacity} spaces left</p>
          </div>
        </div>

        {/* Not logged in */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center mb-4">
            <Lock size={24} className="mx-auto text-blue-400 mb-2" />
            <p className="font-bold text-blue-800 mb-1">Sign in to book</p>
            <p className="text-sm text-blue-600 mb-4">You need a Community Hub account to book a place.</p>
            <div className="flex gap-2">
              <button onClick={() => navigate('/portal/login')} className="flex-1 bg-[#1a3a6b] text-white font-bold py-2.5 rounded-xl text-sm">Sign In</button>
              <button onClick={() => navigate('/portal/register')} className="flex-1 border border-[#1a3a6b] text-[#1a3a6b] font-bold py-2.5 rounded-xl text-sm">Register</button>
            </div>
          </div>
        )}

        {user && !canBook && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800">
              {spotsLeft <= 0 ? 'This club is currently full.' : status.label}
            </p>
          </div>
        )}

        {user && canBook && (
          <>
            {/* Step indicator */}
            <div className="flex items-center gap-1 mb-6">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className={`flex items-center gap-1.5 flex-1 ${i < STEPS.length - 1 ? '' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      i < stepIndex ? 'bg-green-500 text-white' :
                      i === stepIndex ? 'bg-[#1a3a6b] text-white' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {i < stepIndex ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${i === stepIndex ? 'text-[#1a3a6b]' : 'text-gray-400'}`}>
                      {STEP_LABELS[s]}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-1" />}
                </div>
              ))}
            </div>

            {/* Saved children selector — shown on child step */}
            {step === 'child' && savedChildren.length > 0 && (
              <div className="flex flex-col gap-2 mb-5">
                <p className="text-sm font-semibold text-gray-600">Select a child on your account</p>
                {savedChildren.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleChildSelect(c.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left ${
                      selectedChildId === c.id ? 'border-[#1a3a6b] bg-[#1a3a6b]/5' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#1a3a6b] flex items-center justify-center shrink-0">
                      <User size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800">{c.full_name}</p>
                      <p className="text-xs text-gray-400">{[c.year_group, c.class_name].filter(Boolean).join(' · ')}</p>
                    </div>
                    {selectedChildId === c.id && <CheckCircle size={16} className="ml-auto text-[#1a3a6b] shrink-0" />}
                  </button>
                ))}
                <button
                  onClick={() => handleChildSelect('new')}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    selectedChildId === 'new' ? 'border-[#1a3a6b] bg-[#1a3a6b]/5 text-[#1a3a6b]' : 'border-dashed border-gray-300 text-gray-500'
                  }`}
                >
                  + Add a different child
                </button>
              </div>
            )}

            {/* ── Step 1: Child details ── */}
            {step === 'child' && (
              <div className="flex flex-col gap-4">
                <h2 className="font-bold text-[#1a3a6b] text-lg">Child's Details</h2>
                <Input id="cn" label="Child's full name *" placeholder="First and last name" value={childName} onChange={e => setChildName(e.target.value)} />
                <Input id="dob" label="Date of birth *" type="date" value={childDob} onChange={e => setChildDob(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input id="yg" label="Year group *" placeholder="e.g. Year 3" value={yearGroup} onChange={e => setYearGroup(e.target.value)} />
                  <Input id="cls" label="Class" placeholder="e.g. 3B" value={className} onChange={e => setClassName(e.target.value)} />
                </div>
                <Button size="lg" fullWidth disabled={!step1Valid} onClick={() => setStep('contacts')}>Continue</Button>
              </div>
            )}

            {/* ── Step 2: Parent & emergency contacts ── */}
            {step === 'contacts' && (
              <div className="flex flex-col gap-4">
                <button onClick={() => setStep('child')} className="flex items-center gap-1.5 text-sm text-gray-500 -mb-1">
                  <ChevronLeft size={14} /> Back
                </button>
                <h2 className="font-bold text-[#1a3a6b] text-lg">Parent & Emergency Contacts</h2>

                <SectionLabel>Parent / Guardian</SectionLabel>
                <Input id="pn" label="Parent / guardian full name *" placeholder="" value={parentName} onChange={e => setParentName(e.target.value)} />
                <Input id="pr" label="Relationship to child *" placeholder="e.g. Mother, Father, Carer" value={parentRelationship} onChange={e => setParentRelationship(e.target.value)} />
                <Input id="pp" label="Phone number *" type="tel" placeholder="+44 7700 000000" value={parentPhone} onChange={e => setParentPhone(e.target.value)} />

                <SectionLabel>Address</SectionLabel>
                <Input id="a1" label="Address *" placeholder="House number and street" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input id="ac" label="City *" placeholder="e.g. Manchester" value={addressCity} onChange={e => setAddressCity(e.target.value)} />
                  <Input id="ap" label="Postcode *" placeholder="e.g. M1 1AA" value={addressPostcode} onChange={e => setAddressPostcode(e.target.value)} />
                </div>

                <SectionLabel>Secondary Emergency Contact</SectionLabel>
                <Input id="en" label="Emergency contact name *" placeholder="" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} />
                <Input id="er" label="Relationship to child" placeholder="e.g. Grandparent" value={emergencyRelationship} onChange={e => setEmergencyRelationship(e.target.value)} />
                <Input id="ep" label="Emergency contact phone *" type="tel" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} />

                <SectionLabel>Third Emergency Contact</SectionLabel>
                <Input id="sn" label="Name *" placeholder="" value={secondaryName} onChange={e => setSecondaryName(e.target.value)} />
                <Input id="sph" label="Phone *" type="tel" value={secondaryPhone} onChange={e => setSecondaryPhone(e.target.value)} />
                <Input id="sem" label="Email *" type="email" value={secondaryEmail} onChange={e => setSecondaryEmail(e.target.value)} />

                <SectionLabel>Collection</SectionLabel>
                <Input id="cp" label="Who will collect your child? *" placeholder="Full name of the person collecting" value={collectionPerson} onChange={e => setCollectionPerson(e.target.value)} />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Is your child allowed to walk home alone? *</p>
                  <YesNo value={walkHomeAlone} onChange={setWalkHomeAlone} />
                </div>

                <Button size="lg" fullWidth disabled={!step2Valid} onClick={() => setStep('medical')}>Continue</Button>
              </div>
            )}

            {/* ── Step 3: Medical & consents ── */}
            {step === 'medical' && (
              <div className="flex flex-col gap-4">
                <button onClick={() => setStep('contacts')} className="flex items-center gap-1.5 text-sm text-gray-500 -mb-1">
                  <ChevronLeft size={14} /> Back
                </button>
                <h2 className="font-bold text-[#1a3a6b] text-lg">Medical & Additional Needs</h2>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Does your child have any additional needs, SEND, medical conditions, behavioural support requirements, or sensory sensitivities? *
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    This helps our coaches prepare appropriately and provide a safe, positive experience. All information is treated confidentially.
                  </p>
                  <YesNo value={hasAdditionalNeeds} onChange={setHasAdditionalNeeds} />
                </div>

                {hasAdditionalNeeds === true && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Please provide details *</label>
                    <textarea
                      value={additionalNeedsDetails}
                      onChange={e => setAdditionalNeedsDetails(e.target.value)}
                      placeholder="Describe any medical conditions, allergies, SEND needs, sensory sensitivities, or support requirements…"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                    />
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Photography & marketing consent *</p>
                  <p className="text-xs text-gray-400 mb-2">
                    From time to time, we may take photographs during sessions to celebrate achievements and showcase our clubs in newsletters, social media and promotional materials.
                  </p>
                  <YesNo value={photoConsent} onChange={setPhotoConsent} />
                </div>

                <Button size="lg" fullWidth disabled={!step3Valid} onClick={() => setStep('consents')}>Continue</Button>
              </div>
            )}

            {/* ── Step 4: Review & consents ── */}
            {step === 'consents' && (
              <div className="flex flex-col gap-4">
                {stepIndex > 0 && (
                  <button onClick={() => setStep('medical')} className="flex items-center gap-1.5 text-sm text-gray-500 -mb-1">
                    <ChevronLeft size={14} /> Back
                  </button>
                )}

                <h2 className="font-bold text-[#1a3a6b] text-lg">Confirm Booking</h2>

                {/* Summary */}
                <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden text-sm">
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Club</p>
                    <p className="font-semibold text-gray-800">{school.name}</p>
                    <p className="text-gray-500">{school.session_day} · {school.session_time}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Term</p>
                    <p className="font-semibold text-gray-800">{term.term_name}</p>
                    <p className="text-gray-500">
                      {new Date(term.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {' – '}
                      {new Date(term.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{term.num_sessions} sessions
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Child</p>
                    <p className="font-semibold text-gray-800">{childName}</p>
                    {(yearGroup || className) && <p className="text-gray-500">{[yearGroup, className].filter(Boolean).join(' · ')}</p>}
                    {hasAdditionalNeeds && additionalNeedsDetails && (
                      <p className="text-xs text-amber-700 mt-0.5 bg-amber-50 rounded-lg px-2 py-1">{additionalNeedsDetails}</p>
                    )}
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total</p>
                    <p className="text-xl font-extrabold text-[#1a3a6b]">{formatPrice(term.price_pence)}</p>
                  </div>
                </div>

                {/* Consent questions */}
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">I confirm my child is medically fit to participate *</p>
                    <YesNo value={medicallyFit} onChange={setMedicallyFit} />
                    {medicallyFit === false && (
                      <p className="text-xs text-red-600 mt-1">Your child must be medically fit to take part. Please contact us if you have concerns.</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">I give permission for first aid or emergency treatment if required *</p>
                    <YesNo value={firstAidPermission} onChange={setFirstAidPermission} />
                  </div>
                </div>

                {/* Agreement checkboxes */}
                <div className="flex flex-col gap-3 pt-2">
                  {[
                    { checked: feesAcknowledged, onChange: setFeesAcknowledged, label: 'I understand fees are non-refundable once processed' },
                    { checked: policyAgreed, onChange: setPolicyAgreed, label: 'I agree to the ASO Membership & Booking Policy' },
                    { checked: tcAgreed, onChange: setTcAgreed, label: 'I have read and agree to the Terms & Conditions' },
                  ].map(({ checked, onChange, label }) => (
                    <label key={label} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => onChange(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded accent-[#1a3a6b] shrink-0"
                      />
                      <span className="text-sm text-gray-600">{label} *</span>
                    </label>
                  ))}
                </div>

                {/* Signature */}
                <div>
                  <Input
                    id="sig"
                    label="Signature — type your full name *"
                    placeholder="Your full name"
                    value={signatureName}
                    onChange={e => setSignatureName(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    By typing your name above you are electronically signing this booking form.
                    Date: {new Date().toLocaleDateString('en-GB')}
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock size={12} />
                  Secure payment powered by Stripe
                </div>

                <Button size="lg" fullWidth disabled={!step4Valid || submitting} onClick={handlePay}>
                  {submitting ? 'Redirecting to payment…' : `Pay ${formatPrice(term.price_pence)} securely`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PortalLayout>
  )
}
