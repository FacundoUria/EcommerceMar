import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { precargarCatalogo } from './hooks/useCatalog.js';
import { cargarLqip } from './lib/lqip.js';
import { iniciarSmooth } from './lib/smooth.js';
import './index.css';

precargarCatalogo();
iniciarSmooth(); // smooth scroll solo en desktop con mouse (chunk aparte)
// Miniaturas blur-up (chunk aparte): después del load, cuando el navegador está ocioso,
// para no competir con la foto principal (LCP).
const ocioso = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 200));
if (document.readyState === 'complete') ocioso(cargarLqip);
else window.addEventListener('load', () => ocioso(cargarLqip), { once: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
