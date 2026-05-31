import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Target, Dumbbell, Lightbulb, Users, Shield, BookMarked,
  ChevronDown, ChevronUp, Clock, CheckCircle,
  Wrench, Eye, TrendingUp, Zap, HeartHandshake,
} from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { UKAG_LEVELS } from '../../data/ukagLevels'

const LEVEL_THEME: Record<number, { header: string; accent: string; skillBg: string; skillBorder: string; skillText: string }> = {
  1: { header: 'from-[#1a3a6b] to-[#1e4a8c]', accent: 'text-[#f5c518]', skillBg: 'bg-[#1a3a6b]/5', skillBorder: 'border-[#1a3a6b]/20', skillText: 'text-[#1a3a6b]' },
  2: { header: 'from-green-700 to-green-600', accent: 'text-green-200', skillBg: 'bg-green-50', skillBorder: 'border-green-200', skillText: 'text-green-800' },
  3: { header: 'from-violet-700 to-violet-600', accent: 'text-violet-200', skillBg: 'bg-violet-50', skillBorder: 'border-violet-200', skillText: 'text-violet-800' },
  4: { header: 'from-amber-600 to-amber-500', accent: 'text-amber-100', skillBg: 'bg-amber-50', skillBorder: 'border-amber-200', skillText: 'text-amber-800' },
  5: { header: 'from-red-700 to-red-600', accent: 'text-red-200', skillBg: 'bg-red-50', skillBorder: 'border-red-200', skillText: 'text-red-800' },
  6: { header: 'from-cyan-700 to-cyan-600', accent: 'text-cyan-200', skillBg: 'bg-cyan-50', skillBorder: 'border-cyan-200', skillText: 'text-cyan-800' },
}

function CollapsibleSection({
  icon: Icon, title, children, defaultOpen = false,
}: {
  icon: React.ElementType; title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3.5"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2.5">
          <Icon size={16} className="text-gray-500 shrink-0" />
          <span className="font-bold text-gray-800 text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </div>
  )
}

