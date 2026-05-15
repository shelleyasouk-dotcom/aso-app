import { useState, useEffect, useRef } from 'react'
import { Upload, AlertTriangle, CheckCircle, Users, Info, Calendar, ChevronDown, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import type { School, Profile } from '../../types'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

interface ParsedPupil {
  full_name: string
  date_of_birth: string | null
  contact_email: string | null
  contact_phone: string | null
  year_group: string | null
  additional_needs: string | null
  parent_name: string | null
  payment_status: string
  raw_school: string
}

interface ImportResult {
  pupils: number
  sessions: number
  entries: number
  errors: string[]
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function extractFields(cols: string[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (let i = 9; i + 1 < cols.length; i += 2) {
    const label = cols[i]?.trim().toLowerCase()
    const value = cols[i + 1]?.trim()
    if (label && value) map[label] = value
  }
  return map
}

function parseWixCSV(text: string): ParsedPupil[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const pupils: ParsedPupil[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i])
    if (cols.length < 3) continue
    const paymentStatus = cols[6]?.trim() || ''
    const fields = extractFields(cols)
    const fullName = (fields["child's full name"] || [cols[1], cols[2]].filter(Boolean).join(' ')).trim()
    if (!fullName) continue
    const hasNeeds = (fields["does your child have any additional needs or support requirements?"] || '').toLowerCase() === 'yes'
    const needsDetails = fields["if yes, please provide details"] || null
    pupils.push({
      full_name: fullName,
      date_of_birth: fields["child's date of birth"] || null,
      contact_email: cols[3]?.trim() || fields["email"] || null,
      contact_phone: cols[4]?.trim() || fields["contact number"] || null,
      year_group: fields["year group/class"] || null,
      additional_needs: hasNeeds ? (needsDetails || 'Yes') : null,
      parent_name: fields["parent / guardian full name"] || null,
      payment_status: paymentStatus,
      raw_school: fields["school"] || '',
    })
  }
  return pupils
}

function getSessionDates(from: string, to: string, dayName: string): string[] {
  if (!from || !to || !dayName) return []
  const dayIndex = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(dayName)
  if (dayIndex < 0) return []
  const start = new Date(from)
  const end = new Date(to)
  const dates: string[] = []
  const cur = new Date(start)
  // Advance to first occurrence of target day
  while (cur.getDay() !== dayIndex) cur.setDate(cur.getDate() + 1)
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 7)
  }
  return dates
}

