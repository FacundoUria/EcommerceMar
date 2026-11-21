// Fotos del panel: todo en el navegador de Mar (sin servidor). La foto se recorta cuadrada, se achica a
// 400, 800 y 1200 px (nunca se agranda: con un recorte de 1000 px quedan 400, 800 y 1000), se pasa a webp
// (o jpg si el navegador no sabe hacer webp, como algunos iPhone viejos) y se sube al bucket "productos".
// En los datos se guarda la URL de la más grande; lib/imagenes.js deduce las otras (srcset de SmartImg).
// Además calcula lo mismo que scripts/optimizar-assets.mjs para las de /img (color dominante, fondo blanco o
// de escena, blanqueo del fondo gris, miniatura borrosa) y lo guarda en la tabla `fotos`: se ven igual.
import { sb, BUCKET } from './cliente.js';
import { anchosSubida, archivosSubida } from '../lib/imagenes.js';

export const LADO_MINIMO = 800; // menos que esto: "se va a ver borrosa"

/** Archivo elegido → { bitmap, ancho, alto, url } (con la orientación de la cámara ya aplicada). */
export async function abrirFoto(archivo) {
  if (!archivo.type.startsWith('image/')) throw new Error('no-es-foto');
  const bitmap = await createImageBitmap(archivo, { imageOrientation: 'from-image' });
  return { bitmap, ancho: bitmap.width, alto: bitmap.height, url: URL.createObjectURL(archivo) };
}

const lienzo = (ancho, alto = ancho, alpha = true) => {
  const c = document.createElement('canvas');
  c.width = ancho;
  c.height = alto;
  const ctx = c.getContext('2d', { alpha });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return [c, ctx];
};

const aBlob = (canvas, tipo, calidad) => new Promise((ok) => canvas.toBlob(ok, tipo, calidad));

let formato = null;
/** webp si el navegador lo sabe codificar; si no, jpg. */
async function formatoSalida() {
  if (!formato) {
    const [c] = lienzo(2);
    const b = await aBlob(c, 'image/webp', 0.8);
    formato = b?.type === 'image/webp' ? { tipo: 'image/webp', ext: 'webp', calidad: 0.85 } : { tipo: 'image/jpeg', ext: 'jpg', calidad: 0.88 };
  }
  return formato;
}

/**
 * Dibuja el recorte { x, y, lado } (en px de la foto) en un lienzo de n×n. El recorte puede salirse de la foto
 * (Mar alejó para que entre un producto alto entero): lo que sobra queda blanco, como el fondo de estudio.
 * Devuelve dónde quedó la foto en el lienzo { x, y, ancho, alto } (para mirar el borde de la foto real).
 */
function dibujarRecorte(ctx, bitmap, { x, y, lado }, n) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, n, n);
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  const x1 = Math.min(bitmap.width, x + lado);
  const y1 = Math.min(bitmap.height, y + lado);
  const k = n / lado;
  const zona = { x: (x0 - x) * k, y: (y0 - y) * k, ancho: (x1 - x0) * k, alto: (y1 - y0) * k };
  if (x1 > x0 && y1 > y0) ctx.drawImage(bitmap, x0, y0, x1 - x0, y1 - y0, zona.x, zona.y, zona.ancho, zona.alto);
  return zona;
}

// ───────── Lo mismo que scripts/optimizar-assets.mjs hace con las fotos de /img ─────────
// (mismos tamaños de muestra y umbrales: así una foto subida se ve igual que las del sitio)

/**
 * Píxeles RGBA del recorte achicado a n×n promediando por área (pasando por una versión de 512 px). Se parece
 * más al achique de sharp que un solo drawImage: con las 103 fotos de producto, el color dominante sale igual
 * en 73 (en 62 con drawImage).
 */
function pixeles(bitmap, { x, y, lado }, n) {
  const m = Math.max(n, Math.min(Math.round(lado), 512));
  const [, g] = lienzo(m);
  dibujarRecorte(g, bitmap, { x, y, lado }, m);
  const d = g.getImageData(0, 0, m, m).data;
  const out = new Uint8ClampedArray(n * n * 4);
  for (let j = 0; j < n; j++) {
    const y0 = Math.floor((j * m) / n);
    const y1 = Math.max(y0 + 1, Math.floor(((j + 1) * m) / n));
    for (let i = 0; i < n; i++) {
      const x0 = Math.floor((i * m) / n);
      const x1 = Math.max(x0 + 1, Math.floor(((i + 1) * m) / n));
      let r = 0;
      let gg = 0;
      let b = 0;
      let k = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const p = (yy * m + xx) * 4;
          r += d[p];
          gg += d[p + 1];
          b += d[p + 2];
          k++;
        }
      }
      const q = (j * n + i) * 4;
      out[q] = r / k;
      out[q + 1] = gg / k;
      out[q + 2] = b / k;
      out[q + 3] = 255;
    }
  }
  return out;
}

