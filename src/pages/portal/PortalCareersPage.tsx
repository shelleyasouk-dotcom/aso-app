import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Clock, Briefcase, ChevronRight, Filter, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { ShareFacebookButton } from '../../components/ui/ShareFacebookButton'

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CONTRACT_LABELS: Record<string, string> = {
  part_time: 'Part Time',
  full_time: 'Full Time',
  casual: 'Casual / Flexible',
  volunteer: 'Volunteer',
}

const CONTRACT_CHIP: Record<string, string> = {
  part_time: 'bg-blue-100 text-blue-700',
  full_time: 'bg-green-100 text-green-700',
  casual: 'bg-purple-100 text-purple-700',
  volunteer: 'bg-amber-100 text-amber-700',
}

const ROLE_LABELS: Record<string, string> = {
  coach: 'Sports Coach',
  lead_coach: 'Lead Coach',
  assistant: 'Assistant Coach',
  admin: 'Administration',
  other: 'Other',
}

function daysLeft(closesAt: string | null) {
  if (!closesAt) return null
  const diff = Math.ceil((new Date(closesAt).getTime() - Date.now()) / 86400000)
  if (diff < 0) return null
  if (diff === 0) return 'Closes today'
  if (diff === 1) return 'Closes tomorrow'
  return `${diff} days left`
}

