// scripts/migrar-a-supabase.mjs — carga el catálogo local en Supabase (npm run supabase:migrar).
//
// Lee src/data/products.js (categorías, productos —también los ocultos— con el precio propio de cada
// variante, y servicios) + src/data/descripciones.js, y hace upsert de todo por id (variantes por
// producto + nombre). Idempotente: correrlo dos veces no duplica nada. Al final muestra los conteos y
// prueba los permisos con la publishable key (lo que ve la web).
//
// Usa la secret key (SUPABASE_SERVICE_ROLE_KEY del .env, rol service_role: salta RLS). Nunca se imprime.
// ⚠️ PISA lo que haya en la base con lo de products.js (que quedó viejo: los datos los maneja Mar en /admin).
//    Sin --confirmo-pisar-todo NO escribe nada: solo avisa y muestra cuántas filas pisaría.
//
// Opciones:
//   --confirmo-pisar-todo   escribe de verdad (espera 5 s antes, para cancelar con Ctrl+C).
//   --podar                 además borra de la base lo que ya no está en products.js (sin esto solo lo avisa).
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { categories, productosCrudos, services } from '../src/data/products.js';
import descripciones from '../src/data/descripciones.js';
import imagenes from '../src/data/imagenes.json' with { type: 'json' };

try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
} catch {
  // sin .env: se usan las variables que ya estén en el entorno
}

const URL_SUPABASE = process.env.VITE_SUPABASE_URL;
const SECRETA = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PUBLICA = process.env.VITE_SUPABASE_ANON_KEY;
if (!URL_SUPABASE || !SECRETA || !PUBLICA) {
  console.error('Faltan VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY en el .env');
  process.exit(1);
}
if (!SECRETA.startsWith('sb_secret_')) {
  console.error('SUPABASE_SERVICE_ROLE_KEY no parece una secret key nueva (sb_secret_…)');
  process.exit(1);
}
if (!PUBLICA.startsWith('sb_publishable_')) {
  console.error('VITE_SUPABASE_ANON_KEY no parece una publishable key (sb_publishable_…)');
  process.exit(1);
}

const PODAR = process.argv.includes('--podar');
const opciones = { auth: { persistSession: false, autoRefreshToken: false } };
const db = createClient(URL_SUPABASE, SECRETA, opciones);
const web = createClient(URL_SUPABASE, PUBLICA, opciones);

const img = (carpeta, nombre) => `/img/${carpeta}/${nombre}.webp`;
const existe = (ruta) => Boolean(imagenes[ruta.replace(/\.webp$/, '')]);

/** Corta con un mensaje claro si Supabase devolvió error. */
function ok({ data, error, count }, que) {
  if (error) throw new Error(`${que}: ${error.message}${error.hint ? ` (${error.hint})` : ''}`);
  return count ?? data;
}

// ───────── Filas (mismo orden que products.js) ─────────

const filasCategorias = categories.map((c, i) => ({
  id: c.id,
  nombre: c.nombre,
  paso: c.paso ?? null,
  portada: c.portada ? img('productos', c.portada) : null,
  orden: i + 1,
  activa: true,
}));

const filasProductos = productosCrudos.map((p, i) => {
  // Foto explícita (`foto`) o la que lleva el id; si no hay archivo, sin fotos (la web muestra el placeholder).
  const foto = p.foto ? img('productos', p.foto) : img('productos', p.id);
  return {
    id: p.id,
    nombre: p.nombre,
    nombre_corto: p.nombreCorto ?? null,
    marca: p.marca ?? null,
    categoria_id: p.categoria,
    precio: p.precio ?? null,
    tamano: p.tamano ?? null,
    descripcion: descripciones[p.id] ?? null,
    alias: p.alias ?? [],
    destacado: Boolean(p.destacado),
    activo: p.activo !== false,
    orden: i + 1,
    fotos: p.foto || existe(foto) ? [foto] : [],
  };
});

const filasVariantes = productosCrudos.flatMap((p) =>
  (p.variantes || []).map(([nombre, foto, precio], j) => ({
    producto_id: p.id,
    nombre,
    precio: precio ?? null, // null = hereda el del producto
    foto: foto ? img('productos', foto) : null, // null = la del producto
    orden: j + 1,
  })),
);

