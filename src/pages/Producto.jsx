import { useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router';
import { AnimatePresence, m } from 'motion/react';
import Icon from '../components/ui/Icon.jsx';
import FotoProducto from '../components/product/FotoProducto.jsx';
import QuantityStepper from '../components/ui/QuantityStepper.jsx';
import Carrusel from '../components/ui/Carrusel.jsx';
import Reveal, { cascada } from '../components/ui/Reveal.jsx';
import RevealText from '../components/ui/RevealText.jsx';
import { ConDestellos } from '../components/marca/Destellos.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import CartBadge from '../components/layout/CartBadge.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import NoEncontrado from './NoEncontrado.jsx';
import { useCategories, useDescripciones, usePasosRutina, useProduct, useProducts } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useCartAcciones } from '../context/CartContext.jsx';
import { imgSm } from '../lib/format.js';
import Precio from '../components/ui/Precio.jsx';
import { explotarDestellos } from '../lib/destellos.js';
import { colorDe } from '../lib/colores.js';
import { whatsappCon } from '../config/negocio.js';
import { imgFija } from '../lib/imagenes.js';
import Roll from '../components/ui/Roll.jsx';
import Expandible from '../components/ui/Expandible.jsx';
import FilaDeslizable from '../components/ui/FilaDeslizable.jsx';
import { esDesde, precioDe } from '../lib/precios.js';
import { terminaEn } from '../lib/promo.js';
import CartelPromo from '../components/product/CartelPromo.jsx';
import SelectorColores from '../components/product/Colores.jsx';
import Etiquetas from '../components/product/Etiquetas.jsx';
import { IDS_RENOMBRADOS } from '../config/renombrados.js';

export default function Producto() {
  const { id } = useParams();
  const { search } = useLocation();
  // Producto que cambió de id (config/renombrados.js): el link viejo lleva al nuevo
  const idNuevo = IDS_RENOMBRADOS[id];
  const { data: producto, loading } = useProduct(idNuevo ?? id);
  usePageTitle(producto?.nombre ?? (loading ? 'Producto' : 'No encontrado'));

  if (idNuevo) return <Navigate to={`/producto/${idNuevo}${search}`} replace />;
  if (loading) return <ProductoSkeleton />;
  if (!producto) return <NoEncontrado />;
  return <Detalle key={producto.id} producto={producto} />;
}

