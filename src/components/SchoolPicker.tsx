import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import type { School } from '../types'

// Searchable school picker — lets anyone search and pick any school,
// optionally highlighting a subset ("your schools") at the top.
export function SchoolPicker({ schools, mySchoolIds, value, onChange, placeholder }: {
  schools: School[]
  mySchoolIds?: Set<string>
  value: string
  onChange: (id: string) => void
  placeholder?: string
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selected = schools.find(s => s.id === value)
  const highlighted = mySchoolIds ?? new Set<string>()

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  const lq = query.toLowerCase()
  const filtered = query
    ? schools.filter(s => s.name.toLowerCase().includes(lq) || (s.area ?? '').toLowerCase().includes(lq))
    : schools

  const mySchools = filtered.filter(s => highlighted.has(s.id))
  const others = filtered.filter(s => !highlighted.has(s.id))

  const byArea: Record<string, School[]> = {}
  others.forEach(s => {
    const a = s.area || 'Other'
    if (!byArea[a]) byArea[a] = []
    byArea[a].push(s)
  })
  const areaGroups = Object.entries(byArea).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder ?? 'Search for a school…'}
          value={open ? query : (selected?.name ?? '')}
          onFocus={() => { setOpen(true); setQuery('') }}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
        />
        {value && !open && (
          <button
            type="button"
            onClick={() => { onChange(''); setQuery('') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto mt-1.5">
          {mySchools.length > 0 && (
            <>
              <div className="px-3 pt-2.5 pb-1 text-[10px] font-extrabold text-[#1a3a6b] uppercase tracking-widest">
                Your Schools
              </div>
              {mySchools.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { onChange(s.id); setOpen(false); setQuery('') }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors ${value === s.id ? 'bg-blue-50' : ''}`}
                >
                  <p className="text-sm font-semibold text-[#1a3a6b]">{s.name}</p>
                  {s.area && <p className="text-[11px] text-gray-400">{s.area}</p>}
                </button>
              ))}
              {areaGroups.length > 0 && <div className="border-t border-gray-100 mx-3 my-1" />}
            </>
          )}

          {areaGroups.map(([area, areaSchools]) => (
            <div key={area}>
              <div className="px-3 py-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                {area}
              </div>
              {areaSchools.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { onChange(s.id); setOpen(false); setQuery('') }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors ${value === s.id ? 'bg-blue-50' : ''}`}
                >
                  <p className="text-sm text-gray-700">{s.name}</p>
                </button>
              ))}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-400 text-center">
              No schools match "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}
