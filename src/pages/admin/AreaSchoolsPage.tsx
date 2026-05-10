import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import type { School, Profile } from '../../types'

const AREAS = ['Hampshire', 'Wiltshire', 'Dorset', 'Bath and North East Somerset', 'Oxfordshire']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function parseStartMinutes(sessionTime: string): number {
  if (!sessionTime) return 9999
  const first = sessionTime.split(/[-–]/)[0].trim()
  const match = first.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i)
  if (!match) return 9999
  let h = parseInt(match[1])
  const m = parseInt(match[2])
  const ampm = match[3]?.toLowerCase()
  if (ampm === 'pm' && h !== 12) h += 12
  if (ampm === 'am' && h === 12) h = 0
  return h * 60 + m
}

interface SchoolWithCoaches extends School {
  coaches: Profile[]
}

export function AreaSchoolsPage() {
  const { profile } = useAuth()
  const isDirector = profile?.role === 'director'

  // All areas this person can see
  const allowedAreas = isDirector
    ? AREAS
    : (profile?.areas && profile.areas.length > 0 ? profile.areas : profile?.area ? [profile.area] : [])

  const hasMultipleAreas = allowedAreas.length > 1

  const [selectedArea, setSelectedArea] = useState<string>(allowedAreas[0] ?? '')
  const [schools, setSchools] = useState<SchoolWithCoaches[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedArea) loadSchools(selectedArea)
    else setSchools([])
  }, [selectedArea])

  async function loadSchools(area: string) {
    setLoading(true)

    const { data: schoolData } = await supabase
      .from('schools')
      .select('*')
      .eq('area', area)
      .order('name')

    if (!schoolData || schoolData.length === 0) {
      setSchools([])
      setLoading(false)
      return
    }

    // Load staff assignments for these schools
    const schoolIds = schoolData.map(s => s.id)
    const { data: assignments } = await supabase
      .from('staff_school_assignments')
      .select('school_id, staff:profiles(id, full_name, role)')
      .in('school_id', schoolIds)

    setSchools(schoolData.map(school => ({
      ...school,
      coaches: assignments
        ?.filter(a => a.school_id === school.id)
        .map((a: any) => a.staff)
        .filter(Boolean) ?? [],
    })))
    setLoading(false)
  }

  const byDay = DAYS.map(day => ({
    day,
    schools: schools
      .filter(s => s.session_day === day)
      .sort((a, b) => parseStartMinutes(a.session_time) - parseStartMinutes(b.session_time)),
  })).filter(g => g.schools.length > 0)

  return (
    <Layout title="Area Schools" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">

        {/* Area selector — Directors and multi-area leads get buttons; single-area leads see their area */}
        {hasMultipleAreas ? (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Select Area</label>
            <div className="flex flex-wrap gap-2">
              {allowedAreas.map(area => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedArea === area
                      ? 'bg-[#1a3a6b] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1a3a6b]'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-1">
            <MapPin size={16} className="text-[#1a3a6b]" />
            <p className="font-bold text-[#1a3a6b] text-lg">{selectedArea || 'No area assigned'}</p>
          </div>
        )}

        {!selectedArea ? (
          <Card className="text-center py-8">
            <p className="text-gray-500">No area assigned to your profile yet.<br />Ask your Director to set it.</p>
          </Card>
        ) : loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : schools.length === 0 ? (
          <Card className="text-center py-8">
            <MapPin size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No schools in {selectedArea} yet.</p>
          </Card>
        ) : (
          byDay.map(({ day, schools: daySchools }) => (
            <div key={day}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{day}</p>
              <div className="flex flex-col gap-3">
                {daySchools.map(school => (
                  <Card key={school.id}>
                    <p className="font-bold text-[#1a3a6b]">{school.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{school.address}</p>
                    <p className="text-xs text-gray-400 mt-1">{school.session_time}</p>
                    {school.coaches.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 mb-1.5">Coaches</p>
                        <div className="flex flex-col gap-1">
                          {school.coaches.map(coach => (
                            <div key={coach.id} className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0">
                                <span className="text-white font-bold text-[10px]">
                                  {coach.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                              </div>
                              <span className="text-sm text-gray-700">{coach.full_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}
