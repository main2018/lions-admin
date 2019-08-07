import defaultSettings from '@/settings'

const title = defaultSettings.title || '北京狮子会'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
