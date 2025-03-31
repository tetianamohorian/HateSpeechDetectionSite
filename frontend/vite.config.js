import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Задаем порт явно
    host: "0.0.0.0" // Делаем сервер доступным для Docker
  }
})
