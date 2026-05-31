import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, Circle, Award, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import type { ClassChild } from '../../types'
import { SKILLS, APPARATUS_LIST, APPARATUS_LABELS } from '../../lib/skills'
import type { Apparatus } from '../../lib/skills'
import { canManageAwards } from '../../lib/roles'

interface SkillCompletion {
  apparatus: Apparatus
  level: number
  skill_index: number
  completed_by_name: string
  completed_at: string
}

interface Certificate {
  id: string
  apparatus: Apparatus
  level: number
  awarded_at: string
  coach_name: string
  certificate_handed_out: boolean
}

export function ChildSkillsPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const [child, setChild] = useState<ClassChild & { school?: { name: string } } | null>(null)
  const [activeApparatus, setActiveApparatus] = useState<Apparatus>('floor')
  const [openLevel, setOpenLevel] = useState<number>(1)
  const [completions, setCompletions] = useState<SkillCompletion[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [saving, setSaving] = useState(false)

  const canEdit = profile && canManageAwards(profile.role)

  useEffect(() => {
    if (id) {
      loadChild(id)
      loadCompletions(id)
      loadCertificates(id)
    }
  }, [id])

  async function loadChild(childId: string) {
    const { data } = await supabase
      .from('class_children')
      .select('*, school:schools(name)')
      .eq('id', childId)
      .single()
    if (data) setChild(data)
  }

  async function loadCompletions(childId: string) {
    const { data } = await supabase
      .from('class_skill_completions')
      .select('apparatus, level, skill_index, completed_by_name, completed_at')
      .eq('child_id', childId)
    if (data) setCompletions(data)
  }

  async function loadCertificates(childId: string) {
    const { data } = await supabase
      .from('class_certificates')
      .select('*')
      .eq('child_id', childId)
      .order('level')
    if (data) setCertificates(data)
  }

  function isSkillComplete(apparatus: Apparatus, level: number, skillIndex: number): boolean {
    return completions.some(
      c => c.apparatus === apparatus && c.level === level && c.skill_index === skillIndex
    )
  }

  function getLevelCertificate(apparatus: Apparatus, level: number): Certificate | undefined {
    return certificates.find(c => c.apparatus === apparatus && c.level === level)
  }

  function isLevelComplete(apparatus: Apparatus, level: number): boolean {
    const skills = SKILLS[apparatus][level] ?? []
    return skills.every((_, i) => isSkillComplete(apparatus, level, i))
  }

  function getHighestCompletedLevel(apparatus: Apparatus): number {
    for (let level = 6; level >= 1; level--) {
      if (getLevelCertificate(apparatus, level)) return level
    }
    return 0
  }

  async function toggleSkill(apparatus: Apparatus, level: number, skillIndex: number) {
    if (!canEdit || !id || saving) return
    setSaving(true)

    const already = isSkillComplete(apparatus, level, skillIndex)

    if (already) {
      await supabase
        .from('class_skill_completions')
        .delete()
        .eq('child_id', id)
        .eq('apparatus', apparatus)
        .eq('level', level)
        .eq('skill_index', skillIndex)
    } else {
      await supabase.from('class_skill_completions').insert({
        child_id: id,
        apparatus,
        level,
        skill_index: skillIndex,
        completed_by: profile!.id,
        completed_by_name: profile!.full_name,
      })
    }

    await loadCompletions(id)
    setSaving(false)
  }

  async function awardCertificate(apparatus: Apparatus, level: number) {
    if (!canEdit || !id || saving) return
    setSaving(true)
    await supabase.from('class_certificates').insert({
      child_id: id,
      apparatus,
      level,
      coach_name: profile!.full_name,
      awarded_by: profile!.id,
      certificate_handed_out: false,
    })
    await loadCertificates(id)
    setSaving(false)
  }

  async function toggleHandedOut(certId: string, current: boolean) {
    if (!canEdit || saving) return
    setSaving(true)
    await supabase
      .from('class_certificates')
      .update({ certificate_handed_out: !current })
      .eq('id', certId)
    if (id) await loadCertificates(id)
    setSaving(false)
  }

  if (!child) return <Layout title="Skills" showBack><div className="p-8 text-center text-gray-400">Loading…</div></Layout>

  const fullName = `${child.first_name} ${child.last_name}`

  return (
    <Layout title={fullName} showBack>
      <div className="px-4 pt-4 flex flex-col gap-4">

        {/* Child header */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1a3a6b] rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-white font-black text-base">
                {`${child.first_name[0]}${child.last_name[0]}`.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-bold text-[#1a3a6b] text-lg">{fullName}</p>
              <p className="text-gray-500 text-sm">{(child as any).school?.name}</p>
            </div>
          </div>

          {/* Progress summary row */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {APPARATUS_LIST.map(app => {
              const level = getHighestCompletedLevel(app)
              return (
                <button
                  key={app}
                  onClick={() => setActiveApparatus(app)}
                  className={`rounded-xl py-2 text-center transition-colors ${
                    activeApparatus === app
                      ? 'bg-[#1a3a6b] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <p className="text-sm font-bold">{level === 0 ? '–' : `L${level}`}</p>
                  <p className="text-xs mt-0.5 opacity-80">{APPARATUS_LABELS[app]}</p>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Skills for active apparatus */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5, 6].map(level => {
            const skills = SKILLS[activeApparatus][level] ?? []
            const cert = getLevelCertificate(activeApparatus, level)
            const complete = isLevelComplete(activeApparatus, level)
            const completedCount = skills.filter((_, i) => isSkillComplete(activeApparatus, level, i)).length
            const isOpen = openLevel === level

            return (
              <Card key={level} className="overflow-hidden">
                {/* Level header */}
                <button
                  className="w-full flex items-center justify-between"
                  onClick={() => setOpenLevel(isOpen ? 0 : level)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      cert ? 'bg-[#f5c518] text-[#1a3a6b]'
                      : complete ? 'bg-green-100 text-green-700'
                      : completedCount > 0 ? 'bg-blue-100 text-[#1a3a6b]'
                      : 'bg-gray-100 text-gray-400'
                    }`}>
                      {cert ? <Award size={16} /> : `L${level}`}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#1a3a6b]">Level {level}</p>
                      <p className="text-xs text-gray-400">{completedCount}/{skills.length} skills</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cert && <Badge color="yellow">Certified</Badge>}
                    {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </button>

                {/* Skills list */}
                {isOpen && (
                  <div className="mt-4 flex flex-col gap-2">
                    {skills.map((skill, i) => {
                      const done = isSkillComplete(activeApparatus, level, i)
                      return (
                        <button
                          key={i}
                          onClick={() => toggleSkill(activeApparatus, level, i)}
                          disabled={!canEdit || saving}
                          className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                            done ? 'bg-green-50' : 'bg-gray-50 active:bg-gray-100'
                          }`}
                        >
                          {done
                            ? <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                            : <Circle size={20} className="text-gray-300 shrink-0 mt-0.5" />
                          }
                          <span className={`text-sm ${done ? 'text-green-800 line-through' : 'text-gray-700'}`}>
                            {skill}
                          </span>
                        </button>
                      )
                    })}

                    {/* Certificate section */}
                    <div className="mt-2 pt-3 border-t border-gray-100">
                      {cert ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between bg-[#f5c518]/10 rounded-xl px-3 py-2">
                            <div>
                              <p className="text-xs font-semibold text-[#1a3a6b]">Certificate Awarded</p>
                              <p className="text-xs text-gray-500">
                                {new Date(cert.awarded_at).toLocaleDateString('en-GB')} · {cert.coach_name}
                              </p>
                            </div>
                            <Award size={20} className="text-[#f5c518]" />
                          </div>
                          {canEdit && (
                            <button
                              onClick={() => toggleHandedOut(cert.id, cert.certificate_handed_out)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                cert.certificate_handed_out
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {cert.certificate_handed_out
                                ? <><CheckCircle size={16} /> Certificate handed out</>
                                : <><Circle size={16} /> Mark certificate as handed out</>
                              }
                            </button>
                          )}
                        </div>
                      ) : complete && canEdit ? (
                        <Button
                          variant="yellow"
                          fullWidth
                          onClick={() => awardCertificate(activeApparatus, level)}
                          disabled={saving}
                        >
                          <Award size={18} />
                          Award Level {level} Certificate
                        </Button>
                      ) : !complete ? (
                        <p className="text-xs text-gray-400 text-center">
                          Complete all skills to award the Level {level} certificate
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
