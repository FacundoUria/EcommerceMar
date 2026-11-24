// Única puerta de entrada a los datos del catálogo. La UI no sabe de dónde vienen.
//
// Fuente: Supabase (categorías, productos con variantes, servicios y descripciones; solo lo activo).
// Stale-while-revalidate:
//   1. Si hay una copia en localStorage, se muestra al instante y se pide la versión nueva en segundo plano.
//   2. Primera visita (sin copia): se espera a Supabase hasta 3 s; si falla o tarda más, se usa el respaldo
//      (src/data/respaldo-catalogo.json y respaldo-descripciones.json: los baja de Supabase cada build,
//      scripts/respaldo-catalogo.mjs). La tienda nunca queda vacía.
//   3. Cuando llega una versión distinta de la que se ve, se guarda y se avisa (`alActualizar`): los hooks de
//      useCatalog y el carrito se actualizan solos. Al volver a la pestaña después de 5 min se vuelve a pedir.
// El cliente de Supabase va en un chunk aparte (lib/supabase.js), pedido con import().
import { reviews } from '../data/resenas.js';
import respaldo from '../data/respaldo-catalogo.json';
import { categoriaDeFila, productoDeFila, servicioDeFila } from '../lib/catalogo.js';
import { consultarCatalogo, consultarDescripciones, consultarLqip } from '../lib/consultas.js';
import { registrarFotos } from '../lib/imagenes.js';
import { ahoraPromo, proximoCambio } from '../lib/promo.js';

const ESPERA_MAX = 3000; // primera visita: cuánto se espera a Supabase antes de usar el respaldo local
const REVALIDAR_CADA = 5 * 60 * 1000; // al volver a la pestaña

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const cliente = () =>
  import('../lib/supabase.js').then(({ supabase }) => {
    if (!supabase) throw new Error('Supabase sin configurar');
    return supabase;
  });

function leerCopia(clave) {
  try {
    return JSON.parse(localStorage.getItem(clave))?.datos ?? null;
  } catch {
    return null;
  }
}
function guardarCopia(clave, datos) {
  try {
    localStorage.setItem(clave, JSON.stringify({ guardado: Date.now(), datos }));
  } catch {
    // modo privado / sin espacio: se sigue sin copia
  }
}

const oyentes = new Set();
/** Avisa cuando cambian los datos ya entregados ('catalogo' | 'descripciones'). Devuelve cómo desuscribirse. */
export function alActualizar(fn) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

/**
 * Un dato con copia en localStorage, Supabase y respaldo local.
 * `remoto()` → datos crudos (lo que se guarda); `armar(crudos)` → lo que usa la web; `local()` → respaldo armado.
 */
function crearFuente({ tipo, clave, remoto, armar, local }) {
  let valor; // lo que se está entregando (armado)
  let crudosEnUso = null; // los datos crudos de `valor` (para volver a armarlos: rearmar)
  let firma = null; // JSON de los datos crudos en uso (null = respaldo local)
  let fresco = false; // ya llegó la versión de Supabase en esta visita
  let primera = null;
  let pedido = null;
  let ultimoPedido = 0;

  async function revalidar() {
    if (!pedido) {
      ultimoPedido = Date.now();
      pedido = remoto().finally(() => {
        pedido = null;
      });
    }
    try {
      const crudos = await pedido;
      fresco = true;
      const nueva = JSON.stringify(crudos);
      if (nueva === firma) return true;
      const armado = armar(crudos);
      const habia = valor !== undefined;
      valor = armado;
      crudosEnUso = crudos;
      firma = nueva;
      guardarCopia(clave, crudos);
      if (habia) for (const fn of oyentes) fn(tipo);
      return true;
    } catch {
      return false; // sin conexión, Supabase caído o datos raros: queda lo que había
    }
  }

  async function primeraCarga() {
    const copia = leerCopia(clave);
    if (copia) {
      try {
        valor = armar(copia);
        crudosEnUso = copia;
        firma = JSON.stringify(copia);
        revalidar();
        return;
      } catch {
        valor = undefined; // copia rota (de otra versión): se ignora
        firma = null;
      }
    }
    const llego = await Promise.race([revalidar(), esperar(ESPERA_MAX).then(() => false)]);
    if (!llego) {
      const crudos = await local();
      if (valor === undefined) {
        // si Supabase llegó mientras tanto, gana Supabase
        valor = armar(crudos);
        crudosEnUso = crudos;
      }
    }
  }

  /** Vuelve a armar lo que se está mostrando (empezó o terminó una promo) y avisa. */
  const rearmar = () => {
    if (crudosEnUso === null || valor === undefined) return;
    try {
      valor = armar(crudosEnUso);
      for (const fn of oyentes) fn(tipo);
    } catch {
      // queda lo que había
    }
  };

  const cargar = () => {
    if (!primera) {
      primera = primeraCarga().catch((e) => {
        primera = null;
        throw e;
      });
    }
    return primera.then(() => valor);
  };

  /** Lo más nuevo posible: si todavía no llegó Supabase en esta visita, lo espera (hasta 3 s). */
  const actualizado = async () => {
    await cargar();
    if (!fresco) await Promise.race([revalidar(), esperar(ESPERA_MAX)]);
    return valor;
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && primera && Date.now() - ultimoPedido > REVALIDAR_CADA) revalidar();
    });
  }

  return { cargar, actualizado, rearmar };
}

