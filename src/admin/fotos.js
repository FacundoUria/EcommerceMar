// Fotos del panel: todo en el navegador de Mar (sin servidor). La foto se recorta cuadrada, se achica a
// 400, 800 y 1200 px (nunca se agranda: con un recorte de 1000 px quedan 400, 800 y 1000), se pasa a webp
// (o jpg si el navegador no sabe hacer webp, como algunos iPhone viejos) y se sube al bucket "productos".
// En los datos se guarda la URL de la más grande; lib/imagenes.js deduce las otras (srcset de SmartImg).
import { sb, BUCKET } from './cliente.js';
import { anchosSubida, archivosSubida } from '../lib/imagenes.js';

export const LADO_MINIMO = 800; // menos que esto: "se va a ver borrosa"

/** Archivo elegido → { bitmap, ancho, alto, url } (con la orientación de la cámara ya aplicada). */
export async function abrirFoto(archivo) {
  if (!archivo.type.startsWith('image/')) throw new Error('no-es-foto');
  const bitmap = await createImageBitmap(archivo, { imageOrientation: 'from-image' });
  return { bitmap, ancho: bitmap.width, alto: bitmap.height, url: URL.createObjectURL(archivo) };
}

const lienzo = (lado) => {
  const c = document.createElement('canvas');
  c.width = lado;
  c.height = lado;
  const ctx = c.getContext('2d');
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
 * Recorte { x, y, lado } (en px de la foto) → [{ ancho, blob }] de la más grande a la más chica.
 * Se achica de a pasos (1200 → 800 → 400) para que las chicas salgan nítidas.
 */
export async function generarTamanios(bitmap, { x, y, lado }) {
  const { tipo, ext, calidad } = await formatoSalida();
  const anchos = anchosSubida(lado).reverse(); // [max, …, 400]
  const salida = [];
  let anterior = null;
  for (const ancho of anchos) {
    const [c, ctx] = lienzo(ancho);
    if (anterior) ctx.drawImage(anterior, 0, 0, ancho, ancho);
    else ctx.drawImage(bitmap, x, y, lado, lado, 0, 0, ancho, ancho);
    const blob = await aBlob(c, tipo, calidad);
    if (!blob) throw new Error('no-se-pudo-procesar');
    salida.push({ ancho, blob, ext, tipo });
    anterior = c;
  }
  return salida;
}

const rutaDe = (url) => decodeURIComponent(url.split(`/object/public/${BUCKET}/`)[1] ?? '');

/** Sube todos los tamaños. Devuelve la URL pública de la más grande (la que se guarda en los datos). */
export async function subirTamanios(tamanios) {
  const id = crypto.randomUUID();
  const subidos = [];
  try {
    for (const { ancho, blob, ext, tipo } of tamanios) {
      const ruta = `fotos/${id}-${ancho}.${ext}`;
      const { error } = await sb.storage.from(BUCKET).upload(ruta, blob, { contentType: tipo, cacheControl: '31536000', upsert: false });
      if (error) throw error;
      subidos.push(ruta);
    }
  } catch (e) {
    if (subidos.length) await sb.storage.from(BUCKET).remove(subidos);
    throw e;
  }
  const max = tamanios[0];
  return sb.storage.from(BUCKET).getPublicUrl(`fotos/${id}-${max.ancho}.${max.ext}`).data.publicUrl;
}

/** Borra del bucket todos los tamaños de estas fotos. Las de /img (las del sitio) no se tocan nunca. */
export async function borrarFotos(urls) {
  const rutas = [...new Set(urls.filter(Boolean).flatMap(archivosSubida).map(rutaDe).filter(Boolean))];
  if (!rutas.length) return;
  const { error } = await sb.storage.from(BUCKET).remove(rutas);
  if (error) throw error;
}

/** true si la foto está en el bucket (la subió Mar desde el panel). */
export const esSubida = (url) => archivosSubida(url).length > 0;