export function UKAGLevelPage() {
  const { level: levelParam } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const levelNum = parseInt(levelParam ?? '1')
  const level = UKAG_LEVELS.find(l => l.level === levelNum)
  const theme = LEVEL_THEME[levelNum] ?? LEVEL_THEME[1]
  const [activeTab, setActiveTab] = useState<'level' | 'guide'>('level')

  if (!level) {
    return (
      <Layout title="Not Found" showBack>
        <p className="text-center text-gray-400 py-16">Level not found.</p>
      </Layout>
    )
  }

  return (
    <Layout title={`Level ${level.level}`} showBack>
      <div className="pb-12 flex flex-col gap-4">

        {/* Header */}
        <div className={`bg-gradient-to-br ${theme.header} text-white px-4 pt-4 pb-6`}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className={`text-xs font-extrabold uppercase tracking-widest ${theme.accent} mb-1`}>{level.subtitle}</p>
              <h1 className="text-2xl font-extrabold leading-tight">{level.name}</h1>
            </div>
            <span className="text-4xl shrink-0">{level.emoji}</span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-white/70">
            <span className="flex items-center gap-1"><Users size={11} /> {level.delivery}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {level.duration}</span>
            <span>{level.ageGroup}</span>
          </div>

          {/* Level nav */}
          <div className="flex gap-2 mt-4">
            {UKAG_LEVELS.map(l => (
              <button
                key={l.level}
                onClick={() => navigate(`/ukag/${l.level}`)}
                className={`w-9 h-9 rounded-xl text-sm font-extrabold transition-colors ${
                  l.level === levelNum
                    ? 'bg-white text-[#1a3a6b]'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {l.level}
              </button>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="px-4">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {([
              { id: 'level', label: 'Level Content' },
              { id: 'guide', label: '🎯 Coaching Guide' },
            ] as { id: 'level' | 'guide'; label: string }[]).map(tab => (
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

        {activeTab === 'level' && (
        <div className="px-4 flex flex-col gap-3">

          {/* Session Overview */}
          <CollapsibleSection icon={Clock} title="Session Overview" defaultOpen>
            <div className="flex flex-col gap-3">
              {level.overview.map(stage => (
                <div key={stage.stage} className="flex gap-3">
                  <div className="w-1 rounded-full bg-gray-200 shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800 text-sm">{stage.stage}</span>
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{stage.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{stage.description}</p>
                    {stage.coachingFocus && (
                      <p className="text-xs text-gray-400 italic mt-0.5">{stage.coachingFocus}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Objectives */}
          <CollapsibleSection icon={Target} title="Session Objectives" defaultOpen>
            <div className="flex flex-col gap-2">
              {level.objectives.map(obj => (
                <div key={obj} className="flex items-start gap-2.5">
                  <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-snug">{obj}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Skill Progressions */}
          <CollapsibleSection icon={Dumbbell} title="Skill Progressions" defaultOpen>
            <div className="flex flex-col gap-4">
              {level.progressions.map(prog => (
                <div key={prog.apparatus} className={`${theme.skillBg} border ${theme.skillBorder} rounded-xl p-3`}>
                  <p className={`font-extrabold text-sm ${theme.skillText} mb-2`}>{prog.apparatus}</p>

                  <div className="flex flex-col gap-1.5 mb-2">
                    {prog.coreSkills.map((skill, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-white border border-gray-200 text-[9px] font-bold text-gray-500 flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs text-gray-700 leading-snug">{skill}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/60 pt-2 flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Pathway</p>
                    <p className="text-xs text-gray-600">{prog.pathway}</p>
                    <p className={`text-xs font-semibold italic mt-1 ${theme.skillText}`}>{prog.cues}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Teaching Focus */}
          <CollapsibleSection icon={Lightbulb} title="Teaching Focus">
            <div className="flex flex-col gap-2">
              {level.teachingFocus.map(point => (
                <div key={point} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0 mt-2" />
                  <p className="text-sm text-gray-700 leading-snug">{point}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Assistant Coach Roles */}
          <CollapsibleSection icon={Users} title="Assistant Coach Roles">
            <div className="flex flex-col gap-2">
              {level.assistantRoles.map(role => (
                <div key={role.area} className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <p className="text-xs font-bold text-gray-600 w-28 shrink-0">{role.area}</p>
                  <p className="text-xs text-gray-500 leading-relaxed flex-1">{role.responsibility}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Safety Checklist */}
          <CollapsibleSection icon={Shield} title="Safety Checklist">
            <div className="flex flex-col gap-2">
              {level.safetyChecklist.map(item => (
                <div key={item} className="flex items-start gap-2.5">
                  <span className="text-green-500 text-base leading-none shrink-0">✅</span>
                  <p className="text-sm text-gray-700 leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Coaching Reminders */}
          <CollapsibleSection icon={BookMarked} title="Coaching Reminders">
            <div className="flex flex-col gap-2">
              {level.coachingReminders.map(r => (
                <div key={r} className="flex items-start gap-2.5">
                  <span className="text-[#f5c518] text-base leading-none shrink-0">🔖</span>
                  <p className="text-sm text-gray-700 leading-snug">{r}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

        </div>
        )}

        {/* ── COACHING GUIDE TAB ── */}
        {activeTab === 'guide' && level.coachingGuide && (
          <div className="px-4 flex flex-col gap-3">

            {/* Intro */}
            <div className={`${theme.skillBg} border ${theme.skillBorder} rounded-2xl px-4 py-3`}>
              <p className={`text-sm leading-relaxed ${theme.skillText}`}>{level.coachingGuide.intro}</p>
            </div>

            <CollapsibleSection icon={Lightbulb} title="Coaching Techniques" defaultOpen>
              <div className="flex flex-col gap-3">
                {level.coachingGuide.techniques.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-1 rounded-full bg-gray-200 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-gray-800 text-sm leading-tight">{t.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{t.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection icon={HeartHandshake} title="Support Ideas" defaultOpen>
              <div className="flex flex-col gap-2">
                {level.coachingGuide.supportIdeas.map((idea, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-2" />
                    <p className="text-sm text-gray-700 leading-snug">{idea}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection icon={Wrench} title="Coaching Aids & Equipment">
              <div className="flex flex-col gap-3">
                {level.coachingGuide.coachingAids.map((aid, i) => (
                  <div key={i} className={`${theme.skillBg} border ${theme.skillBorder} rounded-xl p-3`}>
                    <p className={`font-extrabold text-sm ${theme.skillText} mb-1`}>{aid.name}</p>
                    <p className="text-xs text-gray-600 leading-snug">{aid.purpose}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection icon={Eye} title="What to Watch For">
              <div className="flex flex-col gap-2">
                {level.coachingGuide.whatToWatch.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-amber-500 text-base leading-none shrink-0">⚠️</span>
                    <p className="text-sm text-gray-700 leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection icon={TrendingUp} title="How to Develop Gymnasts">
              <div className="flex flex-col gap-2">
                {level.coachingGuide.howToDevelop.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-gray-700 leading-snug">{step}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection icon={Zap} title="Motivation & Encouragement Tips">
              <div className="flex flex-col gap-2">
                {level.coachingGuide.motivationTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[#f5c518] text-base leading-none shrink-0">💬</span>
                    <p className="text-sm text-gray-700 leading-snug italic">{tip}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

          </div>
        )}
      </div>
    </Layout>
  )
}
