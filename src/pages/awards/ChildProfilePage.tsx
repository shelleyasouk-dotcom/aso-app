import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Award, Plus, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Input'
import type { Child, ChildAward, AwardLevel, School } from '../../types'
import { AWARD_LEVEL_LABELS } from '../../types'
import { canManageAwards } from '../../lib/roles'

const AWARD_ORDER: AwardLevel[] = ['none', 'ukag_level_1', 'ukag_level_2', 'ukag_level_3', 'ukag_level_4', 'ukag_level_5']

export function ChildProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const [child, setChild] = useState<Child & { school?: School } | null>(null)
  const [awards, setAwards] = useState<(ChildAward & { awarded_by_profile?: any })[]>([])
  const [newLevel, setNewLevel] = useState<AwardLevel>('ukag_level_1')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (id) {
      loadChild(id)
      loadAwards(id)
    }
  }, [id])

  async function loadChild(childId: string) {
    const { data } = await supabase
      .from('children')
      .select('*, school:schools(*)')
      .eq('id', childId)
      .single()
    if (data) setChild(data)
  }

  async function loadAwards(childId: string) {
    const { data } = await supabase
      .from('child_awards')
      .select('*, awarded_by_profile:profiles(*)')
      .eq('child_id', childId)
      .order('awarded_at', { ascending: false })
    if (data) setAwards(data)
  }

  async function awardLevel() {
    if (!profile || !id) return
    setSaving(true)
    const { error } = await supabase.from('child_awards').insert({
      child_id: id,
      level: newLevel,
      awarded_by: profile.id,
    })
    if (!error) {
      await loadAwards(id)
      setShowForm(false)
    }
    setSaving(false)
  }

  const currentLevel: AwardLevel = awards.length > 0 ? awards[0].level : 'none'
  const currentIndex = AWARD_ORDER.indexOf(currentLevel)
  const canEdit = profile && canManageAwards(profile.role)

  if (!child) return <Layout title="Child Profile" showBack><div className="p-8 text-center text-gray-400">Loading…</div></Layout>

  return (
    <Layout title={child.full_name} showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">
        {/* Child info */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1a3a6b] rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xl">
                {child.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <h2 className="font-bold text-[#1a3a6b] text-xl">{child.full_name}</h2>
              <p className="text-gray-500 text-sm">{child.school?.name}</p>
              {child.date_of_birth && (
                <p className="text-gray-400 text-xs mt-1">
                  DOB: {new Date(child.date_of_birth).toLocaleDateString('en-GB')}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Current award level */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Level</p>
              <p className="text-xl font-bold text-[#1a3a6b]">{AWARD_LEVEL_LABELS[currentLevel]}</p>
            </div>
            <Award size={36} className="text-[#f5c518]" />
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{currentIndex}/{AWARD_ORDER.length - 1}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#f5c518] rounded-full transition-all"
                style={{ width: `${(currentIndex / (AWARD_ORDER.length - 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {AWARD_ORDER.filter(l => l !== 'none').map((level, i) => (
                <div
                  key={level}
                  className={`text-xs text-center ${i < currentIndex ? 'text-[#1a3a6b] font-medium' : 'text-gray-300'}`}
                >
                  L{i + 1}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Award new level */}
        {canEdit && (
          showForm ? (
            <Card>
              <h3 className="font-semibold text-[#1a3a6b] mb-3">Award New Level</h3>
              <Select
                label="Award Level"
                value={newLevel}
                onChange={e => setNewLevel(e.target.value as AwardLevel)}
              >
                {AWARD_ORDER.filter(l => l !== 'none').map(level => (
                  <option key={level} value={level}>{AWARD_LEVEL_LABELS[level]}</option>
                ))}
              </Select>
              <div className="flex gap-2 mt-4">
                <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={awardLevel} disabled={saving} className="flex-1">
                  <CheckCircle size={18} />
                  {saving ? 'Saving…' : 'Confirm Award'}
                </Button>
              </div>
            </Card>
          ) : (
            <Button variant="yellow" size="lg" fullWidth onClick={() => setShowForm(true)}>
              <Plus size={20} /> Award New Level
            </Button>
          )
        )}

        {/* Award history */}
        {awards.length > 0 && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-3">Award History</h3>
            <div className="flex flex-col gap-3">
              {awards.map((award, i) => (
                <div key={award.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 0 ? 'bg-[#f5c518]' : 'bg-gray-100'}`}>
                    <Award size={14} className={i === 0 ? 'text-[#1a3a6b]' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{AWARD_LEVEL_LABELS[award.level]}</p>
                    <p className="text-xs text-gray-400">
                      by {award.awarded_by_profile?.full_name} ·{' '}
                      {new Date(award.awarded_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  {i === 0 && <Badge color="yellow">Current</Badge>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}
