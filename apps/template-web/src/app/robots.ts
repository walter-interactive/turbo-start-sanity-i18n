import { getBaseUrl } from '@/utils'
import type { MetadataRoute } from 'next'

const baseUrl = getBaseUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/'
    },
    sitemap: `${baseUrl}/sitemap.xml`
  }
}
