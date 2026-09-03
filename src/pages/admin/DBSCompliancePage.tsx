import { useState, useEffect } from 'react'
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'

interface StaffRecord {
  id: string
  full_name: string
  role: string
  dbs_number: string | null
  dbs_expiry: string | null
  anaphylaxis_cert: boolean
}

// DBS requirements per role under September 2026 changes
// (supervision exemption removed — all roles working directly with children need Enhanced + Barred List)
const DBS_REQUIREMENTS: Record<string, { level: 'enhanced_barred' | 'enhanced' | 'none'; label: string }> = {
  junior_coach:    { level: 'enhanced_barred', label: 'Enhanced + Barred List' },
  assistant_coach: { level: 'enhanced_barred', label: 'Enhanced + Barred List' },
  lead_coach:      { level: 'enhanced_barred', label: 'Enhanced + Barred List' },
  area_lead:       { level: 'enhanced_barred', label: 'Enhanced + Barred List' },
  director:        { level: 'enhanced_barred', label: 'Enhanced + Barred List' },
  outreach_worker: { level: 'enhanced',        label: 'Enhanced DBS' },
  media_tech:      { level: 'enhanced',        label: 'Enhanced DBS' },
}

const ROLE_LABELS: Record<string, string> = {
  junior_coach:    'Junior Coach',
  assistant_coach: 'Assistant Coach',
  lead_coach:      'Lead Coach',
  area_lead:       'Area Lead',
  director:        'Operations Manager',
  outreach_worker: 'Outreach Manager',
  media_tech:      'Marketing Coordinator',
}

function dbsStatus(record: StaffRecord): 'ok' | 'expiring' | 'missing' | 'expired' {
  if (!record.dbs_number || !record.dbs_expiry) return 'missing'
  const expiry = new Date(record.dbs_expiry)
  const now = new Date()
  const daysLeft = Math.floor((expiry.getTime() - now.getTime()) / 86400000)
  if (daysLeft < 0) return 'expired'
  if (daysLeft < 90) return 'expiring'
  return 'ok'
}

export function DBSCompliancePage() {
  const [staff, setStaff] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'issues'>('all')

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { data: certs }] = await Promise.all([
        supabase.from('profiles')
          .select('id, full_name, role, dbs_number, dbs_expiry')
          .in('role', Object.keys(DBS_REQUIREMENTS))
          .order('full_name'),
        supabase.from('course_certificates')
          .select('user_id')
          .eq('course_id', 'anaphylaxis_v1'),
      ])
      const certSet = new Set((certs ?? []).map((c: any) => c.user_id))
      setStaff((profiles ?? []).map((p: any) => ({ ...p, anaphylaxis_cert: certSet.has(p.id) })))
      setLoading(false)
    }
    load()
  }, [])

  const displayed = filter === 'issues'
    ? staff.filter(s => dbsStatus(s) !== 'ok' || !s.anaphylaxis_cert)
    : staff

  const issueCount = staff.filter(s => dbsStatus(s) !== 'ok' || !s.anaphylaxis_cert).length

  return (
    <Layout title="DBS Compliance" showBack>
      <div className="flex flex-col gap-4 pb-10">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] text-white px-4 pt-5 pb-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#f5c518] mb-1">Admin · Safeguarding</p>
              <h1 className="text-xl font-extrabold leading-tight">DBS & Compliance Dashboard</h1>
              <p className="text-white/70 text-xs mt-1">September 2026 regulated activity rules apply</p>
            </div>
            <ShieldCheck size={28} className="text-[#f5c518] shrink-0 mt-1" />
          </div>
          <div className="flex gap-2 mt-3">
            {([['all', 'All staff'], ['issues', `Issues only (${issueCount})`]] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filter === val ? 'bg-white text-[#1a3a6b]' : 'bg-white/15 text-white/80 hover:bg-white/25'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* September 2026 notice */}
        <div className="px-4">
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
            <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-extrabold text-amber-900 mb-0.5">September 2026 — Supervision exemption removed</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Assistant coaches and junior coaches can no longer rely on supervision to avoid regulated activity classification.
                All coaching roles now require <strong>Enhanced DBS with Children's Barred List</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Role matrix */}
        <div className="px-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Required checks by role</p>
          <Card>
            {Object.entries(DBS_REQUIREMENTS).map(([role, req]) => (
              <div key={role} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{ROLE_LABELS[role] ?? role}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  req.level === 'enhanced_barred' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>{req.label}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Staff list */}
        <div className="px-4 flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            {filter === 'issues' ? `${displayed.length} staff with issues` : `${displayed.length} staff members`}
          </p>

          {loading ? (
            <p className="text-center text-gray-400 py-8 text-sm">Loading…</p>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle size={32} className="text-green-500" />
              <p className="font-bold text-green-800 text-sm">All staff compliant</p>
              <p className="text-xs text-gray-400">No DBS or training issues found</p>
            </div>
          ) : (
            displayed.map(s => {
              const status = dbsStatus(s)
              const req = DBS_REQUIREMENTS[s.role]
              return (
                <Card key={s.id}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-extrabold text-gray-800 text-sm">{s.full_name}</p>
                      <p className="text-xs text-gray-400">{ROLE_LABELS[s.role] ?? s.role}</p>
                    </div>
                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0">
                      {req?.label ?? 'No requirement'}
                    </span>
                  </div>

                  {/* DBS row */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500">DBS check</span>
                    <div className="flex items-center gap-1.5">
                      {status === 'ok' && (
                        <>
                          <CheckCircle size={13} className="text-green-500" />
                          <span className="text-xs font-semibold text-green-700">
                            Valid · expires {new Date(s.dbs_expiry!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </>
                      )}
                      {status === 'expiring' && (
                        <>
                          <AlertTriangle size={13} className="text-amber-500" />
                          <span className="text-xs font-semibold text-amber-700">
                            Expiring · {new Date(s.dbs_expiry!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </>
                      )}
                      {status === 'expired' && (
                        <>
                          <ShieldAlert size={13} className="text-red-500" />
                          <span className="text-xs font-semibold text-red-700">
                            Expired · {new Date(s.dbs_expiry!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </>
                      )}
                      {status === 'missing' && (
                        <>
                          <ShieldAlert size={13} className="text-red-500" />
                          <span className="text-xs font-semibold text-red-700">Missing</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Anaphylaxis row */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-gray-500">Anaphylaxis training</span>
                    <div className="flex items-center gap-1.5">
                      {s.anaphylaxis_cert ? (
                        <>
                          <CheckCircle size={13} className="text-green-500" />
                          <span className="text-xs font-semibold text-green-700">Complete</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={13} className="text-amber-500" />
                          <span className="text-xs font-semibold text-amber-700">Not completed</span>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>

        <p className="px-4 text-xs text-gray-400 text-center">
          DBS numbers and expiry dates are entered on each coach's profile. Update them via Staff Admin → Edit.
        </p>
      </div>
    </Layout>
  )
}