// ─── Job card ─────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: JobAdvert }) {
  const navigate = useNavigate()
  const dl = daysLeft(job.closes_at)

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#1a3a6b] hover:shadow-md transition-all cursor-pointer group"
      onClick={() => navigate(`/portal/careers/${job.id}`)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base group-hover:text-[#1a3a6b] transition-colors leading-snug mb-1">
            {job.title}
          </h3>
          <p className="text-sm text-[#1a3a6b] font-medium">{ROLE_LABELS[job.role_type] ?? job.role_type}</p>
        </div>
        <ChevronRight size={18} className="text-gray-300 group-hover:text-[#1a3a6b] shrink-0 mt-1 transition-colors" />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CONTRACT_CHIP[job.contract_type] ?? 'bg-gray-100 text-gray-600'}`}>
          {CONTRACT_LABELS[job.contract_type] ?? job.contract_type}
        </span>
        {dl && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600">
            ⏰ {dl}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
          <MapPin size={13} className="shrink-0" />
          <span>{job.location}</span>
        </div>
        {job.hours_desc && (
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <Clock size={13} className="shrink-0" />
            <span>{job.hours_desc}</span>
          </div>
        )}
        {job.salary_desc && (
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <Briefcase size={13} className="shrink-0" />
            <span>{job.salary_desc}</span>
          </div>
        )}
      </div>

      <p className="text-gray-500 text-sm mt-3 leading-relaxed line-clamp-2">{job.description}</p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function PortalCareersPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState<JobAdvert[]>([])
  const [loading, setLoading] = useState(true)
  const [areas, setAreas] = useState<string[]>([])

  const search = searchParams.get('q') ?? ''
  const areaFilter = searchParams.get('area') ?? ''
  const contractFilter = searchParams.get('contract') ?? ''

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('job_adverts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      const list = (data as JobAdvert[]) ?? []
      setJobs(list)
      const uniqueAreas = [...new Set(list.map(j => j.area).filter(Boolean) as string[])].sort()
      setAreas(uniqueAreas)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || j.title.toLowerCase().includes(q)
      || j.location.toLowerCase().includes(q)
      || (j.area ?? '').toLowerCase().includes(q)
      || j.description.toLowerCase().includes(q)
    const matchArea = !areaFilter || j.area === areaFilter
    const matchContract = !contractFilter || j.contract_type === contractFilter
    return matchSearch && matchArea && matchContract
  })

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  return (
    <PortalLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] via-[#1e4a8c] to-[#142f58] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#f5c518]/20 text-[#f5c518] text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            <Briefcase size={14} />
            Join the ASO Team
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">Work With Us</h1>
          <p className="text-white/70 text-base leading-relaxed mb-8">
            Help inspire the next generation. We're always on the lookout for passionate coaches and staff to join our growing team across the UK.
          </p>

          {/* Search */}
          <form
            onSubmit={e => { e.preventDefault(); setParam('q', search) }}
            className="flex gap-2 max-w-xl mx-auto"
          >
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by role, location or area…"
                value={search}
                onChange={e => setParam('q', e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl text-gray-800 text-sm bg-white border-0 focus:outline-none focus:ring-2 focus:ring-[#f5c518]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#f5c518] text-[#1a3a6b] font-bold px-5 py-3 rounded-xl hover:bg-yellow-400 transition-colors text-sm whitespace-nowrap"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Coach pool CTA */}
      <section className="bg-[#f5c518]/10 border-b border-[#f5c518]/30 py-4 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-[#1a3a6b] shrink-0" />
            <div>
              <p className="font-bold text-[#1a3a6b] text-sm">No role fits? Join our Coach Pool</p>
              <p className="text-gray-600 text-xs">Register your interest and we'll contact you when suitable opportunities arise near you.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/portal/coach-pool')}
            className="shrink-0 inline-flex items-center gap-1.5 bg-[#1a3a6b] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#142f58] transition-colors"
          >
            Join the Pool <ChevronRight size={14} />
          </button>
        </div>
      </section>

      {/* Filters + listing */}
      <section className="max-w-5xl mx-auto px-4 py-10">

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <Filter size={14} />
            <span className="font-medium">Filter:</span>
          </div>

          {/* Area filter */}
          {areas.length > 0 && (
            <select
              value={areaFilter}
              onChange={e => setParam('area', e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#1a3a6b]"
            >
              <option value="">All areas</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          )}

          {/* Contract filter */}
          <select
            value={contractFilter}
            onChange={e => setParam('contract', e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#1a3a6b]"
          >
            <option value="">All contract types</option>
            {Object.entries(CONTRACT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          {(search || areaFilter || contractFilter) && (
            <button
              onClick={() => setSearchParams({})}
              className="text-sm text-gray-500 hover:text-gray-800 underline"
            >
              Clear filters
            </button>
          )}

          <span className="ml-auto text-sm text-gray-400">
            {filtered.length} {filtered.length === 1 ? 'vacancy' : 'vacancies'}
          </span>
        </div>

        {/* Job list */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading vacancies…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <Briefcase size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-700 mb-1">No vacancies found</p>
            <p className="text-gray-500 text-sm">
              {jobs.length === 0
                ? 'We have no open vacancies at the moment. Check back soon or join our coach pool to be the first to hear.'
                : 'Try adjusting your search or filters.'}
            </p>
            <button
              onClick={() => navigate('/portal/coach-pool')}
              className="mt-4 inline-flex items-center gap-1.5 bg-[#1a3a6b] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#142f58] transition-colors"
            >
              Join the Coach Pool <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </section>

      {/* Why work for ASO */}
      <section className="bg-[#1a3a6b] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Why Work for ASO?</h2>
          <p className="text-white/60 text-sm mb-8">We're a passionate, people-first organisation that invests in our coaches.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            {[
              { emoji: '🏅', title: 'Fully funded DBS', desc: 'We cover your DBS check so you can start straight away.' },
              { emoji: '📚', title: 'CPD & Training', desc: 'Regular training days and qualifications support.' },
              { emoji: '📍', title: 'Local Placements', desc: "Work near home — we'll match you to local schools." },
              { emoji: '💰', title: 'Competitive Pay', desc: 'Hourly rates that reflect your experience and qualifications.' },
              { emoji: '🤝', title: 'Supportive Team', desc: 'Dedicated area leads and a friendly national team.' },
              { emoji: '🏃', title: 'Make a Difference', desc: "Directly impact children's health and wellbeing every day." },
            ].map(item => (
              <div key={item.title} className="bg-white/10 rounded-2xl p-4 text-left">
                <div className="text-2xl mb-2">{item.emoji}</div>
                <p className="font-bold text-sm mb-1">{item.title}</p>
                <p className="text-white/60 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-white/50 text-xs">Know someone who'd be a great coach? Share these vacancies!</p>
            <ShareFacebookButton
              url="https://www.activeschool.org.uk/portal/careers"
              hashtag="ASOCareers"
              label="Share these vacancies"
            />
          </div>
        </div>
      </section>
    </PortalLayout>
  )
}
