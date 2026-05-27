import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, Clock, Briefcase, ArrowLeft, CheckCircle, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'

interface JobAdvert {
  id: string
  title: string
  role_type: string
  location: string
  area: string | null
  contract_type: string
  hours_desc: string | null
  salary_desc: string | null
  description: string
  requirements: string | null
  closes_at: string | null
  created_at: string
}

const CONTRACT_LABELS: Record<string, string> = {
  part_time: 'Part Time',
  full_time: 'Full Time',
  casual: 'Casual / Flexible',
  volunteer: 'Volunteer',
}

const ROLE_LABELS: Record<string, string> = {
  coach: 'Sports Coach',
  lead_coach: 'Lead Coach',
  assistant: 'Assistant Coach',
  admin: 'Administration',
  other: 'Other',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function PortalCareerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<JobAdvert | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase
      .from('job_adverts')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setJob(data as JobAdvert)
        else setNotFound(true)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
        </div>
      </PortalLayout>
    )
  }

  if (notFound || !job) {
    return (
      <PortalLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Briefcase size={40} className="text-gray-300 mx-auto mb-4" />
          <h2 className="font-bold text-gray-800 text-xl mb-2">Vacancy not found</h2>
          <p className="text-gray-500 text-sm mb-6">This vacancy may have been filled or removed.</p>
          <button
            onClick={() => navigate('/portal/careers')}
            className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#142f58] transition-colors"
          >
            <ArrowLeft size={14} />
            View all vacancies
          </button>
        </div>
      </PortalLayout>
    )
  }

  const requirements = job.requirements
    ? job.requirements.split('\n').filter(line => line.trim())
    : []

  return (
    <PortalLayout>
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Back */}
        <button
          onClick={() => navigate('/portal/careers')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a3a6b] text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={15} />
          All vacancies
        </button>

        {/* Header card */}
        <div className="bg-[#1a3a6b] text-white rounded-2xl p-6 mb-6">
          <p className="text-[#f5c518] text-sm font-semibold mb-1">{ROLE_LABELS[job.role_type] ?? job.role_type}</p>
          <h1 className="text-2xl font-extrabold mb-4">{job.title}</h1>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-white/70 text-sm">
              <MapPin size={14} />
              {job.location}
            </div>
            {job.hours_desc && (
              <div className="flex items-center gap-1.5 text-white/70 text-sm">
                <Clock size={14} />
                {job.hours_desc}
              </div>
            )}
            {job.salary_desc && (
              <div className="flex items-center gap-1.5 text-white/70 text-sm">
                <Briefcase size={14} />
                {job.salary_desc}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">
              {CONTRACT_LABELS[job.contract_type] ?? job.contract_type}
            </span>
            {job.closes_at && (
              <span className="text-xs font-semibold bg-red-500/80 text-white px-3 py-1 rounded-full">
                Closes {fmtDate(job.closes_at)}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <h2 className="font-bold text-[#1a3a6b] text-base mb-3">About the Role</h2>
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {job.description}
          </div>
        </div>

        {/* Requirements */}
        {requirements.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-[#1a3a6b] text-base mb-3">Requirements &amp; Experience</h2>
            <ul className="flex flex-col gap-2">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                  {req.replace(/^[-•*]\s*/, '')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Apply CTA */}
        <div className="bg-[#f5c518]/10 border border-[#f5c518]/40 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-[#1a3a6b] text-lg mb-2">Ready to apply?</h3>
          <p className="text-gray-500 text-sm mb-5">
            Complete our short application form — it takes less than 5 minutes. No account required.
          </p>
          <button
            onClick={() => navigate(`/portal/careers/${job.id}/apply`)}
            className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#142f58] transition-colors text-sm"
          >
            Apply Now <ChevronRight size={15} />
          </button>
        </div>

      </div>
    </PortalLayout>
  )
}
