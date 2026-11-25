import { memo, useRef } from 'react';
import { Link } from 'react-router';
import Icon from '../ui/Icon.jsx';
import FotoProducto from './FotoProducto.jsx';
import CartelPromo from './CartelPromo.jsx';
import Etiquetas from './Etiquetas.jsx';
import { formatPrecio, imgSm } from '../../lib/format.js';
import { flyToCart } from '../../lib/flyToCart.js';
import { explotarDestellos } from '../../lib/destellos.js';
import { colorDe } from '../../lib/colores.js';
import { useCartAcciones } from '../../context/CartContext.jsx';
import { useUIAcciones } from '../../context/UIContext.jsx';
import Precio from '../ui/Precio.jsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import Roll from '../ui/Roll.jsx';
import { useTarjeta3D } from '../../hooks/useTarjeta3D.jsx';

const SIZES = '(min-width: 1280px) 300px, (min-width: 768px) 25vw, 50vw';

/**
 * Card de producto: foto protagonista + marca, nombre y precio. Nada más.
 * Desktop (hover): se eleva, la foto hace zoom y cambia a la primera variante, y "Agregar" sube desde abajo.
 * Mobile: botón "+" fijo.
 */
function ProductCard({ producto, priority = false, className = '', nivelTitulo = 'h3' }) {
  const Titulo = nivelTitulo;
  // Solo acciones: la card no se vuelve a renderizar cuando cambia el carrito o aparece un toast
  const { agregar } = useCartAcciones();
  const { abrirQuickView, mostrarToast } = useUIAcciones();
  const imgRef = useRef(null);
  const conHover = useMediaQuery('(hover: hover) and (pointer: fine)');

  const tieneVariantes = producto.variantes.length > 0;
  const fotoVariante = conHover && tieneVariantes ? producto.variantes[0].imagen : null;
  const url = `/producto/${producto.id}`;
  const precio = `${producto.desde ? 'Desde ' : ''}${formatPrecio(producto.precio)}`;
  const color = colorDe(producto.imagen);
  const linkRef = useRef(null); // kits: "Agregar" lleva a la ficha (sin useNavigate: re-renderizaría todas las cards al navegar)

  const agregarRapido = async (e) => {
    // Kit con cosas para elegir ("Elegí tu shampoo"): se eligen en su página
    if (producto.elecciones) {
      linkRef.current?.click();
      return;
    }
    // Con variantes: la quick view deja elegir cuál.
    if (tieneVariantes) {
      abrirQuickView(producto);
      return;
    }
    explotarDestellos(e?.currentTarget, color);
    await flyToCart(imgRef.current?.querySelector('img'));
    agregar(producto, null, 1, { abrir: false });
    mostrarToast({ tipo: 'carrito', titulo: 'Agregado', texto: producto.nombreCorto, imagen: imgSm(producto.imagen) });
  };
  const etiquetaAgregar = producto.elecciones
    ? `Elegir las opciones de ${producto.nombreCorto}`
    : tieneVariantes
      ? `Elegir variante de ${producto.nombreCorto}`
      : `Agregar ${producto.nombreCorto} al carrito`;

  // Card 3D en desktop (ver useTarjeta3D)
  const tarjeta = useTarjeta3D();

  return (
    <article
      ref={tarjeta.ref}
      {...tarjeta.eventos}
      // borde-producto: en hover el borde toma el color del producto (y el halo de la foto se expande)
      style={{ '--color-producto': color }}
      className={`card borde-producto group relative overflow-hidden rounded-3xl transition duration-500 ease-out md:hover:-translate-y-1.5 md:hover:shadow-flotante ${className}`}
    >
      {tarjeta.brillo}
      <div className="relative">
        <Link ref={linkRef} to={url} className="block" aria-label={`${producto.nombreCorto}, ${precio}`}>
          <div ref={imgRef} className="relative aspect-[4/5] overflow-hidden">
            <FotoProducto
              src={producto.imagen}
              srcSm={imgSm(producto.imagen)}
              sizes={SIZES}
              alt={producto.nombreCorto}
              placeholderTitulo={producto.nombreCorto}
              placeholderSubtitulo={producto.marca ?? 'Dream Hair'}
              priority={priority}
            />
            {fotoVariante && (
              <span className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100" aria-hidden="true">
                <FotoProducto src={fotoVariante} srcSm={imgSm(fotoVariante)} sizes={SIZES} />
              </span>
            )}
            {producto.promo && <CartelPromo promo={producto.promo} className="absolute top-3 left-3" />}
          </div>
        </Link>

        <button
          type="button"
          onClick={() => (producto.elecciones ? linkRef.current?.click() : abrirQuickView(producto))}
          aria-label={`Vista rápida de ${producto.nombreCorto}`}
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
            {producto.nombreCorto}
          </Link>
        </Titulo>
        <Precio as="p" valor={producto.precio} desde={producto.desde} antes={producto.precioAntes} className="mt-1 text-base text-tinta" />
        {producto.sinStock && <p className="mt-0.5 text-xs font-bold tracking-wide text-red-800 uppercase">Sin stock</p>}
        {/* Etiquetas cortas ("Perfumado", "Llavero de regalo"): desde 640 px, donde entran en una línea */}
        {(producto.perfumado || producto.llavero) && <Etiquetas producto={producto} corta className="mt-2 hidden sm:flex" />}
      </div>
    </article>
  );
}

export default memo(ProductCard);
