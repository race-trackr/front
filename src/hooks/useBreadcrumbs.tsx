import { useMatches } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface BreadcrumbHandle {
  crumb: (data?: any) => string
}

interface Breadcrumb {
  path: string
  label: string
}

const useBreadcrumbs = (): Breadcrumb[] => {
  const matches = useMatches()
  const { t } = useTranslation()

  const crumbs = matches
    .filter((match) => (match.handle as BreadcrumbHandle)?.crumb)
    .map((match) => {
      const handle = match.handle as BreadcrumbHandle
      const label = handle.crumb(match) // Pass the entire match object instead of just match.data
      return {
        path: match.pathname,
        label: label,
      }
    })

  // Add a "Home" crumb at the beginning if not already present
  if (crumbs.length > 0 && crumbs[0].path !== '/') {
    crumbs.unshift({ path: '/', label: t('Home') })
  } else if (crumbs.length === 0) {
    // If no crumbs are found (e.g., on the root path), just add Home
    crumbs.push({ path: '/', label: t('Home') })
  }

  return crumbs
}

export default useBreadcrumbs
