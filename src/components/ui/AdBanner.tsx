import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const SUPABASE_URL = 'https://yhsxtjttoxzhmbeenhow.supabase.co'

interface AdBanner {
  id: string
  business_name: string
  image_path: string
  click_url: string | null
}

interface Props {
  placement: 'homepage' | 'blog' | 'newsletter_archive'
  className?: string
}

export function AdBanner({ placement, className = '' }: Props) {
  const [ad, setAd] = useState<AdBanner | null>(null)

  useEffect(() => {
    supabase
      .from('ad_banners')
      .select('id, business_name, image_path, click_url')
      .eq('placement', placement)
      .eq('is_active', true)
      .or('starts_at.is.null,starts_at.lte.' + new Date().toISOString())
      .or('ends_at.is.null,ends_at.gte.' + new Date().toISOString())
      .then(({ data }) => {
        if (!data || data.length === 0) return
        // Pick randomly if multiple active ads for this placement
        const pick = data[Math.floor(Math.random() * data.length)]
        setAd(pick as AdBanner)
      })
  }, [placement])

  if (!ad) return null

  const imgSrc = `${SUPABASE_URL}/storage/v1/object/public/ad-banners/${ad.image_path}`

  const inner = (
    <div className={`relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm ${className}`}>
      <span className="absolute top-2 left-2 text-[9px] font-bold text-white/70 bg-black/30 px-1.5 py-0.5 rounded-full uppercase tracking-wide z-10">
        Advertisement
      </span>
      <img
        src={imgSrc}
        alt={`Sponsored by ${ad.business_name}`}
        className="w-full object-cover"
      />
    </div>
  )

  if (ad.click_url) {
    return (
      <a href={ad.click_url} target="_blank" rel="noopener noreferrer sponsored" className="block">
        {inner}
      </a>
    )
  }

  return inner
}
