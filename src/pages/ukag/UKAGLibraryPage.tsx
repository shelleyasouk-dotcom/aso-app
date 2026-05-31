import { useNavigate } from 'react-router-dom'
import { ChevronRight, GraduationCap } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { UKAG_LEVELS } from '../../data/ukagLevels'

const LEVEL_COLORS: Record<number, { bg: string; text: string; border: string; pill: string }> = {
  1: { bg: 'bg-[#1a3a6b]/8',  text: 'text-[#1a3a6b]',  border: 'border-[#1a3a6b]/20',  pill: 'bg-[#1a3a6b] text-white' },
  2: { bg: 'bg-green-50',     text: 'text-green-800',   border: 'border-green-200',     pill: 'bg-green-700 text-white' },
  3: { bg: 'bg-violet-50',    text: 'text-violet-800',  border: 'border-violet-200',    pill: 'bg-violet-700 text-white' },
  4: { bg: 'bg-amber-50',     text: 'text-amber-800',   border: 'border-amber-200',     pill: 'bg-amber-600 text-white' },
  5: { bg: 'bg-red-50',       text: 'text-red-800',     border: 'border-red-200',       pill: 'bg-red-600 text-white' },
  6: { bg: 'bg-cyan-50',      text: 'text-cyan-800',    border: 'border-cyan-200',      pill: 'bg-cyan-700 text-white' },
}

export function UKAGLibraryPage() {
  const navigate = useNavigate()

  return (
    <Layout title="UKAG Coaching Library" showBack>
      <div className="px-4 pt-6 pb-10 flex flex-col gap-4">

        <div className="bg-[#1a3a6b] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={18} className="text-[#f5c518]" />
            <p className="font-extrabold text-base">UKAG Award Pathway</p>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Full session plans, skill progressions, coaching cues, and safety checklists for every UKAG level. Tap a level to open the full plan.
          </p>
        </div>

        {UKAG_LEVELS.map(level => {
          const c = LEVEL_COLORS[level.level]
          return (
            <button
              key={level.level}
              onClick={() => navigate(`/ukag/${level.level}`)}
              className={`w-full text-left border-2 ${c.border} ${c.bg} rounded-2xl p-4 flex items-center gap-4 active:opacity-80 transition-opacity`}
            >
              <div className={`w-14 h-14 rounded-2xl ${c.pill} flex items-center justify-center shrink-0`}>
                <span className="text-2xl">{level.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${c.text}`}>Level {level.level}</span>
                </div>
                <p className={`font-extrabold text-base leading-tight ${c.text}`}>{level.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{level.progressions.length} apparatus · {level.objectives.length} objectives</p>
              </div>
              <ChevronRight size={18} className="text-gray-300 shrink-0" />
            </button>
          )
        })}

      </div>
    </Layout>
  )
}
