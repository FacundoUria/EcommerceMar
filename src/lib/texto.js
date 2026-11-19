/** Normaliza para búsqueda: minúsculas y sin tildes ("Cantú" → "cantu"). */
export const normalizar = (s = '') =>
  s
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** ¿El producto coincide con todas las palabras buscadas? (nombre, marca, categoría, descripción y variantes) */
export function coincide(producto, consulta, nombreCategoria = '') {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (!palabras.length) return true;
  const texto = normalizar(
    [producto.nombre, producto.marca, nombreCategoria, producto.descripcion ?? '', ...producto.variantes.map((v) => v.nombre)].join(' '),
  );
  return palabras.every((p) => texto.includes(p));
}
