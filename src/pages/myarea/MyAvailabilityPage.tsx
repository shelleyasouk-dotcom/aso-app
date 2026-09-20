import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'

const AVAIL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const AVAIL_TIMES = ['Mornings', 'Afternoons', 'Evenings', 'Flexible']

const AREAS = [
  'Hampshire',
  'Wiltshire',
  'Dorset',
  'Bath and North East Somerset',
  'Oxfordshire',
]

function parseAvailability(str: string | null): { days: string[]; time: string } {
  if (!str) return { days: [], time: '' }
  const parts = str.split('—').map(s => s.trim())
  const days = AVAIL_DAYS.filter(d => parts[0]?.includes(d))
  const time = AVAIL_TIMES.find(t => parts[1]?.includes(t)) ?? ''
  return { days, time }
}

function serializeAvailability(days: string[], time: string): string {
  const d = days.join(', ')
  return time ? `${d} — ${time}` : d
}

interface Form {
  days: string[]
  time: string
  preferred_areas: string[]
  travel_distance_miles: string
  availability_notes: string
}

function parseAreas(str: string | null): string[] {
  if (!str) return []
  return str.split(',').map(s => s.trim()).filter(Boolean)
}

export function MyAvailabilityPage() {
  const { profile } = useAuth()
  const [form, setForm] = useState<Form>({
    days: [], time: '', preferred_areas: [], travel_distance_miles: '', availability_notes: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) load()
  }, [profile?.id])

  async function load() {
    const { data } = await supabase
      .from('profiles')
      .select('availability, preferred_areas, travel_distance_miles, availability_notes')
      .eq('id', profile!.id)
      .single()

    if (data) {
      const { days, time } = parseAvailability((data as any).availability)
      setForm({
        days,
        time,
        preferred_areas: parseAreas((data as any).preferred_areas),
        travel_distance_miles: (data as any).travel_distance_miles?.toString() ?? '',
        availability_notes: (data as any).availability_notes ?? '',
      })
    }
    setLoading(false)
  }

  async function save() {
    setSaving(true)
    await supabase
      .from('profiles')
      .update({
        availability: serializeAvailability(form.days, form.time) || null,
        preferred_areas: form.preferred_areas.join(', ') || null,
        travel_distance_miles: form.travel_distance_miles ? parseInt(form.travel_distance_miles) : null,
        availability_notes: form.availability_notes.trim() || null,
      })
      .eq('id', profile!.id)

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  function toggleDay(day: string) {
    setForm(f => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day],
    }))
  }

  function toggleArea(area: string) {
    setForm(f => ({
      ...f,
      preferred_areas: f.preferred_areas.includes(area)
        ? f.preferred_areas.filter(a => a !== area)
        : [...f.preferred_areas, area],
    }))
  }

  if (!profile) return null

  return (
    <Layout title="My Availability" showBack>
      <div className="px-4 pt-5 pb-10 flex flex-col gap-5 max-w-lg mx-auto w-full">

        <p className="text-sm text-gray-500">
          Let the team know when and where you're available to coach. This helps us match you to the right sessions when new schools come on board.
        </p>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Days */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Days available</p>
              <div className="flex gap-2 flex-wrap">
                {AVAIL_DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${
                      form.days.includes(day)
                        ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time of day */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Time of day</p>
              <div className="flex gap-2 flex-wrap">
                {AVAIL_TIMES.map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, time: f.time === t ? '' : t }))}
                    className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${
                      form.time === t
                        ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Areas */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Areas I can cover</p>
              <div className="flex flex-col gap-2">
                {AREAS.map(area => (
                  <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      form.preferred_areas.includes(area)
                        ? 'bg-teal-50 text-teal-800 border-teal-300'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel distance */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block mb-3">
                Max travel distance (miles)
              </label>
              <input
                type="number"
                min={0}
                max={200}
                placeholder="e.g. 20"
                value={form.travel_distance_miles}
                onChange={e => setForm(f => ({ ...f, travel_distance_miles: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
              />
            </div>

            {/* Notes */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block mb-3">
                Additional notes
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Not available during school holidays, prefer afternoon sessions…"
                value={form.availability_notes}
                onChange={e => setForm(f => ({ ...f, availability_notes: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
              />
            </div>

            {saved && (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                <CheckCircle className="text-green-500 shrink-0" size={18} />
                <p className="text-green-800 font-semibold text-sm">Availability saved</p>
              </div>
            )}

            <Button size="lg" fullWidth onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save Availability'}
            </Button>
          </>
        )}

      </div>
    </Layout>
  )
}
