import { sanityFetch } from './sanity/live'
import { queryGlobalSeoSettings, queryNavbarData } from './sanity/query'
import type { Locale } from '@/i18n/routing'

export const getNavigationData = async (locale: Locale) => {
  const [navbarData, settingsData] = await Promise.all([
    sanityFetch({
      query: queryNavbarData,
      params: { locale }
    }),
    sanityFetch({ query: queryGlobalSeoSettings })
  ])

  return { navbarData: navbarData.data, settingsData: settingsData.data }
}