const filasServicios = services.map((s, i) => ({
  id: s.id,
  nombre: s.nombre,
  grupo: s.grupo,
  descripcion: s.descripcion ?? null,
  precio: null,
  duracion: s.duracion ?? null,
  foto: s.imagen ?? null,
  activo: true,
  orden: i + 1,
}));

// Descripciones que no corresponden a ningún producto (id mal escrito): mejor saberlo.
const idsProductos = new Set(productosCrudos.map((p) => p.id));
const descSueltas = Object.keys(descripciones).filter((id) => !idsProductos.has(id));
if (descSueltas.length) console.warn(`⚠️  Descripciones sin producto: ${descSueltas.join(', ')}`);

// ───────── Protección: sin --confirmo-pisar-todo no se escribe NADA ─────────
// Desde la etapa 2 los datos los maneja Mar en /admin: products.js quedó viejo y esto pisaría sus cambios.

const iguales = (a, b) => JSON.stringify(a) === JSON.stringify(b);
async function cuantosPisa(tabla, filas, claveDe = (f) => f.id) {
  const columnas = Object.keys(filas[0]);
  const enBase = ok(await db.from(tabla).select(columnas.join(', ')), tabla);
  const porClave = new Map(enBase.map((f) => [claveDe(f), f]));
  let cambian = 0;
  let nuevas = 0;
  for (const f of filas) {
    const b = porClave.get(claveDe(f));
    if (!b) nuevas++;
    else if (!columnas.every((c) => iguales(f[c], b[c]))) cambian++;
  }
  return { cambian, nuevas };
}

console.log(`
⚠️  ATENCIÓN: este script PISA lo que hay en Supabase con lo de src/data/products.js.
   Los cambios que Mar hizo desde el panel /admin (precios, fotos, productos, categorías y servicios)
   se pierden. products.js ya no se actualiza: la verdad está en Supabase.
`);
const pisa = {
  categorías: await cuantosPisa('categorias', filasCategorias),
  productos: await cuantosPisa('productos', filasProductos),
  variantes: await cuantosPisa('variantes', filasVariantes, (v) => `${v.producto_id}\u0000${v.nombre}`),
  servicios: await cuantosPisa('servicios', filasServicios),
};
console.log('   Si sigue, esto pasaría en la base:');
for (const [tabla, { cambian, nuevas }] of Object.entries(pisa))
  console.log(`     ${tabla.padEnd(11)} ${String(cambian).padStart(3)} se pisan · ${String(nuevas).padStart(3)} se agregan`);

if (!process.argv.includes('--confirmo-pisar-todo')) {
  console.log(`
   No se escribió nada. Si de verdad querés pisar todo (por ejemplo, para volver a cargar la base desde cero):
     npm run supabase:migrar -- --confirmo-pisar-todo
`);
  process.exit(1);
}
console.log('\n   --confirmo-pisar-todo: se pisa en 5 segundos (Ctrl+C para cancelar)…');
await new Promise((r) => setTimeout(r, 5000));

// ───────── Upserts (categorías → productos → variantes: por las claves foráneas) ─────────

ok(await db.from('categorias').upsert(filasCategorias, { onConflict: 'id' }), 'categorias');
ok(await db.from('productos').upsert(filasProductos, { onConflict: 'id' }), 'productos');
ok(await db.from('variantes').upsert(filasVariantes, { onConflict: 'producto_id,nombre' }), 'variantes');
ok(await db.from('servicios').upsert(filasServicios, { onConflict: 'id' }), 'servicios');

// ───────── Lo que está en la base y ya no en products.js ─────────

const clave = (v) => `${v.producto_id}\u0000${v.nombre}`;
const locales = {
  categorias: new Set(filasCategorias.map((c) => c.id)),
  productos: idsProductos,
  servicios: new Set(filasServicios.map((s) => s.id)),
  variantes: new Set(filasVariantes.map(clave)),
};

const sobrantes = {};
for (const tabla of ['categorias', 'productos', 'servicios']) {
  const filas = ok(await db.from(tabla).select('id'), tabla);
  sobrantes[tabla] = filas.map((f) => f.id).filter((id) => !locales[tabla].has(id));
}
const variantesBase = ok(await db.from('variantes').select('id, producto_id, nombre'), 'variantes');
sobrantes.variantes = variantesBase.filter((v) => !locales.variantes.has(clave(v)));

