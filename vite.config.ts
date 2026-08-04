import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Vite blocks unrecognized Host headers by default; allow LAN .local access for mobile testing
    allowedHosts: ['dev-0.local', 'parity.local'],
  },
})
