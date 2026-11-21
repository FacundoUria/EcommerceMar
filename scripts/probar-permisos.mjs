// scripts/probar-permisos.mjs — npm run supabase:probar-permisos
//
// Prueba de verdad (no supone) quién puede escribir en Supabase, con tres roles:
//   1. sin login (publishable key, como la tienda)
//   2. logueado con una cuenta que NO está en admins
//   3. logueado como admin
// En cada tabla (categorías, productos, variantes, servicios, admins) intenta crear, editar y borrar, y en el
// bucket "productos" subir y borrar una foto. Además, si puede ver un producto oculto. Lo que "pasó" se
// verifica después con la secret key (con RLS un update sin permiso no da error: afecta 0 filas).
//
// Crea dos usuarios de prueba (@example.com), filas y un archivo de prueba (ids "prueba-permisos-…"), y al
// final BORRA todo lo que creó, aunque algo falle. Usa la secret key del .env (nunca se imprime).
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
} catch {
  // sin .env: variables del entorno
}
const URL_SB = process.env.VITE_SUPABASE_URL;
const PUBLICA = process.env.VITE_SUPABASE_ANON_KEY;
const SECRETA = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_SB || !PUBLICA || !SECRETA) {
  console.error('Faltan VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY en el .env');
  process.exit(1);
}

const sinSesion = { auth: { persistSession: false, autoRefreshToken: false } };
const db = createClient(URL_SB, SECRETA, sinSesion); // service_role: prepara y verifica
const T = Date.now().toString(36);
const P = `prueba-permisos-${T}`;
const clave = `Prueba-${T}-${Math.random().toString(36).slice(2)}!`;
const emails = { admin: `prueba-panel-admin-${T}@example.com`, comun: `prueba-panel-comun-${T}@example.com` };
const usuarios = [];
const foto = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#3e6450' } }).webp().toBuffer();

const ok = (r, que) => {
  if (r.error) throw new Error(`${que}: ${r.error.message}`);
  return r.data;
};

async function limpiar() {
  await db.from('variantes').delete().like('nombre', `${P}%`);
  await db.from('productos').delete().like('id', `${P}%`);
  await db.from('categorias').delete().like('id', `${P}%`);
  await db.from('servicios').delete().like('id', `${P}%`);
  await db.from('admins').delete().like('email', `prueba-panel-%-${T}@example.com`);
  const { data: archivos } = await db.storage.from('productos').list('fotos', { search: P });
  if (archivos?.length) await db.storage.from('productos').remove(archivos.map((a) => `fotos/${a.name}`));
  for (const id of usuarios) await db.auth.admin.deleteUser(id);
}

const resultados = []; // { prueba, rol, pudo }
const ROLES = ['sinLogin', 'comun', 'admin'];

