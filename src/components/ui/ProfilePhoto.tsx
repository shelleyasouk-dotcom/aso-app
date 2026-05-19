import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface Props {
  photoUrl: string | null | undefined
  alt?: string
  className?: string
}

// Resolves a Supabase storage path or URL to a blob: URL for display.
// Avoids Content-Security-Policy issues with external domains by
// downloading through the Supabase client rather than loading directly.
export function ProfilePhoto({ photoUrl, alt = '', className = 'w-full h-full object-cover' }: Props) {
  const [src, setSrc] = useState<string | undefined>()

  useEffect(() => {
    if (!photoUrl) { setSrc(undefined); return }

    let path = photoUrl
    if (photoUrl.startsWith('http')) {
      const m = photoUrl.match(/\/coach-files\/([^?]+)/)
      if (!m) return
      path = m[1]
    }

    supabase.storage.from('coach-files').download(path)
      .then(({ data }) => { if (data) setSrc(URL.createObjectURL(data)) })
  }, [photoUrl])

  if (!src) return null
  return <img src={src} alt={alt} className={className} />
}
