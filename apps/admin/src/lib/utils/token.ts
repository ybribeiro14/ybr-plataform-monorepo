const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)ybr_access_token=([^;]*)/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

export { getAccessToken }
