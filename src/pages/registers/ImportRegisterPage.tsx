import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, CheckCircle, AlertTriangle, Loader2, Calendar, Users, School } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

interface WixChild {
  fullName: string
  dob: string | null
  school: string
  yearGroup: string
  additionalNeeds: string
  parentName: string
  contactEmail: string
  contactPhone: string
}

interface ParsedData {
  children: WixChild[]
  suggestedSchool: string
}

interface DbSchool {
  id: string
  name: string
}

// Extract a form field value from a Wix CSV row
// Header row has "Form Field N" / "Form Response N" columns
// Data rows fill those columns with the actual field name and value
function getFormValue(headers: string[], row: string[], fieldName: string): string {
  for (let i = 0; i < headers.length - 1; i++) {
    if (/^Form Field \d+$/.test(headers[i])) {
      if (row[i]?.trim().toLowerCase() === fieldName.toLowerCase()) {
        if (/^Form Response \d+$/.test(headers[i + 1])) {
          return row[i + 1]?.trim() ?? ''
        }
      }
    }
  }
  return ''
}

// Normalise DOB to ISO YYYY-MM-DD
function parseDob(raw: string): string | null {
  if (!raw) return null
  raw = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split('/')
    return `${y}-${m}-${d}`
  }
  const months: Record<string, string> = {
    jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',
    jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12',
  }
  const m = raw.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i)
  if (m) {
    const mon = months[m[2].toLowerCase().slice(0, 3)]
    if (mon) return `${m[3]}-${mon}-${m[1].padStart(2, '0')}`
  }
  return null
}

// Parse Wix CSV text into WixChild records
function parseWixCsv(text: string): WixChild[] {
  const rows: string[][] = []
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    const row: string[] = []
    let cur = '', inQ = false
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ }
      else if (ch === ',' && !inQ) { row.push(cur); cur = '' }
      else { cur += ch }
    }
    row.push(cur)
    rows.push(row)
  }
  if (rows.length < 2) return []

  const headers = rows[0]
  const children: WixChild[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row.length < 5) continue
    const fullName = getFormValue(headers, row, "Child's Full Name")
    if (!fullName) continue
    const dob = getFormValue(headers, row, "Child's Date of Birth")
    const school = getFormValue(headers, row, 'School')
    const yearGroup = getFormValue(headers, row, 'Year group/Class')
    const needsRaw = getFormValue(headers, row, "Does your child have any additional needs or support requirements?")
    const parentName = getFormValue(headers, row, 'Parent / Guardian Full Name')
    const contactEmail = row[3]?.trim() ?? ''
    const contactPhone = row[4]?.trim() ?? ''
    children.push({
      fullName,
      dob: parseDob(dob),
      school,
      yearGroup,
      additionalNeeds: needsRaw.toLowerCase() === 'no' ? '' : needsRaw,
      parentName,
      contactEmail,
      contactPhone,
    })
  }
  return children
}

// Parse school name and start date from Wix filename
// e.g. ParticipantsOverton_Mon_325425pm_Gym_Jun26Monday_June_1_at_3_25_PM.csv
function parseFilename(filename: string): { school: string; startDate: string | null } {
  const base = filename.replace(/\.csv$/i, '').replace(/^Participants/, '')
  const school = base.split('_')[0] ?? ''
  const monthMap: Record<string, string> = {
    Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',
    Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12',
  }
  let startDate: string | null = null
  for (const part of base.split('_')) {
    const m = part.match(/([A-Z][a-z]{2})(\d{1,2})/)
    if (m && monthMap[m[1]]) {
      const year = new Date().getFullYear()
      startDate = `${year}-${monthMap[m[1]]}-${m[2].padStart(2, '0')}`
      break
    }
  }
  return { school, startDate }
}

// Generate N weekly ISO dates from a start date
function weeklyDates(start: string, weeks: number): string[] {
  const dates: string[] = []
  const d = new Date(start)
  for (let i = 0; i < weeks; i++) {
    const copy = new Date(d)
    copy.setDate(d.getDate() + i * 7)
    dates.push(copy.toISOString().split('T')[0])
  }
  return dates
}

