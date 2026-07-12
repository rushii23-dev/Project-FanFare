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
    build: {
      // Split the vendor libraries out of the app chunk: react/leaflet change
      // only when we upgrade them, so returning visitors keep them cached
      // (assets are served immutable) and only re-download the app code.
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            leaflet: ['leaflet'],
          },
        },
      },
    },
  }
})
