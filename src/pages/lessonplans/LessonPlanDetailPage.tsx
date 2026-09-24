import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import {
  Target, Lightbulb, Users, Shield, BookMarked, ChevronDown, ChevronUp,
  Clock, CheckCircle, Dumbbell, Star, PartyPopper, TriangleAlert,
  Camera, X, Send, Edit2, Lock, GraduationCap, Download, Share2, Loader2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { SchoolPicker } from '../../components/SchoolPicker'
import { LESSON_PLANS } from '../../data/lessonPlans'
import type { SessionFeedback, School, AcademicSemester } from '../../types'
import type { WeeklyLessonPlan } from '../../data/lessonPlans'

async function downloadLessonPlanPDF(plan: WeeklyLessonPlan, semesterLabel: string) {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 14
  const contentW = pageW - margin * 2
  let y = 0

  const PRIMARY = '#1a3a6b'
  const ACCENT = '#f5c518'

  function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
  }

  function checkPage(needed = 10) {
    if (y + needed > pageH - 14) { pdf.addPage(); y = 20 }
  }

  function sectionHeader(title: string) {
    checkPage(12)
    const c = hexToRgb(PRIMARY)
    pdf.setFillColor(c.r, c.g, c.b)
    pdf.rect(margin, y, contentW, 7, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(255, 255, 255)
    pdf.text(title.toUpperCase(), margin + 3, y + 5)
    pdf.setTextColor(0, 0, 0)
    y += 11
  }

  function bullet(text: string, indent = margin + 3, prefix = '•') {
    checkPage(7)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8.5)
    pdf.setTextColor(55, 65, 81)
    const lines = pdf.splitTextToSize(`${prefix} ${text}`, contentW - (indent - margin) - 2)
    pdf.text(lines, indent, y)
    y += lines.length * 4.5
  }

  function bodyText(text: string, indent = margin) {
    checkPage(7)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8.5)
    pdf.setTextColor(55, 65, 81)
    const lines = pdf.splitTextToSize(text, contentW - (indent - margin))
    pdf.text(lines, indent, y)
    y += lines.length * 4.5
  }

  function label(text: string) {
    checkPage(6)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.setTextColor(107, 114, 128)
    pdf.text(text.toUpperCase(), margin, y)
    y += 5
  }

  function gap(n = 4) { y += n }

  // ── Header ─────────────────────────────────────────────────────────────────
  const hc = hexToRgb(PRIMARY)
  pdf.setFillColor(hc.r, hc.g, hc.b)
  pdf.rect(0, 0, pageW, 32, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(7)
  const ac = hexToRgb(ACCENT)
  pdf.setTextColor(ac.r, ac.g, ac.b)
  pdf.text('ACTIVE SCHOOL ORGANISATION', margin, 10)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(15)
  pdf.setTextColor(255, 255, 255)
  pdf.text(`Week ${plan.week} — ${plan.theme}`, margin, 20)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(255, 255, 255, 0.7)
  pdf.text(`${plan.focus}  ·  ${plan.duration}  ·  ${semesterLabel}`, margin, 27)
  y = 40

  // ── Session Overview ────────────────────────────────────────────────────────
  sectionHeader('Session Overview')
  for (const stage of plan.overview) {
    checkPage(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8.5)
    pdf.setTextColor(26, 58, 107)
    pdf.text(`${stage.stage}  (${stage.time})`, margin, y)
    y += 5
    bodyText(stage.description)
    if (stage.coachFocus) {
      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(8)
      pdf.setTextColor(107, 114, 128)
      const lines = pdf.splitTextToSize(stage.coachFocus, contentW)
      pdf.text(lines, margin, y)
      y += lines.length * 4.5
    }
    gap(3)
  }

  // ── Objectives ─────────────────────────────────────────────────────────────
  gap(2)
  sectionHeader('Session Objectives')
  for (const obj of plan.objectives) bullet(obj)
  gap(2)

  // ── Ability Guide ──────────────────────────────────────────────────────────
  if (plan.abilityGuide && plan.abilityGuide.length > 0) {
    sectionHeader('Ability Assessment Guide')
    for (const tier of plan.abilityGuide) {
      label(`${tier.label}  (${tier.ukagLevels})`)
      for (const ind of tier.indicators) bullet(ind, margin + 3)
      gap(2)
    }
  }

  // ── Skill Progressions ─────────────────────────────────────────────────────
  if (plan.skillProgressions && plan.skillProgressions.length > 0) {
    sectionHeader('Skill Progressions')
    for (const prog of plan.skillProgressions) {
      checkPage(10)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(26, 58, 107)
      pdf.text(prog.apparatus, margin, y); y += 5
      if (prog.beginner && prog.beginner.length > 0) { label('Beginner'); for (const s of prog.beginner) bullet(s) }
      if (prog.intermediate && prog.intermediate.length > 0) { label('Intermediate'); for (const s of prog.intermediate) bullet(s) }
      if (prog.advanced && prog.advanced.length > 0) { label('Advanced'); for (const s of prog.advanced) bullet(s) }
      if (!prog.beginner && prog.skills.length > 0) { for (const s of prog.skills) bullet(s) }
      if (prog.progression) { label('Pathway'); bodyText(prog.progression) }
      if (prog.coachingCues) { label('Coaching Cues'); bodyText(prog.coachingCues) }
      gap(3)
    }
  }

  // ── Skill Options ──────────────────────────────────────────────────────────
  if (plan.skillOptions && plan.skillOptions.length > 0) {
    sectionHeader('Skill Options (Choose 2–3)')
    for (const opt of plan.skillOptions) {
      checkPage(10)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(26, 58, 107)
      pdf.text(opt.apparatus, margin, y); y += 5
      for (const s of opt.skills) bullet(s)
      if (opt.progression) { label('Progression'); bodyText(opt.progression) }
      gap(3)
    }
  }

  // ── Circuit Ideas ──────────────────────────────────────────────────────────
  if (plan.circuitIdeas && plan.circuitIdeas.length > 0) {
    sectionHeader('Circuit Ideas')
    for (const circuit of plan.circuitIdeas) {
      checkPage(10)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(26, 58, 107)
      pdf.text(circuit.apparatus, margin, y); y += 5
      for (const s of circuit.skills) bullet(s)
      gap(3)
    }
  }

  // ── Wall Frame Safety ──────────────────────────────────────────────────────
  if (plan.wallFrameGuidance) {
    sectionHeader('Wall Frame Safety')
    for (const phase of ['before', 'during', 'after'] as const) {
      label(`${phase} Session`)
      for (const item of plan.wallFrameGuidance[phase]) bullet(item, margin + 3, '✓')
      gap(2)
    }
  }

  // ── Coaching Focus ─────────────────────────────────────────────────────────
  sectionHeader('Coaching Focus')
  for (const point of plan.coachingFocus) bullet(point)
  gap(2)

  // ── Assistant Roles ────────────────────────────────────────────────────────
  sectionHeader('Assistant Coach Roles')
  for (const role of plan.assistantRoles) {
    checkPage(8)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8.5)
    pdf.setTextColor(55, 65, 81)
    pdf.text(role.area, margin, y)
    const lines = pdf.splitTextToSize(role.responsibility, contentW - 40)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(107, 114, 128)
    pdf.text(lines, margin + 38, y)
    y += Math.max(lines.length * 4.5, 5)
    gap(1)
  }
  gap(2)

  // ── Safety Checklist ───────────────────────────────────────────────────────
  sectionHeader('Safety Checklist')
  for (const item of plan.safetyChecklist) bullet(item, margin + 3, '✓')
  gap(2)

  // ── Coaching Reminders ─────────────────────────────────────────────────────
  sectionHeader('Coaching Reminders')
  for (const r of plan.coachingReminders) bullet(r, margin + 3, '→')
  gap(2)

  // ── Footer ─────────────────────────────────────────────────────────────────
  const totalPages = (pdf as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)
    pdf.setTextColor(180, 180, 180)
    pdf.text('www.activeschool.org.uk', margin, pageH - 6)
    pdf.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 6, { align: 'right' })
    pdf.text('ASO Coaching Session Plan', pageW / 2, pageH - 6, { align: 'center' })
  }

  // ── Output ─────────────────────────────────────────────────────────────────
  const fileName = `ASO_Week${plan.week}_${plan.theme.replace(/\s+/g, '_')}_Session_Plan.pdf`
  const blob = pdf.output('blob')

  if (navigator.share && navigator.canShare) {
    const file = new File([blob], fileName, { type: 'application/pdf' })
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: `Week ${plan.week} Session Plan` })
      return
    }
  }
  const url = URL.createObjectURL(blob)
  const opened = window.open(url, '_blank')
  if (opened) { setTimeout(() => URL.revokeObjectURL(url), 10000); return }
  const a = document.createElement('a')
  a.href = url; a.download = fileName; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

