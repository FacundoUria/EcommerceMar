import { readFileSync } from 'node:fs';
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
        // Playfair (normal + cursiva) de los títulos: se pide con el HTML en vez de esperar al CSS.
        // (Manrope no: probado, no bajaba el CLS de /carrito y retrasaba el FCP del home 0.9 → 1.9 s)
        const fuentes = Object.values(ctx.bundle)
          .filter((a) => a.type === 'asset' && /playfair-display-latin-500-(normal|italic)/.test(a.fileName))
          .map((a) => `  <link rel="preload" as="font" type="font/woff2" href="/${a.fileName}" crossorigin />`)
          .join('\n');
        return html.replace('</head>', `${fuentes}\n  <script>${script}</script>\n  </head>`);
      },
    },
  };
}

/**
 * Imágenes de index.html (preload del hero, logo del shell, favicon) con las versiones reales de
 * src/data/imagenes.json: el srcset del preload queda igual al del <img> del hero sin copiarlo a mano.
 */
const HERO = '/img/mar/inicio'; // = HERO_FOTO de Home.jsx
function imagenesDelHtml() {
  return {
    name: 'imagenes-del-html',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const manifiesto = JSON.parse(readFileSync(new URL('./src/data/imagenes.json', import.meta.url), 'utf8'));
        const srcset = (k) => manifiesto[k].w.map((w) => `${k}-${w}.webp ${w}w`).join(', ');
        const cerca = (k, px) => `${k}-${manifiesto[k].w.find((w) => w >= px) ?? manifiesto[k].w.at(-1)}.webp`;
        return html
          .replaceAll('%HERO_SRC%', cerca(HERO, 640)) // = src de respaldo de SmartImg
          .replaceAll('%HERO_SRCSET%', srcset(HERO))
          .replaceAll('%LOGO_SRC%', cerca('/img/marca/LOGO', 96))
          .replaceAll('%LOGO_SRCSET%', srcset('/img/marca/LOGO'))
          .replaceAll('%FAVICON%', cerca('/img/marca/logocito', 192));
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), imagenesDelHtml(), precargarRutaInicial()],
});