/**
 * Chrome le agrega a cada webp un perfil de color (ICCP, ~460 bytes) que en una miniatura de 20 px pesa 4 veces
 * más que la imagen. Sin perfil el navegador asume sRGB (se ve igual): queda solo el VP8, como las de sharp.
 */
function sinPerfil(uri) {
  const b = Uint8Array.from(atob(uri.split(',')[1]), (c) => c.charCodeAt(0));
  const id = (o) => String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]);
  const largo = (o) => b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24);
  let vp8 = null;
  for (let o = 12; o + 8 <= b.length; ) {
    const n = largo(o + 4);
    if (id(o) === 'ALPH' || id(o) === 'ANIM') return uri; // con transparencia o animada: se deja como está
    if (id(o) === 'VP8 ') vp8 = b.subarray(o, o + 8 + n + (n & 1));
    o += 8 + n + (n & 1);
  }
  if (!vp8) return uri;
  const out = new Uint8Array(12 + vp8.length);
  const total = 4 + vp8.length;
  out.set([82, 73, 70, 70, total & 255, (total >> 8) & 255, (total >> 16) & 255, total >>> 24, 87, 69, 66, 80]); // RIFF…WEBP
  out.set(vp8, 12);
  let bin = '';
  for (const x of out) bin += String.fromCharCode(x);
  return `data:image/webp;base64,${btoa(bin)}`;
}

/** 'blanco' si casi todo el marco (3 px de una versión de 48×48) es blanco o gris muy claro; si no, 'escena'. */
export function tipoDeFondo(bitmap, recorte) {
  const N = 48;
  const data = pixeles(bitmap, recorte, N);
  let claros = 0;
  let total = 0;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (x > 2 && x < N - 3 && y > 2 && y < N - 3) continue;
      const i = (y * N + x) * 4;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      claros += Math.min(r, g, b) > 225 && Math.max(r, g, b) - Math.min(r, g, b) < 22 ? 1 : 0;
      total++;
    }
  }
  return claros / total > 0.8 ? 'blanco' : 'escena';
}

/**
 * Color dominante "con color" (sin blancos, grises ni casi negros): cubos RGB de 16 niveles pesados por
 * saturación sobre una versión de 64×64; el promedio del cubo ganador en hex. null si la foto es neutra.
 */
export function colorDominante(bitmap, recorte) {
  const data = pixeles(bitmap, recorte, 64);
  const cubos = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 510;
    const s = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
    if (s < 0.22 || l < 0.12 || l > 0.9) continue;
    const clave = (r >> 4) * 256 + (g >> 4) * 16 + (b >> 4);
    const c = cubos.get(clave) ?? { peso: 0, r: 0, g: 0, b: 0, n: 0 };
    c.peso += s;
    c.r += r;
    c.g += g;
    c.b += b;
    c.n++;
    cubos.set(clave, c);
  }
  let mejor = null;
  for (const c of cubos.values()) if (!mejor || c.peso > mejor.peso) mejor = c;
  if (!mejor || mejor.n < 6) return null;
  const hex = (v) => Math.round(v / mejor.n).toString(16).padStart(2, '0');
  return '#' + hex(mejor.r) + hex(mejor.g) + hex(mejor.b);
}

/** ¿Empezar el recorte con la foto entera? Sí si parece producto sobre blanco (que no se corte el frasco). */
export function empezarEntera(bitmap) {
  const lado = Math.min(bitmap.width, bitmap.height);
  return tipoDeFondo(bitmap, { x: (bitmap.width - lado) / 2, y: (bitmap.height - lado) / 2, lado }) === 'blanco';
}

/** Miniatura de 20 px para el blur-up (webp calidad 40, como lqip.json; jpg si el navegador no hace webp). */
function miniatura(bitmap, recorte) {
  const [c, ctx] = lienzo(20, 20, false);
  ctx.putImageData(new ImageData(pixeles(bitmap, recorte, 20), 20, 20), 0, 0);
  const webp = c.toDataURL('image/webp', 0.4);
  const uri = webp.startsWith('data:image/webp') ? sinPerfil(webp) : c.toDataURL('image/jpeg', 0.4);
  return uri.length <= 2000 ? uri : null;
}

/**
 * Fondo "blanco" que en realidad es gris claro: lleva las luces a blanco puro (por encima de una rodilla de
 * 170; los colores del producto no cambian) para que el multiply lo funda con el fondo de la marca sin dejar
 * un recuadro. Se aplica sobre el lienzo más grande; los chicos salen de él. El borde que se mira es el de la
 * foto real (`zona`), no el relleno blanco de cuando Mar alejó.
 */
