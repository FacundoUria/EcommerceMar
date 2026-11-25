import Icon from '../ui/Icon.jsx';

/** Etiquetas de un producto (las prende Mar en /admin): [{ icono, texto (ficha), corto (card) }]. */
export function etiquetasDe(producto) {
  const lista = [];
  if (producto.perfumado) lista.push({ icono: 'aroma', texto: 'Perfumado: cada color tiene su aroma', corto: 'Perfumado' });
  if (producto.llavero)
    lista.push({ icono: 'regalo', texto: `Llavero de regalo${producto.llavero.colores ? ` en ${producto.llavero.colores}` : ''}`, corto: 'Llavero de regalo' });
  return lista;
}

/**
 * Etiquetitas en píldora (mismo estilo que el chip de tamaño). `corta`: versión de la card (texto corto, más
 * chica). `children`: otras píldoras que van en la misma fila, antes (el tamaño en la ficha).
 */
export default function Etiquetas({ producto, corta = false, className = '', children }) {
  const lista = etiquetasDe(producto);
  if (!lista.length && !children) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {children}
      {lista.map((e) => (
        <p
          key={e.icono}
          className={`inline-flex items-center rounded-full bg-salvia font-bold text-verde ${corta ? 'gap-1 px-2 py-0.5 text-[11px]' : 'gap-1.5 px-3 py-1 text-xs'}`}
        >
          <Icon name={e.icono} size={corta ? 12 : 15} strokeWidth={2} className="shrink-0" />
          {corta ? e.corto : e.texto}
        </p>
      ))}
    </div>
  );
}
