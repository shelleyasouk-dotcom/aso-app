import { useState, useEffect } from 'react'
import { Download, Users, MapPin, Clock, Navigation } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { ROLE_LABELS } from '../../lib/roles'
import type { Role } from '../../types'

const AVAIL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface StaffAvail {
  id: string
  full_name: string
  role: Role
  phone: string | null
  availability: string | null
  preferred_areas: string | null
  travel_distance_miles: number | null
  availability_notes: string | null
}

function exportCSV(staff: StaffAvail[]) {
  const rows: string[][] = [
    ['Name', 'Role', 'Days Available', 'Time of Day', 'Areas', 'Max Miles', 'Notes', 'Phone'],
  ]

  staff.forEach(s => {
    const parsed = parseAvailability(s.availability)
    rows.push([
      s.full_name,
      ROLE_LABELS[s.role] ?? s.role,
      parsed.days.join(', '),
      parsed.time,
      s.preferred_areas ?? '',
      s.travel_distance_miles?.toString() ?? '',
      s.availability_notes ?? '',
      s.phone ?? '',
    ])
  })

  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ASO_Staff_Availability.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function parseAvailability(str: string | null): { days: string[]; time: string } {
  if (!str) return { days: [], time: '' }
  const parts = str.split('—').map(s => s.trim())
  const days = AVAIL_DAYS.filter(d => parts[0]?.includes(d))
  const time = ['Mornings', 'Afternoons', 'Evenings', 'Flexible'].find(t => parts[1]?.includes(t)) ?? ''
  return { days, time }
}

const DAY_COLORS: Record<string, string> = {
  Mon: 'bg-blue-100 text-blue-800',
  Tue: 'bg-purple-100 text-purple-800',
  Wed: 'bg-teal-100 text-teal-800',
  Thu: 'bg-orange-100 text-orange-800',
  Fri: 'bg-pink-100 text-pink-800',
  Sat: 'bg-amber-100 text-amber-800',
}

export function StaffAvailabilityPage() {
  const [staff, setStaff] = useState<StaffAvail[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDay, setFilterDay] = useState('')
  const [filterArea, setFilterArea] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role, phone, availability, preferred_areas, travel_distance_miles, availability_notes')
      .not('role', 'in', '("school","parent")')
      .order('full_name')
    setStaff((data as StaffAvail[]) ?? [])
    setLoading(false)
  }

  const filtered = staff.filter(s => {
    if (filterDay) {
      const { days } = parseAvailability(s.availability)
      if (!days.includes(filterDay)) return false
    }
    if (filterArea) {
      if (!s.preferred_areas?.toLowerCase().includes(filterArea.toLowerCase())) return false
    }
    return true
  })

  const withAvail = filtered.filter(s => s.availability || s.preferred_areas)
  const withoutAvail = filtered.filter(s => !s.availability && !s.preferred_areas)

  return (
    <Layout title="Staff Availability" showBack>
      <div className="px-4 pt-5 pb-10 flex flex-col gap-5 max-w-2xl mx-auto w-full">

        {/* Header actions */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{filtered.length} staff members</p>
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 bg-[#1a3a6b] text-white px-4 py-2 rounded-xl text-sm font-bold active:opacity-90"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
          <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Filter</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterDay('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                !filterDay ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]' : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              All days
            </button>
            {AVAIL_DAYS.map(day => (
              <button
                key={day}
                onClick={() => setFilterDay(filterDay === day ? '' : day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  filterDay === day ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]' : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Filter by area (e.g. Hampshire)"
            value={filterArea}
            onChange={e => setFilterArea(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
          />
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : withAvail.length === 0 && withoutAvail.length === 0 ? (
          <div className="text-center py-16">
            <Users size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No staff found</p>
          </div>
        ) : (
          <>
            {/* Staff with availability set */}
            {withAvail.length > 0 && (
              <div className="flex flex-col gap-3">
                {withAvail.map(s => {
                  const { days, time } = parseAvailability(s.availability)
                  return (
                    <div key={s.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <p className="font-bold text-[#1a3a6b] text-sm">{s.full_name}</p>
                          <p className="text-xs text-gray-400">{ROLE_LABELS[s.role] ?? s.role}</p>
                        </div>
                        {s.phone && (
                          <a href={`tel:${s.phone}`} className="text-xs text-[#1a3a6b] font-semibold shrink-0">
                            {s.phone}
                          </a>
                        )}
                      </div>

                      {days.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mb-2">
                          {days.map(d => (
                            <span key={d} className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${DAY_COLORS[d] ?? 'bg-gray-100 text-gray-600'}`}>
                              {d}
                            </span>
                          ))}
                          {time && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                              <Clock size={9} />{time}
                            </span>
                          )}
                        </div>
                      )}

                      {s.preferred_areas && (
                        <div className="flex items-start gap-1.5 mb-1">
                          <MapPin size={11} className="text-gray-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-gray-600">{s.preferred_areas}</p>
                        </div>
                      )}

                      {s.travel_distance_miles != null && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Navigation size={11} className="text-gray-400 shrink-0" />
                          <p className="text-xs text-gray-600">Up to {s.travel_distance_miles} miles</p>
                        </div>
                      )}

                      {s.availability_notes && (
                        <p className="text-xs text-gray-400 mt-1 italic">{s.availability_notes}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Staff with no availability set */}
            {withoutAvail.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">
                  No availability set ({withoutAvail.length})
                </p>
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-50">
                  {withoutAvail.map(s => (
                    <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600">{s.full_name}</p>
                        <p className="text-xs text-gray-400">{ROLE_LABELS[s.role] ?? s.role}</p>
                      </div>
                      {s.phone && (
                        <a href={`tel:${s.phone}`} className="text-xs text-[#1a3a6b] font-semibold">
                          {s.phone}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </Layout>
  )
}