function Detalle({ producto }) {
  const [params, setParams] = useSearchParams();
  const { agregar, abrir } = useCartAcciones();
  const { data: categorias } = useCategories();
  const [cantidad, setCantidad] = useState(1);
  const [preview, setPreview] = useState(null);
  const [aviso, setAviso] = useState(false);
  const imgRef = useRef(null);
  // Descripción de Mar: archivo aparte, ya pedido junto con el chunk de esta página (App.jsx)
  const descripcion = useDescripciones()?.[producto.id];

  // La de la URL (?v=), salvo que esté agotada
  const variante = producto.variantes.find((v) => v.nombre === params.get('v') && !v.agotado) ?? null;
  const [vista, setVista] = useState(null); // otra foto del producto elegida en la galería (no es una variante)
  // Consulta por WhatsApp con el producto (y la variante elegida) ya escritos
  const nombreMensaje = `${producto.marca && producto.marca !== 'Dream Hair' ? `${producto.marca} ` : ''}${producto.nombreCorto}`;
  const consulta = whatsappCon(`¡Hola Mar! Tengo una consulta sobre: ${nombreMensaje}${variante ? ` (${variante.nombre})` : ''}`);
  const tieneVariantes = producto.variantes.length > 0;
  const categoria = categorias?.find((c) => c.id === producto.categoria);

  // Galería: la foto principal + las otras fotos del producto (`galeria`: Pirulito sobre madera, exhibidor…) +
  // una miniatura por cada foto propia de una variante. Si una variante tiene como foto la misma del producto
  // (Ghee 350 g), queda la de la variante (así se marca al elegirla); las variantes sin foto propia se eligen
  // desde los chips (la principal, que muestra todos los colores, no elige ninguna)
  const galeria = useMemo(() => {
    const vistas = new Set();
    const variantes = producto.variantes.filter((v) => v.propia && !vistas.has(v.imagen) && vistas.add(v.imagen));
    const extras = (producto.galeria ?? []).filter((src) => !vistas.has(src)).map((src) => ({ nombre: null, extra: true, imagen: src }));
    return [...(vistas.has(producto.imagen) ? [] : [{ nombre: null, imagen: producto.imagen }]), ...extras, ...variantes];
  }, [producto]);
  const imagen = preview?.imagen ?? vista ?? variante?.imagen ?? producto.imagen;

  const elegir = (v) => {
    const next = new URLSearchParams(params);
    if (v?.nombre) next.set('v', v.nombre);
    else next.delete('v');
    setParams(next, { replace: true, preventScrollReset: true });
    setVista(null);
    setAviso(false);
  };

  // Kits: lo que se elige al comprarlo ("Elegí tu shampoo") → { [clave]: opción }
  const [elegidas, setElegidas] = useState({});
  const [falta, setFalta] = useState(null); // clave de la elección que falta (aviso)

  const agregarAlCarrito = (e) => {
    if (producto.sinStock) return; // todas las variantes agotadas: el botón dice "Sin stock"
    if (tieneVariantes && !variante) {
      setAviso(true);
      document.getElementById('variantes')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const sinElegir = producto.elecciones?.find((x) => !elegidas[x.clave]);
    if (sinElegir) {
      setFalta(sinElegir.clave);
      const el = document.getElementById(`eleccion-${producto.elecciones.indexOf(sinElegir)}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus({ preventScroll: true });
      return;
    }
    explotarDestellos(e?.currentTarget, colorDe(imagen));
    agregar(producto, variante, cantidad, { elecciones: producto.elecciones?.map((x) => [x.clave, elegidas[x.clave]]) ?? null });
  };

  return (
    <div className="contenedor pt-2 pb-36 md:pt-6 md:pb-10">
      {/* Migas */}
      <nav aria-label="Migas de pan" className="mb-4 text-sm text-texto-suave">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/tienda" className="hover:text-tinta">
              Productos
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
                  className="fondo-color-producto" // degradé suave del color del producto hacia arena
                />
              </m.div>
            </AnimatePresence>
            {producto.promo && <CartelPromo promo={producto.promo} className="absolute top-4 left-4" />}
          </div>
          {galeria.length > 1 && (
            <FilaDeslizable className="-mx-4 mt-3" claseFila="gap-2 px-4 pb-1" activo={vista ?? variante?.nombre ?? null} aria-label="Fotos del producto">
              {galeria.map((g, i) => {
                // La principal queda marcada también con una variante sin foto propia (es la que se ve)
                const activa = g.extra
                  ? vista === g.imagen
                  : !vista && (g.nombre === null ? !variante?.propia : variante?.nombre === g.nombre);
                return (
                  <button
                    key={g.nombre ?? g.imagen}
                    type="button"
                    onClick={() => (g.extra ? setVista(g.imagen) : elegir(g.nombre ? g : null))}
                    aria-label={g.nombre ? `Ver variante ${g.nombre}` : g.extra ? `Ver foto ${i + 1}` : 'Ver foto principal'}
                    aria-pressed={activa}
                    className={`size-16 shrink-0 overflow-hidden rounded-2xl border-2 bg-crema-card transition active:scale-95 md:size-20 ${
                      activa ? 'border-verde' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <FotoProducto src={imgSm(g.imagen)} zoom={false} compacta />
                  </button>
                );
              })}
            </FilaDeslizable>
          )}
        </Reveal>

        {/* Info */}
        <Reveal delay={0.1} className="flex min-w-0 flex-col gap-6">
          <div>
            {producto.marca && <p className="text-xs font-bold tracking-[0.2em] text-dorado uppercase">{producto.marca}</p>}
            <ConDestellos className="mt-1">
              <RevealText as="h1" className="text-3xl leading-tight md:text-4xl">{producto.nombre}</RevealText>
            </ConDestellos>
            {/* Tamaño + etiquetas ("Perfumado: cada color tiene su aroma", "Llavero de regalo") */}
            <Etiquetas producto={producto} className="mt-3">
              {producto.tamano && (
                <p className="inline-flex rounded-full bg-salvia px-3 py-1 text-xs font-bold text-verde">
                  <span className="sr-only">Tamaño:</span> {producto.tamano}
                </p>
              )}
            </Etiquetas>
            {/* Descripción de Mar (tal cual): mobile 4 líneas + "Ver más"; desktop completa */}
            {descripcion && (
              <Expandible lineas={4} soloMobile className="mt-3 text-[15px] leading-relaxed text-texto-suave">
                <p>{descripcion}</p>
              </Expandible>
            )}
            <Precio
              as="p"
              valor={precioDe(producto, preview ?? variante)}
              desde={esDesde(producto, preview ?? variante)}
              antes={producto.precioAntes}
              className="mt-3 text-3xl text-tinta"
            />
            {producto.promo && (
              <p className="mt-1.5 text-sm font-bold text-dorado">
                {producto.promo.nombre} · {terminaEn(producto.promo.hasta)}
              </p>
            )}
            {producto.sinStock && <p className="mt-1.5 text-sm font-bold tracking-wide text-red-800 uppercase">Sin stock</p>}
          </div>

          {/* Kit: qué trae */}
          {producto.incluye && (
            <div>
              <p className="text-sm font-bold text-tinta">Incluye</p>
              <ul className="mt-2 space-y-1.5">
                {producto.incluye.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-[15px] text-tinta">
                    <Icon name="check" size={18} strokeWidth={2.4} className="mt-0.5 shrink-0 text-verde" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sin selector de color (config/color.js) */}
          {producto.colorACoordinar && (
            <p className="flex items-start gap-2.5 rounded-2xl bg-salvia px-4 py-3 text-[15px] font-semibold text-tinta">
              <Icon name="whatsapp" size={20} className="mt-px shrink-0 text-verde" />
              El color lo coordinás con Mar por WhatsApp
            </p>
          )}
          {producto.colorUnico && (
            <p className="text-[15px] text-tinta">
              <span className="font-bold">Color:</span> {producto.colorUnico}
            </p>
          )}

          {/* Kit: lo que se elige (selectores grandes, uno por cosa) */}
          {producto.elecciones?.map((x, i) => (
            <div key={x.clave}>
              <label htmlFor={`eleccion-${i}`} className="mb-2 block text-[17px] font-bold text-tinta">
                {x.titulo}
              </label>
              <select
                id={`eleccion-${i}`}
                value={elegidas[x.clave] ?? ''}
                onChange={(ev) => {
                  setElegidas((s) => ({ ...s, [x.clave]: ev.target.value }));
                  setFalta(null);
                }}
                aria-invalid={falta === x.clave}
                aria-describedby={falta === x.clave ? `eleccion-${i}-error` : undefined}
                className={`block h-14 w-full rounded-2xl border-2 bg-crema-card px-4 text-[17px] text-tinta outline-none focus-visible:border-verde ${
                  falta === x.clave ? 'border-red-700' : 'border-verde/20'
                }`}
              >
                <option value="" disabled>
                  Tocá para elegir
                </option>
                {x.opciones.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {falta === x.clave && (
                <p id={`eleccion-${i}-error`} className="mt-2 text-sm font-semibold text-red-700" role="alert">
                  {x.titulo} antes de agregar
                </p>
              )}
            </div>
          ))}

          {/* Variantes que son colores: cuadraditos de color con el nombre abajo */}
          {producto.deColores && (
            <div id="variantes">
              <SelectorColores
                variantes={producto.variantes}
                seleccionada={variante?.nombre}
                onSelect={elegir}
                onPreview={setPreview}
                nombreProducto={producto.nombre}
              />
              {aviso && (
                <p className="mt-3 text-sm font-semibold text-dorado" role="alert">
                  Elegí un color
                </p>
              )}
            </div>
          )}

          {tieneVariantes && !producto.deColores && (
            <div id="variantes">
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Variantes de ${producto.nombre}`} onMouseLeave={() => setPreview(null)}>
                {producto.variantes.map((v) => {
                  const activa = variante?.nombre === v.nombre;
                  const agotada = !!v.agotado; // tachada con "Agotado", no se puede elegir
                  return (
                    <button
                      key={v.nombre}
                      type="button"
                      role="radio"
                      aria-checked={activa}
                      aria-disabled={agotada || undefined}
                      onClick={() => !agotada && elegir(v)}
                      onMouseEnter={() => !agotada && setPreview(v)}
                      onFocus={() => !agotada && setPreview(v)}
                      onBlur={() => setPreview(null)}
                      className={`flex items-center gap-2 rounded-full border-2 bg-crema-card py-1 pr-4 pl-1 text-sm font-semibold transition ${
                        agotada
                          ? 'cursor-not-allowed border-verde/10 text-texto-suave opacity-60'
                          : activa
                            ? 'border-verde text-tinta shadow-suave active:scale-95'
                            : 'border-verde/10 text-tinta hover:border-verde/40 active:scale-95'
                      }`}
                    >
                      <img {...imgFija(v.imagen, 36)} alt="" width="36" height="36" loading="lazy" className={`size-9 rounded-full object-cover ${agotada ? 'grayscale' : ''}`} />
                      <span className={agotada ? 'line-through' : ''}>{v.nombre}</span>
                      {agotada && <span className="text-[11px] font-bold tracking-wide text-red-800 uppercase">Agotado</span>}
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
            <button type="button" onClick={agregarAlCarrito} disabled={producto.sinStock} className="btn btn-primario flex-1 py-4 text-base disabled:opacity-50">
              {producto.sinStock ? (
                'Sin stock'
              ) : (
                <Roll>
                  <Icon name="carrito" size={20} /> Agregar
                </Roll>
              )}
            </button>
          </div>
          <a
            href={consulta}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 hidden w-fit items-center gap-1.5 text-sm font-semibold text-verde underline-offset-4 hover:underline md:inline-flex"
          >
            <Icon name="whatsapp" size={16} /> ¿Dudas? Consultale a Mar
          </a>
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
          <a
            href={consulta}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Consultale a Mar por WhatsApp sobre ${producto.nombre}`}
            className="flex size-12 shrink-0 items-center justify-center rounded-full text-arena shadow-suave active:scale-90"
            style={{ backgroundImage: 'linear-gradient(135deg, #3e6450 0%, #2f5240 100%)' }}
          >
            <Icon name="whatsapp" size={22} />
          </a>
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
          <button type="button" onClick={agregarAlCarrito} disabled={producto.sinStock} className="btn btn-primario h-12 flex-1 py-0 disabled:opacity-50">
            {producto.sinStock ? 'Sin stock' : <Roll>Agregar</Roll>}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Productos de los otros grupos de categorías de la rutina (destacados primero). */
function CompletaTuRutina({ producto }) {
  const { data: productos } = useProducts();
  const pasos = usePasosRutina();
  const sugeridos = useMemo(() => {
    if (!productos) return [];
    const otrosGrupos = pasos.map((p) => p.categorias).filter((cats) => !cats.includes(producto.categoria));
    return otrosGrupos.flatMap((cats) =>
      productos
        .filter((x) => cats.includes(x.categoria) && x.id !== producto.id)
        .sort((a, b) => Number(!!b.destacado) - Number(!!a.destacado))
        .slice(0, 2),
    );
  }, [productos, producto, pasos]);

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
      <Carrusel label="Completá tu rutina" anchoMobile="62%">
        {sugeridos.map((p, i) => (
          <Reveal key={p.id} delay={cascada(i)} className="h-full">
            <ProductCard producto={p} className="h-full" />
          </Reveal>
        ))}
      </Carrusel>
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
