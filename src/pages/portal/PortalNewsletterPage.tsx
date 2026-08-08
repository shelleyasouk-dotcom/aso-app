import { useState, useEffect } from 'react'
import { Mail, ExternalLink, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { AdBanner } from '../../components/ui/AdBanner'
import { useSEO } from '../../hooks/useSEO'

interface Newsletter {
  id: string
  title: string
  preview_url: string | null
  sent_at: string | null
  created_at: string
}

export function PortalNewsletterPage() {
  useSEO({
    title: 'Newsletters — ASO Updates',
    description: 'Browse the ASO newsletter archive. Stay up to date with coaching news, camp announcements and community stories.',
    url: 'https://www.activeschool.org.uk/portal/newsletters',
  })

  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('newsletters')
      .select('id, title, preview_url, sent_at, created_at')
      .order('sent_at', { ascending: false, nullsFirst: false })
      .then(({ data }) => {
        setNewsletters((data ?? []) as Newsletter[])
        setLoading(false)
      })
  }, [])

  return (
    <PortalLayout>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] via-[#1e4a8c] to-[#142f58] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#f5c518]/20 text-[#f5c518] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Mail size={14} /> Newsletter Archive
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">ASO Newsletters</h1>
          <p className="text-white/70 text-base max-w-xl">
            Catch up on our latest updates — coaching news, camp announcements, awards and community stories.
          </p>
        </div>
      </section>

      {/* Ad banner */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <AdBanner placement="newsletter_archive" />
      </div>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : newsletters.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📬</p>
            <p className="text-gray-500 font-semibold">No newsletters yet</p>
            <p className="text-sm text-gray-400 mt-1">Check back soon — we'll add them here as they go out.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {newsletters.map((n, i) => (
              <div
                key={n.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4"
              >
                {/* Issue number badge */}
                <div className="w-11 h-11 rounded-xl bg-[#1a3a6b]/5 flex items-center justify-center shrink-0">
                  <span className="text-xs font-extrabold text-[#1a3a6b]">#{newsletters.length - i}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-tight truncate">{n.title}</p>
                  {n.sent_at && (
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                      <Calendar size={11} />
                      {new Date(n.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>

                {n.preview_url ? (
                  <a
                    href={n.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a3a6b] bg-[#1a3a6b]/5 hover:bg-[#1a3a6b]/10 px-3 py-2 rounded-xl transition-colors shrink-0"
                  >
                    Read <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-xs text-gray-300 shrink-0">No link</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

    </PortalLayout>
  )
}
