import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, m, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Icon from '../components/ui/Icon.jsx';
import Reveal, { cascada } from '../components/ui/Reveal.jsx';
import RevealText from '../components/ui/RevealText.jsx';
import RevealImagen from '../components/ui/RevealImagen.jsx';
import Carousel from '../components/ui/Carousel.jsx';
import SmartImg from '../components/ui/SmartImg.jsx';
import Stories from '../components/ui/Stories.jsx';
import MeshFondo from '../components/ui/MeshFondo.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import LineaProgreso from '../components/ui/LineaProgreso.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import FotoProducto from '../components/product/FotoProducto.jsx';
import CarruselCentrado from '../components/ui/CarruselCentrado.jsx';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { ProductCardSkeleton, Skeleton } from '../components/ui/Skeleton.jsx';
import { useBrands, useCategories, useProducts } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { NEGOCIO, PASOS_RUTINA } from '../config/negocio.js';
import { formatPrecio, imgSm } from '../lib/format.js';

const EASE = [0.22, 1, 0.36, 1];

export default function Home() {
  usePageTitle(null);
  return (
    <>
      <Hero />
      <Categorias />
      <MasVendidos />
      <CintaMarcas />
      <RutinaHistoria />
      <HolaSoyMar />
      <Resultados />
    </>
  );
}

/* ═════════ HERO full-screen: mesh animado, título gigante, foto blob + mini-cards flotantes ═════════ */
// La frase de Mar: "El cabello es el espejo de tu amor propio"
const TITULO_TEXTO = 'El cabello es el espejo de tu';
const TITULO_EM = 'amor propio';
const PARALLAX_PX = 60;
const BLOB = 'rounded-[46%_54%_40%_60%/56%_44%_56%_44%]';

function Hero() {
  const reducido = useReducedMotion();
  const { scrollY } = useScroll();
  const { data: productos } = useProducts();
  // Foto al 70% de la velocidad del scroll; mini-cards a distintas velocidades.
  const yFoto = useTransform(scrollY, [0, PARALLAX_PX / 0.3], [0, PARALLAX_PX], { clamp: true });
  const yCard1 = useTransform(scrollY, [0, 600], [0, -70], { clamp: true });
  const yCard2 = useTransform(scrollY, [0, 600], [0, -140], { clamp: true });

  const flotantes = ['shampoo-low-poo-han', 'cremas-skala'].map((id) => productos?.find((p) => p.id === id)).filter(Boolean);

  return (
    <section aria-labelledby="hero-titulo" className="grano -mt-px overflow-hidden">
      <MeshFondo />
      {/* El hero termina donde termina su contenido (+ indicador de scroll), sin aire vacío abajo */}
      <div className="contenedor grid items-center gap-8 pt-6 pb-10 md:grid-cols-[1.08fr_0.92fr] md:gap-10 md:pt-10 md:pb-6">
        {/* Título (arriba en mobile, izquierda en desktop): revelado por línea al cargar */}
        <div className="flex flex-col items-start gap-8">
          <RevealText as="h1" id="hero-titulo" alCargar delay={0.15} className="text-[clamp(3rem,7.4vw,6.5rem)] leading-[0.98] tracking-[-0.02em]">
            {TITULO_TEXTO} <em className="texto-dorado">{TITULO_EM}</em>
          </RevealText>
          <m.div
            initial={reducido ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
          >
            <Link to="/tienda" className="btn btn-primario px-8 py-4 text-base">
              Ver productos <Icon name="flecha" size={18} />
            </Link>
          </m.div>
        </div>

        {/* Foto con forma orgánica + mini-cards flotando */}
        <div className="relative mx-auto w-[84%] max-w-[30rem] md:w-full">
          <m.div
            initial={reducido ? false : { opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE }}
            className={`relative aspect-[4/5] overflow-hidden bg-salvia-media shadow-flotante ${BLOB}`}
          >
            <m.div className="absolute inset-x-0 bottom-0" style={{ top: -PARALLAX_PX, y: reducido ? 0 : yFoto }}>
              <SmartImg
                src="/img/mar/mar-con-productos-1.webp"
                alt="Mar, de Dream Hair, con rulos definidos y productos para rulos"
                width={387}
                height={516}
                priority
                className="size-full object-cover object-top"
              />
            </m.div>
          </m.div>

          {flotantes[0] && (
            <MiniCard producto={flotantes[0]} y={reducido ? 0 : yCard1} delay={0.9} className="-left-[14%] bottom-[10%] md:-left-[18%]" />
          )}
          {flotantes[1] && (
            <MiniCard producto={flotantes[1]} y={reducido ? 0 : yCard2} delay={1.05} className="-right-[10%] top-[8%] md:-right-[12%]" flotarDesfase />
          )}
        </div>
      </div>

      {/* Indicador de scroll: dentro del hero, abajo */}
      <div aria-hidden="true" className="hidden flex-col items-center gap-1.5 pb-8 text-texto-suave md:flex">
        <span className="flex h-10 w-6 justify-center rounded-full border border-tinta/25 pt-2">
          <span className="anim-rebote h-2 w-1 rounded-full bg-verde" style={{ animation: 'rebote 2s ease-in-out infinite' }} />
        </span>
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase">Scroll</span>
      </div>
    </section>
  );
}

function MiniCard({ producto, y, delay, className, flotarDesfase = false }) {
  const reducido = useReducedMotion();
  return (
    <m.div style={{ y }} className={`absolute z-10 ${className}`}>
      <m.div
        initial={reducido ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay, ease: EASE }}
      >
        <Link
          to={`/producto/${producto.id}`}
          className="anim-flotar flex w-[10.5rem] items-center gap-2.5 rounded-2xl border border-linea bg-crema-card/90 p-2 pr-3 shadow-flotante backdrop-blur-md transition hover:bg-crema-card md:w-[13rem] md:p-2.5"
          style={{ animation: `flotar ${flotarDesfase ? 5 : 4.5}s ease-in-out ${flotarDesfase ? '-2.2s' : '0s'} infinite` }}
        >
          <span className="size-11 shrink-0 overflow-hidden rounded-xl md:size-14">
            <FotoProducto src={imgSm(producto.imagen)} zoom={false} compacta />
          </span>
          <span className="min-w-0">
            <span className="line-clamp-2 block text-xs leading-tight font-semibold text-tinta md:text-[13px]">{producto.nombre}</span>
            <span className="precio mt-0.5 block text-xs text-verde md:text-sm">{formatPrecio(producto.precio)}</span>
          </span>
        </Link>
      </m.div>
    </m.div>
  );
}

