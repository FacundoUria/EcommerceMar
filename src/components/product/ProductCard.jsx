import { memo, useRef, useState } from 'react';
import { Link } from 'react-router';
import Icon from '../ui/Icon.jsx';
import SmartImg from '../ui/SmartImg.jsx';
import Swatches from './Swatches.jsx';
import { formatPrecio, imgSm } from '../../lib/format.js';
import { flyToCart } from '../../lib/flyToCart.js';
import { useCart } from '../../context/CartContext.jsx';
import { useUI } from '../../context/UIContext.jsx';

const SIZES = '(min-width: 1024px) 280px, (min-width: 768px) 33vw, 50vw';

function ProductCard({ producto, etiqueta, priority = false, className = '' }) {
  const { agregar } = useCart();
  const { abrirQuickView, mostrarToast } = useUI();
  const [elegida, setElegida] = useState(null); // variante elegida (tap/click)
  const [preview, setPreview] = useState(null); // variante en hover
  const imgRef = useRef(null);

  const varianteVisible = preview || elegida;
  const imagen = varianteVisible?.imagen ?? producto.imagen;
  const tieneVariantes = producto.variantes.length > 0;
  const url = `/producto/${producto.id}${elegida ? `?v=${encodeURIComponent(elegida.nombre)}` : ''}`;
  const precio = formatPrecio(producto.precio);

  const agregarRapido = async () => {
    // Si tiene variantes y no eligió ninguna, abrimos el quick view para que elija.
    if (tieneVariantes && !elegida) {
      abrirQuickView(producto);
      return;
    }
    await flyToCart(imgRef.current?.querySelector('img'));
    agregar(producto, elegida, 1, { abrir: false });
    mostrarToast({
      tipo: 'carrito',
      titulo: 'Agregado al carrito',
      texto: elegida ? `${producto.nombre} · ${elegida.nombre}` : producto.nombre,
      imagen: imgSm(elegida?.imagen ?? producto.imagen),
    });
  };

  return (
    <article className={`group ${className}`}>
      <div className="relative">
        <Link to={url} className="block rounded-4xl" aria-label={`${producto.nombre}, ${precio}`}>
          <div ref={imgRef} className="relative aspect-square overflow-hidden rounded-4xl bg-white shadow-suave">
            <SmartImg
              src={imagen}
              srcSm={imgSm(imagen)}
              sizes={SIZES}
              alt={producto.nombre}
              placeholderTitulo={producto.nombre}
              placeholderSubtitulo={producto.marca ?? 'Dream Hair'}
              priority={priority}
              className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
            />
            {producto.destacado && (
              <span className="absolute top-3 left-3 rounded-full bg-amarillo px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-verde uppercase">
                Top
              </span>
            )}
          </div>
        </Link>

        <button
          type="button"
          onClick={() => abrirQuickView(producto, elegida)}
          aria-label={`Vista rápida de ${producto.nombre}`}
          className="glass absolute top-3 right-3 flex size-10 items-center justify-center rounded-full text-verde shadow-suave transition duration-300 hover:scale-110 active:scale-90 md:translate-y-1 md:opacity-0 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          <Icon name="ojo" size={18} />
        </button>
        <button
          type="button"
          onClick={agregarRapido}
          aria-label={tieneVariantes && !elegida ? `Elegir variante de ${producto.nombre}` : `Agregar ${producto.nombre} al carrito`}
          className="absolute right-3 bottom-3 flex size-11 items-center justify-center rounded-full bg-verde text-amarillo shadow-flotante transition duration-200 hover:scale-110 hover:bg-verde-700 active:scale-90"
        >
          <Icon name="mas" size={20} strokeWidth={2.4} />
        </button>
      </div>

      <div className="mt-3 px-1">
        <p className="text-[11px] font-bold tracking-[0.14em] text-dorado uppercase">{producto.marca ?? etiqueta}</p>
        <h3 className="mt-0.5 line-clamp-2 font-sans text-[15px] leading-snug font-semibold text-tinta">
          <Link to={url} className="hover:text-verde-700" tabIndex={-1}>
            {producto.nombre}
          </Link>
        </h3>
        <p className="mt-0.5 h-4 truncate text-xs text-gris">{varianteVisible?.nombre ?? ''}</p>
        <p className="mt-0.5 font-serif text-lg font-semibold text-verde">{precio}</p>
        {tieneVariantes && (
          <div className="mt-2">
            <Swatches
              variantes={producto.variantes}
              seleccionada={elegida?.nombre}
              onSelect={(v) => setElegida((act) => (act?.nombre === v.nombre ? null : v))}
              onPreview={setPreview}
              max={5}
              size="sm"
              nombreProducto={producto.nombre}
            />
          </div>
        )}
      </div>
    </article>
  );
}

export default memo(ProductCard);
