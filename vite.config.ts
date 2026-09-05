import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ATUALIZADO: Usando exatamente as letras maiúsculas do seu link
  base: '/Sistema-Otica/',
});
