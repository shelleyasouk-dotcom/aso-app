import { useState, useEffect } from 'react'
import { FileText, Download } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { SchoolLayout } from '../../components/layout/SchoolLayout'
import { Card } from '../../components/ui/Card'
import type { ImpactReport } from '../../types'

export function SchoolImpactReportsPage() {
  const { profile } = useAuth()
  const [reports, setReports] = useState<ImpactReport[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    if (!profile?.school_id) return
    supabase
      .from('impact_reports')
      .select('*')
      .eq('school_id', profile.school_id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReports(data ?? [])
        setLoading(false)
      })
  }, [profile?.school_id])

  async function downloadReport(report: ImpactReport) {
    setDownloading(report.id)
    const { data, error } = await supabase.storage
      .from('impact-reports')
      .createSignedUrl(report.file_path, 300)
    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
    setDownloading(null)
  }

  if (loading) {
    return (
      <SchoolLayout title="Impact Reports" showBack>
        <div className="px-4 pt-6 flex flex-col gap-4">
          {[1,2].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      </SchoolLayout>
    )
  }

  return (
    <SchoolLayout title="Impact Reports" showBack>
      <div className="px-4 pt-6 pb-4 flex flex-col gap-4">

        {reports.length === 0 ? (
          <Card className="text-center py-12">
            <FileText size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No reports yet</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
              Your impact report will appear here at the end of each term.
            </p>
          </Card>
        ) : (
          <>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
              {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
            </p>
            {reports.map(report => (
              <Card key={report.id} className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                  <FileText size={22} className="text-[#1a3a6b]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1a3a6b] text-sm truncate">{report.term_name}</p>
                  {report.sport && (
                    <p className="text-xs text-gray-500">{report.sport}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {report.generated_at
                      ? new Date(report.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                      : new Date(report.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    }
                  </p>
                </div>
                <button
                  onClick={() => downloadReport(report)}
                  disabled={downloading === report.id}
                  className="p-2.5 rounded-xl bg-[#1a3a6b] text-white hover:bg-[#1a3a6b]/90 active:bg-[#1a3a6b]/80 transition-colors disabled:opacity-50"
                  title="Download report"
                >
                  <Download size={18} />
                </button>
              </Card>
            ))}
          </>
        )}

      </div>
    </SchoolLayout>
  )
}
