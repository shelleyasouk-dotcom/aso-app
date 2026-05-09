import { useState } from 'react'
import { Upload, CheckCircle, XCircle, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

type ImportType = 'schools' | 'staff' | 'children'

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? '' })
    return row
  }).filter(row => Object.values(row).some(v => v !== ''))
}

export function BulkImportPage() {
  const [activeTab, setActiveTab] = useState<ImportType>('schools')
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const tabs: { key: ImportType; label: string }[] = [
    { key: 'schools', label: 'Schools' },
    { key: 'staff', label: 'Staff' },
    { key: 'children', label: 'Children' },
  ]

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
    setResult(null)
  }

  async function handleImport() {
    if (!file) return
    setImporting(true)
    setResult(null)

    const text = await file.text()
    const rows = parseCSV(text)
    const errors: string[] = []
    let success = 0

    if (activeTab === 'schools') {
      for (const row of rows) {
        const { error } = await supabase.from('schools').insert({
          name: row['School Name'],
          address: row['Address'],
          session_day: row['Session Day'],
          session_time: row['Session Time'],
        })
        if (error) errors.push(`${row['School Name']}: ${error.message}`)
        else success++
      }
    }

    if (activeTab === 'staff') {
      for (const row of rows) {
        // Create auth user
        const { data, error: authError } = await supabase.auth.signUp({
          email: row['Email'],
          password: 'TempPass123!',
          options: { data: { full_name: row['Full Name'], role: row['Role'] } },
        })

        if (authError) {
          errors.push(`${row['Full Name']}: ${authError.message}`)
          continue
        }

        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: row['Email'],
            full_name: row['Full Name'],
            role: row['Role'] || 'junior_coach',
          })
          success++
        }
      }
    }

    if (activeTab === 'children') {
      for (const row of rows) {
        const { data: school } = await supabase
          .from('schools')
          .select('id')
          .eq('name', row['School Name'])
          .single()

        if (!school) {
          errors.push(`${row['Child Name']}: School "${row['School Name']}" not found`)
          continue
        }

        const { error } = await supabase.from('children').insert({
          full_name: row['Child Name'],
          school_id: school.id,
          contact_email: row['Contact Email'] || null,
          is_active: true,
        })

        if (error) errors.push(`${row['Child Name']}: ${error.message}`)
        else success++
      }
    }

    setResult({ success, failed: errors.length, errors })
    setImporting(false)
  }

  function downloadTemplate(type: ImportType) {
    const templates = {
      schools: `School Name,Address,Session Day,Session Time\nSt Mary's Primary,123 High Street London E1 1AA,Monday,15:30 - 16:30`,
      staff: `Full Name,Email,Role\nJohn Smith,john@example.com,lead_coach`,
      children: `Child Name,School Name,Contact Email\nEmma Johnson,St Mary's Primary,parent@example.com`,
    }
    const blob = new Blob([templates[type]], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}_template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const instructions = {
    schools: 'Import all your school locations. Make sure Session Day matches exactly (e.g. Monday, Tuesday).',
    staff: 'Import all coaches. Role must be one of: director, area_lead, lead_coach, assistant_coach, junior_coach. All staff are created with temporary password: TempPass123! — assign their schools afterwards in Admin → Staff.',
    children: 'Import all children. School Name must match exactly. Import schools first before children.',
  }

  return (
    <Layout title="Bulk Import" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setFile(null); setResult(null) }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#1a3a6b] text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Instructions */}
        <Card>
          <p className="text-sm text-gray-600">{instructions[activeTab]}</p>
        </Card>

        {/* Download template */}
        <Button variant="secondary" fullWidth onClick={() => downloadTemplate(activeTab)}>
          <Download size={18} /> Download {activeTab} template
        </Button>

        {/* File upload */}
        <Card>
          <p className="text-sm font-semibold text-gray-700 mb-3">Upload your CSV file</p>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#1a3a6b] transition-colors bg-gray-50">
            <Upload size={24} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              {file ? file.name : 'Tap to select CSV file'}
            </span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </Card>

        {/* Import button */}
        {file && (
          <Button size="lg" fullWidth onClick={handleImport} disabled={importing}>
            <Upload size={20} />
            {importing ? 'Importing…' : `Import ${activeTab}`}
          </Button>
        )}

        {/* Results */}
        {result && (
          <Card>
            <div className="flex gap-4 mb-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <span className="font-bold">{result.success} imported</span>
              </div>
              {result.failed > 0 && (
                <div className="flex items-center gap-2 text-red-500">
                  <XCircle size={20} />
                  <span className="font-bold">{result.failed} failed</span>
                </div>
              )}
            </div>
            {result.errors.length > 0 && (
              <div className="flex flex-col gap-1">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1">{err}</p>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  )
}
