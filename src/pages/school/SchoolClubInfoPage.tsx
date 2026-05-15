import { useState, useEffect } from 'react'
import { Calendar, Clock, Mail } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { SchoolLayout } from '../../components/layout/SchoolLayout'
import { Card } from '../../components/ui/Card'
import { useSchoolId } from '../../hooks/useSchoolId'
import type { School } from '../../types'

interface Register {
  id: string
  session_date: string
  notes: string | null
}

function getUpcomingSessions(dayName: string, count = 4): Date[] {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const target = days.indexOf(dayName)
  if (target < 0) return []
  const today = new Date()
  const sessions: Date[] = []
  let diff = (target - today.getDay() + 7) % 7 || 7
  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + diff + i * 7)
    sessions.push(d)
  }
  return sessions
}

function formatShort(d: Date): string {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function SchoolClubInfoPage() {
  const { profile } = useAuth()
  const schoolId = useSchoolId()
  const [school, setSchool] = useState<School | null>(null)
  const [recentSessions, setRecentSessions] = useState<Register[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!schoolId) return
    async function load() {
      const [schoolRes, sessionRes] = await Promise.all([
        supabase.from('schools').select('*').eq('id', schoolId!).single(),
        supabase
          .from('session_registers')
          .select('id, session_date, notes')
          .eq('school_id', schoolId!)
          .order('session_date', { ascending: false })
          .limit(4),
      ])
      if (schoolRes.data) setSchool(schoolRes.data)
      setRecentSessions(sessionRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [profile?.school_id])

  if (loading) {
    return (
      <SchoolLayout title="Club Information" showBack>
        <div className="px-4 pt-6 flex flex-col gap-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      </SchoolLayout>
    )
  }

  const upcoming = school?.session_day ? getUpcomingSessions(school.session_day) : []

  return (
    <SchoolLayout title="Club Information" showBack>
      <div className="px-4 pt-6 pb-4 flex flex-col gap-5">

        {/* Schedule card */}
        {school ? (
          <Card>
            <p className="font-bold text-[#1a3a6b] mb-3">Your Session Schedule</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-[#1a3a6b]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Day</p>
                  <p className="font-semibold text-gray-800 text-sm">{school.session_day}s</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-[#1a3a6b]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Time</p>
                  <p className="font-semibold text-gray-800 text-sm">{school.session_time || 'Contact ASO to confirm'}</p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="text-center py-6">
            <p className="text-gray-400 text-sm">Club schedule not yet configured.</p>
            <p className="text-xs text-gray-400 mt-1">Contact ASO to set up your session.</p>
          </Card>
        )}

        {/* Upcoming sessions */}
        {upcoming.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Upcoming Sessions</p>
            <div className="flex flex-col gap-2">
              {upcoming.map((d, i) => (
                <Card key={i} className="flex items-center gap-3 py-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-green-600 uppercase">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
                    <span className="text-base font-black text-green-700 leading-none">{d.getDate()}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{formatShort(d)}</p>
                    {school?.session_time && (
                      <p className="text-xs text-gray-500">{school.session_time}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Confirmed</span>
                </Card>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              ASO will notify you of any cancellations or changes.
            </p>
          </div>
        )}

        {/* Recent sessions with notes */}
        {recentSessions.filter(r => r.notes).length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Recent Session Notes</p>
            <div className="flex flex-col gap-2">
              {recentSessions.filter(r => r.notes).map(r => (
                <Card key={r.id}>
                  <p className="text-xs font-semibold text-gray-400">
                    {new Date(r.session_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{r.notes}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <Card className="bg-[#1a3a6b]/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1a3a6b] flex items-center justify-center shrink-0">
              <Mail size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#1a3a6b] text-sm">Have a question?</p>
              <p className="text-xs text-gray-500">Get in touch with your ASO coordinator</p>
            </div>
          </div>
          <a
            href="mailto:info@activeschool.org.uk"
            className="mt-3 w-full block text-center py-2.5 rounded-xl bg-[#1a3a6b] text-white text-sm font-semibold"
          >
            Contact ASO
          </a>
        </Card>

      </div>
    </SchoolLayout>
  )
}