export function PupilImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [coaches, setCoaches] = useState<Profile[]>([])
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [selectedCoachId, setSelectedCoachId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sessionDay, setSessionDay] = useState('')
  const [allRows, setAllRows] = useState<ParsedPupil[]>([])
  const [onlyPaid, setOnlyPaid] = useState(true)
  const [showPupilPreview, setShowPupilPreview] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  useEffect(() => {
    supabase.from('schools').select('*').order('name').then(({ data }) => setSchools(data ?? []))
    supabase.from('profiles')
      .select('id, full_name')
      .in('role', ['lead_coach', 'assistant_coach'])
      .order('full_name')
      .then(({ data }) => setCoaches((data ?? []) as Profile[]))
  }, [])

  // Auto-fill session day from school record
  useEffect(() => {
    if (!selectedSchoolId) return
    const school = schools.find(s => s.id === selectedSchoolId)
    if (school?.session_day) setSessionDay(school.session_day)
  }, [selectedSchoolId, schools])

  const rows = onlyPaid ? allRows.filter(r => r.payment_status === 'Paid') : allRows
  const unpaidCount = allRows.filter(r => r.payment_status !== 'Paid').length
  const sessionDates = getSessionDates(dateFrom, dateTo, sessionDay)
  const canImport = rows.length > 0 && selectedSchoolId && sessionDates.length > 0

  function handleFile(file: File) {
    setResult(null)
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      setAllRows(parseWixCSV(text))
    }
    reader.readAsText(file)
  }

  async function runImport() {
    if (!canImport) return
    setImporting(true)
    setResult(null)
    const errors: string[] = []

    // 1. Insert all pupils
    const { data: insertedChildren, error: childErr } = await supabase
      .from('children')
      .insert(rows.map(p => ({
        full_name: p.full_name,
        date_of_birth: p.date_of_birth,
        contact_email: p.contact_email,
        contact_phone: p.contact_phone,
        year_group: p.year_group,
        additional_needs: p.additional_needs,
        parent_name: p.parent_name,
        school_id: selectedSchoolId,
        is_active: true,
      })))
      .select('id')

    if (childErr) {
      errors.push('Pupils: ' + childErr.message)
      setResult({ pupils: 0, sessions: 0, entries: 0, errors })
      setImporting(false)
      return
    }

    // 2. Also fetch any existing active children at this school so registers are complete
    const { data: existingChildren } = await supabase
      .from('children')
      .select('id')
      .eq('school_id', selectedSchoolId)
      .eq('is_active', true)
      .not('id', 'in', `(${(insertedChildren ?? []).map(c => c.id).join(',')})`)

    const allChildIds = [
      ...(insertedChildren ?? []).map(c => c.id),
      ...(existingChildren ?? []).map(c => c.id),
    ]

    // 3. Create a session register for each date
    let sessionsCreated = 0
    let entriesCreated = 0

    for (const date of sessionDates) {
      const { data: register, error: regErr } = await supabase
        .from('session_registers')
        .insert({
          school_id: selectedSchoolId,
          session_date: date,
          lead_coach_id: selectedCoachId || null,
          notes: null,
        })
        .select('id')
        .single()

      if (regErr) { errors.push(`Session ${date}: ${regErr.message}`); continue }
      sessionsCreated++

      if (allChildIds.length > 0) {
        const { error: entryErr } = await supabase
          .from('register_entries')
          .insert(allChildIds.map(child_id => ({
            register_id: register.id,
            child_id,
            present: false,
          })))
        if (entryErr) errors.push(`Entries for ${date}: ${entryErr.message}`)
        else entriesCreated += allChildIds.length
      }
    }

    setResult({
      pupils: insertedChildren?.length ?? 0,
      sessions: sessionsCreated,
      entries: entriesCreated,
      errors,
    })
    setImporting(false)
    if (errors.length === 0) {
      setAllRows([])
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <Layout title="Import Pupils" showBack>
      <div className="px-4 pt-6 pb-6 flex flex-col gap-5">

        {/* Step 1 — Upload */}
        <Card>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">1. Upload Registration File</p>
          <p className="text-xs text-gray-500 mb-3">Upload the Wix participant export CSV.</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
          />
          <Button variant="primary" fullWidth onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> {allRows.length > 0 ? `${allRows.length} registrations loaded — change file` : 'Choose CSV File'}
          </Button>
        </Card>

        {/* Step 2 — Options */}
        {allRows.length > 0 && (
          <Card>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">2. Term &amp; School</p>
            <div className="flex flex-col gap-3">
              <Select
                label="School"
                value={selectedSchoolId}
                onChange={e => setSelectedSchoolId(e.target.value)}
              >
                <option value="">Select a school…</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>

              <Select
                label="Session day"
                value={sessionDay}
                onChange={e => setSessionDay(e.target.value)}
              >
                <option value="">Select day…</option>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </Select>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Term start"
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                />
                <Input
                  label="Term end"
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                />
              </div>

              <Select
                label="Lead coach (optional)"
                value={selectedCoachId}
                onChange={e => setSelectedCoachId(e.target.value)}
              >
                <option value="">Not yet assigned</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </Select>

              {/* Only paid toggle */}
              <button
                onClick={() => setOnlyPaid(v => !v)}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 text-left"
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${onlyPaid ? 'bg-[#1a3a6b] border-[#1a3a6b]' : 'border-gray-300'}`}>
                  {onlyPaid && <CheckCircle size={12} className="text-white" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Only import Paid registrations</p>
                  {unpaidCount > 0 && <p className="text-xs text-amber-600">{unpaidCount} unpaid will be excluded</p>}
                </div>
              </button>
            </div>
          </Card>
        )}

        {/* Step 3 — Preview */}
        {rows.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">3. Preview</p>

            {/* Sessions preview */}
            {sessionDates.length > 0 ? (
              <Card>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar size={18} className="text-[#1a3a6b]" />
                  <p className="font-bold text-[#1a3a6b]">{sessionDates.length} sessions will be created</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sessionDates.map(d => (
                    <span key={d} className="text-xs bg-[#1a3a6b]/10 text-[#1a3a6b] font-semibold px-2 py-1 rounded-lg">
                      {new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  ))}
                </div>
              </Card>
            ) : (dateFrom && dateTo && sessionDay) ? (
              <Card className="bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-700">No {sessionDay}s found between those dates — check your dates.</p>
              </Card>
            ) : null}

            {/* Pupils preview (collapsible) */}
            <Card>
              <button
                onClick={() => setShowPupilPreview(v => !v)}
                className="w-full flex items-center gap-3 text-left"
              >
                <Users size={18} className="text-[#1a3a6b]" />
                <p className="flex-1 font-bold text-[#1a3a6b]">{rows.length} pupils to enrol</p>
                {showPupilPreview ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
              </button>
              {showPupilPreview && (
                <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                  {rows.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                      <div className="w-7 h-7 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                        <span className="text-[#1a3a6b] font-bold text-xs">
                          {p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-semibold text-gray-800">{p.full_name}</p>
                          {p.year_group && <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded-full">{p.year_group}</span>}
                          {p.additional_needs && <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Info size={9} />Needs</span>}
                        </div>
                        {p.date_of_birth && <p className="text-xs text-gray-400">DOB: {new Date(p.date_of_birth).toLocaleDateString('en-GB')}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Import button */}
        {canImport && (
          <Button variant="primary" size="lg" fullWidth onClick={runImport} disabled={importing}>
            {importing
              ? 'Importing…'
              : `Import ${rows.length} pupils + ${sessionDates.length} sessions`}
          </Button>
        )}

        {/* Result */}
        {result && (
          <Card className={result.errors.length === 0 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}>
            <div className="flex items-start gap-3">
              {result.errors.length === 0
                ? <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                : <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              }
              <div>
                <p className="font-semibold text-sm text-gray-800">
                  {result.errors.length === 0 ? 'Import complete' : 'Import finished with errors'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  ✓ {result.pupils} pupils enrolled
                </p>
                <p className="text-xs text-gray-600">
                  ✓ {result.sessions} weekly sessions created
                </p>
                <p className="text-xs text-gray-600">
                  ✓ {result.entries} register entries pre-filled
                </p>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 mt-1">{e}</p>
                ))}
                <p className="text-xs text-gray-400 mt-2">
                  Coaches can now see and tick off registers. Schools can view attendance in their portal.
                </p>
              </div>
            </div>
          </Card>
        )}

      </div>
    </Layout>
  )
}
