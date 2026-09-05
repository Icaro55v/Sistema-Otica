import React from 'react'
import ReactDOM from 'react-dom/client'
// IMPORTANTE: Ajuste o caminho do import do App se o nome do arquivo for diferente no seu projeto local.
// No nosso ambiente ele se chama tica_vis_o_erp_completo_e_modular (2).tsx, mas localmente você deve renomear para App.tsx
import App from './App.tsx' 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