function Section({
  icon: Icon, title, children, defaultOpen = false,
}: {
  icon: React.ElementType; title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <button className="w-full flex items-center justify-between px-4 py-3.5" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-2.5">
          <Icon size={16} className="text-gray-500 shrink-0" />
          <span className="font-bold text-gray-800 text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && <div className="border-t border-gray-100 px-4 pb-4 pt-3">{children}</div>}
    </div>
  )
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function LessonPlanDetailPage() {
  const { week: weekParam } = useParams<{ week: string }>()
  const [searchParams] = useSearchParams()
  const { profile } = useAuth()

  const weekNum = parseInt(weekParam ?? '1')
  const semId = searchParams.get('semId')
  const plan = LESSON_PLANS.find(p => p.week === weekNum)

  const navigate = useNavigate()

  const [semester, setSemester] = useState<AcademicSemester | null>(null)
  const [mySchools, setMySchools] = useState<School[]>([])
  const [allSchools, setAllSchools] = useState<School[]>([])
  const [existingCoachNote, setExistingCoachNote] = useState<SessionFeedback | null>(null)
  const [leadReports, setLeadReports] = useState<SessionFeedback[]>([])
  const [activeTab, setActiveTab] = useState<'plan' | 'note' | 'report'>('plan')
  const [editingNote, setEditingNote] = useState(false)
  const [editingReport, setEditingReport] = useState(false)
  const [editingReportId, setEditingReportId] = useState<string | null>(null)
  const [downloadingPDF, setDownloadingPDF] = useState(false)

  // Coach note form
  const [noteSchoolId, setNoteSchoolId] = useState('')
  const [noteText, setNoteText] = useState('')
  const [noteHighlights, setNoteHighlights] = useState('')
  const [noteChallenges, setNoteChallenges] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // Session report form
  const [reportSchoolId, setReportSchoolId] = useState('')
  const [reportDate, setReportDate] = useState(todayStr())
  const [skillsCovered, setSkillsCovered] = useState('')
  const [awardSignOffs, setAwardSignOffs] = useState('')
  const [reportHighlights, setReportHighlights] = useState('')
  const [reportChallenges, setReportChallenges] = useState('')
  const [reportPhotos, setReportPhotos] = useState<File[]>([])
  const [savingReport, setSavingReport] = useState(false)

  useEffect(() => {
    if (!profile) return
    async function load() {
      // Load semester
      let sem: AcademicSemester | null = null
      if (semId) {
        const { data } = await supabase.from('academic_semesters').select('*').eq('id', semId).single()
        sem = data as AcademicSemester
      } else {
        // Fallback: load current semester
        const { data } = await supabase.from('academic_semesters').select('*').eq('is_current', true).single()
        sem = data as AcademicSemester
      }
      setSemester(sem)

      // Load schools — area leads/directors get all schools in their area
      let schools: School[] = []
      if (profile!.role === 'director') {
        const { data } = await supabase.from('schools').select('*').order('name')
        schools = (data ?? []) as School[]
      } else if (profile!.role === 'area_lead') {
        const { data } = await supabase.from('schools').select('*').eq('area', profile!.area).order('name')
        schools = (data ?? []) as School[]
      } else {
        const { data: assignments } = await supabase
          .from('staff_school_assignments')
          .select('school_id, schools(*)')
          .eq('staff_id', profile!.id)
        schools = (assignments ?? []).map((a: any) => a.schools).filter(Boolean) as School[]
      }
      setMySchools(schools)
      if (schools.length === 1) setNoteSchoolId(schools[0].id)

      // Session reports can be filed for ANY school, by anybody — load the full list to search
      const { data: everySchool } = await supabase.from('schools').select('*').order('name')
      setAllSchools((everySchool ?? []) as School[])

      if (sem) {
        const { data: feedback } = await supabase
          .from('session_feedback').select('*')
          .eq('coach_id', profile!.id)
          .eq('semester_number', sem.semester_number)
          .eq('academic_year', sem.academic_year)
          .eq('week_number', weekNum)
        const leads: SessionFeedback[] = []
        for (const row of feedback ?? []) {
          if (row.feedback_type === 'lead') leads.push(row as SessionFeedback)
          else setExistingCoachNote(row as SessionFeedback)
        }
        setLeadReports(leads)
      }
    }
    load()
  }, [profile, semId, weekNum])

  async function submitNote() {
    if (!profile || !noteSchoolId || !semester) return
    setSavingNote(true)
    try {
      const payload = {
        semester_number: semester.semester_number, week_number: weekNum,
        academic_year: semester.academic_year,
        school_id: noteSchoolId, coach_id: profile.id,
        feedback_type: 'coach',
        overall_notes: noteText || null, highlights: noteHighlights || null, challenges: noteChallenges || null,
        days_worked: [], session_dates: [], skills_covered: [], award_sign_offs: null, photos: [],
      }
      if (existingCoachNote && editingNote) {
        await supabase.from('session_feedback').update(payload).eq('id', existingCoachNote.id)
      } else {
        await supabase.from('session_feedback').insert(payload)
      }
      const { data } = await supabase.from('session_feedback').select('*')
        .eq('coach_id', profile.id).eq('semester_number', semester.semester_number)
        .eq('academic_year', semester.academic_year)
        .eq('week_number', weekNum).eq('feedback_type', 'coach').single()
      setExistingCoachNote(data as SessionFeedback)
      setEditingNote(false)
      setActiveTab('plan')
    } finally { setSavingNote(false) }
  }

  function startNewReport() {
    setEditingReportId(null)
    setReportSchoolId('')
    setReportDate(todayStr())
    setSkillsCovered(''); setAwardSignOffs(''); setReportHighlights(''); setReportChallenges(''); setReportPhotos([])
    setEditingReport(true)
  }

  function startEditReport(report: SessionFeedback) {
    setEditingReportId(report.id)
    setReportSchoolId(report.school_id)
    setReportDate((report.session_dates ?? [])[0] ?? todayStr())
    setSkillsCovered((report.skills_covered ?? []).join('\n'))
    setAwardSignOffs(report.award_sign_offs ?? '')
    setReportHighlights(report.highlights ?? '')
    setReportChallenges(report.challenges ?? '')
    setReportPhotos([])
    setEditingReport(true)
  }

  async function submitReport() {
    if (!profile || !reportSchoolId || !reportDate || !semester) return
    setSavingReport(true)
    try {
      const dayName = new Date(reportDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long' })
      const payload = {
        semester_number: semester.semester_number, week_number: weekNum,
        academic_year: semester.academic_year,
        school_id: reportSchoolId, coach_id: profile.id,
        feedback_type: 'lead',
        days_worked: [dayName],
        session_dates: [reportDate],
        skills_covered: skillsCovered.split('\n').map(s => s.trim()).filter(Boolean),
        award_sign_offs: awardSignOffs || null,
        highlights: reportHighlights || null, challenges: reportChallenges || null,
        overall_notes: null, photos: [],
      }
      let reportId: string
      const editingExisting = editingReportId ? leadReports.find(r => r.id === editingReportId) : null
      if (editingExisting) {
        await supabase.from('session_feedback').update(payload).eq('id', editingExisting.id)
        reportId = editingExisting.id
      } else {
        const { data } = await supabase.from('session_feedback').insert(payload).select('id').single()
        reportId = data!.id
      }
      const photoUrls: string[] = []
      for (const file of reportPhotos) {
        const ext = file.name.split('.').pop()
        const path = `feedback/${reportId}/${Date.now()}.${ext}`
        const { data: up } = await supabase.storage.from('coach-files').upload(path, file, { upsert: true })
        if (up) {
          const { data: urlData } = supabase.storage.from('coach-files').getPublicUrl(up.path)
          photoUrls.push(urlData.publicUrl)
        }
      }
      if (photoUrls.length > 0) {
        const existing = editingExisting?.photos ?? []
        await supabase.from('session_feedback').update({ photos: [...existing, ...photoUrls] }).eq('id', reportId)
      }
      const { data } = await supabase.from('session_feedback').select('*').eq('id', reportId).single()
      const savedReport = data as SessionFeedback
      setLeadReports(prev => editingExisting
        ? prev.map(r => r.id === reportId ? savedReport : r)
        : [savedReport, ...prev])
      setEditingReport(false); setEditingReportId(null); setReportPhotos([])

      // Notify area leads and directors on new submissions only (not edits)
      if (!editingExisting) {
        const schoolName = allSchools.find(s => s.id === reportSchoolId)?.name ?? 'school'
        const { data: leaders } = await supabase
          .from('profiles').select('id')
          .in('role', ['area_lead', 'director'])
          .neq('id', profile.id)
        if ((leaders ?? []).length > 0) {
          await supabase.from('notifications').insert(
            (leaders ?? []).map((l: { id: string }) => ({
              user_id: l.id,
              title: `Session report from ${profile.full_name}`,
              body: `${schoolName} · ${dayName} ${reportDate}`,
              type: 'week_report',
              related_id: reportId,
            }))
          )
        }
      }
    } finally { setSavingReport(false) }
  }

  if (!plan) {
    return <Layout title="Not Found" showBack><p className="text-center text-gray-400 py-16">Week not found.</p></Layout>
  }

  const isArchived = semester?.is_archived ?? false
  const showNoteForm = activeTab === 'note' && !isArchived && (!existingCoachNote || editingNote)
  const showReportForm = activeTab === 'report' && !isArchived && editingReport

  return (
    <Layout title={`Week ${plan.week}`} showBack>
      <div className="pb-12 flex flex-col gap-4">

        {/* Header */}
        <div className={`bg-gradient-to-br ${plan.headerGradient} text-white px-4 pt-4 pb-6`}>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <p className={`text-xs font-extrabold uppercase tracking-widest ${plan.accentText} mb-1`}>
                {semester ? `${semester.label ?? `Semester ${semester.semester_number}`} · ${semester.academic_year}` : ''} · Week {plan.week}
              </p>
              <h1 className="text-2xl font-extrabold leading-tight">{plan.theme}</h1>
              <p className="text-white/70 text-sm mt-1">{plan.focus}</p>
            </div>
            <span className="text-4xl shrink-0">{plan.emoji}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="flex items-center gap-1 text-xs text-white/60">
              <Clock size={11} /> {plan.duration}
            </span>
            <button
              onClick={async () => {
                setDownloadingPDF(true)
                const semLabel = semester
                  ? `${semester.label ?? `Semester ${semester.semester_number}`} · ${semester.academic_year}`
                  : 'Session Plan'
                await downloadLessonPlanPDF(plan, semLabel).catch(console.error)
                setDownloadingPDF(false)
              }}
              disabled={downloadingPDF}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-60"
            >
              {downloadingPDF
                ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
                : typeof navigator !== 'undefined' && !!navigator.share
                ? <><Share2 size={13} /> Save / Share PDF</>
                : <><Download size={13} /> Download PDF</>
              }
            </button>
          </div>
        </div>

        {/* Archived notice */}
        {isArchived && (
          <div className="px-4">
            <div className="flex items-center gap-2.5 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3">
              <Lock size={15} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-600">Archived semester</p>
                <p className="text-xs text-gray-400">This semester is read-only. You can view submitted feedback but cannot add new entries.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="px-4">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {([
              { id: 'plan', label: 'Session Plan' },
              { id: 'note', label: existingCoachNote ? '✓ My Note' : 'My Note' },
              { id: 'report', label: leadReports.length > 0 ? `✓ Session Reports (${leadReports.length})` : 'Session Report' },
            ] as { id: 'plan' | 'note' | 'report'; label: string }[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === tab.id ? 'bg-white text-[#1a3a6b] shadow-sm' : 'text-gray-500'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── PLAN TAB ── */}
        {activeTab === 'plan' && (
          <div className="px-4 flex flex-col gap-3">

            <Section icon={Clock} title="Session Overview" defaultOpen>
              <div className="flex flex-col gap-3">
                {plan.overview.map(stage => (
                  <div key={stage.stage} className="flex gap-3">
                    <div className="w-1 rounded-full bg-gray-200 shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800 text-sm">{stage.stage}</span>
                        <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{stage.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{stage.description}</p>
                      <p className="text-xs text-gray-400 italic mt-0.5">{stage.coachFocus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={Target} title="Session Objectives" defaultOpen>
              <div className="flex flex-col gap-2">
                {plan.objectives.map(obj => (
                  <div key={obj} className="flex items-start gap-2.5">
                    <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 leading-snug">{obj}</p>
                  </div>
                ))}
              </div>
            </Section>

            {plan.abilityGuide && plan.abilityGuide.length > 0 && (
              <Section icon={GraduationCap} title="Ability Assessment Guide" defaultOpen>
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Use these indicators to place children into the right ability group. Tap a level badge to open the UKAG Library.
                  </p>
                  {plan.abilityGuide.map(tier => {
                    const c = tier.label === 'Beginner'
                      ? { dot: 'bg-green-500', title: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800' }
                      : tier.label === 'Intermediate'
                      ? { dot: 'bg-amber-500', title: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800' }
                      : { dot: 'bg-violet-500', title: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-800' }
                    return (
                      <div key={tier.label} className={`${c.bg} border ${c.border} rounded-xl p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${c.dot} shrink-0`} />
                            <span className={`font-extrabold text-sm ${c.title}`}>{tier.label}</span>
                          </div>
                          <button
                            onClick={() => navigate(`/ukag/${tier.ukagLevelNums[0]}`)}
                            className={`text-[10px] font-bold ${c.badge} px-2 py-1 rounded-full`}
                          >
                            {tier.ukagLevels} →
                          </button>
                        </div>
                        <div className="flex flex-col gap-1">
                          {tier.indicators.map((ind, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-gray-400 text-xs mt-0.5 shrink-0">•</span>
                              <p className="text-xs text-gray-700 leading-snug">{ind}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {plan.skillProgressions && plan.skillProgressions.length > 0 && (
              <Section icon={Dumbbell} title="Skill Progressions" defaultOpen>
                <div className="flex flex-col gap-4">
                  {plan.skillProgressions.map(prog => {
                    const hasTiers = (prog.beginner && prog.beginner.length > 0) || (prog.intermediate && prog.intermediate.length > 0) || (prog.advanced && prog.advanced.length > 0)
                    const tiers = [
                      { key: 'beginner', label: 'Beginner', items: prog.beginner ?? [], dot: 'bg-green-500', title: 'text-green-700', divider: 'border-green-200/60' },
                      { key: 'intermediate', label: 'Intermediate', items: prog.intermediate ?? [], dot: 'bg-amber-500', title: 'text-amber-700', divider: 'border-amber-200/60' },
                      { key: 'advanced', label: 'Advanced', items: prog.advanced ?? [], dot: 'bg-violet-500', title: 'text-violet-700', divider: 'border-violet-200/60' },
                    ]
                    return (
                      <div key={prog.apparatus} className={`${plan.cardBg} border ${plan.cardBorder} rounded-xl p-3`}>
                        <p className={`font-extrabold text-sm ${plan.cardText} mb-2`}>{prog.apparatus}</p>
                        {hasTiers ? (
                          <div className="flex flex-col gap-2.5">
                            {tiers.filter(t => t.items.length > 0).map((t, ti, arr) => (
                              <div key={t.key} className={ti < arr.length - 1 ? `pb-2.5 border-b ${t.divider}` : ''}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <span className={`w-2 h-2 rounded-full ${t.dot} shrink-0`} />
                                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${t.title}`}>{t.label}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  {t.items.map((skill, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <span className="text-gray-400 text-xs mt-0.5 shrink-0">•</span>
                                      <p className="text-xs text-gray-700 leading-snug">{skill}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5 mb-2">
                            {prog.skills.map((skill, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-white border border-gray-200 text-[9px] font-bold text-gray-500 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                <p className="text-xs text-gray-700 leading-snug">{skill}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {(prog.progression || prog.coachingCues || prog.awardLink) && (
                          <div className="border-t border-white/60 pt-2 flex flex-col gap-1 mt-2">
                            {prog.progression && <>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Pathway</p>
                              <p className="text-xs text-gray-600">{prog.progression}</p>
                            </>}
                            {prog.coachingCues && <p className={`text-xs font-semibold italic mt-1 ${plan.cardText}`}>{prog.coachingCues}</p>}
                            {prog.awardLink && <p className="text-[10px] font-bold text-gray-400 mt-1">🏅 {prog.awardLink}</p>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {plan.skillOptions && plan.skillOptions.length > 0 && (
              <Section icon={Star} title="Skill Options (Choose 2–3)" defaultOpen>
                <div className="flex flex-col gap-4">
                  {plan.skillOptions.map(opt => (
                    <div key={opt.apparatus} className={`${plan.cardBg} border ${plan.cardBorder} rounded-xl p-3`}>
                      <p className={`font-extrabold text-sm ${plan.cardText} mb-2`}>{opt.apparatus}</p>
                      <div className="flex flex-col gap-1.5 mb-2">
                        {opt.skills.map((skill, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-white border border-gray-200 text-[9px] font-bold text-gray-500 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                            <p className="text-xs text-gray-700 leading-snug">{skill}</p>
                          </div>
                        ))}
                      </div>
                      {opt.progression && (
                        <div className="border-t border-white/60 pt-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Progression</p>
                          <p className="text-xs text-gray-600">{opt.progression}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {plan.circuitIdeas && plan.circuitIdeas.length > 0 && (
              <Section icon={PartyPopper} title="Circuit Ideas" defaultOpen>
                <div className="flex flex-col gap-4">
                  {plan.circuitIdeas.map(circuit => (
                    <div key={circuit.apparatus} className={`${plan.cardBg} border ${plan.cardBorder} rounded-xl p-3`}>
                      <p className={`font-extrabold text-sm ${plan.cardText} mb-2`}>{circuit.apparatus}</p>
                      <div className="flex flex-col gap-1">
                        {circuit.skills.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-gray-400 text-xs mt-0.5">•</span>
                            <p className="text-xs text-gray-700 leading-snug">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {plan.wallFrameGuidance && (
              <Section icon={TriangleAlert} title="Wall Frame Safety" defaultOpen>
                <div className="flex flex-col gap-3">
                  {(['before', 'during', 'after'] as const).map(phase => (
                    <div key={phase}>
                      <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1.5 capitalize">{phase} Session</p>
                      <div className="flex flex-col gap-1">
                        {plan.wallFrameGuidance![phase].map(item => (
                          <div key={item} className="flex items-start gap-2">
                            <CheckCircle size={13} className="text-green-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-700 leading-snug">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {plan.assessmentRows && plan.assessmentRows.length > 0 && (
              <Section icon={CheckCircle} title="Assessment Recording Guide">
                <div className="flex flex-col gap-2">
                  {plan.assessmentRows.map(row => (
                    <div key={row.skill} className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-700">{row.skill}</p>
                        <p className="text-[10px] text-gray-400">{row.note}</p>
                      </div>
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full self-start">Level {row.level}</span>
                    </div>
                  ))}
                  {plan.assessmentTip && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1">
                      💡 {plan.assessmentTip}
                    </p>
                  )}
                </div>
              </Section>
            )}

            {plan.celebrations && plan.celebrations.length > 0 && (
              <Section icon={PartyPopper} title="Celebrations & Recognition">
                <div className="flex flex-wrap gap-2">
                  {plan.celebrations.map(c => (
                    <span key={c} className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
                  ))}
                </div>
              </Section>
            )}

            <Section icon={Lightbulb} title="Coaching Focus">
              <div className="flex flex-col gap-2">
                {plan.coachingFocus.map(point => (
                  <div key={point} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0 mt-2" />
                    <p className="text-sm text-gray-700 leading-snug">{point}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={Users} title="Assistant Coach Roles">
              <div className="flex flex-col gap-2">
                {plan.assistantRoles.map(role => (
                  <div key={role.area} className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
                    <p className="text-xs font-bold text-gray-600 w-24 shrink-0">{role.area}</p>
                    <p className="text-xs text-gray-500 leading-relaxed flex-1">{role.responsibility}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={Shield} title="Safety Checklist">
              <div className="flex flex-col gap-2">
                {plan.safetyChecklist.map(item => (
                  <div key={item} className="flex items-start gap-2.5">
                    <span className="text-green-500 text-base leading-none shrink-0">✅</span>
                    <p className="text-sm text-gray-700 leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={BookMarked} title="Coaching Reminders">
              <div className="flex flex-col gap-2">
                {plan.coachingReminders.map(r => (
                  <div key={r} className="flex items-start gap-2.5">
                    <span className="text-[#f5c518] text-base leading-none shrink-0">🔖</span>
                    <p className="text-sm text-gray-700 leading-snug">{r}</p>
                  </div>
                ))}
              </div>
            </Section>

          </div>
        )}

        {/* ── MY NOTE TAB ── */}
        {activeTab === 'note' && (
          <div className="px-4 flex flex-col gap-4">
            {existingCoachNote && !editingNote ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-gray-800">Your Session Note</p>
                  <button
                    onClick={() => { setNoteText(existingCoachNote.overall_notes ?? ''); setNoteHighlights(existingCoachNote.highlights ?? ''); setNoteChallenges(existingCoachNote.challenges ?? ''); setEditingNote(true) }}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#1a3a6b] bg-[#1a3a6b]/10 px-3 py-1.5 rounded-full"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3">
                  {existingCoachNote.overall_notes && <div><p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Notes</p><p className="text-sm text-gray-700 leading-relaxed">{existingCoachNote.overall_notes}</p></div>}
                  {existingCoachNote.highlights && <div><p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Highlights</p><p className="text-sm text-gray-700 leading-relaxed">{existingCoachNote.highlights}</p></div>}
                  {existingCoachNote.challenges && <div><p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Challenges</p><p className="text-sm text-gray-700 leading-relaxed">{existingCoachNote.challenges}</p></div>}
                  <p className="text-[10px] text-gray-400">Submitted {new Date(existingCoachNote.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            ) : showNoteForm && (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-extrabold text-gray-800">{editingNote ? 'Edit Note' : 'Leave a Session Note'}</p>
                  <p className="text-sm text-gray-500 mt-0.5">A quick observation after your session — highlights, concerns, or how the group went.</p>
                </div>
                {mySchools.length > 1 && (
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">School</label>
                    <select value={noteSchoolId} onChange={e => setNoteSchoolId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
                      <option value="">Select school…</option>
                      {mySchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}
                {[
                  { label: 'Session notes', value: noteText, set: setNoteText, placeholder: 'How did the session go?', rows: 3 },
                  { label: 'Highlights', value: noteHighlights, set: setNoteHighlights, placeholder: 'Any standout moments or progress?', rows: 2 },
                  { label: 'Challenges or concerns', value: noteChallenges, set: setNoteChallenges, placeholder: 'Anything that needs follow-up?', rows: 2 },
                ].map(field => (
                  <div key={field.label}>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">{field.label}</label>
                    <textarea value={field.value} onChange={e => field.set(e.target.value)} placeholder={field.placeholder} rows={field.rows} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none" />
                  </div>
                ))}
                <div className="flex gap-2">
                  {editingNote && <button onClick={() => setEditingNote(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold text-sm py-3 rounded-2xl">Cancel</button>}
                  {mySchools.length === 0
                    ? <p className="w-full text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl py-3 px-4">You don't have a school assigned yet — ask your area lead to add you to a school.</p>
                    : <button onClick={submitNote} disabled={savingNote || !noteSchoolId} className="flex-1 bg-[#1a3a6b] text-white font-bold text-sm py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50">
                        <Send size={14} /> {savingNote ? 'Saving…' : editingNote ? 'Save changes' : 'Submit note'}
                      </button>
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SESSION REPORT TAB ── */}
        {activeTab === 'report' && (
          <div className="px-4 flex flex-col gap-4">
            {!showReportForm ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-gray-800">Session Reports</p>
                  {!isArchived && (
                    <button
                      onClick={startNewReport}
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#1a3a6b] px-3 py-1.5 rounded-full"
                    >
                      + Add Session Report
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500 -mt-1.5">
                  Anybody can file a session report for any school — add one for each session you deliver this week.
                </p>

                {leadReports.length === 0 ? (
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-sm text-gray-400">
                    No session reports filed for this week yet.
                  </div>
                ) : (
                  leadReports.map(report => {
                    const schoolName = allSchools.find(s => s.id === report.school_id)?.name ?? mySchools.find(s => s.id === report.school_id)?.name ?? 'Unknown school'
                    const date = (report.session_dates ?? [])[0]
                    return (
                      <div key={report.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{schoolName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {date ? new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }) : (report.days_worked ?? []).join(', ')}
                            </p>
                          </div>
                          <button
                            onClick={() => startEditReport(report)}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#1a3a6b] bg-[#1a3a6b]/10 px-3 py-1.5 rounded-full shrink-0"
                          >
                            <Edit2 size={11} /> Edit
                          </button>
                        </div>
                        {report.skills_covered.length > 0 && (
                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Skills Covered</p>
                            {report.skills_covered.map(s => <p key={s} className="text-sm text-gray-700">· {s}</p>)}
                          </div>
                        )}
                        {report.award_sign_offs && <div><p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Award Sign-offs</p><p className="text-sm text-gray-700">{report.award_sign_offs}</p></div>}
                        {report.highlights && <div><p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Highlights</p><p className="text-sm text-gray-700">{report.highlights}</p></div>}
                        {report.challenges && <div><p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Challenges</p><p className="text-sm text-gray-700">{report.challenges}</p></div>}
                        {report.photos.length > 0 && (
                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1.5">Photos</p>
                            <div className="grid grid-cols-3 gap-2">{report.photos.map(url => <img key={url} src={url} alt="" className="w-full aspect-square object-cover rounded-xl" />)}</div>
                          </div>
                        )}
                        <p className="text-[10px] text-gray-400">Submitted {new Date(report.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    )
                  })
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-extrabold text-gray-800">{editingReportId ? 'Edit Session Report' : 'New Session Report'}</p>
                  <p className="text-sm text-gray-500 mt-0.5">One report per session — file a separate one for each school you work at this week.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1.5">School</label>
                  <SchoolPicker
                    schools={allSchools}
                    mySchoolIds={new Set(mySchools.map(s => s.id))}
                    value={reportSchoolId}
                    onChange={setReportSchoolId}
                    placeholder="Search for a school…"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Date</label>
                    <input
                      type="date"
                      value={reportDate}
                      max={todayStr()}
                      onChange={e => setReportDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Day</label>
                    <div className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-500">
                      {reportDate ? new Date(reportDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long' }) : '—'}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1.5">Skills covered (one per line)</label>
                  <textarea value={skillsCovered} onChange={e => setSkillsCovered(e.target.value)} placeholder={'Forward rolls\nT-balance on beam\nStraight jumps + landing'} rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1.5">Award sign-offs completed</label>
                  <textarea value={awardSignOffs} onChange={e => setAwardSignOffs(e.target.value)} placeholder="Names and skills signed off, or 'none this session'" rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none" />
                </div>
                {[
                  { label: 'Highlights', value: reportHighlights, set: setReportHighlights, placeholder: 'What went really well?' },
                  { label: 'Challenges or follow-up needed', value: reportChallenges, set: setReportChallenges, placeholder: 'Anything your area lead needs to know about?' },
                ].map(field => (
                  <div key={field.label}>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">{field.label}</label>
                    <textarea value={field.value} onChange={e => field.set(e.target.value)} placeholder={field.placeholder} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-2">Session photos (optional)</label>
                  <label className="flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-3 cursor-pointer hover:border-gray-300 transition-colors">
                    <Camera size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-400">Add photos</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => setReportPhotos(prev => [...prev, ...Array.from(e.target.files ?? [])])} />
                  </label>
                  {reportPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {reportPhotos.map((file, i) => (
                        <div key={i} className="relative">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full aspect-square object-cover rounded-xl" />
                          <button onClick={() => setReportPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center"><X size={10} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingReport(false); setEditingReportId(null) }} className="flex-1 border border-gray-200 text-gray-600 font-bold text-sm py-3 rounded-2xl">Cancel</button>
                  <button onClick={submitReport} disabled={savingReport || !reportSchoolId || !reportDate} className="flex-1 bg-[#1a3a6b] text-white font-bold text-sm py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50">
                    <Send size={14} /> {savingReport ? 'Saving…' : editingReportId ? 'Save report' : 'Submit report'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </Layout>
  )
}
