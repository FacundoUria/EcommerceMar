/** Normaliza para búsqueda: minúsculas y sin tildes ("Cantú" → "cantu"). */
export const normalizar = (s = '') =>
  s
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/**
 * ¿El producto coincide con todas las palabras buscadas? (nombre, marca, categoría, variantes, `alias` y, si
 * ya está cargada, la descripción de Mar: va en un archivo aparte, ver useDescripciones)
 */
export function coincide(producto, consulta, nombreCategoria = '', descripcion = '') {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (!palabras.length) return true;
  const texto = normalizar(
    [producto.nombre, producto.nombreCorto ?? '', producto.marca, nombreCategoria, descripcion ?? '', ...producto.variantes.map((v) => v.nombre), ...(producto.alias ?? [])].join(' '),
  );
  return palabras.every((p) => texto.includes(p));
}