/* ═════════ CATEGORÍAS: paneles expandibles (desktop) / carrusel centrado (mobile) ═════════ */
const MAX_PANELES = 5; // + 1 panel "Ver todas"

function Categorias() {
  const { data: categorias, loading } = useCategories();
  const desktop = useMediaQuery('(min-width: 1024px)');
  return (
    <section aria-labelledby="cat-titulo" className="pt-4 pb-10 md:pt-8 md:pb-12">
      <SectionHeader id="cat-titulo" titulo="Categorías" />
      {loading || !categorias ? (
        <div className="contenedor flex gap-3">
          {Array.from({ length: desktop ? 6 : 2 }, (_, i) => (
            <Skeleton key={i} className="h-[420px] flex-1 rounded-3xl lg:h-[480px]" />
          ))}
        </div>
      ) : desktop ? (
        <PanelesCategorias categorias={categorias} />
      ) : (
        <CarruselCentrado label="Categorías" anchoItem="w-[68vw] max-w-[19rem]">
          {categorias.map((c) => (
            <Link key={c.id} to={`/tienda?cat=${c.id}`} data-cursor="ver" className="relative block aspect-[3/4] overflow-hidden rounded-3xl shadow-suave">
              <FotoProducto src={c.imagen} srcSm={imgSm(c.imagen)} sizes="68vw" placeholderTitulo={c.nombre} cover zoom={false} />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#16241C]/80 via-[#16241C]/10 to-transparent" />
              <span className="absolute inset-x-5 bottom-5 font-serif text-2xl leading-tight text-crema-card">{c.nombre}</span>
            </Link>
          ))}
        </CarruselCentrado>
      )}
    </section>
  );
}

