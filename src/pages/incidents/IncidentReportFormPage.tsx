import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
type SchoolOption = { id: string; name: string }

interface FormState {
  school_id: string
  incident_type: string
  incident_date: string
  incident_time: string
  incident_location: string
  persons_involved: string
  description: string
  injuries: string
  first_aid_given: boolean
  first_aid_details: string
  first_aid_given_by: string
  parent_notified: boolean
  parent_notified_details: string
  witnesses: string
  immediate_action: string
}

const empty: FormState = {
  school_id: '',
  incident_type: 'accident',
  incident_date: new Date().toISOString().split('T')[0],
  incident_time: '',
  incident_location: '',
  persons_involved: '',
  description: '',
  injuries: '',
  first_aid_given: false,
  first_aid_details: '',
  first_aid_given_by: '',
  parent_notified: false,
  parent_notified_details: '',
  witnesses: '',
  immediate_action: '',
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-2">{children}</h3>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
        checked ? 'bg-[#1a3a6b] border-[#1a3a6b] text-white' : 'bg-white border-gray-200 text-gray-700'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${checked ? 'bg-white/30' : 'bg-gray-200'}`}>
        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </button>
  )
}

export function IncidentReportFormPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const [form, setForm] = useState<FormState>(empty)
  const [schools, setSchools] = useState<SchoolOption[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingReport, setLoadingReport] = useState(isEdit)

  const isAdmin = profile?.role === 'director' || profile?.role === 'area_lead'

  useEffect(() => {
    if (!profile) return

    if (isAdmin) {
      supabase.from('schools').select('id,name').order('name').then(({ data }) => setSchools(data ?? []))
    } else {
      supabase
        .from('staff_school_assignments')
        .select('school:schools(id,name)')
        .eq('staff_id', profile.id)
        .then(({ data }) => {
          const list = (data ?? []).map((d: any) => d.school).filter(Boolean) as SchoolOption[]
          setSchools(list)
          if (list.length === 1 && !isEdit) {
            setForm(f => ({ ...f, school_id: list[0].id }))
          }
        })
    }

    if (isEdit) {
      supabase
        .from('incident_reports')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setForm({
              school_id: data.school_id ?? '',
              incident_type: data.incident_type,
              incident_date: data.incident_date,
              incident_time: data.incident_time ?? '',
              incident_location: data.incident_location ?? '',
              persons_involved: data.persons_involved,
              description: data.description,
              injuries: data.injuries ?? '',
              first_aid_given: data.first_aid_given,
              first_aid_details: data.first_aid_details ?? '',
              first_aid_given_by: data.first_aid_given_by ?? '',
              parent_notified: data.parent_notified,
              parent_notified_details: data.parent_notified_details ?? '',
              witnesses: data.witnesses ?? '',
              immediate_action: data.immediate_action ?? '',
            })
          }
          setLoadingReport(false)
        })
    }
  }, [profile])

  function set(key: keyof FormState, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function save(status: 'draft' | 'submitted') {
    if (!profile) return
    setError(null)
    setSaving(true)

    const payload = {
      reported_by: profile.id,
      school_id: form.school_id || null,
      incident_type: form.incident_type,
      incident_date: form.incident_date,
      incident_time: form.incident_time || null,
      incident_location: form.incident_location || null,
      persons_involved: form.persons_involved,
      description: form.description,
      injuries: form.injuries || null,
      first_aid_given: form.first_aid_given,
      first_aid_details: form.first_aid_given ? form.first_aid_details || null : null,
      first_aid_given_by: form.first_aid_given ? form.first_aid_given_by || null : null,
      parent_notified: form.parent_notified,
      parent_notified_details: form.parent_notified ? form.parent_notified_details || null : null,
      witnesses: form.witnesses || null,
      immediate_action: form.immediate_action || null,
      status,
    }

    let err
    if (isEdit) {
      const res = await supabase.from('incident_reports').update(payload).eq('id', id)
      err = res.error
    } else {
      const res = await supabase.from('incident_reports').insert(payload)
      err = res.error
    }

    setSaving(false)

    if (err) {
      setError(err.message)
    } else {
      navigate('/incidents')
    }
  }

  if (loadingReport) return null

  const canSubmit = form.persons_involved.trim() && form.description.trim() && form.incident_date

  return (
    <Layout title={isEdit ? 'Edit Report' : 'New Incident Report'}>
      <div className="px-4 pt-6 pb-10 flex flex-col gap-5">

        {/* Type banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800">
            Complete this form as soon as possible after the incident. Submit when ready for review by your area lead.
          </p>
        </div>

        {/* Incident Type */}
        <SectionHeading>Type of Report</SectionHeading>
        <div className="grid grid-cols-3 gap-2">
          {(['accident', 'incident', 'near_miss'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => set('incident_type', t)}
              className={`py-3 rounded-xl text-sm font-semibold border transition-colors ${
                form.incident_type === t
                  ? t === 'accident'
                    ? 'bg-red-600 text-white border-red-600'
                    : t === 'incident'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {t === 'near_miss' ? 'Near Miss' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Date/Time/School */}
        <SectionHeading>When &amp; Where</SectionHeading>

        {schools.length > 1 || isAdmin ? (
          <Select
            label="School"
            value={form.school_id}
            onChange={e => set('school_id', e.target.value)}
          >
            <option value="">Select school…</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        ) : schools.length === 1 ? (
          <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-xs text-gray-400 mb-0.5">School</p>
            <p className="text-sm font-semibold text-[#1a3a6b]">{schools[0].name}</p>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="incident_date"
            label="Date of Incident"
            type="date"
            value={form.incident_date}
            onChange={e => set('incident_date', e.target.value)}
            required
          />
          <Input
            id="incident_time"
            label="Time (approx)"
            type="time"
            value={form.incident_time}
            onChange={e => set('incident_time', e.target.value)}
          />
        </div>

        <Input
          id="incident_location"
          label="Location (e.g. gym hall, corridor)"
          placeholder="Where did it happen?"
          value={form.incident_location}
          onChange={e => set('incident_location', e.target.value)}
        />

        {/* People */}
        <SectionHeading>People Involved</SectionHeading>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Name(s) of person(s) involved <span className="text-red-500">*</span></label>
          <textarea
            value={form.persons_involved}
            onChange={e => set('persons_involved', e.target.value)}
            placeholder="Full names of children and/or adults involved"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
          />
        </div>

        {/* What happened */}
        <SectionHeading>What Happened</SectionHeading>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Describe what happened, including the sequence of events"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Injuries sustained</label>
          <textarea
            value={form.injuries}
            onChange={e => set('injuries', e.target.value)}
            placeholder="Describe any injuries, or 'None' if no injuries"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
          />
        </div>

        {/* First Aid */}
        <SectionHeading>First Aid</SectionHeading>
        <Toggle
          label="Was first aid given?"
          checked={form.first_aid_given}
          onChange={v => set('first_aid_given', v)}
        />
        {form.first_aid_given && (
          <div className="flex flex-col gap-3 pl-2 border-l-2 border-[#1a3a6b]/20">
            <Input
              id="first_aid_given_by"
              label="First aid given by"
              placeholder="Name of person who administered first aid"
              value={form.first_aid_given_by}
              onChange={e => set('first_aid_given_by', e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Details of first aid given</label>
              <textarea
                value={form.first_aid_details}
                onChange={e => set('first_aid_details', e.target.value)}
                placeholder="What treatment was given?"
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
              />
            </div>
          </div>
        )}

        {/* Parent notification */}
        <SectionHeading>Parent / Guardian</SectionHeading>
        <Toggle
          label="Was parent/guardian notified?"
          checked={form.parent_notified}
          onChange={v => set('parent_notified', v)}
        />
        {form.parent_notified && (
          <div className="flex flex-col gap-1 pl-2 border-l-2 border-[#1a3a6b]/20">
            <label className="text-sm font-medium text-gray-700">How and by whom</label>
            <textarea
              value={form.parent_notified_details}
              onChange={e => set('parent_notified_details', e.target.value)}
              placeholder="How were they notified and who contacted them?"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
            />
          </div>
        )}

        {/* Witnesses & action */}
        <SectionHeading>Additional Information</SectionHeading>
        <Input
          id="witnesses"
          label="Witnesses (names)"
          placeholder="Names of any witnesses present"
          value={form.witnesses}
          onChange={e => set('witnesses', e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Immediate action taken</label>
          <textarea
            value={form.immediate_action}
            onChange={e => set('immediate_action', e.target.value)}
            placeholder="Any action taken at the time of the incident"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            size="lg"
            fullWidth
            disabled={!canSubmit || saving}
            onClick={() => save('submitted')}
          >
            {saving ? 'Saving…' : 'Submit for Review'}
          </Button>
          <Button
            size="lg"
            fullWidth
            variant="secondary"
            disabled={saving}
            onClick={() => save('draft')}
          >
            Save as Draft
          </Button>
        </div>

      </div>
    </Layout>
  )
}
