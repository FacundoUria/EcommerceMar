import { memo, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import Icon from '../ui/Icon.jsx';
import FotoProducto from './FotoProducto.jsx';
import { formatPrecio, imgSm } from '../../lib/format.js';
import { flyToCart } from '../../lib/flyToCart.js';
import { explotarDestellos } from '../../lib/destellos.js';
import { colorDe } from '../../lib/colores.js';
import { useCart } from '../../context/CartContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import Precio from '../ui/Precio.jsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import Roll from '../ui/Roll.jsx';

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
  const color = colorDe(producto.imagen);

  const agregarRapido = async (e) => {
    // Con variantes: la quick view deja elegir cuál.
    if (tieneVariantes) {
      abrirQuickView(producto);
      return;
    }
    explotarDestellos(e?.currentTarget, color);
    await flyToCart(imgRef.current?.querySelector('img'));
    agregar(producto, null, 1, { abrir: false });
    mostrarToast({ tipo: 'carrito', titulo: 'Agregado', texto: producto.nombre, imagen: imgSm(producto.imagen) });
  };
  const etiquetaAgregar = tieneVariantes ? `Elegir variante de ${producto.nombre}` : `Agregar ${producto.nombre} al carrito`;

  // Card 3D (desktop con mouse, sin movimiento reducido): se inclina hasta 6° siguiendo el mouse
  // (perspective 800px) y un brillo diagonal se mueve con la inclinación. Sin re-renders.
  const cardRef = useRef(null);
  const brilloRef = useRef(null);
  const reducido = useReducedMotion();
  const inclinar = (e) => {
    if (!conHover || reducido || e.pointerType !== 'mouse') return;
    const el = cardRef.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = 'transform 120ms ease-out, box-shadow 500ms';
    el.style.transform = `perspective(800px) rotateX(${(-py * 12).toFixed(2)}deg) rotateY(${(px * 12).toFixed(2)}deg)`;
    if (brilloRef.current) {
      brilloRef.current.style.opacity = '1';
      brilloRef.current.style.transform = `translate(${(px * 40).toFixed(1)}%, ${(py * 40).toFixed(1)}%)`;
    }
  };
  const soltar = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 500ms';
    el.style.transform = '';
    if (brilloRef.current) brilloRef.current.style.opacity = '0';
  };

  return (
    <article
      ref={cardRef}
      data-cursor="ver"
      onPointerMove={inclinar}
      onPointerLeave={soltar}
      // borde-producto: en hover el borde toma el color del producto (y el halo de la foto se expande)
      style={{ '--color-producto': color }}
      className={`card borde-producto group relative overflow-hidden rounded-3xl transition duration-500 ease-out md:hover:-translate-y-1.5 md:hover:shadow-flotante ${className}`}
    >
      {conHover && !reducido && (
        <span aria-hidden="true" className="pointer-events-none absolute -inset-1/2 z-20 overflow-hidden">
          <span
            ref={brilloRef}
            className="absolute inset-0 opacity-0 transition-opacity duration-500"
            style={{ background: 'linear-gradient(115deg, transparent 38%, rgb(255 253 248 / 0.38) 50%, transparent 62%)' }}
          />
        </span>
      )}
      <div className="relative">
        <Link to={url} className="block" aria-label={`${producto.nombre}, ${precio}`}>
          <div ref={imgRef} className="relative aspect-[4/5] overflow-hidden">
            <FotoProducto
              src={producto.imagen}
              srcSm={imgSm(producto.imagen)}
              sizes={SIZES}
              alt={producto.nombre}
              placeholderTitulo={producto.nombre}
              placeholderSubtitulo={producto.marca ?? 'Dream Hair'}
              priority={priority}
            />
            {fotoVariante && (
              <span className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100" aria-hidden="true">
                <FotoProducto src={fotoVariante} srcSm={imgSm(fotoVariante)} sizes={SIZES} />
              </span>
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
            <Roll>
              <Icon name="carrito" size={17} /> Agregar
            </Roll>
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
        <Precio as="p" valor={producto.precio} className="mt-1 text-base text-tinta" />
      </div>
    </article>
  );
}

export default memo(ProductCard);
