// scripts/respaldo-catalogo.mjs — corre solo antes de cada build (npm "prebuild"; también npm run respaldo).
//
// Baja de Supabase el catálogo ACTIVO (lo mismo que ve la web, con la publishable key) y lo guarda como
// respaldo de la tienda: src/data/respaldo-catalogo.json (categorías, productos con variantes, servicios) y
// src/data/respaldo-descripciones.json. productsService los usa si Supabase falla o tarda más de 3 s.
//
// Si algo falla (sin red, Supabase caído o pausado, faltan las variables) se CONSERVA el respaldo anterior
// (el commiteado) y el build sigue: este script nunca corta el build.
// En Netlify: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY ya están cargadas. En la compu: el .env.
import { existsSync, renameSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PostgrestClient } from '@supabase/postgrest-js';
import { consultarCatalogo, consultarDescripciones } from '../src/lib/consultas.js';

const ruta = (p) => fileURLToPath(new URL(p, import.meta.url));
const ARCHIVOS = {
  catalogo: ruta('../src/data/respaldo-catalogo.json'),
  descripciones: ruta('../src/data/respaldo-descripciones.json'),
};
const ESPERA_MAX = 20000;

const aviso = (msg) => {
  console.warn(`⚠️  respaldo del catálogo: ${msg}. Se conserva el respaldo anterior.`);
  process.exit(0);
};

try {
  if (existsSync(ruta('../.env'))) process.loadEnvFile(ruta('../.env'));
} catch {
  // .env ilegible: se usan las variables del entorno
}
const url = process.env.VITE_SUPABASE_URL;
const clave = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !clave) aviso('faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');

const conTope = (input, init = {}) => fetch(input, { ...init, signal: AbortSignal.timeout(ESPERA_MAX) });
const sb = new PostgrestClient(`${url}/rest/v1`, { headers: { apikey: clave }, fetch: conTope, retry: false });

let catalogo, descripciones;
try {
  [catalogo, descripciones] = await Promise.all([consultarCatalogo(sb), consultarDescripciones(sb)]);
} catch (e) {
  aviso(`no se pudo bajar (${e.message})`);
}

// Escritura atómica: primero a un .tmp y después se renombra (un build cortado no deja un JSON a medias)
const guardar = (archivo, datos) => {
  writeFileSync(`${archivo}.tmp`, `${JSON.stringify(datos, null, 1)}\n`);
  renameSync(`${archivo}.tmp`, archivo);
};
guardar(ARCHIVOS.catalogo, catalogo);
guardar(ARCHIVOS.descripciones, descripciones);
console.log(
  `✓ respaldo del catálogo: ${catalogo.categorias.length} categorías, ${catalogo.productos.length} productos, ` +
    `${catalogo.servicios.length} servicios, ${Object.keys(descripciones).length} descripciones`,
);