const haySobrantes = Object.values(sobrantes).some((l) => l.length);
if (haySobrantes) {
  console.log(PODAR ? '\nBorrando lo que ya no está en products.js:' : '\n⚠️  En la base y no en products.js (correr con --podar para borrarlo):');
  for (const [tabla, lista] of Object.entries(sobrantes)) {
    if (!lista.length) continue;
    const nombres = tabla === 'variantes' ? lista.map((v) => `${v.producto_id} / ${v.nombre}`) : lista;
    console.log(`  ${tabla}: ${nombres.join(', ')}`);
  }
  if (PODAR) {
    // Variantes primero; los productos borran las suyas en cascada; categorías al final (restrict).
    if (sobrantes.variantes.length)
      ok(await db.from('variantes').delete().in('id', sobrantes.variantes.map((v) => v.id)), 'borrar variantes');
    for (const tabla of ['productos', 'servicios', 'categorias'])
      if (sobrantes[tabla].length) ok(await db.from(tabla).delete().in('id', sobrantes[tabla]), `borrar ${tabla}`);
  }
}

// ───────── Conteos ─────────

const contar = async (cliente, tabla, filtro) => {
  let q = cliente.from(tabla).select('*', { count: 'exact', head: true });
  if (filtro) q = q.eq(...filtro);
  return ok(await q, `contar ${tabla}`);
};

const local = {
  categorias: filasCategorias.length,
  productos: filasProductos.length,
  activos: filasProductos.filter((p) => p.activo).length,
  variantes: filasVariantes.length,
  variantesVisibles: filasVariantes.filter((v) => filasProductos.find((p) => p.id === v.producto_id).activo).length,
  conPrecioPropio: filasVariantes.filter((v) => v.precio != null).length,
  descripciones: filasProductos.filter((p) => p.descripcion).length,
  servicios: filasServicios.length,
};

const base = {
  categorias: await contar(db, 'categorias'),
  productos: await contar(db, 'productos'),
  activos: await contar(db, 'productos', ['activo', true]),
  variantes: await contar(db, 'variantes'),
  conPrecioPropio: ok(await db.from('variantes').select('*', { count: 'exact', head: true }).not('precio', 'is', null), 'contar'),
  descripciones: ok(await db.from('productos').select('*', { count: 'exact', head: true }).not('descripcion', 'is', null), 'contar'),
  servicios: await contar(db, 'servicios'),
};

// Lo que ve la web (publishable key → anon): solo lo activo.
const publico = {
  categorias: await contar(web, 'categorias'),
  productos: await contar(web, 'productos'),
  variantes: await contar(web, 'variantes'),
  servicios: await contar(web, 'servicios'),
};

const fila = (nombre, l, b, w = '') => console.log(`  ${nombre.padEnd(26)}${String(l).padStart(8)}${String(b).padStart(8)}${String(w).padStart(8)}`);
console.log(`\n  ${''.padEnd(26)}${'local'.padStart(8)}${'base'.padStart(8)}${'web'.padStart(8)}`);
fila('Categorías', local.categorias, base.categorias, publico.categorias);
fila('Productos (todos)', local.productos, base.productos);
fila('Productos activos', local.activos, base.activos, publico.productos);
fila('Variantes (todas)', local.variantes, base.variantes);
fila('Variantes de activos', local.variantesVisibles, '', publico.variantes);
fila('Variantes c/ precio propio', local.conPrecioPropio, base.conPrecioPropio);
fila('Con descripción', local.descripciones, base.descripciones);
fila('Servicios', local.servicios, base.servicios, publico.servicios);

// ───────── Permisos: la publishable key no puede escribir ni ver admins ─────────

const problemas = [];
if (publico.productos !== local.activos) problemas.push('la web no ve exactamente los productos activos');
if (publico.variantes !== local.variantesVisibles) problemas.push('la web no ve exactamente las variantes de los activos');

const prueba = { id: 'prueba-permisos', nombre: 'Prueba', orden: 999 };
const escritura = await web.from('categorias').insert(prueba);
if (!escritura.error) {
  problemas.push('¡la publishable key PUDO escribir en categorias!');
  await db.from('categorias').delete().eq('id', prueba.id);
}
const admins = await web.from('admins').select('email');
if (!admins.error && admins.data.length) problemas.push('¡la publishable key puede leer admins!');

console.log(
  problemas.length
    ? `\n❌ ${problemas.join('\n❌ ')}`
    : '\n✓ Permisos OK: la web lee solo lo activo, no puede escribir ni ver admins.',
);
if (problemas.length || (haySobrantes && !PODAR)) process.exitCode = 1;