// Productos nuevos de Mar sin precio ni foto: `activo: false` → ocultos en tienda, rutina, carruseles,
// búsqueda, chat y carrito (y su página da "No encontrado"). Supabase ya devuelve solo los activos.
const visibles = (products) => products.filter((p) => p.activo !== false);

/**
 * Filas (de Supabase o del respaldo) → catálogo de la web. Categorías: solo las que tienen productos visibles
 * (una categoría nueva y vacía no aparece en la tienda) y, si no tienen portada, la foto de su primer producto.
 */
function armarCatalogo(f) {
  registrarFotos(f.fotos); // color y fondo de las fotos subidas desde el panel (antes de que las dibuje la UI)
  const t = ahoraPromo();
  programarCambioDePromo(f.productos, t);
  const products = visibles(f.productos.map((p) => productoDeFila(p, f.productos, t)));
  if (!products.length) throw new Error('sin productos');
  const primero = new Map();
  for (const p of products) if (!primero.has(p.categoria)) primero.set(p.categoria, p);
  const categories = f.categorias
    .map(categoriaDeFila)
    .filter((c) => primero.has(c.id))
    .map((c) => (c.imagen ? c : { ...c, imagen: primero.get(c.id).imagen }));
  return { products, categories, services: f.servicios.map(servicioDeFila) };
}

// Las promos se prenden y se apagan solas: cuando empieza o termina alguna, se vuelve a armar el catálogo
// (precios, kits visibles) y los hooks y el carrito se actualizan como con una versión nueva.
let cambioDePromo = null;
function programarCambioDePromo(filas, t) {
  if (typeof window === 'undefined') return;
  clearTimeout(cambioDePromo);
  const prox = proximoCambio(filas.map((p) => ({ desde: p.promo_desde, hasta: p.promo_hasta })), t);
  // setTimeout no acepta más de ~24 días; más allá, se vuelve a calcular en la próxima carga
  if (prox !== null && prox - t < 20 * 86400000) cambioDePromo = setTimeout(() => catalogo.rearmar(), prox - t + 50);
}

const catalogo = crearFuente({
  tipo: 'catalogo',
  clave: 'dreamhair:catalogo:v1',
  remoto: () => cliente().then(consultarCatalogo),
  armar: armarCatalogo,
  local: () => respaldo,
});

const descripciones = crearFuente({
  tipo: 'descripciones',
  clave: 'dreamhair:descripciones:v1',
  remoto: () => cliente().then(consultarDescripciones),
  armar: (d) => {
    if (!d || typeof d !== 'object') throw new Error('descripciones raras');
    return d;
  },
  local: () => import('../data/respaldo-descripciones.json').then((m) => m.default),
});

// Miniaturas borrosas de las fotos subidas desde el panel (las pide lib/lqip.js después del load).
const lqipFotos = crearFuente({
  tipo: 'lqip',
  clave: 'dreamhair:lqip-fotos:v1',
  remoto: () => cliente().then(consultarLqip),
  armar: (d) => {
    if (!d || typeof d !== 'object') throw new Error('miniaturas raras');
    return d;
  },
  local: () => ({}),
});
/** { [url]: data URI } de las fotos subidas. */
export const getLqipFotos = () => lqipFotos.cargar();

/**
 * Descripciones de Mar por id de producto ({ [id]: texto }). Van aparte del catálogo (~14 KB): se piden recién
 * cuando hacen falta (/producto y el buscador de la tienda).
 */
export const getDescripciones = () => descripciones.cargar();

/** Productos del catálogo (solo los activos). */
export async function getProducts() {
  return (await catalogo.cargar()).products;
}

/**
 * Un producto activo por id, o null si no existe (o está oculto). Si no está en la copia guardada, espera a
 * la versión de Supabase antes de decir que no existe (un producto recién cargado por Mar).
 */
export async function getProductById(id) {
  const buscar = ({ products }) => products.find((p) => p.id === id);
  return buscar(await catalogo.cargar()) ?? buscar(await catalogo.actualizado()) ?? null;
}

/** Categorías con su paso de la rutina (1-4 o null) y la foto de portada (`imagen`). */
export async function getCategories() {
  return (await catalogo.cargar()).categories;
}

/** Servicios de peluquería (no van al carrito), en el orden de Mar. Cada uno trae su `grupo`. */
export async function getServices() {
  return (await catalogo.cargar()).services;
}

/** Grupos de servicios con sus servicios: [{ titulo, servicios }], en el orden en que aparece cada grupo. */
export async function getServiceGroups() {
  const { services } = await catalogo.cargar();
  const titulos = [...new Set(services.map((s) => s.grupo))];
  return titulos.map((titulo) => ({ titulo, servicios: services.filter((s) => s.grupo === titulo) }));
}

/** Reseñas de clientas (home). Locales: no están en Supabase. */
export async function getReviews() {
  return reviews;
}

/** Marcas presentes en el catálogo, ordenadas por cantidad de productos. */
export async function getBrands() {
  const { products } = await catalogo.cargar();
  const cuenta = new Map();
  for (const p of products) if (p.marca) cuenta.set(p.marca, (cuenta.get(p.marca) || 0) + 1);
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1]).map(([nombre]) => nombre);
}
