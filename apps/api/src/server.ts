import { resolve } from 'node:path'
import { config } from 'dotenv'

// Load env vars BEFORE any app module is imported.
// Static imports (dotenv, path) are hoisted by esbuild but they don't read
// env vars at init time — only buildApp and its deps do.
const root = resolve(__dirname, '../../..')
config({ path: resolve(root, '.env') })
config({ path: resolve(root, '.env.local'), override: true })

const start = async () => {
  // Dynamic import ensures env vars are set before @ybr/database and other
  // modules that read process.env at initialization time are loaded.
  const { buildApp } = await import('./app')

  const port = Number(process.env.PORT ?? 3002)
  const host = process.env.HOST ?? '0.0.0.0'

  const app = await buildApp()

  try {
    await app.listen({ port, host })
    app.log.info(`API running on http://${host}:${port}`)
    app.log.info(`Docs available at http://${host}:${port}/docs`)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()
