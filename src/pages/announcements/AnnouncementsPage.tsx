import { useState, useEffect } from 'react'
import { Pin, Megaphone } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import type { Announcement } from '../../types'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function AnnouncementsPage() {
  const { profile } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    let query = supabase
      .from('announcements')
      .select('*, author:profiles!created_by(full_name)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (profile.role !== 'director') {
      if (profile.area) {
        query = query.or(`area.is.null,area.eq.${profile.area}`)
      } else {
        query = query.is('area', null)
      }
    }

    query.then(({ data }) => {
      if (data) setAnnouncements(data)
      setLoading(false)
    })
  }, [profile])

  return (
    <Layout title="Announcements" showBack>
      <div className="px-4 pt-6 flex flex-col gap-3 pb-8">
        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : announcements.length === 0 ? (
          <Card className="text-center py-10">
            <Megaphone size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No announcements yet.</p>
          </Card>
        ) : (
          announcements.map(a => (
            <div
              key={a.id}
              className={`rounded-2xl px-4 py-3.5 ${
                a.is_pinned
                  ? 'bg-amber-50 border border-amber-200'
                  : 'bg-white border border-gray-100 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-2">
                {a.is_pinned && <Pin size={13} className="text-amber-500 mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1a3a6b] text-sm">{a.title}</p>
                  {a.body && (
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap leading-snug">{a.body}</p>
                  )}
                  {a.link_url && (
                    <a
                      href={a.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-sm font-semibold text-[#1a3a6b] bg-[#1a3a6b]/10 px-3 py-1.5 rounded-lg"
                    >
                      {a.link_label || 'Open Link'}
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {timeAgo(a.created_at)}
                    {a.area ? ` · ${a.area}` : ' · All Staff'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}
