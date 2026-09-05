import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ISSO AQUI É O QUE RESOLVE O ERRO 404
  // O nome aqui tem que ser EXATAMENTE igual ao nome do seu repositório no GitHub (com maiúsculas e minúsculas)
  base: '/Sistema-Otica/',
});
