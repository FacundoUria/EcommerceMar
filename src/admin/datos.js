// Lectura y escritura del panel contra Supabase (como admin: ve y edita también lo oculto).
// Cada operación está pensada para poder repetirse si se corta internet a la mitad: nunca se borra todo para
// volver a crearlo, y lo que se borra es solo lo que Mar sacó.
import { sb } from './cliente.js';
import { borrarFotos, esSubida } from './fotos.js';
import { idUnico } from './util.js';

const revisar = ({ data, error }) => {
  if (error) throw error;
  return data;
};
// Con RLS un update/delete sin permiso no da error: afecta 0 filas. Para el panel eso es un error (si no,
// diría "Guardado ✓" sin haber guardado nada).
const una = (r) => {
  const data = revisar(r);
  if (!data?.length) throw Object.assign(new Error('permission denied (0 filas)'), { code: '42501' });
  return data;
};
const porOrden = (a, b) => (a.orden ?? 0) - (b.orden ?? 0) || String(a.id).localeCompare(String(b.id));
const siguienteOrden = (filas) => filas.reduce((m, f) => Math.max(m, f.orden ?? 0), 0) + 1;

/** { categorias, productos (con variantes ordenadas), servicios }, todo ordenado. */
export async function cargarTodo() {
  const [categorias, productos, servicios] = await Promise.all([
    sb.from('categorias').select('*').order('orden').order('id').then(revisar),
    sb.from('productos').select('*, variantes(*)').order('orden').order('id').then(revisar),
    sb.from('servicios').select('*').order('orden').order('id').then(revisar),
  ]);
  for (const p of productos) p.variantes.sort(porOrden);
  return { categorias, productos, servicios };
}

// ───────── Productos ─────────

/**
 * Guarda un producto con sus variantes. `datos`: columnas de productos + variantes [{ id?, nombre, precio,
 * foto }] en orden. `original`: la fila como estaba (null si es nuevo). Devuelve el id.
 */
export async function guardarProducto(datos, original, todos) {
  const { variantes, ...producto } = datos;
  if (original) {
    una(await sb.from('productos').update(producto).eq('id', original.id).select('id'));
  } else {
    producto.id = idUnico(producto.nombre_corto || producto.nombre, [...todos.map((p) => p.id), 'nuevo']); // 'nuevo' = ruta del formulario
    producto.orden = siguienteOrden(todos);
    una(await sb.from('productos').insert(producto).select('id'));
  }
  const id = producto.id ?? original.id;

  // Variantes: 1) se borran las que Mar sacó; 2) las renombradas pasan por un nombre temporal (así dos
  // variantes pueden intercambiar nombres sin chocar con "nombre único por producto"); 3) se guardan todas.
  const antes = original?.variantes ?? [];
  const quedan = new Set(variantes.filter((v) => v.id).map((v) => v.id));
  const sacadas = antes.filter((v) => !quedan.has(v.id)).map((v) => v.id);
  if (sacadas.length) una(await sb.from('variantes').delete().in('id', sacadas).select('id'));

  const nombreAntes = new Map(antes.map((v) => [v.id, v.nombre]));
  const renombradas = variantes.filter((v) => v.id && nombreAntes.has(v.id) && nombreAntes.get(v.id) !== v.nombre);
  if (renombradas.length) {
    const temporales = renombradas.map((v) => ({ id: v.id, producto_id: id, nombre: `~${v.id}` }));
    una(await sb.from('variantes').upsert(temporales, { onConflict: 'id' }).select('id'));
  }
  if (variantes.length) {
    const filas = variantes.map((v, i) => ({
      id: v.id ?? crypto.randomUUID(),
      producto_id: id,
      nombre: v.nombre,
      precio: v.precio,
      foto: v.foto,
      orden: i + 1,
    }));
    una(await sb.from('variantes').upsert(filas, { onConflict: 'id' }).select('id'));
  }
  return id;
}

/** Solo muestra u oculta (el resto queda como está). */
export async function cambiarVisible(tabla, id, visible) {
  const columna = tabla === 'categorias' ? 'activa' : 'activo';
  una(await sb.from(tabla).update({ [columna]: visible }).eq('id', id).select('id'));
}

/** Fotos del bucket de un producto (la suya y las de sus variantes). */
export const fotosDeProducto = (p) => [...(p.fotos ?? []), ...(p.variantes ?? []).map((v) => v.foto)].filter(esSubida);

/** Borra el producto (sus variantes se borran solas) y después sus fotos del bucket. */
export async function borrarProducto(p) {
  una(await sb.from('productos').delete().eq('id', p.id).select('id'));
  await borrarFotos(fotosDeProducto(p)).catch(() => {}); // si falla, quedan archivos sueltos: no es grave
}

// ───────── Categorías ─────────

export async function guardarCategoria(datos, original, todas) {
  if (original) {
    una(await sb.from('categorias').update(datos).eq('id', original.id).select('id'));
    return original.id;
  }
  const fila = { ...datos, id: idUnico(datos.nombre, [...todas.map((c) => c.id), 'nueva']), orden: siguienteOrden(todas), activa: true };
  una(await sb.from('categorias').insert(fila).select('id'));
  return fila.id;
}

/** Pasa los productos a otra categoría (si hace falta) y borra la categoría y su portada del bucket. */
export async function borrarCategoria(categoria, moverA) {
  if (moverA) revisar(await sb.from('productos').update({ categoria_id: moverA }).eq('categoria_id', categoria.id).select('id'));
  una(await sb.from('categorias').delete().eq('id', categoria.id).select('id'));
  await borrarFotos([categoria.portada]).catch(() => {});
}

// ───────── Servicios ─────────

export async function guardarServicio(datos, original, todos) {
  if (original) {
    una(await sb.from('servicios').update(datos).eq('id', original.id).select('id'));
    return original.id;
  }
  const fila = { ...datos, id: idUnico(datos.nombre, [...todos.map((s) => s.id), 'nuevo']), orden: siguienteOrden(todos) };
  una(await sb.from('servicios').insert(fila).select('id'));
  return fila.id;
}

export async function borrarServicio(s) {
  una(await sb.from('servicios').delete().eq('id', s.id).select('id'));
  await borrarFotos([s.foto]).catch(() => {});
}

// ───────── Orden (subir / bajar) ─────────

/** `filas` en el orden nuevo → orden 1, 2, 3… (solo se escriben las que cambiaron). */
export async function reordenar(tabla, filas) {
  const cambios = filas.map((f, i) => ({ f, orden: i + 1 })).filter(({ f, orden }) => f.orden !== orden);
  for (const { f, orden } of cambios) una(await sb.from(tabla).update({ orden }).eq('id', f.id).select('id'));
}
