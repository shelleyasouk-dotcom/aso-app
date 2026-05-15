import { useState, useEffect } from 'react'
import { CheckCircle, ClipboardCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { SchoolLayout } from '../../components/layout/SchoolLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useSchoolId } from '../../hooks/useSchoolId'
import type { School, SchoolInfoForm } from '../../types'

const LABEL = 'text-sm font-semibold text-gray-700'
const TEXTAREA = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] resize-none min-h-[72px]'
const SELECT_CLS = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white'

function SectionHead({ num, title, subtitle }: { num: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-7 h-7 rounded-full bg-[#1a3a6b] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
        {num}
      </div>
      <div>
        <p className="font-bold text-[#1a3a6b]">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

function CheckRow({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          checked ? 'bg-[#1a3a6b] border-[#1a3a6b]' : 'border-gray-300'
        }`}
      >
        {checked && <CheckCircle size={12} className="text-white" />}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-3 mt-1">
      {[true, false].map(v => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
            value === v
              ? 'bg-[#1a3a6b] border-[#1a3a6b] text-white'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          {v ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  )
}

function ReadRow({ label, value }: { label: string; value: string | boolean | null }) {
  const display = value === null ? '—'
    : value === true ? 'Yes'
    : value === false ? 'No'
    : value || '—'
  return (
    <div className="flex gap-2 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-44 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800">{display as string}</span>
    </div>
  )
}

const SPACE_TYPES = [
  { value: 'school_hall',     label: 'School hall' },
  { value: 'sports_hall',     label: 'Sports hall' },
  { value: 'gymnasium',       label: 'Gymnasium' },
  { value: 'outdoor_hard',    label: 'Outdoor hard court' },
  { value: 'outdoor_grass',   label: 'Outdoor grass' },
  { value: 'other_space',     label: 'Other' },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const EQUIPMENT_LIST = [
  { value: 'balance_beam',    label: 'Balance beam' },
  { value: 'vaulting_table',  label: 'Vaulting table' },
  { value: 'springboard',     label: 'Springboard' },
  { value: 'crash_mats',      label: 'Crash mats' },
  { value: 'floor_mats',      label: 'Floor mats' },
  { value: 'wall_bars',       label: 'Wall bars / ropes' },
  { value: 'trampoline',      label: 'Trampoline' },
  { value: 'benches',         label: 'Benches / plinths' },
]

type FormState = Omit<SchoolInfoForm, 'id' | 'school_id' | 'submitted_by' | 'submitted_at' | 'created_at'>

const EMPTY: FormState = {
  headteacher_name: '', contact_name: '', contact_title: '', contact_email: '', contact_phone: '',
  school_address: '', school_type_desc: '', number_on_roll: '',
  space_types: '', space_size: '', floor_surface: '', max_pupils_space: '', obstructions: '',
  available_days: '', school_finish_time: '', pickup_time: '',
  has_lockup_contact: null, lockup_contact: '',
  toilets_accessible: null, storage_available: null,
  has_existing_equipment: null, existing_equipment: '',
  dsl_name: '', dsl_contact: '', backup_contact: '', visitor_signin: '',
  year_groups: '', num_clubs: '', additional_info: '',
}

function parseCSV(s: string | null): string[] {
  return s ? s.split(',').filter(Boolean) : []
}
function toCSV(arr: string[]): string { return arr.join(',') }
function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

export function SchoolInfoFormPage() {
  const { profile } = useAuth()
  const schoolId = useSchoolId()
  const [school, setSchool] = useState<School | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [existing, setExisting] = useState<SchoolInfoForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!schoolId) return
    async function load() {
      const [schoolRes, formRes] = await Promise.all([
        supabase.from('schools').select('*').eq('id', schoolId!).single(),
        supabase.from('school_info_forms').select('*').eq('school_id', schoolId!).maybeSingle(),
      ])
      if (schoolRes.data) setSchool(schoolRes.data)
      if (formRes.data) {
        setExisting(formRes.data)
        const d = formRes.data
        setForm({
          headteacher_name: d.headteacher_name ?? '', contact_name: d.contact_name ?? '',
          contact_title: d.contact_title ?? '', contact_email: d.contact_email ?? '',
          contact_phone: d.contact_phone ?? '', school_address: d.school_address ?? '',
          school_type_desc: d.school_type_desc ?? '', number_on_roll: d.number_on_roll ?? '',
          space_types: d.space_types ?? '', space_size: d.space_size ?? '',
          floor_surface: d.floor_surface ?? '', max_pupils_space: d.max_pupils_space ?? '',
          obstructions: d.obstructions ?? '', available_days: d.available_days ?? '',
          school_finish_time: d.school_finish_time ?? '', pickup_time: d.pickup_time ?? '',
          has_lockup_contact: d.has_lockup_contact, lockup_contact: d.lockup_contact ?? '',
          toilets_accessible: d.toilets_accessible, storage_available: d.storage_available,
          has_existing_equipment: d.has_existing_equipment, existing_equipment: d.existing_equipment ?? '',
          dsl_name: d.dsl_name ?? '', dsl_contact: d.dsl_contact ?? '',
          backup_contact: d.backup_contact ?? '', visitor_signin: d.visitor_signin ?? '',
          year_groups: d.year_groups ?? '', num_clubs: d.num_clubs ?? '',
          additional_info: d.additional_info ?? '',
        })
      } else if (schoolRes.data) {
        // Pre-fill from schools table
        setForm(f => ({
          ...f,
          headteacher_name: schoolRes.data!.headteacher_name ?? '',
          contact_name: schoolRes.data!.contact_name ?? '',
          contact_email: schoolRes.data!.contact_email ?? '',
          contact_phone: schoolRes.data!.contact_phone ?? '',
          school_address: schoolRes.data!.address ?? '',
          dsl_name: schoolRes.data!.dsl_name ?? '',
          dsl_contact: schoolRes.data!.dsl_email ?? '',
        }))
      }
      setLoading(false)
    }
    load()
  }, [schoolId])

  async function submit() {
    if (!schoolId) return
    setSaving(true)
    setError(null)
    const payload = {
      school_id: schoolId,
      submitted_by: profile?.id ?? null,
      submitted_at: new Date().toISOString(),
      ...form,
    }
    const { data: upserted, error: err } = await supabase
      .from('school_info_forms')
      .upsert(payload, { onConflict: 'school_id' })
      .select()
      .single()
    if (err) {
      setError('Could not save form. Please try again.')
    } else {
      await supabase.from('schools').update({ facility_form_completed: true }).eq('id', schoolId)
      setExisting(upserted)
      setSaved(true)
      if (school) setSchool({ ...school, facility_form_completed: true })
    }
    setSaving(false)
  }

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const spaceTypes    = parseCSV(form.space_types)
  const availDays     = parseCSV(form.available_days)
  const equipList     = parseCSV(form.existing_equipment)

  if (loading) {
    return (
      <SchoolLayout title="School Information Form" showBack>
        <div className="px-4 pt-6 flex flex-col gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      </SchoolLayout>
    )
  }

  // Read-only view after submission
  if (existing && school?.facility_form_completed && !saved) {
    return (
      <SchoolLayout title="School Information Form" showBack>
        <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
          <Card className="bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-sm">Form submitted</p>
                <p className="text-xs text-green-700">
                  Submitted {new Date(existing.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </Card>
          <Card><SectionHead num={1} title="Your School" />
            <ReadRow label="School name" value={school?.name ?? null} />
            <ReadRow label="Headteacher" value={existing.headteacher_name} />
            <ReadRow label="Contact name" value={existing.contact_name} />
            <ReadRow label="Contact title" value={existing.contact_title} />
            <ReadRow label="Email" value={existing.contact_email} />
            <ReadRow label="Phone" value={existing.contact_phone} />
            <ReadRow label="Address" value={existing.school_address} />
            <ReadRow label="School type" value={existing.school_type_desc} />
            <ReadRow label="Number on roll" value={existing.number_on_roll} />
          </Card>
          <Card><SectionHead num={2} title="Your Space" />
            <ReadRow label="Space type(s)" value={parseCSV(existing.space_types).join(', ')} />
            <ReadRow label="Approximate size" value={existing.space_size} />
            <ReadRow label="Floor surface" value={existing.floor_surface} />
            <ReadRow label="Max pupils" value={existing.max_pupils_space} />
            <ReadRow label="Obstructions" value={existing.obstructions} />
          </Card>
          <Card><SectionHead num={3} title="Availability" />
            <ReadRow label="Available days" value={parseCSV(existing.available_days).join(', ')} />
            <ReadRow label="School finish time" value={existing.school_finish_time} />
            <ReadRow label="Pick-up time" value={existing.pickup_time} />
            <ReadRow label="Lockup contact" value={existing.lockup_contact} />
          </Card>
          <Card><SectionHead num={4} title="Facilities" />
            <ReadRow label="Toilets accessible" value={existing.toilets_accessible} />
            <ReadRow label="Storage available" value={existing.storage_available} />
            <ReadRow label="Existing equipment" value={
              existing.has_existing_equipment
                ? (parseCSV(existing.existing_equipment).join(', ') || 'Yes')
                : 'No'
            } />
          </Card>
          <Card><SectionHead num={5} title="Safeguarding" />
            <ReadRow label="DSL name" value={existing.dsl_name} />
            <ReadRow label="DSL contact" value={existing.dsl_contact} />
            <ReadRow label="Backup contact" value={existing.backup_contact} />
            <ReadRow label="Visitor sign-in" value={existing.visitor_signin} />
          </Card>
          <Card><SectionHead num={6} title="Your Club" />
            <ReadRow label="Year groups" value={existing.year_groups} />
            <ReadRow label="Number of clubs" value={existing.num_clubs} />
            <ReadRow label="Additional info" value={existing.additional_info} />
          </Card>
        </div>
      </SchoolLayout>
    )
  }

  return (
    <SchoolLayout title="School Information Form" showBack>
      <div className="px-4 pt-6 pb-4 flex flex-col gap-4">

        <Card className="bg-[#1a3a6b]/5">
          <div className="flex items-start gap-3">
            <ClipboardCheck size={20} className="text-[#1a3a6b] shrink-0 mt-0.5" />
            <p className="text-sm text-[#1a3a6b]">
              This takes around 5 minutes to complete. Fields marked * are required.
              We need this before your club can start.
            </p>
          </div>
        </Card>

        {/* Section 1 */}
        <Card>
          <SectionHead num={1} title="Your School" />
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-400 -mt-2 mb-1">Your school: <span className="font-semibold text-[#1a3a6b]">{school?.name}</span></p>
            <Input label="Headteacher name *" value={form.headteacher_name ?? ''} onChange={set('headteacher_name')} placeholder="Enter headteacher name" />
            <Input label="Your name *" value={form.contact_name ?? ''} onChange={set('contact_name')} placeholder="e.g. Jane Smith" />
            <Input label="Your job title *" value={form.contact_title ?? ''} onChange={set('contact_title')} placeholder="e.g. School Business Manager" />
            <Input label="Your email *" type="email" value={form.contact_email ?? ''} onChange={set('contact_email')} placeholder="Enter email" />
            <Input label="Your phone *" type="tel" value={form.contact_phone ?? ''} onChange={set('contact_phone')} placeholder="Enter phone number" />
            <div className="flex flex-col gap-1">
              <label className={LABEL}>School address *</label>
              <textarea className={TEXTAREA} style={{ minHeight: 64 }} value={form.school_address ?? ''} onChange={set('school_address')} placeholder="Enter full address and postcode" />
            </div>
            <Input label="School type" value={form.school_type_desc ?? ''} onChange={set('school_type_desc')} placeholder="e.g. State primary / Academy" />
            <Input label="Number on roll (approx)" value={form.number_on_roll ?? ''} onChange={set('number_on_roll')} placeholder="e.g. 280" />
          </div>
        </Card>

        {/* Section 2 */}
        <Card>
          <SectionHead num={2} title="Your Space" subtitle="This is the most important section." />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Type of space *</label>
              {SPACE_TYPES.map(({ value, label }) => (
                <CheckRow
                  key={value}
                  label={label}
                  checked={spaceTypes.includes(value)}
                  onChange={() => setForm(f => ({ ...f, space_types: toCSV(toggle(spaceTypes, value)) }))}
                />
              ))}
            </div>
            <Input label="Approximate size" value={form.space_size ?? ''} onChange={set('space_size')} placeholder="e.g. 15m × 10m" />
            <Input label="Floor surface" value={form.floor_surface ?? ''} onChange={set('floor_surface')} placeholder="e.g. Sprung wood / Concrete" />
            <Input label="Maximum pupils the space can hold" value={form.max_pupils_space ?? ''} onChange={set('max_pupils_space')} placeholder="e.g. 30" />
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Any obstructions we should know about?</label>
              <textarea className={TEXTAREA} style={{ minHeight: 60 }} value={form.obstructions ?? ''} onChange={set('obstructions')} placeholder="e.g. Stage at one end, wall bars — or None" />
            </div>
          </div>
        </Card>

        {/* Section 3 */}
        <Card>
          <SectionHead num={3} title="When You Are Available" />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Which days could work for the club? *</label>
              {DAYS.map(day => (
                <CheckRow
                  key={day}
                  label={day}
                  checked={availDays.includes(day)}
                  onChange={() => setForm(f => ({ ...f, available_days: toCSV(toggle(availDays, day)) }))}
                />
              ))}
            </div>
            <Input label="School finish time *" value={form.school_finish_time ?? ''} onChange={set('school_finish_time')} placeholder="e.g. 3:15pm" />
            <Input label="Pick-up time *" value={form.pickup_time ?? ''} onChange={set('pickup_time')} placeholder="e.g. 4:30pm" />
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Is there someone available to open and lock up? *</label>
              <YesNo value={form.has_lockup_contact} onChange={v => setForm(f => ({ ...f, has_lockup_contact: v }))} />
            </div>
            {form.has_lockup_contact && (
              <Input label="Their name and contact number" value={form.lockup_contact ?? ''} onChange={set('lockup_contact')} placeholder="e.g. John — site manager — 07700 000000" />
            )}
          </div>
        </Card>

        {/* Section 4 */}
        <Card>
          <SectionHead num={4} title="A Few Quick Questions" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Are toilets accessible to pupils during the club?</label>
              <YesNo value={form.toilets_accessible} onChange={v => setForm(f => ({ ...f, toilets_accessible: v }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Is there a lockable space to store ASO equipment between sessions?</label>
              <YesNo value={form.storage_available} onChange={v => setForm(f => ({ ...f, storage_available: v }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Does the school have any gymnastics equipment we could use?</label>
              <YesNo value={form.has_existing_equipment} onChange={v => setForm(f => ({ ...f, has_existing_equipment: v, existing_equipment: v ? f.existing_equipment : '' }))} />
            </div>
            {form.has_existing_equipment && (
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Tick what you have</label>
                {EQUIPMENT_LIST.map(({ value, label }) => (
                  <CheckRow
                    key={value}
                    label={label}
                    checked={equipList.includes(value)}
                    onChange={() => setForm(f => ({ ...f, existing_equipment: toCSV(toggle(equipList, value)) }))}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Section 5 */}
        <Card>
          <SectionHead num={5} title="Safeguarding Contact" subtitle="We need your DSL details before the club can start. This is a safeguarding requirement." />
          <div className="flex flex-col gap-3">
            <Input label="DSL name *" value={form.dsl_name ?? ''} onChange={set('dsl_name')} placeholder="Enter full name" />
            <Input label="DSL email or phone *" value={form.dsl_contact ?? ''} onChange={set('dsl_contact')} placeholder="Enter email or phone" />
            <div className="flex flex-col gap-1">
              <label className={LABEL}>If the DSL is unavailable, who should our coaches contact?</label>
              <textarea className={TEXTAREA} style={{ minHeight: 60 }} value={form.backup_contact ?? ''} onChange={set('backup_contact')} placeholder="Name and phone number of backup contact" />
            </div>
            <Input label="Visitor sign-in process" value={form.visitor_signin ?? ''} onChange={set('visitor_signin')} placeholder="e.g. Sign in at reception" />
          </div>
        </Card>

        {/* Section 6 */}
        <Card>
          <SectionHead num={6} title="Your Gymnastics Club" />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Which year groups would the club be for? *</label>
              <select className={SELECT_CLS} value={form.year_groups ?? ''} onChange={set('year_groups')}>
                <option value="">Select…</option>
                <option value="KS1 only (Years 1–2)">KS1 only (Years 1–2 | Reception from January)</option>
                <option value="KS2 only (Years 3–6)">KS2 only (Years 3–6)</option>
                <option value="Combined KS1 and KS2">Combined KS1 and KS2</option>
                <option value="Not decided yet">Not decided yet</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={LABEL}>How many clubs are you interested in running? *</label>
              <select className={SELECT_CLS} value={form.num_clubs ?? ''} onChange={set('num_clubs')}>
                <option value="">Select…</option>
                <option value="One club — all years together">One club — all year groups together</option>
                <option value="Two clubs — KS1 and KS2 separately">Two clubs — KS1 and KS2 separately</option>
                <option value="One club per KS">One club per KS</option>
                <option value="Not sure yet">Not sure yet</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Anything else we should know before visiting?</label>
              <textarea className={TEXTAREA} value={form.additional_info ?? ''} onChange={set('additional_info')} placeholder="e.g. Parking, access, SEND pupils, anything specific — or leave blank" />
            </div>
          </div>
        </Card>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {saved && (
          <Card className="bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle size={18} className="text-green-600" />
              <p className="text-sm font-semibold text-green-700">Form submitted — thank you!</p>
            </div>
          </Card>
        )}

        <Button variant="primary" size="lg" fullWidth onClick={submit} disabled={saving}>
          {saving ? 'Submitting…' : 'Submit Form'}
        </Button>

        <p className="text-xs text-gray-400 text-center">
          We'll be in touch within 2 working days to confirm next steps.
        </p>

      </div>
    </SchoolLayout>
  )
}
