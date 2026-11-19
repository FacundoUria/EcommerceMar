// Auditoría de calidad de imagen: ¿cada foto tiene resolución para el tamaño al que se muestra?
// Recorre el sitio real (vite preview sobre dist/) en mobile 390px @3x y desktop 1440px @2x, mide el ancho
// al que se ve cada imagen (según su caja y object-fit) y lo compara con el original (src/data/imagenes.json).
//   sí    → el original alcanza para la densidad pedida
//   justo → alcanza para 2x en mobile / 1.33x en desktop (se ve bien; en pantallas 3x apenas más suave)
//   no    → se estiraría: las fotos "contain" se muestran más chicas (SmartImg); hay que pedirle el original a Mar
// Uso: npm run build && npm run imagenes:auditar   (usa el Chrome instalado; tabla en docs/auditoria-imagenes.md)
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { products } from '../src/data/products.js';

const PUERTO = 4179;
const BASE = `http://localhost:${PUERTO}`;
const manifiesto = JSON.parse(readFileSync('src/data/imagenes.json', 'utf8'));
const VIDEO = { '/video/proceso': [576, 1024] }; // poster del video (el video original es 576×1024)
const DISPOSITIVOS = [
  { nombre: 'mobile', dpr: 3, opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  { nombre: 'desktop', dpr: 2, opts: { viewport: { width: 1440, height: 900 } } },
];

// Páginas: todas las de producto (y sus variantes) + el resto; el carrito con 3 productos
const RUTAS = ['/', '/tienda', '/rutina', '/servicios', '/carrito'];
for (const p of products) {
  RUTAS.push(`/producto/${p.id}`);
  for (const v of p.variantes) RUTAS.push(`/producto/${p.id}?v=${encodeURIComponent(v.nombre)}`);
}
const CARRITO = products.slice(0, 3).map((p) => ({ clave: `${p.id}::`, id: p.id, nombre: p.nombre, variante: null, precio: p.precio, imagen: p.imagen, cantidad: 1 }));

// En la página: ancho mostrado (px CSS) de cada imagen, con los topes de resolución apagados (= lo que pide el diseño).
function medir() {
  const res = [];
  const ancho = (fit, w, h, ar) => (fit === 'cover' ? Math.max(w, h * ar) : fit === 'contain' ? Math.min(w, h * ar) : w);
  for (const img of document.querySelectorAll('img')) {
    const u = img.currentSrc || img.getAttribute('src');
    if (!u) continue; // sin src: lejos de la pantalla (SmartImg la pide recién cerca)
    const ruta = new URL(u, location.href).pathname;
    if (!/^\/(img|video)\//.test(ruta)) continue;
    const w = img.clientWidth;
    const h = img.clientHeight;
    if (!w) continue;
    // sin cargar (carrusel fuera de pantalla): proporción de los atributos width/height
    const ar = img.naturalWidth ? img.naturalWidth / img.naturalHeight : +img.getAttribute("width") / +img.getAttribute("height");
    if (!ar) continue;
    const fit = getComputedStyle(img).objectFit;
    res.push({
      clave: ruta.replace(/(-sm|-lg|-\d+)?\.webp$/, ''),
      fit,
      mostrado: ancho(fit, w, h, ar),
      diseno: ancho(fit, w, h, ar),
    });
  }
  const canvas = document.querySelector('[data-mini-mar] canvas');
  if (canvas?.clientWidth) res.push({ clave: '/img/marca/mini-mar', fit: 'canvas', mostrado: canvas.clientWidth, diseno: canvas.clientWidth });
  return res;
}

async function recorrer(page) {
  const alto = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < alto; y += 350) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(90);
  }
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(300);
}

