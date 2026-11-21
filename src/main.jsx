import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { precargarCatalogo } from './hooks/useCatalog.js';
import { cargarLqip } from './lib/lqip.js';
import './index.css';

const root = createRoot(document.getElementById('root'));

// /admin: panel de Mar (chunk aparte con supabase-js completo). Sin nada de la tienda: ni catálogo, ni
// header, ni animaciones. La tienda no lo linkea en ningún lado.
if (/^\/admin(\/|$)/.test(location.pathname)) {
  import('./admin/AdminApp.jsx').then(({ default: AdminApp }) =>
    root.render(
      <StrictMode>
        <AdminApp />
      </StrictMode>,
    ),
  );
} else {
  precargarCatalogo();
  // Miniaturas blur-up (chunk aparte): después del load, cuando el navegador está ocioso,
  // para no competir con la foto principal (LCP).
  const ocioso = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 200));
  if (document.readyState === 'complete') ocioso(cargarLqip);
  else window.addEventListener('load', () => ocioso(cargarLqip), { once: true });

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
