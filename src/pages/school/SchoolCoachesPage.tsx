import { useState, useEffect } from 'react'
import { ShieldCheck, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { SchoolLayout } from '../../components/layout/SchoolLayout'
import { useSchoolId } from '../../hooks/useSchoolId'

interface CoachRow {
  is_lead: boolean
  staff: {
    full_name: string
    role: string
    dbs_number: string | null
    dbs_expiry: string | null
    safeguarding_expiry: string | null
  } | null
}

function expirySoon(dateStr: string | null): boolean {
  if (!dateStr) return false
  const exp = new Date(dateStr)
  const inThreeMonths = new Date()
  inThreeMonths.setMonth(inThreeMonths.getMonth() + 3)
  return exp <= inThreeMonths
}

function expired(dateStr: string | null): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not recorded'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function CertRow({ label, date }: { label: string; date: string | null }) {
  const isExpired = expired(date)
  const isSoon = !isExpired && expirySoon(date)
  const colour = isExpired
    ? 'text-red-600'
    : isSoon
      ? 'text-amber-600'
      : date ? 'text-green-700' : 'text-gray-400'

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="flex items-center gap-1">
        {(isExpired || isSoon) && <AlertTriangle size={11} className={colour} />}
        <p className={`text-xs font-semibold ${colour}`}>{formatDate(date)}</p>
      </div>
    </div>
  )
}

export function SchoolCoachesPage() {
  const schoolId = useSchoolId()
  const [coaches, setCoaches] = useState<CoachRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!schoolId) return
    supabase
      .from('staff_school_assignments')
      .select('is_lead, staff:profiles!staff_id(full_name, role, dbs_number, dbs_expiry, safeguarding_expiry)')
      .eq('school_id', schoolId)
      .order('is_lead', { ascending: false })
      .then(({ data }) => {
        setCoaches((data ?? []) as unknown as CoachRow[])
        setLoading(false)
      })
  }, [schoolId])

  if (loading) {
    return (
      <SchoolLayout title="Coaching Team" showBack>
        <div className="px-4 pt-6 flex flex-col gap-3">
          {[1, 2].map(i => <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      </SchoolLayout>
    )
  }

  return (
    <SchoolLayout title="Coaching Team" showBack>
      <div className="px-4 pt-6 pb-10 flex flex-col gap-4">

        <div className="bg-[#1a3a6b]/5 border border-[#1a3a6b]/10 rounded-2xl px-4 py-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-[#1a3a6b] shrink-0 mt-0.5" />
            <p className="text-xs text-[#1a3a6b] leading-relaxed">
              All ASO staff working at your school have an enhanced DBS check, valid safeguarding certificate, and meet our suitability requirements before delivery begins.
            </p>
          </div>
        </div>

        {coaches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-8 text-center">
            <p className="text-sm text-gray-500">No coaches assigned yet.</p>
            <p className="text-xs text-gray-400 mt-1">Contact your area lead to confirm your coaching team.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {coaches.map((c, i) => {
              const staff = c.staff
              if (!staff) return null
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3.5 flex items-center gap-3 border-b border-gray-50">
                    <div className="w-9 h-9 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                      <span className="text-[#1a3a6b] font-extrabold text-sm leading-none">
                        {staff.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1a3a6b] text-sm leading-tight">{staff.full_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {c.is_lead ? 'Lead Coach' : 'Assistant Coach'}
                      </p>
                    </div>
                    {c.is_lead && (
                      <span className="text-[10px] font-bold bg-[#1a3a6b]/10 text-[#1a3a6b] px-2 py-0.5 rounded-full shrink-0">
                        Lead
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Compliance</p>
                    <div>
                      <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                        <p className="text-xs text-gray-500">DBS Number</p>
                        <p className="text-xs font-semibold text-gray-700">
                          {staff.dbs_number ?? <span className="text-gray-400">Not recorded</span>}
                        </p>
                      </div>
                      <CertRow label="DBS Expiry" date={staff.dbs_expiry} />
                      <CertRow label="Safeguarding Expiry" date={staff.safeguarding_expiry} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center px-4 leading-relaxed">
          If you have any concerns about coach suitability, contact your area lead or email{' '}
          <a href="mailto:info@activeschool.org.uk" className="text-[#1a3a6b] font-semibold">
            info@activeschool.org.uk
          </a>
        </p>

      </div>
    </SchoolLayout>
  )
}