try {
  // ── Usuarios de prueba (email ya confirmado) ──
  for (const [rol, email] of Object.entries(emails)) {
    const { user } = ok(await db.auth.admin.createUser({ email, password: clave, email_confirm: true }), `crear usuario ${rol}`);
    usuarios.push(user.id);
  }
  ok(await db.from('admins').insert({ email: emails.admin }), 'cargar admin de prueba');

  const clientes = { sinLogin: createClient(URL_SB, PUBLICA, sinSesion) };
  for (const rol of ['comun', 'admin']) {
    const c = createClient(URL_SB, PUBLICA, sinSesion);
    ok(await c.auth.signInWithPassword({ email: emails[rol], password: clave }), `login ${rol}`);
    clientes[rol] = c;
  }

  for (const rol of ROLES) {
    const c = clientes[rol];
    const id = `${P}-${rol.toLowerCase()}`;
    const anotar = (prueba, pudo) => resultados.push({ prueba, rol, pudo });

    // Filas "de la casa" (las crea la secret key) para intentar editarlas y borrarlas
    ok(await db.from('categorias').insert({ id: `${id}-cat`, nombre: 'Prueba', orden: 999 }), 'fixture categoría');
    ok(await db.from('productos').insert({ id: `${id}-prod`, nombre: 'Prueba', categoria_id: `${id}-cat`, activo: false, orden: 999 }), 'fixture producto');
    const [vari] = ok(await db.from('variantes').insert({ producto_id: `${id}-prod`, nombre: `${P}-v` }).select('id'), 'fixture variante');
    ok(await db.from('servicios').insert({ id: `${id}-serv`, nombre: 'Prueba', grupo: 'Prueba', activo: false, orden: 999 }), 'fixture servicio');
    ok(await db.storage.from('productos').upload(`fotos/${id}-fija.webp`, foto, { contentType: 'image/webp' }), 'fixture foto');

    // Ver un producto oculto
    const { data: vistos } = await c.from('productos').select('id').eq('id', `${id}-prod`);
    anotar('Ver un producto oculto', (vistos?.length ?? 0) > 0);

    // Crear (insert): pasa si la fila existe después
    await c.from('categorias').insert({ id: `${id}-cat2`, nombre: 'Prueba', orden: 999 });
    anotar('Categorías: crear', (ok(await db.from('categorias').select('id').eq('id', `${id}-cat2`), 'v')).length > 0);
    await c.from('productos').insert({ id: `${id}-prod2`, nombre: 'Prueba', categoria_id: `${id}-cat`, orden: 999 });
    anotar('Productos: crear', (ok(await db.from('productos').select('id').eq('id', `${id}-prod2`), 'v')).length > 0);
    await c.from('variantes').insert({ producto_id: `${id}-prod`, nombre: `${P}-v2` });
    anotar('Variantes: crear', (ok(await db.from('variantes').select('id').eq('producto_id', `${id}-prod`).eq('nombre', `${P}-v2`), 'v')).length > 0);
    await c.from('servicios').insert({ id: `${id}-serv2`, nombre: 'Prueba', grupo: 'Prueba', orden: 999 });
    anotar('Servicios: crear', (ok(await db.from('servicios').select('id').eq('id', `${id}-serv2`), 'v')).length > 0);
    await c.from('admins').insert({ email: `prueba-panel-intruso-${rol}-${T}@example.com` });
    const intruso = ok(await db.from('admins').select('email').eq('email', `prueba-panel-intruso-${rol}-${T}@example.com`), 'v');
    anotar('Admins: agregarse', intruso.length > 0);
    if (intruso.length) await db.from('admins').delete().eq('email', intruso[0].email);

    // Editar (update): pasa si el valor cambió
    await c.from('categorias').update({ nombre: 'Cambiada' }).eq('id', `${id}-cat`);
    anotar('Categorías: editar', ok(await db.from('categorias').select('nombre').eq('id', `${id}-cat`), 'v')[0]?.nombre === 'Cambiada');
    await c.from('productos').update({ precio: 1234 }).eq('id', `${id}-prod`);
    anotar('Productos: editar', ok(await db.from('productos').select('precio').eq('id', `${id}-prod`), 'v')[0]?.precio === 1234);
    await c.from('variantes').update({ precio: 1234 }).eq('id', vari.id);
    anotar('Variantes: editar', ok(await db.from('variantes').select('precio').eq('id', vari.id), 'v')[0]?.precio === 1234);
    await c.from('servicios').update({ duracion: '9 h' }).eq('id', `${id}-serv`);
    anotar('Servicios: editar', ok(await db.from('servicios').select('duracion').eq('id', `${id}-serv`), 'v')[0]?.duracion === '9 h');

    // Fotos: subir y borrar
    const subida = await c.storage.from('productos').upload(`fotos/${id}-nueva.webp`, foto, { contentType: 'image/webp' });
    anotar('Fotos: subir', !subida.error);
    await c.storage.from('productos').remove([`fotos/${id}-fija.webp`]);
    const { data: quedan } = await db.storage.from('productos').list('fotos', { search: `${id}-fija` });
    anotar('Fotos: borrar', !quedan?.length);

    // Borrar (delete): pasa si la fila ya no está (variante antes que su producto)
    await c.from('variantes').delete().eq('id', vari.id);
    anotar('Variantes: borrar', ok(await db.from('variantes').select('id').eq('id', vari.id), 'v').length === 0);
    await c.from('productos').delete().eq('id', `${id}-prod`);
    anotar('Productos: borrar', ok(await db.from('productos').select('id').eq('id', `${id}-prod`), 'v').length === 0);
    await c.from('servicios').delete().eq('id', `${id}-serv`);
    anotar('Servicios: borrar', ok(await db.from('servicios').select('id').eq('id', `${id}-serv`), 'v').length === 0);
    await c.from('productos').delete().eq('id', `${id}-prod2`); // (si la pudo crear) para poder borrar la categoría
    await c.from('categorias').delete().eq('id', `${id}-cat`);
    anotar('Categorías: borrar', ok(await db.from('categorias').select('id').eq('id', `${id}-cat`), 'v').length === 0);
  }
} finally {
  await limpiar();
}

// ── Resultado ──
const esperado = (prueba, rol) => rol === 'admin' && prueba !== 'Admins: agregarse';
const pruebas = [...new Set(resultados.map((r) => r.prueba))];
const celda = (pudo, bien) => `${pudo ? 'SÍ' : 'no'}${bien ? '' : ' ❌'}`.padEnd(12);
console.log(`\n  ${'¿Pudo…?'.padEnd(26)}${'Sin login'.padEnd(12)}${'No admin'.padEnd(12)}${'Admin'.padEnd(12)}`);
let fallas = 0;
for (const prueba of pruebas) {
  const fila = ROLES.map((rol) => {
    const { pudo } = resultados.find((r) => r.prueba === prueba && r.rol === rol);
    const bien = pudo === esperado(prueba, rol);
    if (!bien) fallas++;
    return celda(pudo, bien);
  });
  console.log(`  ${prueba.padEnd(26)}${fila.join('')}`);
}
console.log(
  fallas
    ? `\n❌ ${fallas} resultado(s) distintos de lo esperado.`
    : '\n✓ Todo como debe ser: sin login y sin permiso no pueden escribir nada; el admin sí (menos agregarse admins).\n  Todo lo de prueba (usuarios, filas y fotos) ya se borró.',
);
process.exitCode = fallas ? 1 : 0;
