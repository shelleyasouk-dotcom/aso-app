import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, Trash2, ChevronDown, ChevronUp, Lock, AlertCircle, CheckCircle, Tag, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import {
  useBasket, isChildItemComplete, isContactDataComplete,
  type BasketItem, type BasketContactData, type DiscountCode,
} from '../../contexts/BasketContext'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(2)}`
}

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      {([true, false] as const).map(v => (
        <button key={String(v)} type="button" onClick={() => onChange(v)}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
            value === v ? 'border-[#1a3a6b] bg-[#1a3a6b] text-white' : 'border-gray-200 bg-white text-gray-600'
          }`}
        >{v ? 'Yes' : 'No'}</button>
      ))}
    </div>
  )
}

function ChildForm({ item, onUpdate }: { item: BasketItem; onUpdate: (updates: Partial<BasketItem>) => void }) {
  const c = item.child
  const set = (field: string, val: unknown) => onUpdate({ child: { ...c, [field]: val } })
  const [open, setOpen] = useState(!isChildItemComplete(item))

  return (
    <div className="border-t border-gray-100 mt-3 pt-3">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-700"
      >
        <span className="flex items-center gap-2">
          {isChildItemComplete(item)
            ? <CheckCircle size={15} className="text-green-500" />
            : <AlertCircle size={15} className="text-amber-500" />}
          {isChildItemComplete(item) ? 'Child details complete' : 'Complete child details'}
        </span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {open && (
        <div className="flex flex-col gap-3 mt-3">
          <Input id={`cn-${item.id}`} label="Child's full name *" value={c.childName}
            onChange={e => set('childName', e.target.value)} />
          <Input id={`dob-${item.id}`} label="Date of birth *" type="date" value={c.childDob}
            onChange={e => set('childDob', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Input id={`yg-${item.id}`} label="Year group *" placeholder="e.g. Year 3" value={c.yearGroup}
              onChange={e => set('yearGroup', e.target.value)} />
            <Input id={`cls-${item.id}`} label="Class" placeholder="e.g. 3B" value={c.className}
              onChange={e => set('className', e.target.value)} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Additional needs / SEND? *</p>
            <YesNo value={c.hasAdditionalNeeds} onChange={v => set('hasAdditionalNeeds', v)} />
          </div>
          {c.hasAdditionalNeeds === true && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Please provide details *</label>
              <textarea value={c.additionalNeedsDetails}
                onChange={e => set('additionalNeedsDetails', e.target.value)}
                placeholder="Medical conditions, allergies, SEND, sensory needs…"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
              />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Photo & marketing consent *</p>
            <p className="text-xs text-gray-400 mb-2">
              We may photograph sessions to celebrate achievements and use in newsletters and social media.
            </p>
            <YesNo value={c.photoConsent} onChange={v => set('photoConsent', v)} />
          </div>
        </div>
      )}
    </div>
  )
}

function ContactForm({ data, onChange }: { data: BasketContactData; onChange: (d: Partial<BasketContactData>) => void }) {
  const [open, setOpen] = useState(!isContactDataComplete(data))

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <button onClick={() => setOpen(v => !v)} className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {isContactDataComplete(data)
            ? <CheckCircle size={16} className="text-green-500" />
            : <AlertCircle size={16} className="text-amber-500" />}
          <div className="text-left">
            <p className="font-bold text-gray-800">Parent & Emergency Contacts</p>
            <p className="text-xs text-gray-400">Applied to all new children in this booking</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="flex flex-col gap-3 mt-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Parent / Guardian</p>
          <Input id="pn" label="Full name *" value={data.parentName} onChange={e => onChange({ parentName: e.target.value })} />
          <Input id="pr" label="Relationship to child *" placeholder="e.g. Mother, Father, Carer" value={data.parentRelationship} onChange={e => onChange({ parentRelationship: e.target.value })} />
          <Input id="pp" label="Phone number *" type="tel" value={data.parentPhone} onChange={e => onChange({ parentPhone: e.target.value })} />

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Address</p>
          <Input id="a1" label="Address *" value={data.addressLine1} onChange={e => onChange({ addressLine1: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input id="ac" label="City *" value={data.addressCity} onChange={e => onChange({ addressCity: e.target.value })} />
            <Input id="ap" label="Postcode *" value={data.addressPostcode} onChange={e => onChange({ addressPostcode: e.target.value })} />
          </div>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Secondary Emergency Contact</p>
          <Input id="en" label="Name *" value={data.emergencyName} onChange={e => onChange({ emergencyName: e.target.value })} />
          <Input id="er" label="Relationship" placeholder="e.g. Grandparent" value={data.emergencyRelationship} onChange={e => onChange({ emergencyRelationship: e.target.value })} />
          <Input id="ep" label="Phone *" type="tel" value={data.emergencyPhone} onChange={e => onChange({ emergencyPhone: e.target.value })} />

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Third Emergency Contact</p>
          <Input id="sn" label="Name *" value={data.secondaryName} onChange={e => onChange({ secondaryName: e.target.value })} />
          <Input id="sp" label="Phone *" type="tel" value={data.secondaryPhone} onChange={e => onChange({ secondaryPhone: e.target.value })} />
          <Input id="se" label="Email *" type="email" value={data.secondaryEmail} onChange={e => onChange({ secondaryEmail: e.target.value })} />

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Collection</p>
          <Input id="cp" label="Who will collect your child? *" placeholder="Full name" value={data.collectionPerson} onChange={e => onChange({ collectionPerson: e.target.value })} />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Is your child allowed to walk home alone? *</p>
            <YesNo value={data.walkHomeAlone} onChange={v => onChange({ walkHomeAlone: v })} />
          </div>
        </div>
      )}
    </div>
  )
}

export function PortalBasketPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    items, contactData, discount, removeItem, updateItem, updateContactData,
    setDiscount, clearBasket, totalPence, discountAmountPence, finalPence, hasNewChildren,
  } = useBasket()

  // Discount code state
  const [codeInput, setCodeInput] = useState('')
  const [applyingCode, setApplyingCode] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)

  // Consent state
  const [medicallyFit, setMedicallyFit] = useState<boolean | null>(null)
  const [firstAidPermission, setFirstAidPermission] = useState<boolean | null>(null)
  const [feesAcknowledged, setFeesAcknowledged] = useState(false)
  const [policyAgreed, setPolicyAgreed] = useState(false)
  const [tcAgreed, setTcAgreed] = useState(false)
  const [signatureName, setSignatureName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function applyDiscount() {
    const code = codeInput.trim().toUpperCase()
    if (!code) return
    setApplyingCode(true)
    setCodeError(null)
    const today = new Date().toISOString().split('T')[0]
    const { data, error: dbErr } = await supabase
      .from('discount_codes')
      .select('code,type,value,description,max_uses,uses,valid_from,valid_until,is_active')
      .eq('code', code)
      .eq('is_active', true)
      .single()
    setApplyingCode(false)
    if (dbErr || !data) { setCodeError('Code not found or no longer active.'); return }
    if (data.valid_until && data.valid_until < today) { setCodeError('This code has expired.'); return }
    if (data.valid_from && data.valid_from > today) { setCodeError('This code is not valid yet.'); return }
    if (data.max_uses !== null && data.uses >= data.max_uses) { setCodeError('This code has reached its maximum uses.'); return }
    setDiscount({ code: data.code, type: data.type as DiscountCode['type'], value: data.value, description: data.description })
    setCodeInput('')
  }

  if (!user) {
    return (
      <PortalLayout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <Lock size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="font-bold text-gray-800 mb-1">Sign in to view your basket</p>
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={() => navigate('/portal/login')} className="bg-[#1a3a6b] text-white font-bold py-2.5 px-6 rounded-xl text-sm">Sign In</button>
            <button onClick={() => navigate('/portal/register')} className="border border-[#1a3a6b] text-[#1a3a6b] font-bold py-2.5 px-6 rounded-xl text-sm">Register</button>
          </div>
        </div>
      </PortalLayout>
    )
  }

  if (items.length === 0) {
    return (
      <PortalLayout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <ShoppingCart size={40} className="mx-auto text-gray-200 mb-4" />
          <p className="font-bold text-gray-600 text-lg mb-1">Your basket is empty</p>
          <p className="text-sm text-gray-400 mb-6">Browse clubs and add a place for your child.</p>
          <Button onClick={() => navigate('/portal/clubs')}>Find a club</Button>
        </div>
      </PortalLayout>
    )
  }

  const allChildrenComplete = items.every(isChildItemComplete)
  const contactComplete = !hasNewChildren || isContactDataComplete(contactData)
  const consentComplete = medicallyFit === true && firstAidPermission === true &&
    feesAcknowledged && policyAgreed && tcAgreed && signatureName.trim().length > 0
  const canPay = allChildrenComplete && contactComplete && consentComplete

  async function handlePay() {
    if (!canPay) return
    setError(null)
    setSubmitting(true)

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    if (!token) { setError('Session expired — please log in again.'); setSubmitting(false); return }

    const { data, error: fnErr } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        items: items.map(item => ({
          club_term_id: item.clubTermId,
          existing_child_id: item.child.existingChildId ?? null,
          child: {
            full_name: item.child.childName,
            date_of_birth: item.child.childDob || null,
            year_group: item.child.yearGroup || null,
            class_name: item.child.className || null,
            additional_needs: item.child.hasAdditionalNeeds ? item.child.additionalNeedsDetails : null,
            photo_consent: item.child.photoConsent,
            // Contact fields — only for new children (existing children already have these saved)
            ...(!item.child.existingChildId ? {
              parent_name: contactData.parentName,
              parent_relationship: contactData.parentRelationship,
              parent_phone: contactData.parentPhone,
              address_line1: contactData.addressLine1,
              address_city: contactData.addressCity,
              address_postcode: contactData.addressPostcode.toUpperCase(),
              emergency_contact_name: contactData.emergencyName,
              emergency_contact_relationship: contactData.emergencyRelationship || null,
              emergency_contact_phone: contactData.emergencyPhone,
              secondary_emergency_name: contactData.secondaryName,
              secondary_emergency_phone: contactData.secondaryPhone,
              secondary_emergency_email: contactData.secondaryEmail,
              collection_person: contactData.collectionPerson,
              walk_home_alone: contactData.walkHomeAlone,
            } : {}),
          },
        })),
        consents: {
          medically_fit: medicallyFit,
          first_aid_permission: firstAidPermission,
          fees_acknowledged: feesAcknowledged,
          policy_agreed: policyAgreed,
          signature_name: signatureName.trim(),
        },
        discount_code: discount?.code ?? null,
      },
    })

    setSubmitting(false)
    if (fnErr || data?.error) {
      setError(data?.error ?? fnErr?.message ?? 'Something went wrong. Please try again.')
      return
    }
    clearBasket()
    window.location.href = data.url
  }

  return (
    <PortalLayout>
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-[#1a3a6b] mb-1">Your Basket</h1>
        <p className="text-sm text-gray-500 mb-6">{items.length} booking{items.length !== 1 ? 's' : ''} · {formatPrice(totalPence)} total</p>

        {/* Basket items */}
        <div className="flex flex-col gap-3 mb-6">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-[#1a3a6b]">{item.schoolName}</p>
                  <p className="text-sm text-gray-500">{item.termName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.sessionDay && `${item.sessionDay} · `}
                    {new Date(item.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    {' – '}
                    {new Date(item.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{item.numSessions} sessions
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-extrabold text-[#1a3a6b]">{formatPrice(item.pricePence)}</span>
                  <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <ChildForm item={item} onUpdate={updates => updateItem(item.id, updates)} />
            </div>
          ))}
        </div>

        <Link to="/portal/clubs" className="flex items-center gap-1.5 text-sm text-[#1a3a6b] font-medium mb-6">
          + Add another child / club
        </Link>

        {/* Parent & contact details (only for new children) */}
        {hasNewChildren && (
          <div className="mb-6">
            <ContactForm data={contactData} onChange={updateContactData} />
          </div>
        )}

        {/* Consents (shown when all child+contact data is complete) */}
        {allChildrenComplete && contactComplete && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 flex flex-col gap-4">
            <p className="font-bold text-gray-800">Confirm &amp; Sign</p>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                I confirm all children listed are medically fit to participate *
              </p>
              <YesNo value={medicallyFit} onChange={setMedicallyFit} />
              {medicallyFit === false && (
                <p className="text-xs text-red-600 mt-1">All children must be medically fit. Please contact us if you have concerns.</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                I give permission for first aid or emergency treatment for all children listed *
              </p>
              <YesNo value={firstAidPermission} onChange={setFirstAidPermission} />
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { checked: feesAcknowledged, onChange: setFeesAcknowledged, label: 'I understand fees are non-refundable once processed' },
                { checked: policyAgreed, onChange: setPolicyAgreed, label: 'I agree to the ASO Membership & Booking Policy' },
                { checked: tcAgreed, onChange: setTcAgreed, label: 'I have read and agree to the Terms & Conditions' },
              ].map(({ checked, onChange, label }) => (
                <label key={label} className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-[#1a3a6b] shrink-0" />
                  <span className="text-sm text-gray-600">{label} *</span>
                </label>
              ))}
            </div>

            <div>
              <Input id="sig" label="Signature — type your full name *"
                placeholder="Your full name" value={signatureName}
                onChange={e => setSignatureName(e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">
                By typing your name you are electronically signing for all bookings in this order.
                Date: {new Date().toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>
        )}

        {/* Discount code */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
          <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Tag size={14} /> Discount Code</p>
          {discount ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
              <div>
                <p className="text-sm font-extrabold text-green-800 font-mono">{discount.code}</p>
                <p className="text-xs text-green-600 mt-0.5">
                  {discount.description || (discount.type === 'percentage' ? `${discount.value}% off` : `£${(discount.value / 100).toFixed(2)} off`)}
                  {' · '}saving {formatPrice(discountAmountPence)}
                </p>
              </div>
              <button onClick={() => setDiscount(null)} className="text-green-600 hover:text-red-500 transition-colors ml-3">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code…"
                value={codeInput}
                onChange={e => { setCodeInput(e.target.value.toUpperCase()); setCodeError(null) }}
                onKeyDown={e => e.key === 'Enter' && applyDiscount()}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
              />
              <button
                onClick={applyDiscount}
                disabled={applyingCode || !codeInput.trim()}
                className="bg-[#1a3a6b] text-white font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-40 transition-colors hover:bg-[#142f58]"
              >
                {applyingCode ? '…' : 'Apply'}
              </button>
            </div>
          )}
          {codeError && <p className="text-xs text-red-600 mt-2">{codeError}</p>}
        </div>

        {/* Order total */}
        <div className="bg-gray-50 rounded-2xl px-4 py-3 mb-4">
          {discount && (
            <>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="text-sm text-gray-500">{formatPrice(totalPence)}</p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-green-600 font-semibold flex items-center gap-1"><Tag size={12} /> {discount.code}</p>
                <p className="text-sm text-green-600 font-semibold">−{formatPrice(discountAmountPence)}</p>
              </div>
              <hr className="border-gray-200 mb-2" />
            </>
          )}
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-700">Total</p>
            <p className="text-xl font-extrabold text-[#1a3a6b]">{formatPrice(finalPence)}</p>
          </div>
        </div>

        {!allChildrenComplete && (
          <p className="text-xs text-amber-600 mb-3 flex items-center gap-1.5">
            <AlertCircle size={12} /> Please complete details for all children above.
          </p>
        )}
        {allChildrenComplete && !contactComplete && hasNewChildren && (
          <p className="text-xs text-amber-600 mb-3 flex items-center gap-1.5">
            <AlertCircle size={12} /> Please complete parent & emergency contact details above.
          </p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-3">{error}</div>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <Lock size={12} /> Secure payment powered by Stripe
        </div>

        <Button size="lg" fullWidth disabled={!canPay || submitting} onClick={handlePay}>
          {submitting ? 'Redirecting to payment…' : `Pay ${formatPrice(finalPence)} securely`}
        </Button>
      </div>
    </PortalLayout>
  )
}
