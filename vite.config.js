import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Serves /api/ai during `npm run dev` using the same handler Vercel runs in
// production, so local and deployed behaviour cannot drift. The key is read
// from .env.local into the dev server's own process — it never reaches the
// browser bundle.
function aiDevApi(env) {
  return {
    name: 'fanfare-ai-dev-api',
    configureServer(server) {
      if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY
      if (env.GEMINI_MODEL) process.env.GEMINI_MODEL = env.GEMINI_MODEL

      server.middlewares.use('/api/ai', async (req, res) => {
        const send = (status, payload) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(payload))
        }
        try {
          const mod = await server.ssrLoadModule('/api/ai.js')
          await mod.default(req, {
            status: (code) => ({ json: (payload) => send(code, payload) }),
          })
        } catch (e) {
          send(500, { error: e.message, code: 'DEV_HANDLER' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' = load every var, not just VITE_-prefixed ones.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), aiDevApi(env)],
    server: { open: true },
    test: {
      coverage: {
        provider: 'v8',
        // Only code that can actually execute in tests is measured: the lib
        // layer, the API handler, and the components the journey tests mount.
        include: ['src/**/*.{js,jsx}', 'api/**/*.js'],
        // main.jsx is the ReactDOM bootstrap — it runs only in a real browser
        // (the Playwright a11y gate exercises it on all 24 screens), so it has
        // no meaningful jsdom unit to measure.
        exclude: ['src/main.jsx'],
        reporter: ['text', 'html', 'lcov'],
        // Ratchet, not target: CI fails if coverage ever drops below the
        // level the suite already proves (st 94.2 / br 87.1 / fn 92.3 / ln
        // 97.2 as of 2026-07-17). Raise as the suite grows.
        thresholds: { statements: 92, branches: 85, functions: 90, lines: 96 },
      },
    },
    build: {
      // Split the vendor libraries out of the app chunk: react/leaflet change
      // only when we upgrade them, so returning visitors keep them cached
      // (assets are served immutable) and only re-download the app code.
      // Function form, not the object shorthand: vite 8's Rolldown bundler
      // only accepts the function ("manualChunks is not a function" otherwise),
      // and vite 7's Rollup accepts both.
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
            if (/node_modules[\\/]leaflet[\\/]/.test(id)) return 'leaflet'
          },
        },
      },
    },
  }
})