function blanquear(canvas, zona) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const imagen = ctx.getImageData(0, 0, W, H);
  const data = imagen.data;
  const borde = [[], [], []];
  const zx0 = Math.max(0, Math.ceil(zona.x));
  const zy0 = Math.max(0, Math.ceil(zona.y));
  const zx1 = Math.min(W, Math.floor(zona.x + zona.ancho));
  const zy1 = Math.min(H, Math.floor(zona.y + zona.alto));
  const paso = Math.max(1, Math.round(Math.min(zx1 - zx0, zy1 - zy0) / 120));
  for (let y = zy0; y < zy1; y += paso) {
    for (let x = zx0; x < zx1; x += paso) {
      if (x > zx0 + 3 && x < zx1 - 4 && y > zy0 + 3 && y < zy1 - 4) continue;
      const i = (y * W + x) * 4;
      for (let c = 0; c < 3; c++) borde[c].push(data[i + c]);
    }
  }
  const fondo = borde.map((v) => v.sort((a, b) => a - b)[v.length >> 1]);
  if (Math.min(...fondo) >= 250) return;
  const RODILLA = 170;
  const curva = fondo.map((b) => {
    const t = new Uint8Array(256);
    for (let v = 0; v < 256; v++) t[v] = v <= RODILLA ? v : Math.min(255, Math.round(RODILLA + ((v - RODILLA) * (255 - RODILLA)) / Math.max(1, b - RODILLA)));
    return t;
  });
  for (let i = 0; i < data.length; i += 4) for (let c = 0; c < 3; c++) data[i + c] = curva[c][data[i + c]];
  ctx.putImageData(imagen, 0, 0);
}

/**
 * Recorte { x, y, lado } (en px de la foto) → { tamanios: [{ ancho, blob }] de la más grande a la más chica,
 * datos: { color, fondo, lqip } } (los datos van a la tabla `fotos`). Se achica de a pasos (1200 → 800 → 400)
 * para que las chicas salgan nítidas. `fondo`: el que eligió Mar ("¿Cómo es la foto?"); si falta, se detecta.
 */
export async function prepararFoto(bitmap, recorte, { fondo: elegido } = {}) {
  const { lado } = recorte;
  const fondo = elegido ?? tipoDeFondo(bitmap, recorte);
  const datos = { color: colorDominante(bitmap, recorte), fondo, lqip: miniatura(bitmap, recorte) };
  const { tipo, ext, calidad } = await formatoSalida();
  const anchos = anchosSubida(lado).reverse(); // [max, …, 400]
  const tamanios = [];
  let anterior = null;
  for (const ancho of anchos) {
    const [c, ctx] = lienzo(ancho);
    if (anterior) ctx.drawImage(anterior, 0, 0, ancho, ancho);
    else {
      const zona = dibujarRecorte(ctx, bitmap, recorte, ancho);
      if (fondo === 'blanco') blanquear(c, zona);
    }
    const blob = await aBlob(c, tipo, calidad);
    if (!blob) throw new Error('no-se-pudo-procesar');
    tamanios.push({ ancho, blob, ext, tipo });
    anterior = c;
  }
  return { tamanios, datos };
}

const rutaDe = (url) => decodeURIComponent(url.split(`/object/public/${BUCKET}/`)[1] ?? '');

/**
 * Sube todos los tamaños y guarda sus datos (color, fondo, miniatura) en la tabla `fotos`. Devuelve la URL
 * pública de la más grande (la que se guarda en los datos). Si algo falla, no deja nada a medias.
 */
export async function subirFoto({ tamanios, datos }) {
  const id = crypto.randomUUID();
  const subidos = [];
  try {
    for (const { ancho, blob, ext, tipo } of tamanios) {
      const ruta = `fotos/${id}-${ancho}.${ext}`;
      const { error } = await sb.storage.from(BUCKET).upload(ruta, blob, { contentType: tipo, cacheControl: '31536000', upsert: false });
      if (error) throw error;
      subidos.push(ruta);
    }
    const max = tamanios[0];
    const url = sb.storage.from(BUCKET).getPublicUrl(`fotos/${id}-${max.ancho}.${max.ext}`).data.publicUrl;
    const { error } = await sb.from('fotos').insert({ url, ...datos });
    if (error) throw error;
    return url;
  } catch (e) {
    if (subidos.length) await sb.storage.from(BUCKET).remove(subidos);
    throw e;
  }
}

/** Borra del bucket todos los tamaños de estas fotos y sus datos. Las de /img (las del sitio) no se tocan nunca. */
export async function borrarFotos(urls) {
  const subidas = [...new Set(urls.filter((u) => u && esSubida(u)))];
  if (!subidas.length) return;
  const rutas = subidas.flatMap(archivosSubida).map(rutaDe).filter(Boolean);
  const { error } = await sb.storage.from(BUCKET).remove(rutas);
  if (error) throw error;
  await sb.from('fotos').delete().in('url', subidas);
}

/** true si la foto está en el bucket (la subió Mar desde el panel). */
export const esSubida = (url) => archivosSubida(url).length > 0;
