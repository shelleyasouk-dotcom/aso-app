import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import type { IncidentReport, IncidentStatus } from '../../types'

const TYPE_CONFIG = {
  accident: { label: 'Accident', color: 'bg-red-100 text-red-700' },
  incident: { label: 'Incident', color: 'bg-amber-100 text-amber-700' },
  near_miss: { label: 'Near Miss', color: 'bg-blue-100 text-blue-700' },
}

const STATUS_CONFIG: Record<IncidentStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-500' },
  submitted: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700' },
  reviewed: { label: 'Reviewed', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-400' },
}

export function IncidentReportsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState<IncidentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'all'>('pending')

  const isAdmin = profile?.role === 'director' || profile?.role === 'area_lead'
  const isCoach = profile?.role === 'lead_coach'

  useEffect(() => {
    if (!profile) return
    loadReports()
  }, [profile])

  async function loadReports() {
    let query = supabase
      .from('incident_reports')
      .select('*, school:schools(id,name), reporter:profiles!reported_by(id,full_name), reviewer:profiles!reviewed_by(id,full_name)')
      .order('created_at', { ascending: false })

    if (!isAdmin) {
      query = query.eq('reported_by', profile!.id)
    }

    const { data } = await query
    setReports((data ?? []) as IncidentReport[])
    setLoading(false)
  }

  const filtered = reports.filter(r => {
    if (tab === 'pending') return r.status === 'submitted'
    return true
  })

  const pendingCount = reports.filter(r => r.status === 'submitted').length

  return (
    <Layout title="Incident Reports">
      <div className="px-4 pt-6 flex flex-col gap-4">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {isAdmin ? 'All incident & accident reports' : 'Your submitted reports'}
          </p>
          {(isCoach || isAdmin) && (
            <button
              onClick={() => navigate('/incidents/new')}
              className="flex items-center gap-1.5 bg-[#1a3a6b] text-white text-sm font-semibold px-3 py-2 rounded-xl"
            >
              <Plus size={15} /> New Report
            </button>
          )}
        </div>

        {/* Tabs — admin only */}
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setTab('pending')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                tab === 'pending'
                  ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              Pending Review
              {pendingCount > 0 && (
                <span className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                  tab === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('all')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                tab === 'all'
                  ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              All Reports
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-10">
            <AlertTriangle size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">
              {tab === 'pending' ? 'No reports pending review.' : 'No incident reports yet.'}
            </p>
            {(isCoach || isAdmin) && tab === 'all' && (
              <button
                onClick={() => navigate('/incidents/new')}
                className="mt-3 text-sm font-semibold text-[#1a3a6b] underline"
              >
                Create first report
              </button>
            )}
          </Card>
        ) : (
          filtered.map(report => {
            const typeConf = TYPE_CONFIG[report.incident_type]
            const statusConf = STATUS_CONFIG[report.status]
            const school = report.school as any
            const reporter = report.reporter as any
            return (
              <Card key={report.id} onClick={() => navigate(`/incidents/${report.id}`)}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeConf.color}`}>
                      {typeConf.label}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConf.color}`}>
                      {statusConf.label}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 shrink-0 mt-0.5" />
                </div>
                <p className="text-sm font-semibold text-[#1a3a6b] mb-1">{report.persons_involved}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{report.description}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-gray-400">
                    {new Date(report.incident_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {school?.name && (
                    <span className="text-xs text-gray-400">{school.name}</span>
                  )}
                  {isAdmin && reporter?.full_name && (
                    <span className="text-xs text-gray-400">By: {reporter.full_name}</span>
                  )}
                </div>
              </Card>
            )
          })
        )}

      </div>
    </Layout>
  )
}
