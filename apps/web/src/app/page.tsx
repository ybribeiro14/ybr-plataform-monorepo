import { redirect } from 'next/navigation'

// Redirect root path to default locale.
// next-intl middleware handles this at runtime; this is a fallback for SSR.
const RootPage = () => redirect('/en')

export default RootPage
