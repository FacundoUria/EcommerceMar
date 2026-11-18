import { memo, useRef } from 'react';
import { Link } from 'react-router';
import Icon from '../ui/Icon.jsx';
import SmartImg from '../ui/SmartImg.jsx';
import { formatPrecio, imgSm } from '../../lib/format.js';
import { flyToCart } from '../../lib/flyToCart.js';
import { useCart } from '../../context/CartContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

const SIZES = '(min-width: 1280px) 300px, (min-width: 768px) 25vw, 50vw';

/**
 * Card de producto: foto protagonista + marca, nombre y precio. Nada más.
 * Desktop (hover): se eleva, la foto hace zoom y cambia a la primera variante, y "Agregar" sube desde abajo.
 * Mobile: botón "+" fijo.
 */
function ProductCard({ producto, priority = false, className = '', nivelTitulo = 'h3' }) {
  const Titulo = nivelTitulo;
  const { agregar } = useCart();
  const { abrirQuickView, mostrarToast } = useUI();
  const imgRef = useRef(null);
  const conHover = useMediaQuery('(hover: hover) and (pointer: fine)');

  const tieneVariantes = producto.variantes.length > 0;
  const fotoVariante = conHover && tieneVariantes ? producto.variantes[0].imagen : null;
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
  const etiquetaAgregar = tieneVariantes ? `Elegir variante de ${producto.nombre}` : `Agregar ${producto.nombre} al carrito`;

  return (
    <article
      className={`card group overflow-hidden rounded-3xl transition duration-500 ease-out md:hover:-translate-y-1.5 md:hover:shadow-flotante ${className}`}
    >
      <div className="relative">
        <Link to={url} className="block" aria-label={`${producto.nombre}, ${precio}`}>
          <div ref={imgRef} className="relative aspect-[4/5] overflow-hidden bg-salvia-media">
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
            {fotoVariante && (
              <img
                src={imgSm(fotoVariante)}
                alt=""
                aria-hidden="true"
                width="400"
                height="400"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full scale-[1.07] object-cover opacity-0 transition duration-700 ease-out group-hover:opacity-100"
              />
            )}
          </div>
        </Link>

        <button
          type="button"
          onClick={() => abrirQuickView(producto)}
          aria-label={`Vista rápida de ${producto.nombre}`}
          className="glass absolute top-3 right-3 flex size-10 items-center justify-center rounded-full text-tinta shadow-suave transition duration-500 hover:scale-110 active:scale-90 md:translate-y-1 md:opacity-0 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          <Icon name="ojo" size={18} />
        </button>

        {/* Mobile: "+" fijo */}
        <button
          type="button"
          onClick={agregarRapido}
          aria-label={etiquetaAgregar}
          className="absolute right-3 bottom-3 flex size-11 items-center justify-center rounded-full bg-verde text-arena shadow-flotante transition duration-200 active:scale-90 md:hidden"
        >
          <Icon name="mas" size={20} strokeWidth={2.4} />
        </button>

        {/* Desktop: "Agregar" sube desde abajo en hover / foco */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden overflow-hidden rounded-full md:block">
          <button
            type="button"
            onClick={agregarRapido}
            aria-label={etiquetaAgregar}
            className="btn btn-primario pointer-events-auto w-full translate-y-[120%] py-3 opacity-0 transition duration-500 ease-out group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Icon name="carrito" size={17} /> Agregar
          </button>
        </div>
      </div>

      <div className="px-3.5 pt-3 pb-3.5 md:px-4 md:pb-4">
        {producto.marca && <p className="text-[11px] font-bold tracking-[0.14em] text-dorado uppercase">{producto.marca}</p>}
        <Titulo className="line-clamp-2 font-sans text-[15px] leading-snug font-semibold text-tinta">
          <Link to={url} className="hover:text-verde" tabIndex={-1}>
            {producto.nombre}
          </Link>
        </Titulo>
        <p className="precio mt-1 text-base text-tinta">{precio}</p>
      </div>
    </article>
  );
}

export default memo(ProductCard);
