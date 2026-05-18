import { useState, useEffect } from 'react'
import { Users, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSchoolId } from '../../hooks/useSchoolId'
import { Layout } from '../../components/layout/Layout'
import type { ClubTerm } from '../../types'

interface RosterEntry {
  child_name: string
  child_year_group: string | null
  child_class: string | null
  child_additional_needs: string | null
}

export function SchoolRosterPage() {
  const schoolId = useSchoolId()
  const [activeTerm, setActiveTerm] = useState<ClubTerm | null>(null)
  const [roster, setRoster] = useState<RosterEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!schoolId) return
    async function load() {
      // Find the active term for this school
      const { data: term } = await supabase
        .from('club_terms')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('start_date')
        .limit(1)
        .maybeSingle()

      if (!term) { setLoading(false); return }
      setActiveTerm(term as ClubTerm)

      // Fetch confirmed bookings (only child-facing fields — no parent payment info)
      const { data: bookings } = await supabase
        .from('parent_bookings')
        .select('child_name, child_year_group, child_class, child_additional_needs')
        .eq('club_term_id', term.id)
        .eq('status', 'confirmed')
        .order('child_name')

      setRoster((bookings ?? []) as RosterEntry[])
      setLoading(false)
    }
    load()
  }, [schoolId])

  return (
    <Layout title="Class Roster">
      <div className="px-4 pt-6 pb-10 flex flex-col gap-4">

        {activeTerm && (
          <div className="bg-[#1a3a6b] rounded-2xl px-4 py-3 text-white">
            <p className="font-bold text-base">{activeTerm.term_name}</p>
            <p className="text-white/70 text-sm">
              {new Date(activeTerm.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              {' – '}
              {new Date(activeTerm.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              {' · '}{activeTerm.num_sessions} sessions
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-white/60 text-sm">
              <Users size={14} />
              {roster.length} of {activeTerm.capacity} places filled
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : !activeTerm ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-gray-500 text-sm">No active term found for this club.</p>
            <p className="text-xs text-gray-400 mt-1">Contact your ASO area lead to set up the next term.</p>
          </div>
        ) : roster.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-gray-500 text-sm">No children booked in yet for this term.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {roster.map((child, i) => (
              <div key={i} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#1a3a6b] text-sm">{child.child_name}</p>
                    {(child.child_year_group || child.child_class) && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {[child.child_year_group, child.child_class].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  {child.child_additional_needs && (
                    <div className="flex items-center gap-1 shrink-0">
                      <AlertCircle size={13} className="text-amber-500" />
                      <span className="text-xs font-semibold text-amber-600">Needs</span>
                    </div>
                  )}
                </div>
                {child.child_additional_needs && (
                  <p className="text-xs text-amber-700 mt-1 bg-amber-50 rounded-lg px-2 py-1">
                    {child.child_additional_needs}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center px-4">
          This roster shows children enrolled via the ASO Community Hub booking system.
          Children added manually by staff may not appear here.
        </p>
      </div>
    </Layout>
  )
}
