import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'semidomestic-frictional-gigi.ngrok-free.dev' // replace with your actual ngrok URL
    ],
    host: true, // ensures Vite binds to all interfaces
    port: 5173  // or whichever port you’re using
  }
})