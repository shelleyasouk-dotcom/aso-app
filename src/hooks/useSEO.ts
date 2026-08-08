import { useEffect } from 'react'

interface SEOProps {
  title: string
  description: string
  url?: string
  image?: string
}

const SITE_NAME = 'Active School Organisation'
const DEFAULT_IMAGE = 'https://www.activeschool.org.uk/og-image.png'

export function useSEO({ title, description, url, image }: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`
    const canonicalUrl = url ?? window.location.href
    const ogImage = image ?? DEFAULT_IMAGE

    document.title = fullTitle

    setMeta('name', 'description', description)

    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:image', ogImage)

    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', ogImage)

    setCanonical(canonicalUrl)

    return () => {
      document.title = SITE_NAME
    }
  }, [title, description, url, image])
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', url)
}
