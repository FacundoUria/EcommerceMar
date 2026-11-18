import { memo, useRef } from 'react';
import { Link } from 'react-router';
import Icon from '../ui/Icon.jsx';
import SmartImg from '../ui/SmartImg.jsx';
import { formatPrecio, imgSm } from '../../lib/format.js';
import { flyToCart } from '../../lib/flyToCart.js';
import { useCart } from '../../context/CartContext.jsx';
import { useUI } from '../../context/UIContext.jsx';

const SIZES = '(min-width: 1024px) 280px, (min-width: 768px) 33vw, 50vw';

/** Card de producto: foto protagonista + marca, nombre y precio. Nada más. */
function ProductCard({ producto, priority = false, className = '', nivelTitulo = 'h3' }) {
  const Titulo = nivelTitulo;
  const { agregar } = useCart();
  const { abrirQuickView, mostrarToast } = useUI();
  const imgRef = useRef(null);

  const tieneVariantes = producto.variantes.length > 0;
  const url = `/producto/${producto.id}`;
  const precio = formatPrecio(producto.precio);

  const agregarRapido = async () => {
    // Con variantes: la quick view deja elegir cuál.
    if (tieneVariantes) {
      abrirQuickView(producto);
      return;
    }
    await flyToCart(imgRef.current?.querySelector('img'));
    agregar(producto, null, 1, { abrir: false });
    mostrarToast({ tipo: 'carrito', titulo: 'Agregado', texto: producto.nombre, imagen: imgSm(producto.imagen) });
  };

  return (
    <article className={`group ${className}`}>
      <div className="relative">
        <Link to={url} className="block rounded-4xl" aria-label={`${producto.nombre}, ${precio}`}>
          <div ref={imgRef} className="card relative aspect-[4/5] overflow-hidden rounded-4xl">
            <SmartImg
              src={producto.imagen}
              srcSm={imgSm(producto.imagen)}
              sizes={SIZES}
              alt={producto.nombre}
              placeholderTitulo={producto.nombre}
              placeholderSubtitulo={producto.marca ?? 'Dream Hair'}
              priority={priority}
              className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
            />
          </div>
        </Link>

        <button
          type="button"
          onClick={() => abrirQuickView(producto)}
          aria-label={`Vista rápida de ${producto.nombre}`}
          className="glass absolute top-3 right-3 flex size-10 items-center justify-center rounded-full text-verde shadow-suave transition duration-300 hover:scale-110 active:scale-90 md:translate-y-1 md:opacity-0 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          <Icon name="ojo" size={18} />
        </button>
        <button
          type="button"
          onClick={agregarRapido}
          aria-label={tieneVariantes ? `Elegir variante de ${producto.nombre}` : `Agregar ${producto.nombre} al carrito`}
          className="absolute right-3 bottom-3 flex size-11 items-center justify-center rounded-full bg-verde text-amarillo shadow-flotante transition duration-200 hover:scale-110 hover:bg-verde-700 active:scale-90"
        >
          <Icon name="mas" size={20} strokeWidth={2.4} />
        </button>
      </div>

      <div className="mt-2.5 px-1">
        {producto.marca && <p className="text-[11px] font-bold tracking-[0.14em] text-dorado uppercase">{producto.marca}</p>}
        <Titulo className="line-clamp-2 font-sans text-[15px] leading-snug font-semibold text-tinta">
          <Link to={url} className="hover:text-verde-700" tabIndex={-1}>
            {producto.nombre}
          </Link>
        </Titulo>
        <p className="mt-0.5 font-serif text-lg font-semibold text-verde">{precio}</p>
      </div>
    </article>
  );
}

export default memo(ProductCard);
