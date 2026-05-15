import { useState, useEffect, useRef } from 'react'
import { Upload, AlertTriangle, CheckCircle, Users, Info } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import type { School } from '../../types'

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
  imported: number
  skipped: number
  errors: string[]
}

// Parse a single CSV line respecting quoted fields
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

// Build label→value map from Wix form field/response pairs (cols 9+)
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

    // Child name: prefer dedicated form field, fall back to First/Last columns
    const fullName = (
      fields["child's full name"] ||
      [cols[1], cols[2]].filter(Boolean).join(' ')
    ).trim()
    if (!fullName) continue

    // DOB: form field value is already YYYY-MM-DD
    const dob = fields["child's date of birth"] || null

    // Year group
    const yearGroup = fields["year group/class"] || null

    // Additional needs
    const hasNeeds = (fields["does your child have any additional needs or support requirements?"] || '').toLowerCase() === 'yes'
    const needsDetails = fields["if yes, please provide details"] || null
    const additionalNeeds = hasNeeds ? (needsDetails || 'Yes') : null

    // Parent / contact info
    const parentName = fields["parent / guardian full name"] || null
    const contactEmail = cols[3]?.trim() || fields["email"] || null
    const contactPhone = cols[4]?.trim() || fields["contact number"] || null
    const rawSchool = fields["school"] || ''

    pupils.push({
      full_name: fullName,
      date_of_birth: dob,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      year_group: yearGroup,
      additional_needs: additionalNeeds,
      parent_name: parentName,
      payment_status: paymentStatus,
      raw_school: rawSchool,
    })
  }
  return pupils
}

export function PupilImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [allRows, setAllRows] = useState<ParsedPupil[]>([])
  const [onlyPaid, setOnlyPaid] = useState(true)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  useEffect(() => {
    supabase.from('schools').select('*').order('name').then(({ data }) => {
      setSchools(data ?? [])
    })
  }, [])

  const rows = onlyPaid ? allRows.filter(r => r.payment_status === 'Paid') : allRows
  const unpaidCount = allRows.filter(r => r.payment_status !== 'Paid').length

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
    if (!selectedSchoolId || rows.length === 0) return
    setImporting(true)
    setResult(null)
    let imported = 0
    const errors: string[] = []

    for (const pupil of rows) {
      const { error } = await supabase.from('children').insert({
        full_name: pupil.full_name,
        date_of_birth: pupil.date_of_birth,
        contact_email: pupil.contact_email,
        contact_phone: pupil.contact_phone,
        year_group: pupil.year_group,
        additional_needs: pupil.additional_needs,
        parent_name: pupil.parent_name,
        school_id: selectedSchoolId,
        is_active: true,
      })
      if (error) errors.push(`${pupil.full_name}: ${error.message}`)
      else imported++
    }

    setResult({ imported, skipped: rows.length - imported - errors.length, errors })
    setImporting(false)
    if (errors.length === 0) {
      setAllRows([])
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <Layout title="Import Pupils" showBack>
      <div className="px-4 pt-6 pb-6 flex flex-col gap-5">

        {/* Step 1 — Upload file */}
        <Card>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">1. Upload Registration File</p>
          <p className="text-xs text-gray-500 mb-3">
            Upload the Wix participant export CSV. Both .csv and .txt formats are accepted.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
          />
          <Button variant="primary" fullWidth onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Choose CSV File
          </Button>
        </Card>

        {/* Step 2 — School + options */}
        {allRows.length > 0 && (
          <Card>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">2. Options</p>
            <div className="flex flex-col gap-3">
              <Select
                label="Assign all pupils to school"
                value={selectedSchoolId}
                onChange={e => setSelectedSchoolId(e.target.value)}
              >
                <option value="">Select a school…</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>

              <button
                onClick={() => setOnlyPaid(v => !v)}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 text-left"
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${onlyPaid ? 'bg-[#1a3a6b] border-[#1a3a6b]' : 'border-gray-300'}`}>
                  {onlyPaid && <CheckCircle size={12} className="text-white" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Only import Paid registrations</p>
                  {unpaidCount > 0 && (
                    <p className="text-xs text-amber-600">{unpaidCount} unpaid registration{unpaidCount !== 1 ? 's' : ''} will be excluded</p>
                  )}
                </div>
              </button>
            </div>
          </Card>
        )}

        {/* Step 3 — Preview */}
        {rows.length > 0 && (
          <>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                3. Preview — {rows.length} pupil{rows.length !== 1 ? 's' : ''} to import
              </p>
              <div className="flex flex-col gap-2">
                {rows.map((p, i) => (
                  <Card key={i} className="py-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                        <Users size={16} className="text-[#1a3a6b]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-800 text-sm">{p.full_name}</p>
                          {p.year_group && (
                            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">{p.year_group}</span>
                          )}
                          {p.additional_needs && (
                            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Info size={10} /> Needs
                            </span>
                          )}
                        </div>
                        {p.date_of_birth && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            DOB: {new Date(p.date_of_birth).toLocaleDateString('en-GB')}
                          </p>
                        )}
                        {p.parent_name && (
                          <p className="text-xs text-gray-400">Parent: {p.parent_name}</p>
                        )}
                        {p.contact_email && (
                          <p className="text-xs text-gray-400 truncate">{p.contact_email}</p>
                        )}
                        {p.additional_needs && p.additional_needs !== 'Yes' && (
                          <p className="text-xs text-amber-700 mt-1 bg-amber-50 rounded-lg px-2 py-1 leading-snug">{p.additional_needs}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={runImport}
              disabled={importing || !selectedSchoolId}
            >
              {importing ? 'Importing…' : `Import ${rows.length} Pupil${rows.length !== 1 ? 's' : ''}`}
            </Button>
          </>
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
                <p className="font-semibold text-sm">
                  {result.errors.length === 0
                    ? `${result.imported} pupil${result.imported !== 1 ? 's' : ''} imported successfully`
                    : `${result.imported} imported, ${result.errors.length} failed`
                  }
                </p>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 mt-1">{e}</p>
                ))}
                <p className="text-xs text-gray-500 mt-2">
                  Pupils are now visible in the Children admin, Awards section, and school portal register.
                </p>
              </div>
            </div>
          </Card>
        )}

      </div>
    </Layout>
  )
}