// Normalise school name from CSV for fuzzy matching
function normaliseSchool(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim()
}

// Score how well a school name matches a query
function schoolScore(schoolName: string, query: string): number {
  const sn = normaliseSchool(schoolName)
  const q = normaliseSchool(query)
  if (sn === q) return 100
  if (sn.includes(q) || q.includes(sn)) return 80
  const words = q.split(' ').filter(Boolean)
  const matches = words.filter(w => sn.includes(w))
  return Math.round((matches.length / words.length) * 60)
}

export function ImportRegisterPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<'upload' | 'review' | 'importing' | 'done'>('upload')
  const [error, setError] = useState('')
  const [parsed, setParsed] = useState<ParsedData | null>(null)
  const [schools, setSchools] = useState<DbSchool[]>([])
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [numWeeks, setNumWeeks] = useState(6)
  const [result, setResult] = useState<{ children: number; sessions: number; entries: number } | null>(null)

  useEffect(() => {
    supabase.from('schools').select('id, name').order('name').then(({ data }) => {
      if (data) setSchools(data)
    })
  }, [])

  function handleFile(file: File) {
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const children = parseWixCsv(text)
      if (children.length === 0) {
        setError('No children found in this file. Make sure it is a Wix participant export.')
        return
      }
      // Suggest school from filename or first CSV row
      const { school: fnSchool, startDate: fnDate } = parseFilename(file.name)
      const suggestedSchool = fnSchool || children[0]?.school || ''

      // Auto-select best matching school
      if (schools.length > 0) {
        const scored = schools
          .map(s => ({ ...s, score: schoolScore(s.name, suggestedSchool) }))
          .sort((a, b) => b.score - a.score)
        if (scored[0]?.score > 30) setSelectedSchoolId(scored[0].id)
      }

      if (fnDate) setStartDate(fnDate)
      setParsed({ children, suggestedSchool })
      setStep('review')
    }
    reader.readAsText(file)
  }

  async function runImport() {
    if (!parsed || !selectedSchoolId || !startDate || !profile) return
    setStep('importing')

    const dates = weeklyDates(startDate, numWeeks)

    // 1. Fetch existing children for this school
    const { data: existing } = await supabase
      .from('children')
      .select('id, full_name')
      .eq('school_id', selectedSchoolId)

    const existingMap = new Map<string, string>() // normalised name → id
    for (const c of existing ?? []) {
      existingMap.set(normaliseSchool(c.full_name), c.id)
    }

    // 2. Upsert children
    const childIds: string[] = []
    for (const child of parsed.children) {
      const key = normaliseSchool(child.fullName)
      const payload = {
        full_name: child.fullName,
        school_id: selectedSchoolId,
        date_of_birth: child.dob,
        year_group: child.yearGroup || null,
        additional_needs: child.additionalNeeds || null,
        contact_email: child.contactEmail || null,
        contact_phone: child.contactPhone || null,
        parent_name: child.parentName || null,
        is_active: true,
      }
      if (existingMap.has(key)) {
        const id = existingMap.get(key)!
        await supabase.from('children').update(payload).eq('id', id)
        childIds.push(id)
      } else {
        const { data: newChild } = await supabase.from('children').insert(payload).select('id').single()
        if (newChild) childIds.push(newChild.id)
      }
    }

    // 3. Create/find session_registers for each date
    const registerIds: string[] = []
    for (const date of dates) {
      const { data: existing } = await supabase
        .from('session_registers')
        .select('id')
        .eq('school_id', selectedSchoolId)
        .eq('session_date', date)
        .maybeSingle()
      if (existing) {
        registerIds.push(existing.id)
      } else {
        const { data: reg } = await supabase
          .from('session_registers')
          .insert({ school_id: selectedSchoolId, session_date: date, lead_coach_id: profile.id })
          .select('id')
          .single()
        if (reg) registerIds.push(reg.id)
      }
    }

    // 4. Upsert register_entries for every child × session
    const entries = registerIds.flatMap(register_id =>
      childIds.map(child_id => ({ register_id, child_id, present: false }))
    )
    if (entries.length > 0) {
      await supabase
        .from('register_entries')
        .upsert(entries, { onConflict: 'register_id,child_id', ignoreDuplicates: true })
    }

    setResult({ children: childIds.length, sessions: registerIds.length, entries: entries.length })
    setStep('done')
  }

  const dates = startDate ? weeklyDates(startDate, numWeeks) : []
  const selectedSchool = schools.find(s => s.id === selectedSchoolId)

  return (
    <Layout title="Import Wix Register" showBack>
      <div className="px-4 pt-6 pb-10 flex flex-col gap-4">

        {step === 'upload' && (
          <>
            <div className="text-center">
              <p className="text-sm text-gray-500">Upload a Wix participant export CSV to create session registers and import children.</p>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center gap-3 text-gray-400 active:bg-gray-50 transition-colors"
            >
              <Upload size={36} />
              <p className="font-semibold text-sm">Tap to select CSV file</p>
              <p className="text-xs">Wix participant export (.csv)</p>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                <AlertTriangle size={16} className="shrink-0" />
                {error}
              </div>
            )}
          </>
        )}

        {step === 'review' && parsed && (
          <>
            {/* Children found */}
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-[#1a3a6b]" />
                <p className="font-bold text-[#1a3a6b]">{parsed.children.length} children found</p>
              </div>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {parsed.children.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                    <span className="font-medium text-gray-700">{c.fullName}</span>
                    <span className="text-xs text-gray-400">{c.yearGroup || '—'}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* School selector */}
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <School size={16} className="text-[#1a3a6b]" />
                <p className="font-bold text-[#1a3a6b]">School</p>
              </div>
              <p className="text-xs text-gray-400 mb-2">Detected from file: <span className="font-semibold">{parsed.suggestedSchool}</span></p>
              <select
                value={selectedSchoolId}
                onChange={e => setSelectedSchoolId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
              >
                <option value="">— Select school —</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Card>

            {/* Session dates */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-[#1a3a6b]" />
                <p className="font-bold text-[#1a3a6b]">Session dates</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Weeks</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={numWeeks}
                    onChange={e => setNumWeeks(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                  />
                </div>
              </div>
              {dates.length > 0 && (
                <div className="flex flex-col gap-1">
                  {dates.map((d, i) => (
                    <p key={d} className="text-xs text-gray-500">
                      Week {i + 1} — {new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  ))}
                </div>
              )}
            </Card>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                <AlertTriangle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                if (!selectedSchoolId) { setError('Please select a school'); return }
                if (!startDate) { setError('Please set a start date'); return }
                setError('')
                runImport()
              }}
            >
              Import {parsed.children.length} children into {numWeeks} sessions
            </Button>
          </>
        )}

        {step === 'importing' && (
          <div className="flex flex-col items-center gap-4 py-16">
            <Loader2 size={36} className="text-[#1a3a6b] animate-spin" />
            <p className="text-sm text-gray-500">Importing — please wait…</p>
          </div>
        )}

        {step === 'done' && result && (
          <div className="flex flex-col items-center gap-5 py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#1a3a6b]">Import complete</p>
              <p className="text-sm text-gray-500 mt-1">
                School: <span className="font-semibold">{selectedSchool?.name}</span>
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full">
              {[
                { label: 'Children', value: result.children },
                { label: 'Sessions', value: result.sessions },
                { label: 'Entries', value: result.entries },
              ].map(stat => (
                <div key={stat.label} className="bg-[#1a3a6b]/5 rounded-2xl p-3">
                  <p className="text-2xl font-extrabold text-[#1a3a6b]">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/registers')}>
              View Registers
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}