const preview = spawn('npx', ['vite', 'preview', '--port', String(PUERTO), '--strictPort'], { shell: true, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch({ channel: 'chrome' });
const datos = {}; // clave → { mobile: {mostrado, diseno, donde}, desktop: {...}, fit }

try {
  for (const d of DISPOSITIVOS) {
    const ctx = await browser.newContext(d.opts);
    await ctx.addInitScript((c) => {
      try {
        window.__auditoriaSinTope = true; // mide el tamaño que pide el diseño (sin el tope de resolución)
        sessionStorage.setItem('dh-intro', '1');
        localStorage.setItem('dreamhair:carrito:v1', JSON.stringify(c));
      } catch {}
    }, CARRITO);
    const page = await ctx.newPage();
    const anotar = (lista, donde) => {
      for (const m of lista) {
        const e = (datos[m.clave] ??= { fit: m.fit });
        const prev = e[d.nombre];
        if (!prev || m.diseno > prev.diseno) e[d.nombre] = { mostrado: m.mostrado, diseno: m.diseno, donde };
      }
    };
    for (const ruta of RUTAS) {
      await page.goto(BASE + ruta, { waitUntil: 'load' });
      await page.waitForTimeout(ruta.startsWith('/producto/') ? 700 : 1200);
      if (!ruta.startsWith('/producto/')) await recorrer(page);
      anotar(await page.evaluate(medir), ruta);
      if (ruta === '/' && d.nombre === 'desktop') {
        // paneles de categorías: cada uno se expande con el hover
        await page.evaluate(() => window.scrollTo(0, 0));
        for (const panel of await page.locator('section[aria-labelledby="cat-titulo"] a').all()) {
          await panel.hover().catch(() => {});
          await page.waitForTimeout(700);
          anotar(await page.evaluate(medir), '/ (categoría expandida)');
        }
      }
      if (ruta === '/tienda') {
        const qv = page.locator('button[aria-label^="Vista rápida"]').first();
        if (await qv.count()) {
          await qv.click({ force: true });
          await page.waitForTimeout(900);
          anotar(await page.evaluate(medir), 'quick view');
          await page.keyboard.press('Escape');
        }
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  preview.kill();
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(preview.pid), '/T', '/F'], { stdio: 'ignore' });
}

// Tabla
const filas = [];
for (const [clave, e] of Object.entries(datos).sort()) {
  const o = manifiesto[clave]?.o ?? VIDEO[clave];
  if (!o) continue;
  const mob = e.mobile?.diseno ?? 0;
  const desk = e.desktop?.diseno ?? 0;
  const necesita = Math.ceil(Math.max(mob * 3, desk * 2));
  const veredicto = o[0] >= necesita ? 'sí' : o[0] >= necesita * (2 / 3) ? 'justo' : 'no';
  const accion = veredicto !== 'no' ? '' : clave.startsWith('/img/productos/') ? `se muestra más chica: máx ${Math.round(o[0] / 2)}px de ancho` : 'revisar a mano';
  const donde = mob * 3 >= desk * 2 ? `${e.mobile?.donde} (mobile)` : `${e.desktop?.donde} (desktop)`;
  filas.push({ clave, o, mob: Math.round(mob), desk: Math.round(desk), necesita, veredicto, accion, donde });
}

const md = [
  '# Auditoría de imágenes',
  '',
  `Generada con \`npm run imagenes:auditar\` (${new Date().toISOString().slice(0, 10)}). Tamaño mostrado = ancho en px CSS al que la pide el diseño (máximo entre todas las páginas); necesita = mobile ×3 o desktop ×2, lo mayor.`,
  '',
  '| Imagen | Original | Mostrado mobile | Mostrado desktop | Necesita | ¿Alcanza? | Dónde se ve más grande | Acción |',
  '|---|---|---|---|---|---|---|---|',
  ...filas.map((f) => `| ${f.clave.replace(/^\/(img|video)\//, '')} | ${f.o[0]}×${f.o[1]} | ${f.mob}px | ${f.desk}px | ${f.necesita}px | ${f.veredicto} | ${f.donde} | ${f.accion} |`),
  '',
];
writeFileSync('docs/auditoria-imagenes.md', md.join('\n'));
const cuenta = (v) => filas.filter((f) => f.veredicto === v).length;
console.log(`${filas.length} imágenes · sí ${cuenta('sí')} · justo ${cuenta('justo')} · no ${cuenta('no')} → docs/auditoria-imagenes.md`);
for (const f of filas.filter((f) => f.veredicto === 'no')) console.log(`  no: ${f.clave} (${f.o[0]}px, necesita ${f.necesita}px, ${f.donde}) ${f.accion}`);
