import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Rutas con chunk propio (code-splitting) → archivo de la página en src/pages
const RUTAS = {
  '/tienda': 'Tienda',
  '/producto/': 'Producto',
  '/rutina': 'Rutina',
  '/servicios': 'Servicios',
  '/carrito': 'Carrito',
};

/**
 * Si alguien entra directo a una ruta (ej. un link a /tienda), empieza a bajar el chunk
 * de esa página en paralelo con el JS principal, en vez de esperar a que este lo descubra.
 */
function precargarRutaInicial() {
  return {
    name: 'precargar-ruta-inicial',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const chunks = Object.values(ctx.bundle).filter((c) => c.type === 'chunk');
        const mapa = {};
        for (const c of chunks) {
          const m = c.facadeModuleId?.match(/[\\/]pages[\\/](\w+)\.jsx$/);
          if (m) mapa[m[1]] = [c.fileName, ...c.imports].map((f) => `/${f}`);
        }
        const script = `(function(){var p=location.pathname,r=${JSON.stringify(RUTAS)},m=${JSON.stringify(mapa)};for(var k in r){if(p.indexOf(k)===0&&m[r[k]]){m[r[k]].forEach(function(f){var l=document.createElement('link');l.rel='modulepreload';l.href=f;document.head.appendChild(l)});break}}})();`;
        return html.replace('</head>', `  <script>${script}</script>\n  </head>`);
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), precargarRutaInicial()],
});
