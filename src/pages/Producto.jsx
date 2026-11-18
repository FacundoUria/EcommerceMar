import { useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { AnimatePresence, m } from 'motion/react';
import Icon from '../components/ui/Icon.jsx';
import FotoProducto from '../components/product/FotoProducto.jsx';
import QuantityStepper from '../components/ui/QuantityStepper.jsx';
import Carousel from '../components/ui/Carousel.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import RevealText from '../components/ui/RevealText.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import CartBadge from '../components/layout/CartBadge.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import NoEncontrado from './NoEncontrado.jsx';
import { useCategories, useProduct, useProducts } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useCart } from '../context/CartContext.jsx';
import { imgSm } from '../lib/format.js';
import Precio from '../components/ui/Precio.jsx';
import { PASOS_RUTINA } from '../config/negocio.js';
import Roll from '../components/ui/Roll.jsx';

export default function Producto() {
  const { id } = useParams();
  const { data: producto, loading } = useProduct(id);
  usePageTitle(producto?.nombre ?? (loading ? 'Producto' : 'No encontrado'));

  if (loading) return <ProductoSkeleton />;
  if (!producto) return <NoEncontrado />;
  return <Detalle key={producto.id} producto={producto} />;
}

function Detalle({ producto }) {
  const [params, setParams] = useSearchParams();
  const { agregar, abrir } = useCart();
  const { data: categorias } = useCategories();
  const [cantidad, setCantidad] = useState(1);
  const [preview, setPreview] = useState(null);
  const [aviso, setAviso] = useState(false);
  const imgRef = useRef(null);

  const variante = producto.variantes.find((v) => v.nombre === params.get('v')) ?? null;
  const tieneVariantes = producto.variantes.length > 0;
  const categoria = categorias?.find((c) => c.id === producto.categoria);

  // Galería: foto principal + una por variante
  const galeria = useMemo(
    () => [{ nombre: null, imagen: producto.imagen }, ...producto.variantes],
    [producto],
  );
  const imagen = (preview ?? variante)?.imagen ?? producto.imagen;

  const elegir = (v) => {
    const next = new URLSearchParams(params);
    if (v?.nombre) next.set('v', v.nombre);
    else next.delete('v');
    setParams(next, { replace: true, preventScrollReset: true });
    setAviso(false);
  };

  const agregarAlCarrito = () => {
    if (tieneVariantes && !variante) {
      setAviso(true);
      document.getElementById('variantes')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    agregar(producto, variante, cantidad);
  };

  return (
    <div className="contenedor pt-2 pb-36 md:pt-6 md:pb-10">
      {/* Migas */}
      <nav aria-label="Migas de pan" className="mb-4 text-sm text-texto-suave">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/tienda" className="hover:text-tinta">
              Tienda
            </Link>
          </li>
          {categoria && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link to={`/tienda?cat=${categoria.id}`} className="hover:text-tinta">
                  {categoria.nombre}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Galería */}
        <Reveal className="min-w-0 md:sticky md:top-24 md:self-start">
          <div ref={imgRef} className="relative aspect-[4/5] overflow-hidden rounded-3xl md:aspect-square">
            <AnimatePresence mode="popLayout" initial={false}>
              <m.div
                key={imagen}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="size-full"
              >
                <FotoProducto
                  src={imagen}
                  alt={variante ? `${producto.nombre} — ${variante.nombre}` : producto.nombre}
                  placeholderTitulo={producto.nombre}
                  placeholderSubtitulo={producto.marca ?? 'Dream Hair'}
                  priority
                  zoom={false}
                />
              </m.div>
            </AnimatePresence>
          </div>
          {galeria.length > 1 && (
            <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Fotos del producto">
              {galeria.map((g) => {
                const activa = (variante?.nombre ?? null) === g.nombre;
                return (
                  <button
                    key={g.nombre ?? 'principal'}
                    type="button"
                    onClick={() => elegir(g.nombre ? g : null)}
                    aria-label={g.nombre ? `Ver variante ${g.nombre}` : 'Ver foto principal'}
                    aria-pressed={activa}
                    className={`size-16 shrink-0 overflow-hidden rounded-2xl border-2 bg-crema-card transition active:scale-95 md:size-20 ${
                      activa ? 'border-verde' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <FotoProducto src={imgSm(g.imagen)} zoom={false} compacta />
                  </button>
                );
              })}
            </div>
          )}
        </Reveal>

        {/* Info */}
        <Reveal delay={0.1} className="flex min-w-0 flex-col gap-6">
          <div>
            {producto.marca && <p className="text-xs font-bold tracking-[0.2em] text-dorado uppercase">{producto.marca}</p>}
            <RevealText as="h1" className="mt-1 text-4xl leading-tight md:text-5xl">{producto.nombre}</RevealText>
            <Precio as="p" valor={producto.precio} className="mt-3 text-3xl text-tinta" />
          </div>

          {tieneVariantes && (
            <div id="variantes">
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Variantes de ${producto.nombre}`} onMouseLeave={() => setPreview(null)}>
                {producto.variantes.map((v) => {
                  const activa = variante?.nombre === v.nombre;
                  return (
                    <button
                      key={v.nombre}
                      type="button"
                      role="radio"
                      aria-checked={activa}
                      onClick={() => elegir(v)}
                      onMouseEnter={() => setPreview(v)}
                      onFocus={() => setPreview(v)}
                      onBlur={() => setPreview(null)}
                      className={`flex items-center gap-2 rounded-full border-2 bg-crema-card py-1 pr-4 pl-1 text-sm font-semibold transition active:scale-95 ${
                        activa ? 'border-verde text-tinta shadow-suave' : 'border-verde/10 text-tinta hover:border-verde/40'
                      }`}
                    >
                      <img src={imgSm(v.imagen)} alt="" width="36" height="36" loading="lazy" className="size-9 rounded-full object-cover" />
                      {v.nombre}
                    </button>
                  );
                })}
              </div>
              {aviso && (
                <p className="mt-3 text-sm font-semibold text-dorado" role="alert">
                  Elegí una variante
                </p>
              )}
            </div>
          )}

          {/* Cantidad + agregar (desktop / en flujo) */}
          <div className="hidden items-center gap-3 md:flex">
            <QuantityStepper value={cantidad} onChange={setCantidad} />
            <button type="button" onClick={agregarAlCarrito} className="btn btn-primario flex-1 py-4 text-base">
              <Roll>
                <Icon name="carrito" size={20} /> Agregar
              </Roll>
            </button>
          </div>
          <div className="flex justify-center md:hidden">
            <span className="sr-only">Cantidad</span>
            <QuantityStepper value={cantidad} onChange={setCantidad} />
          </div>
        </Reveal>
      </div>

      <CompletaTuRutina producto={producto} />

      {/* Barra fija mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="glass-arena flex items-center gap-2 rounded-full p-2 shadow-flotante ring-1 ring-verde/10">
          <button
            type="button"
            onClick={abrir}
            aria-label="Abrir carrito"
            className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-crema-card text-tinta active:scale-90"
          >
            <span data-cart-target className="relative">
              <Icon name="carrito" />
              <CartBadge />
            </span>
          </button>
          <button type="button" onClick={agregarAlCarrito} className="btn btn-primario h-12 flex-1 py-0">
            <Roll>
              Agregar
            </Roll>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Productos de los otros grupos de categorías de la rutina (destacados primero). */
function CompletaTuRutina({ producto }) {
  const { data: productos } = useProducts();
  const sugeridos = useMemo(() => {
    if (!productos) return [];
    const otrosGrupos = PASOS_RUTINA.map((p) => p.categorias).filter((cats) => !cats.includes(producto.categoria));
    return otrosGrupos.flatMap((cats) =>
      productos
        .filter((x) => cats.includes(x.categoria) && x.id !== producto.id)
        .sort((a, b) => Number(!!b.destacado) - Number(!!a.destacado))
        .slice(0, 2),
    );
  }, [productos, producto]);

  if (!sugeridos.length) return null;
  return (
    <section aria-labelledby="completa-titulo" className="-mx-4 mt-16">
      <Reveal className="mb-5 flex items-end justify-between gap-4 px-4">
        <RevealText id="completa-titulo" className="text-3xl">
          Completá tu rutina
        </RevealText>
        <Link to="/rutina" className="text-sm font-bold text-verde">
          Ver rutina →
        </Link>
      </Reveal>
      <Carousel label="Completá tu rutina">
        {sugeridos.map((p) => (
          <ProductCard key={p.id} producto={p} className="w-[46%] shrink-0 snap-start sm:w-56" />
        ))}
      </Carousel>
    </section>
  );
}

function ProductoSkeleton() {
  return (
    <div className="contenedor grid gap-8 pt-6 md:grid-cols-2" role="status" aria-label="Cargando producto">
      <Skeleton className="aspect-square rounded-5xl" />
      <div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-10 w-4/5" />
        <Skeleton className="mt-4 h-8 w-32" />
        <div className="mt-8 flex gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-11 w-28 rounded-full" />
          ))}
        </div>
        <Skeleton className="mt-8 h-14 w-full rounded-full" />
      </div>
    </div>
  );
}
