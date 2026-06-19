import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'

function getComingFriday(): string {
  const today = new Date()
  const day = today.getDay() // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const daysUntilFriday = day === 5 ? 0 : (5 - day + 7) % 7
  const friday = new Date(today)
  friday.setDate(today.getDate() + daysUntilFriday)
  return friday.toISOString().split('T')[0]
}

interface FormState {
  weekEnding: string
  staffAbsences: string
  coverArranged: string
  incidentsConcerns: string
  actionsTaken: string
  flagsNextWeek: string
  generalNotes: string
}

interface SectionCardProps {
  title: string
  hint: string
  value: string
  onChange: (v: string) => void
}

function SectionCard({ title, hint, value, onChange }: SectionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-2">
      <p className="text-sm font-bold text-[#1a3a6b]">{title}</p>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={hint}
        rows={3}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#f4f6f9] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] placeholder:text-gray-400"
      />
    </div>
  )
}

export function AreaLeadWeeklyReportPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>({
    weekEnding: getComingFriday(),
    staffAbsences: '',
    coverArranged: '',
    incidentsConcerns: '',
    actionsTaken: '',
    flagsNextWeek: '',
    generalNotes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setError(null)
    setSaving(true)

    const { error: insertError } = await supabase.from('area_lead_weekly_reports').insert({
      submitted_by: profile.id,
      area: profile.area ?? null,
      week_ending: form.weekEnding,
      staff_absences: form.staffAbsences,
      cover_arranged: form.coverArranged,
      incidents_concerns: form.incidentsConcerns,
      actions_taken: form.actionsTaken,
      flags_next_week: form.flagsNextWeek,
      general_notes: form.generalNotes,
    })

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    // Notify all directors except the submitter
    const { data: directors } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'director')

    const notifs = (directors ?? [])
      .filter((d: { id: string }) => d.id !== profile.id)
      .map((d: { id: string }) => ({
        user_id: d.id,
        type: 'week_report',
        title: 'Weekly report submitted',
        body: `${profile.full_name} submitted their area lead weekly admin report`,
      }))

    if (notifs.length > 0) {
      await supabase.from('notifications').insert(notifs)
    }

    setSaving(false)
    setSuccess(true)
    setTimeout(() => navigate('/my-area'), 2000)
  }

  if (!profile) return null

  return (
    <Layout title="Weekly Admin Report" showBack>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-[#1a3a6b]">Weekly Admin Report</h2>
          <p className="text-sm text-gray-500 mt-0.5">Submit your end-of-week admin summary.</p>
        </div>

        {success && (
          <div className="mb-5 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-green-700">Report submitted successfully! Redirecting…</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Week ending */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-2">
            <label className="text-sm font-bold text-[#1a3a6b]" htmlFor="week-ending">
              Week ending
            </label>
            <input
              id="week-ending"
              type="date"
              value={form.weekEnding}
              onChange={e => set('weekEnding', e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#f4f6f9] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
            />
          </div>

          <SectionCard
            title="Staff & Absences"
            hint="Any absences this week? Note who was off and the reason."
            value={form.staffAbsences}
            onChange={v => set('staffAbsences', v)}
          />

          <SectionCard
            title="Cover Arranged"
            hint="How was cover arranged? List any coaches who stepped in."
            value={form.coverArranged}
            onChange={v => set('coverArranged', v)}
          />

          <SectionCard
            title="Incidents & Concerns"
            hint="Any incidents, safeguarding concerns, or complaints this week?"
            value={form.incidentsConcerns}
            onChange={v => set('incidentsConcerns', v)}
          />

          <SectionCard
            title="Actions Taken"
            hint="What did you action this week? Include calls made, decisions, follow-ups."
            value={form.actionsTaken}
            onChange={v => set('actionsTaken', v)}
          />

          <SectionCard
            title="Flags for Next Week"
            hint="Anything to watch, escalate, or prepare for next week?"
            value={form.flagsNextWeek}
            onChange={v => set('flagsNextWeek', v)}
          />

          <SectionCard
            title="General Notes"
            hint="Any other updates for the admin team?"
            value={form.generalNotes}
            onChange={v => set('generalNotes', v)}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || success}
            className="w-full bg-[#1a3a6b] text-white font-bold text-base py-4 rounded-2xl shadow-sm active:opacity-80 transition-opacity disabled:opacity-60 mt-2"
          >
            {saving ? 'Submitting…' : 'Submit Report'}
          </button>

        </form>
      </div>
    </Layout>
  )
}
