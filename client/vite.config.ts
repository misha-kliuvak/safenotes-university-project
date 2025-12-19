import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'

const env = loadEnv('mock', process.cwd(), '')
const PORT = Number(env.VITE_PORT)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  preview: {
    port: PORT
  },
  server: {
    port: PORT
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scoped: true,
      scss: {
        additionalData: `@import "@/common/styles/index.scss";`
      }
    }
  },
  define: {
    global: 'window'
  }
})