function PanelesCategorias({ categorias }) {
  const [activo, setActivo] = useState(0);
  const paneles = [...categorias.slice(0, MAX_PANELES).map((c) => ({ ...c, to: `/tienda?cat=${c.id}` })), { id: 'todas', nombre: 'Ver todas', to: '/tienda' }];
  return (
    <div className="contenedor">
      <ul className="flex h-[480px] gap-3">
        {paneles.map((p, i) => {
          const on = i === activo;
          const todas = p.id === 'todas';
          return (
            <li
              key={p.id}
              className="min-w-0 basis-0 transition-[flex-grow] duration-[600ms] ease-[ease]"
              style={{ flexGrow: on ? 4 : 1 }}
              onMouseEnter={() => setActivo(i)}
            >
              <Link
                to={p.to}
                onFocus={() => setActivo(i)}
                aria-label={todas ? 'Ver todas las categorías' : `${p.nombre}: ver productos`}
                data-cursor="ver"
                className={`group relative block size-full overflow-hidden rounded-3xl shadow-suave ${todas ? 'bg-salvia' : ''}`}
              >
                {!todas && (
                  <>
                    <RevealImagen delay={i * 0.08}>
                      <FotoProducto src={p.imagen} srcSm={imgSm(p.imagen)} sizes="(min-width: 1024px) 640px" placeholderTitulo={p.nombre} cover zoom={false} />
                    </RevealImagen>
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#16241C]/80 via-[#16241C]/15 to-transparent" />
                  </>
                )}
                {/* Angosto: nombre en vertical */}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-7 left-1/2 -translate-x-1/2 rotate-180 font-serif text-2xl whitespace-nowrap [writing-mode:vertical-rl] transition-opacity duration-500 ${
                    todas ? 'text-tinta' : 'text-crema-card'
                  } ${on ? 'opacity-0' : 'opacity-100'}`}
                >
                  {todas ? 'Ver todas →' : p.nombre}
                </span>
                {/* Expandido: nombre grande + "Ver productos →" que entra desde abajo */}
                <span className={`absolute inset-x-8 bottom-8 transition-opacity duration-500 ${on ? 'opacity-100 delay-150' : 'opacity-0'}`}>
                  <span className={`block font-serif text-5xl leading-none whitespace-nowrap ${todas ? 'text-tinta' : 'text-crema-card'}`}>
                    {todas ? 'Ver todas' : p.nombre}
                  </span>
                  <span
                    className={`mt-3 inline-flex items-center gap-2 text-sm font-bold transition duration-500 ease-out ${todas ? 'text-verde' : 'text-crema-card'} ${
                      on ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-4 opacity-0'
                    }`}
                  >
                    {todas ? 'Todas las categorías' : 'Ver productos'} <Icon name="flecha" size={16} />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ═════════ MÁS VENDIDOS: full-bleed; desktop con controles arriba, mobile con card central ═════════ */
function MasVendidos() {
  const { data: productos, loading } = useProducts();
  const desktop = useMediaQuery('(min-width: 768px)');
  const destacados = useMemo(() => (productos ?? []).filter((p) => p.destacado), [productos]);
  const titulo = (
    <RevealText id="dest-titulo" className="text-3xl leading-tight md:text-4xl">
      Más vendidos
    </RevealText>
  );
  return (
    <section aria-labelledby="dest-titulo" className="fondo-salvia grano py-14 md:py-20">
      {loading ? (
        <div className="contenedor">
          {titulo}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : desktop ? (
        <Carousel label="Más vendidos" itemsClassName="gap-5" autoplay={4500} hint cabecera={<Reveal>{titulo}</Reveal>}>
          {destacados.map((p, i) => (
            <Reveal key={p.id} delay={cascada(i)} className="w-[17.5rem] shrink-0 snap-start lg:w-[19rem]">
              <ProductCard producto={p} className="h-full" />
            </Reveal>
          ))}
        </Carousel>
      ) : (
        <>
          <div className="contenedor mb-2 flex items-end justify-between">
            {titulo}
            <Link to="/tienda" className="py-2 text-sm font-bold text-verde">
              Ver todo
            </Link>
          </div>
          <CarruselCentrado label="Más vendidos">
            {destacados.map((p) => (
              <ProductCard key={p.id} producto={p} className="h-full" />
            ))}
          </CarruselCentrado>
        </>
      )}
    </section>
  );
}

/* ═════════ Cinta infinita de marcas (sin título) ═════════ */
function CintaMarcas() {
  const { data: marcas } = useBrands();
  if (!marcas?.length) return <div className="h-20" aria-hidden="true" />;
  const fila = (copia) => (
    <ul className="flex shrink-0 items-center" aria-hidden={copia || undefined}>
      {marcas.map((mk) => (
        <li key={mk} className="flex items-center">
          <Link
            to={`/tienda?marca=${encodeURIComponent(mk)}`}
            tabIndex={copia ? -1 : undefined}
            className="px-6 font-serif text-3xl whitespace-nowrap text-tinta transition-colors hover:text-verde md:px-9 md:text-5xl"
          >
            {mk}
          </Link>
          <span className="size-2 rounded-full bg-dorado" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <nav aria-label="Marcas" className="group/cinta overflow-hidden py-8 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] md:py-12">
      <div className="flex w-max animate-[cinta_45s_linear_infinite] group-hover/cinta:[animation-play-state:paused] motion-reduce:animate-none">
        {fila(false)}
        {fila(true)}
      </div>
    </nav>
  );
}

/* ═════════ ARMÁ TU RUTINA: scroll storytelling (sticky en desktop, apilado en mobile) ═════════ */
const PASOS_CHIPS = ['Lavar', 'Hidratar', 'Definir', 'Proteger'];

function useProductosPorPaso() {
  const { data: productos } = useProducts();
  return useMemo(
    () =>
      PASOS_RUTINA.map((p) => {
        const lista = (productos ?? []).filter((x) => p.categorias.includes(x.categoria));
        return lista.find((x) => x.destacado) ?? lista[0] ?? null;
      }),
    [productos],
  );
}

function RutinaHistoria() {
  return (
    <section aria-labelledby="rutina-titulo" className="grano">
      <MeshFondo />
      <RutinaDesktop />
      <RutinaMobile />
    </section>
  );
}

function RutinaDesktop() {
  const ref = useRef(null);
  const reducido = useReducedMotion();
  const porPaso = useProductosPorPaso();
  const [activo, setActivo] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => setActivo(Math.min(3, Math.max(0, Math.floor(v * 4)))));
  const producto = porPaso[activo];

  // Movimiento reducido: sin sticky ni escenas; los 4 pasos a la vista en una grilla.
  if (reducido) {
    return (
      <div className="contenedor hidden py-24 md:block">
        <RevealText id="rutina-titulo" className="text-[clamp(2.75rem,5vw,4.5rem)] leading-none">
          Armá tu <em className="texto-dorado">rutina</em>
        </RevealText>
        <ol className="mt-10 grid grid-cols-4 gap-6">
          {PASOS_CHIPS.map((p, i) => {
            const prod = porPaso[i];
            return (
              <li key={p}>
                <Link to={prod ? `/producto/${prod.id}` : '/rutina'} className="card group block overflow-hidden rounded-3xl">
                  <span className="block aspect-[4/5] overflow-hidden">
                    {prod && <FotoProducto src={prod.imagen} srcSm={imgSm(prod.imagen)} sizes="300px" />}
                  </span>
                  <span className="flex items-center gap-3 p-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-verde text-sm font-bold text-verde">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block font-serif text-2xl text-tinta">{p}</span>
                      {prod && <span className="block truncate text-xs text-texto-suave">{prod.nombre}</span>}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <Link to="/rutina" className="btn btn-primario mt-10 px-8 py-4 text-base">
          Empezar<span className="sr-only"> la rutina</span> <Icon name="flecha" size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div ref={ref} className="hidden h-[320vh] md:block">
      <div className="sticky top-0 flex h-screen items-center">
        <div className="contenedor grid grid-cols-[0.95fr_1.05fr] items-center gap-16">
          <div>
            <RevealText id="rutina-titulo" className="text-[clamp(2.75rem,5vw,4.5rem)] leading-none">
              Armá tu <em className="texto-dorado">rutina</em>
            </RevealText>
            <div className="relative mt-10">
              <LineaProgreso progreso={scrollYProgress} vertical className="absolute top-5 bottom-5 left-[19px]" />
              <ol className="relative space-y-5">
                {PASOS_CHIPS.map((p, i) => {
                  const on = i === activo;
                  const hecho = i < activo;
                  return (
                    <li key={p} className="flex items-center gap-5">
                      <span
                        className={`flex size-10 items-center justify-center rounded-full border text-sm font-bold transition duration-500 ${
                          on ? 'scale-110 border-verde bg-verde text-arena shadow-flotante' : hecho ? 'border-verde bg-crema-card text-verde' : 'border-linea bg-crema-card text-texto-suave'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={`font-serif text-3xl transition duration-500 ${on ? 'translate-x-1 text-tinta' : 'text-texto-suave'}`}
                        aria-current={on ? 'step' : undefined}
                      >
                        {p}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
            <Link to="/rutina" className="btn btn-primario mt-10 px-8 py-4 text-base">
              Empezar<span className="sr-only"> la rutina</span> <Icon name="flecha" size={18} />
            </Link>
          </div>

          <div className="relative mx-auto aspect-[4/5] w-full max-w-[28rem]">
            <AnimatePresence mode="popLayout" initial={false}>
              {producto && (
                <m.div
                  key={producto.id}
                  initial={reducido ? false : { opacity: 0, scale: 0.94, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={reducido ? undefined : { opacity: 0, scale: 1.03 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="absolute inset-0"
                >
                  <Link to={`/producto/${producto.id}`} className="group block size-full">
                    <span className="block size-full overflow-hidden rounded-[2.5rem] shadow-flotante">
                      <FotoProducto src={producto.imagen} srcSm={imgSm(producto.imagen)} sizes="448px" alt={producto.nombre} />
                    </span>
                    <span className="absolute -bottom-5 left-6 rounded-2xl border border-linea bg-crema-card/95 px-4 py-3 shadow-flotante backdrop-blur">
                      <span className="block text-sm font-semibold text-tinta">{producto.nombre}</span>
                      <span className="precio block text-sm text-verde">{formatPrecio(producto.precio)}</span>
                    </span>
                  </Link>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function RutinaMobile() {
  const ref = useRef(null);
  const porPaso = useProductosPorPaso();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  return (
    <div className="contenedor py-16 md:hidden">
      <Reveal>
        <RevealText className="text-4xl leading-none">
          Armá tu <em className="texto-dorado">rutina</em>
        </RevealText>
      </Reveal>
      <div ref={ref} className="relative mt-8">
        <LineaProgreso progreso={scrollYProgress} vertical className="absolute top-8 bottom-8 left-[19px]" />
        <ol className="relative space-y-4">
          {PASOS_CHIPS.map((p, i) => {
            const prod = porPaso[i];
            return (
              <Reveal as="li" key={p} delay={i * 0.1} className="flex items-center gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-verde bg-crema-card text-sm font-bold text-verde">
                  {i + 1}
                </span>
                <span className="card flex flex-1 items-center gap-3 rounded-2xl p-2 pr-3">
                  {prod && (
                    <span className="size-16 shrink-0 overflow-hidden rounded-xl">
                      <FotoProducto src={imgSm(prod.imagen)} zoom={false} compacta />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block font-serif text-xl text-tinta">{p}</span>
                    {prod && <span className="block truncate text-xs text-texto-suave">{prod.nombre}</span>}
                  </span>
                </span>
              </Reveal>
            );
          })}
        </ol>
      </div>
      <Reveal delay={0.2}>
        <Link to="/rutina" className="btn btn-primario mt-8">
          Empezar<span className="sr-only"> la rutina</span> <Icon name="flecha" size={18} />
        </Link>
      </Reveal>
    </div>
  );
}

/* ═════════ HOLA, SOY MAR (textos intactos; parallax de capas) ═════════ */
function HolaSoyMar() {
  const ref = useRef(null);
  const reducido = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // Diferencia entre capas: máximo 30px.
  const yMarco = useTransform(scrollYProgress, [0, 1], [15, -15]);
  const yFoto = useTransform(scrollYProgress, [0, 1], [-15, 15]);
  return (
    <section ref={ref} aria-labelledby="mar-titulo" className="contenedor py-20 md:py-28">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-20">
        <Reveal className="relative mx-auto w-[86%] max-w-md">
          <m.div style={reducido ? undefined : { y: yMarco }} className="absolute -inset-3 rotate-[-4deg] rounded-5xl bg-salvia-media" />
          <m.div style={reducido ? undefined : { y: yFoto }} className="relative aspect-[4/5] overflow-hidden rounded-5xl shadow-flotante">
            <RevealImagen>
            <SmartImg
              src="/img/mar/mar-con-producto.webp"
              srcSm="/img/mar/mar-con-producto-sm.webp"
              sizes="(min-width: 768px) 448px, 90vw"
              alt="Mar, especialista en rizos de Dream Hair"
              width={900}
              height={1575}
              className="size-full object-cover object-top"
            />
            </RevealImagen>
          </m.div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-xs font-bold tracking-[0.22em] text-dorado uppercase">Detrás de Dream Hair</p>
          <RevealText id="mar-titulo" className="mt-2 text-5xl leading-none md:text-7xl">
            Hola, soy <em className="texto-dorado">Mar</em>
          </RevealText>
          <p className="mt-5 max-w-lg font-serif text-2xl leading-snug text-tinta md:text-3xl">
            Especialista en rizos y apasionada por realzar la identidad de cada cabello.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/servicios" className="btn btn-primario">
              Conocé los servicios
            </Link>
            <a href={NEGOCIO.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-borde">
              <Icon name="whatsapp" size={18} /> Escribime
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═════════ RESULTADOS (textos intactos): stories con fotos del estudio + video ═════════ */
const STORIES = [
  { tipo: 'video', src: '/video/amor-propio.mp4', poster: '/video/amor-propio.webp', alt: 'Video: rulos definidos en Dream Hair', duracion: 7.7 },
  { tipo: 'foto', src: '/img/estudio/servicio-corte-rulos.webp', alt: 'Corte de rulos en el estudio', duracion: 5 },
  { tipo: 'foto', src: '/img/estudio/asesoramiento-1.webp', alt: 'Asesoramiento en el estudio', duracion: 5 },
  { tipo: 'foto', src: '/img/estudio/asesoramiento-2.webp', alt: 'Asesoramiento en el estudio', duracion: 5 },
  { tipo: 'foto', src: '/img/estudio/servicio-tratamiento-lavado-1.webp', alt: 'Tratamiento y lavado', duracion: 5 },
  { tipo: 'foto', src: '/img/estudio/servicio-tratamiento-lavado-2.webp', alt: 'Tratamiento y lavado', duracion: 5 },
  { tipo: 'foto', src: '/img/estudio/servicio-ozonoterapia.webp', alt: 'Ozonoterapia', duracion: 5 },
  { tipo: 'foto', src: '/img/estudio/servicio-celulas-madre-infrarrojo.webp', alt: 'Células madre + infrarrojo', duracion: 5 },
  { tipo: 'foto', src: '/img/estudio/salon-1.webp', alt: 'El estudio Dream Hair', duracion: 5 },
];

function Resultados() {
  return (
    <section aria-labelledby="res-titulo" className="fondo-salvia grano py-20 md:py-28">
      <div className="contenedor grid items-center gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
        <Reveal className="md:order-2">
          <p className="text-xs font-bold tracking-[0.22em] text-dorado uppercase">Resultados reales</p>
          <RevealText id="res-titulo" className="mt-2 text-4xl leading-tight md:text-6xl">
            Rulos que se <em className="texto-dorado">ven</em> y se <em className="texto-dorado">sienten</em>
          </RevealText>
          <p className="mt-3 max-w-md text-texto-suave">Así quedan los rulos después de pasar por el estudio.</p>
          <Link to="/servicios" className="btn btn-primario mt-6">
            Reservá tu turno <Icon name="flecha" size={18} />
          </Link>
        </Reveal>
        <Reveal delay={0.1} className="mx-auto w-full max-w-[20rem] md:order-1 md:max-w-[22rem]">
          <div className="aspect-[9/16] overflow-hidden rounded-5xl shadow-flotante ring-8 ring-crema-card">
            <RevealImagen>
              <Stories items={STORIES} className="size-full" />
            </RevealImagen>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
