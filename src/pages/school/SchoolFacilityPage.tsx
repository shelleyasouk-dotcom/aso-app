import { useState, useEffect } from 'react'
import { CheckCircle, ClipboardCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { SchoolLayout } from '../../components/layout/SchoolLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useSchoolId } from '../../hooks/useSchoolId'
import type { School, FacilityAssessment } from '../../types'

const LABEL = 'text-sm font-semibold text-gray-700'
const TEXTAREA = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] resize-none min-h-[80px]'
const SELECT = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]'

type FormState = Omit<FacilityAssessment, 'id' | 'school_id' | 'submitted_by' | 'submitted_at' | 'created_at'>

const EMPTY: FormState = {
  space_description: '',
  space_size: '',
  availability_notes: '',
  changing_facilities: '',
  welfare_facilities: '',
  storage_available: null,
  storage_notes: '',
  existing_equipment: '',
  additional_info: '',
}

function SectionHead({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 rounded-full bg-[#1a3a6b] text-white text-sm font-bold flex items-center justify-center shrink-0">
        {num}
      </div>
      <p className="font-bold text-[#1a3a6b]">{title}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | boolean | null }) {
  const display = value === null ? '—' : value === true ? 'Yes' : value === false ? 'No' : value || '—'
  return (
    <div className="flex gap-2 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-40 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800">{display as string}</span>
    </div>
  )
}

export function SchoolFacilityPage() {
  const { profile } = useAuth()
  const schoolId = useSchoolId()
  const [school, setSchool] = useState<School | null>(null)
  const [assessment, setAssessment] = useState<FacilityAssessment | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!schoolId) return
    async function load() {
      const [schoolRes, assessRes] = await Promise.all([
        supabase.from('schools').select('*').eq('id', schoolId!).single(),
        supabase.from('facility_assessments').select('*').eq('school_id', schoolId!).maybeSingle(),
      ])
      if (schoolRes.data) setSchool(schoolRes.data)
      if (assessRes.data) {
        setAssessment(assessRes.data)
        setForm({
          space_description:  assessRes.data.space_description  ?? '',
          space_size:         assessRes.data.space_size         ?? '',
          availability_notes: assessRes.data.availability_notes ?? '',
          changing_facilities:assessRes.data.changing_facilities?? '',
          welfare_facilities: assessRes.data.welfare_facilities ?? '',
          storage_available:  assessRes.data.storage_available,
          storage_notes:      assessRes.data.storage_notes      ?? '',
          existing_equipment: assessRes.data.existing_equipment ?? '',
          additional_info:    assessRes.data.additional_info    ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [profile?.school_id])

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
      .from('facility_assessments')
      .upsert(payload, { onConflict: 'school_id' })
      .select()
      .single()

    if (err) {
      setError('Could not save form. Please try again.')
    } else {
      await supabase.from('schools').update({ facility_form_completed: true }).eq('id', schoolId)
      setAssessment(upserted)
      setSaved(true)
      if (school) setSchool({ ...school, facility_form_completed: true })
    }
    setSaving(false)
  }

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  if (loading) {
    return (
      <SchoolLayout title="Facility Assessment" showBack>
        <div className="px-4 pt-6 flex flex-col gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      </SchoolLayout>
    )
  }

  // Read-only view after submission
  if (assessment && school?.facility_form_completed && saved === false) {
    return (
      <SchoolLayout title="Facility Assessment" showBack>
        <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
          <Card className="bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-sm">Assessment completed</p>
                <p className="text-xs text-green-700">
                  Submitted {new Date(assessment.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <SectionHead num={2} title="Available Space" />
            <Row label="Description" value={assessment.space_description} />
            <Row label="Size" value={assessment.space_size} />
          </Card>
          <Card>
            <SectionHead num={3} title="Availability" />
            <Row label="Notes" value={assessment.availability_notes} />
          </Card>
          <Card>
            <SectionHead num={4} title="Changing & Welfare" />
            <Row label="Changing facilities" value={assessment.changing_facilities} />
            <Row label="Welfare facilities" value={assessment.welfare_facilities} />
          </Card>
          <Card>
            <SectionHead num={5} title="Equipment Storage" />
            <Row label="Storage available" value={assessment.storage_available} />
            <Row label="Storage notes" value={assessment.storage_notes} />
          </Card>
          <Card>
            <SectionHead num={6} title="Existing Equipment" />
            <Row label="Equipment" value={assessment.existing_equipment} />
          </Card>
          <Card>
            <SectionHead num={8} title="Additional Information" />
            <Row label="Notes" value={assessment.additional_info} />
          </Card>
        </div>
      </SchoolLayout>
    )
  }

  // Editable form
  return (
    <SchoolLayout title="Facility Assessment" showBack>
      <div className="px-4 pt-6 pb-4 flex flex-col gap-4">

        <Card className="bg-[#1a3a6b]/5">
          <div className="flex items-start gap-3">
            <ClipboardCheck size={20} className="text-[#1a3a6b] shrink-0 mt-0.5" />
            <p className="text-sm text-[#1a3a6b]">
              Please complete this form so ASO can prepare for your club sessions. All sections are required.
            </p>
          </div>
        </Card>

        {/* Section 1: School details */}
        <Card>
          <SectionHead num={1} title="School Details" />
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-500"><span className="font-medium">School:</span> {school?.name}</p>
            <p className="text-sm text-gray-500"><span className="font-medium">Address:</span> {school?.address}</p>
            <p className="text-xs text-gray-400 mt-1">Pre-populated from your school record. Contact ASO to update.</p>
          </div>
        </Card>

        {/* Section 2: Available space */}
        <Card>
          <SectionHead num={2} title="Available Space" />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Describe the available space</label>
              <textarea className={TEXTAREA} value={form.space_description ?? ''} onChange={set('space_description')}
                placeholder="e.g. Main school hall, wooden floor, 30m × 20m" />
            </div>
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Approximate size</label>
              <textarea className={TEXTAREA} style={{ minHeight: 60 }} value={form.space_size ?? ''} onChange={set('space_size')}
                placeholder="e.g. 600m²" />
            </div>
          </div>
        </Card>

        {/* Section 3: Availability */}
        <Card>
          <SectionHead num={3} title="Availability" />
          <div className="flex flex-col gap-1">
            <label className={LABEL}>Days and times the space is available</label>
            <textarea className={TEXTAREA} value={form.availability_notes ?? ''} onChange={set('availability_notes')}
              placeholder="e.g. Monday to Friday 3:30pm–5:30pm, Saturday mornings" />
          </div>
        </Card>

        {/* Section 4: Changing and welfare */}
        <Card>
          <SectionHead num={4} title="Changing & Welfare" />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Changing facilities</label>
              <textarea className={TEXTAREA} value={form.changing_facilities ?? ''} onChange={set('changing_facilities')}
                placeholder="e.g. Separate male/female changing rooms adjacent to hall" />
            </div>
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Welfare facilities (toilets, first aid)</label>
              <textarea className={TEXTAREA} value={form.welfare_facilities ?? ''} onChange={set('welfare_facilities')}
                placeholder="e.g. Toilets in main corridor, first aid kit in school office" />
            </div>
          </div>
        </Card>

        {/* Section 5: Equipment storage */}
        <Card>
          <SectionHead num={5} title="Equipment Storage" />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Is storage available for ASO equipment?</label>
              <select className={SELECT} value={form.storage_available === null ? '' : String(form.storage_available)}
                onChange={e => setForm(f => ({ ...f, storage_available: e.target.value === '' ? null : e.target.value === 'true' }))}>
                <option value="">Select…</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Storage details</label>
              <textarea className={TEXTAREA} value={form.storage_notes ?? ''} onChange={set('storage_notes')}
                placeholder="e.g. Locked cupboard in sports hall, approx 2m × 1m" />
            </div>
          </div>
        </Card>

        {/* Section 6: Existing equipment */}
        <Card>
          <SectionHead num={6} title="Existing Gymnastics Equipment" />
          <div className="flex flex-col gap-1">
            <label className={LABEL}>List any existing gymnastics equipment on site</label>
            <textarea className={TEXTAREA} value={form.existing_equipment ?? ''} onChange={set('existing_equipment')}
              placeholder="e.g. 2 × gymnastics benches, box top, 4 × mats. Or: None." />
          </div>
        </Card>

        {/* Section 7: Safeguarding — pre-populated */}
        <Card>
          <SectionHead num={7} title="Safeguarding Contacts" />
          <p className="text-xs text-gray-400 mb-2">Pre-populated from your safeguarding record. Update via the Safeguarding tab.</p>
          <Row label="DSL name" value={school?.dsl_name ?? null} />
          <Row label="DSL email" value={school?.dsl_email ?? null} />
          <Row label="DDSL name" value={school?.ddsl_name ?? null} />
        </Card>

        {/* Section 8: Additional */}
        <Card>
          <SectionHead num={8} title="Additional Information" />
          <div className="flex flex-col gap-1">
            <label className={LABEL}>Anything else ASO should know?</label>
            <textarea className={TEXTAREA} value={form.additional_info ?? ''} onChange={set('additional_info')}
              placeholder="e.g. Car parking arrangements, access codes, term dates that differ from local authority" />
          </div>
        </Card>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {saved && (
          <Card className="bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle size={18} className="text-green-600" />
              <p className="text-sm font-semibold text-green-700">Assessment submitted successfully</p>
            </div>
          </Card>
        )}

        <Button variant="primary" size="lg" fullWidth onClick={submit} disabled={saving}>
          {saving ? 'Submitting…' : 'Submit Assessment'}
        </Button>

      </div>
    </SchoolLayout>
  )
}
