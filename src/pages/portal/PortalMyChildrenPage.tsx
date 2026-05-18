import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Pencil, Trash2, Plus, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { ParentChild } from '../../types'

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      {([true, false] as const).map(v => (
        <button key={String(v)} type="button" onClick={() => onChange(v)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
            value === v ? 'border-[#1a3a6b] bg-[#1a3a6b] text-white' : 'border-gray-200 bg-white text-gray-600'
          }`}
        >{v ? 'Yes' : 'No'}</button>
      ))}
    </div>
  )
}

interface ChildFormState {
  full_name: string
  date_of_birth: string
  year_group: string
  class_name: string
  hasAdditionalNeeds: boolean | null
  additional_needs: string
  photo_consent: boolean | null
  parent_name: string
  parent_relationship: string
  parent_phone: string
  address_line1: string
  address_city: string
  address_postcode: string
  emergency_contact_name: string
  emergency_contact_relationship: string
  emergency_contact_phone: string
  secondary_emergency_name: string
  secondary_emergency_phone: string
  secondary_emergency_email: string
  collection_person: string
  walk_home_alone: boolean | null
}

function emptyForm(): ChildFormState {
  return {
    full_name: '', date_of_birth: '', year_group: '', class_name: '',
    hasAdditionalNeeds: null, additional_needs: '', photo_consent: null,
    parent_name: '', parent_relationship: '', parent_phone: '',
    address_line1: '', address_city: '', address_postcode: '',
    emergency_contact_name: '', emergency_contact_relationship: '', emergency_contact_phone: '',
    secondary_emergency_name: '', secondary_emergency_phone: '', secondary_emergency_email: '',
    collection_person: '', walk_home_alone: null,
  }
}

function fromChild(c: ParentChild): ChildFormState {
  return {
    full_name: c.full_name,
    date_of_birth: c.date_of_birth ?? '',
    year_group: c.year_group ?? '',
    class_name: c.class_name ?? '',
    hasAdditionalNeeds: c.additional_needs ? true : (c.additional_needs === '' ? false : null),
    additional_needs: c.additional_needs ?? '',
    photo_consent: c.photo_consent ?? null,
    parent_name: c.parent_name ?? '',
    parent_relationship: c.parent_relationship ?? '',
    parent_phone: c.parent_phone ?? '',
    address_line1: c.address_line1 ?? '',
    address_city: c.address_city ?? '',
    address_postcode: c.address_postcode ?? '',
    emergency_contact_name: c.emergency_contact_name ?? '',
    emergency_contact_relationship: c.emergency_contact_relationship ?? '',
    emergency_contact_phone: c.emergency_contact_phone ?? '',
    secondary_emergency_name: c.secondary_emergency_name ?? '',
    secondary_emergency_phone: c.secondary_emergency_phone ?? '',
    secondary_emergency_email: c.secondary_emergency_email ?? '',
    collection_person: c.collection_person ?? '',
    walk_home_alone: c.walk_home_alone ?? null,
  }
}

function isFormComplete(f: ChildFormState): boolean {
  return !!(
    f.full_name && f.date_of_birth && f.year_group &&
    f.parent_name && f.parent_phone &&
    f.emergency_contact_name && f.emergency_contact_phone &&
    f.secondary_emergency_name && f.secondary_emergency_phone &&
    f.collection_person && f.walk_home_alone !== null &&
    f.photo_consent !== null && f.hasAdditionalNeeds !== null &&
    (f.hasAdditionalNeeds === false || f.additional_needs.trim())
  )
}

function ChildFormFields({ form, setForm }: {
  form: ChildFormState
  setForm: (f: ChildFormState) => void
}) {
  const set = (key: keyof ChildFormState, val: unknown) => setForm({ ...form, [key]: val })
  return (
    <div className="flex flex-col gap-3 mt-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Child Details</p>
      <Input id="cfn" label="Child's full name *" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
      <Input id="cdob" label="Date of birth *" type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <Input id="cyg" label="Year group *" placeholder="e.g. Year 3" value={form.year_group} onChange={e => set('year_group', e.target.value)} />
        <Input id="ccls" label="Class" placeholder="e.g. 3B" value={form.class_name} onChange={e => set('class_name', e.target.value)} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Additional needs / SEND? *</p>
        <YesNo value={form.hasAdditionalNeeds} onChange={v => set('hasAdditionalNeeds', v)} />
      </div>
      {form.hasAdditionalNeeds === true && (
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Please provide details *</label>
          <textarea value={form.additional_needs} onChange={e => set('additional_needs', e.target.value)}
            placeholder="Medical conditions, allergies, SEND, sensory needs…" rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]" />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Photo & marketing consent *</p>
        <YesNo value={form.photo_consent} onChange={v => set('photo_consent', v)} />
      </div>

      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Parent / Guardian</p>
      <Input id="cpn" label="Full name *" value={form.parent_name} onChange={e => set('parent_name', e.target.value)} />
      <Input id="cpr" label="Relationship to child *" placeholder="e.g. Mother, Father, Carer" value={form.parent_relationship} onChange={e => set('parent_relationship', e.target.value)} />
      <Input id="cpp" label="Phone *" type="tel" value={form.parent_phone} onChange={e => set('parent_phone', e.target.value)} />

      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Address</p>
      <Input id="ca1" label="Address *" value={form.address_line1} onChange={e => set('address_line1', e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <Input id="cac" label="City *" value={form.address_city} onChange={e => set('address_city', e.target.value)} />
        <Input id="cap" label="Postcode *" value={form.address_postcode} onChange={e => set('address_postcode', e.target.value)} />
      </div>

      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Secondary Emergency Contact</p>
      <Input id="cen" label="Name *" value={form.emergency_contact_name} onChange={e => set('emergency_contact_name', e.target.value)} />
      <Input id="cer" label="Relationship" placeholder="e.g. Grandparent" value={form.emergency_contact_relationship} onChange={e => set('emergency_contact_relationship', e.target.value)} />
      <Input id="cep" label="Phone *" type="tel" value={form.emergency_contact_phone} onChange={e => set('emergency_contact_phone', e.target.value)} />

      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Third Emergency Contact</p>
      <Input id="csn" label="Name *" value={form.secondary_emergency_name} onChange={e => set('secondary_emergency_name', e.target.value)} />
      <Input id="csp" label="Phone *" type="tel" value={form.secondary_emergency_phone} onChange={e => set('secondary_emergency_phone', e.target.value)} />
      <Input id="cse" label="Email *" type="email" value={form.secondary_emergency_email} onChange={e => set('secondary_emergency_email', e.target.value)} />

      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Collection</p>
      <Input id="ccp" label="Who will collect your child? *" value={form.collection_person} onChange={e => set('collection_person', e.target.value)} />
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Walk home alone? *</p>
        <YesNo value={form.walk_home_alone} onChange={v => set('walk_home_alone', v)} />
      </div>
    </div>
  )
}

export function PortalMyChildrenPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [children, setChildren] = useState<ParentChild[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | 'new' | null>(null)
  const [editForms, setEditForms] = useState<Record<string, ChildFormState>>({})
  const [newForm, setNewForm] = useState<ChildFormState>(emptyForm())
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    supabase.from('parent_children').select('*').eq('parent_id', user.id).order('full_name')
      .then(({ data }) => {
        setChildren((data ?? []) as ParentChild[])
        setLoading(false)
      })
  }, [user])

  function startEdit(child: ParentChild) {
    setEditForms(prev => ({ ...prev, [child.id]: fromChild(child) }))
    setExpandedId(child.id)
  }

  async function saveEdit(childId: string) {
    const form = editForms[childId]
    if (!form) return
    setSaving(childId)
    const updates = {
      full_name: form.full_name.trim(),
      date_of_birth: form.date_of_birth || null,
      year_group: form.year_group.trim() || null,
      class_name: form.class_name.trim() || null,
      additional_needs: form.hasAdditionalNeeds ? form.additional_needs.trim() : null,
      photo_consent: form.photo_consent,
      parent_name: form.parent_name.trim() || null,
      parent_relationship: form.parent_relationship.trim() || null,
      parent_phone: form.parent_phone.trim() || null,
      address_line1: form.address_line1.trim() || null,
      address_city: form.address_city.trim() || null,
      address_postcode: form.address_postcode.trim().toUpperCase() || null,
      emergency_contact_name: form.emergency_contact_name.trim() || null,
      emergency_contact_relationship: form.emergency_contact_relationship.trim() || null,
      emergency_contact_phone: form.emergency_contact_phone.trim() || null,
      secondary_emergency_name: form.secondary_emergency_name.trim() || null,
      secondary_emergency_phone: form.secondary_emergency_phone.trim() || null,
      secondary_emergency_email: form.secondary_emergency_email.trim() || null,
      collection_person: form.collection_person.trim() || null,
      walk_home_alone: form.walk_home_alone,
    }
    await supabase.from('parent_children').update(updates).eq('id', childId)
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, ...updates } as ParentChild : c))
    setExpandedId(null)
    setSaving(null)
  }

  async function addChild() {
    if (!user) return
    setSaving('new')
    const form = newForm
    const { data } = await supabase.from('parent_children').insert({
      parent_id: user.id,
      full_name: form.full_name.trim(),
      date_of_birth: form.date_of_birth || null,
      year_group: form.year_group.trim() || null,
      class_name: form.class_name.trim() || null,
      additional_needs: form.hasAdditionalNeeds ? form.additional_needs.trim() : null,
      photo_consent: form.photo_consent,
      parent_name: form.parent_name.trim() || null,
      parent_relationship: form.parent_relationship.trim() || null,
      parent_phone: form.parent_phone.trim() || null,
      address_line1: form.address_line1.trim() || null,
      address_city: form.address_city.trim() || null,
      address_postcode: form.address_postcode.trim().toUpperCase() || null,
      emergency_contact_name: form.emergency_contact_name.trim() || null,
      emergency_contact_relationship: form.emergency_contact_relationship.trim() || null,
      emergency_contact_phone: form.emergency_contact_phone.trim() || null,
      secondary_emergency_name: form.secondary_emergency_name.trim() || null,
      secondary_emergency_phone: form.secondary_emergency_phone.trim() || null,
      secondary_emergency_email: form.secondary_emergency_email.trim() || null,
      collection_person: form.collection_person.trim() || null,
      walk_home_alone: form.walk_home_alone,
    }).select('*').single()
    if (data) setChildren(prev => [...prev, data as ParentChild])
    setNewForm(emptyForm())
    setExpandedId(null)
    setSaving(null)
  }

  async function deleteChild(id: string) {
    if (!confirm('Remove this child from your account? This will not cancel any existing bookings.')) return
    await supabase.from('parent_children').delete().eq('id', id)
    setChildren(prev => prev.filter(c => c.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  if (!user) {
    return <PortalLayout><div className="px-4 py-16 text-center"><p className="text-gray-500">Please sign in.</p></div></PortalLayout>
  }

  return (
    <PortalLayout>
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a3a6b]">My Children</h1>
            <p className="text-sm text-gray-500 mt-0.5">Saved profiles for quick booking</p>
          </div>
          <Button size="sm" onClick={() => setExpandedId('new')}>
            <Plus size={14} className="inline mr-1" /> Add child
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : (
          <div className="flex flex-col gap-3">
            {children.map(child => {
              const form = editForms[child.id] ?? fromChild(child)
              const isEditing = expandedId === child.id
              const complete = isFormComplete(fromChild(child))
              return (
                <div key={child.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1a3a6b] flex items-center justify-center shrink-0">
                        <User size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{child.full_name}</p>
                        <p className="text-xs text-gray-400">{[child.year_group, child.class_name].filter(Boolean).join(' · ')}</p>
                        {!complete && (
                          <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                            <AlertCircle size={10} /> Profile incomplete
                          </p>
                        )}
                        {complete && (
                          <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                            <CheckCircle size={10} /> Profile complete
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => (isEditing ? setExpandedId(null) : startEdit(child))}
                        className="text-[#1a3a6b] hover:opacity-70">
                        {isEditing ? <ChevronUp size={16} /> : <Pencil size={15} />}
                      </button>
                      <button onClick={() => deleteChild(child.id)} className="text-gray-300 hover:text-red-400">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <>
                      <ChildFormFields
                        form={form}
                        setForm={f => setEditForms(prev => ({ ...prev, [child.id]: f }))}
                      />
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" disabled={saving === child.id} onClick={() => saveEdit(child.id)}>
                          {saving === child.id ? 'Saving…' : 'Save changes'}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setExpandedId(null)}>Cancel</Button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}

            {/* Add new child */}
            {expandedId === 'new' ? (
              <div className="bg-white border border-[#1a3a6b]/20 rounded-2xl p-4">
                <p className="font-bold text-[#1a3a6b] mb-1">New child</p>
                <ChildFormFields form={newForm} setForm={setNewForm} />
                <div className="flex gap-2 mt-4">
                  <Button size="sm" disabled={!newForm.full_name || saving === 'new'} onClick={addChild}>
                    {saving === 'new' ? 'Saving…' : 'Save child'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => { setExpandedId(null); setNewForm(emptyForm()) }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setExpandedId('new')}
                className="flex items-center justify-center gap-2 text-sm font-semibold text-[#1a3a6b] border border-dashed border-[#1a3a6b]/30 rounded-2xl px-4 py-3 hover:bg-[#1a3a6b]/5 transition-colors"
              >
                <Plus size={15} /> Add a child
              </button>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/portal/clubs')}>
            Book a club
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/portal/my-bookings')}>
            My bookings
          </Button>
        </div>
      </div>
    </PortalLayout>
  )
}
