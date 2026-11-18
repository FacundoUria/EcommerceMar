import { useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Icon from '../components/ui/Icon.jsx';
import Reveal, { cascada } from '../components/ui/Reveal.jsx';
import Carousel from '../components/ui/Carousel.jsx';
import SmartImg from '../components/ui/SmartImg.jsx';
import AutoVideo from '../components/ui/AutoVideo.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import LineaProgreso from '../components/ui/LineaProgreso.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import { ProductCardSkeleton, Skeleton } from '../components/ui/Skeleton.jsx';
import { useBrands, useCategories, useProducts } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { NEGOCIO } from '../config/negocio.js';
import { imgSm } from '../lib/format.js';

const EASE = [0.22, 1, 0.36, 1];

export default function Home() {
  usePageTitle(null);
  return (
    <>
      <Hero />
      <Categorias />
      <MasVendidos />
      <CintaMarcas />
      <RutinaCard />
      <HolaSoyMar />
      <Resultados />
    </>
  );
}

/* ───────── Hero: bloque salvia, foto con zoom-out + parallax, título palabra por palabra ───────── */
const TITULO = [
  { t: 'El' },
  { t: 'cabello' },
  { t: 'es' },
  { t: 'el' },
  { t: 'espejo' },
  { t: 'de' },
  { t: 'tu' },
  { t: 'amor', em: true },
  { t: 'propio', em: true },
];
const PARALLAX_PX = 60; // recorrido máximo de la foto dentro del marco

function Hero() {
  const reducido = useReducedMotion();
  const { scrollY } = useScroll();
  // La foto sube al 70% de la velocidad del scroll: se desplaza +30% del scroll (hasta 60px).
  const yFoto = useTransform(scrollY, [0, PARALLAX_PX / 0.3], [0, PARALLAX_PX], { clamp: true });

  return (
    <section aria-labelledby="hero-titulo" className="mx-auto max-w-6xl px-3 pt-2 md:px-4 md:pt-6">
      <div className="bloque-salvia grid items-center gap-6 p-3 pb-7 md:grid-cols-2 md:gap-12 md:p-10">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-salvia-media md:order-2 md:mx-auto md:max-w-md">
          {/* Capa extendida hacia arriba para que el parallax nunca deje un hueco */}
          <m.div className="absolute inset-x-0 bottom-0" style={{ top: -PARALLAX_PX, y: reducido ? 0 : yFoto }}>
            <m.div
              initial={reducido ? false : { scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="size-full"
            >
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
        </div>
        <div className="flex flex-col items-start gap-6 px-3 md:order-1 md:px-0">
          <h1 id="hero-titulo" className="text-[2.5rem] leading-[1.05] md:text-6xl">
            {TITULO.map(({ t, em }, i) => {
              const palabra = (
                <m.span
                  className="inline-block"
                  initial={reducido ? false : { opacity: 0, y: '0.35em' }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: EASE }}
                >
                  {t}
                </m.span>
              );
              return (
                <span key={t + i}>
                  {em ? <em className="text-dorado">{palabra}</em> : palabra}
                  {i < TITULO.length - 1 && ' '}
                </span>
              );
            })}
          </h1>
          <m.div
            initial={reducido ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 + TITULO.length * 0.08, ease: EASE }}
          >
            <Link to="/tienda" className="btn btn-primario">
              Ver productos <Icon name="flecha" size={18} />
            </Link>
          </m.div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Categorías (fondo arena): cascada al entrar ───────── */
function Categorias() {
  const { data: categorias, loading } = useCategories();
  return (
    <section aria-labelledby="cat-titulo" className="mt-14">
      <SectionHeader id="cat-titulo" titulo="Categorías" link="/tienda" />
      <Carousel label="Categorías" itemsClassName="gap-3 md:gap-4">
        {loading || !categorias
          ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="aspect-[4/5] w-[58%] shrink-0 rounded-3xl md:w-64" />)
          : categorias.map((c, i) => (
              <Reveal key={c.id} delay={cascada(i)} className="w-[58%] shrink-0 snap-start md:w-64">
                <Link to={`/tienda?cat=${c.id}`} className="group block rounded-3xl">
                  <span className="block aspect-[4/5] overflow-hidden rounded-3xl bg-salvia-media transition duration-300 group-hover:-translate-y-1 group-hover:shadow-flotante group-active:scale-[0.98]">
                    <SmartImg
                      src={c.imagen}
                      srcSm={imgSm(c.imagen)}
                      sizes="(min-width: 768px) 256px, 58vw"
                      alt=""
                      placeholderTitulo={c.nombre}
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </span>
                  <span className="mt-2.5 block px-1 font-serif text-lg leading-tight text-tinta">{c.nombre}</span>
                </Link>
              </Reveal>
            ))}
      </Carousel>
    </section>
  );
}

/* ───────── Más vendidos (bloque salvia): cascada + "hint" del carrusel ───────── */
function MasVendidos() {
  const { data: productos, loading } = useProducts();
  const destacados = useMemo(() => (productos ?? []).filter((p) => p.destacado), [productos]);
  return (
    <section aria-labelledby="dest-titulo" className="mx-auto mt-14 max-w-6xl px-3 md:px-4">
      <div className="bloque-salvia overflow-hidden py-7 md:py-10">
        <Reveal className="mb-5 flex items-end justify-between gap-4 px-5 md:px-8">
          <h2 id="dest-titulo" className="text-3xl leading-tight md:text-4xl">
            Más vendidos
          </h2>
          <Link to="/tienda" className="group/l inline-flex shrink-0 items-center gap-1 py-2 text-sm font-bold text-verde">
            Ver todo <Icon name="flecha" size={16} className="transition-transform group-hover/l:translate-x-1" />
          </Link>
        </Reveal>
        <Carousel label="Más vendidos" itemsClassName="gap-3 md:gap-4" gutter="1.25rem" hint={!loading}>
          {loading
            ? Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="w-[62%] shrink-0 sm:w-64">
                  <ProductCardSkeleton />
                </div>
              ))
            : destacados.map((p, i) => (
                <Reveal key={p.id} delay={cascada(i)} className="w-[62%] shrink-0 snap-start sm:w-64">
                  <ProductCard producto={p} className="h-full" />
                </Reveal>
              ))}
        </Carousel>
      </div>
    </section>
  );
}

/* ───────── Cinta infinita de marcas (sin título) ───────── */
function CintaMarcas() {
  const { data: marcas } = useBrands();
  if (!marcas?.length) return <div className="mt-6 h-14" aria-hidden="true" />;
  const fila = (copia) => (
    <ul className="flex shrink-0 items-center" aria-hidden={copia || undefined}>
      {marcas.map((mk) => (
        <li key={mk} className="flex items-center">
          <Link
            to={`/tienda?marca=${encodeURIComponent(mk)}`}
            tabIndex={copia ? -1 : undefined}
            className="px-5 font-serif text-2xl whitespace-nowrap text-tinta transition-colors hover:text-verde md:text-3xl"
          >
            {mk}
          </Link>
          <span className="size-1.5 rounded-full bg-dorado" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <nav aria-label="Marcas" className="group/cinta mt-6 overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="flex w-max animate-[cinta_40s_linear_infinite] group-hover/cinta:[animation-play-state:paused] motion-reduce:animate-none">
        {fila(false)}
        {fila(true)}
      </div>
    </nav>
  );
}

/* ───────── Rutina (bloque salvia): pasos de a uno + línea que se dibuja con el scroll ───────── */
const PASOS_CHIPS = ['Lavar', 'Hidratar', 'Definir', 'Proteger'];

function RutinaCard() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'center 45%'] });
  return (
    <section ref={ref} aria-labelledby="rutina-titulo" className="mx-auto mt-6 max-w-6xl px-3 md:px-4">
      <div className="bloque-salvia flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:gap-12 md:p-10">
        <div className="flex-1">
          <Reveal>
            <h2 id="rutina-titulo" className="text-3xl md:text-4xl">
              Armá tu rutina
            </h2>
          </Reveal>
          <div className="relative mt-5 max-w-xl">
            {/* línea que conecta los centros de los 4 círculos */}
            <LineaProgreso progreso={scrollYProgress} className="absolute top-[17px] right-[12.5%] left-[12.5%]" />
            <ol className="relative grid grid-cols-4">
              {PASOS_CHIPS.map((p, i) => (
                <Reveal as="li" key={p} delay={0.1 + i * 0.12} className="flex flex-col items-center gap-2 text-center">
                  <span className="flex size-9 items-center justify-center rounded-full border border-linea bg-crema-card text-sm font-bold text-verde shadow-suave">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-tinta">{p}</span>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
        <Reveal delay={0.2} className="self-start md:self-auto">
          <Link to="/rutina" className="btn btn-primario">
            Empezar<span className="sr-only"> la rutina</span> <Icon name="flecha" size={18} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── Hola, soy Mar (parallax de capas: foto y marco a distinta velocidad) ───────── */
function HolaSoyMar() {
  const ref = useRef(null);
  const reducido = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // Diferencia entre capas: máximo 30px.
  const yMarco = useTransform(scrollYProgress, [0, 1], [15, -15]);
  const yFoto = useTransform(scrollYProgress, [0, 1], [-15, 15]);
  return (
    <section ref={ref} aria-labelledby="mar-titulo" className="mx-auto mt-16 max-w-6xl px-4">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
        <Reveal className="relative mx-auto w-[86%] max-w-sm">
          <m.div style={reducido ? undefined : { y: yMarco }} className="absolute -inset-3 rotate-[-4deg] rounded-5xl bg-salvia-media" />
          <m.div style={reducido ? undefined : { y: yFoto }} className="relative aspect-[4/5] overflow-hidden rounded-5xl shadow-flotante">
            <SmartImg
              src="/img/mar/mar-con-producto.webp"
              srcSm="/img/mar/mar-con-producto-sm.webp"
              sizes="(min-width: 768px) 384px, 90vw"
              alt="Mar, especialista en rizos de Dream Hair"
              width={900}
              height={1575}
              className="size-full object-cover object-top"
            />
          </m.div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-xs font-bold tracking-[0.22em] text-dorado uppercase">Detrás de Dream Hair</p>
          <h2 id="mar-titulo" className="mt-2 text-5xl leading-none md:text-6xl">
            Hola, soy <em className="text-dorado">Mar</em>
          </h2>
          <p className="mt-5 font-serif text-2xl leading-snug text-tinta">
            Especialista en rizos y apasionada por realzar la identidad de cada cabello.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
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

/* ───────── Resultados ───────── */
function Resultados() {
  return (
    <section aria-labelledby="res-titulo" className="mx-auto mt-16 max-w-6xl px-4">
      <div className="grid items-center gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
        <Reveal className="md:order-2">
          <p className="text-xs font-bold tracking-[0.22em] text-dorado uppercase">Resultados reales</p>
          <h2 id="res-titulo" className="mt-2 text-4xl leading-tight md:text-5xl">
            Rulos que se <em className="text-dorado">ven</em> y se <em className="text-dorado">sienten</em>
          </h2>
          <p className="mt-3 max-w-md text-texto-suave">Así quedan los rulos después de pasar por el estudio.</p>
          <Link to="/servicios" className="btn btn-primario mt-6">
            Reservá tu turno <Icon name="flecha" size={18} />
          </Link>
        </Reveal>
        <Reveal delay={0.1} className="mx-auto w-full max-w-xs md:order-1">
          <AutoVideo
            src="/video/amor-propio.mp4"
            poster="/video/amor-propio.webp"
            alt="Video: resultado de rulos definidos en Dream Hair"
            className="aspect-[9/16] rounded-5xl shadow-flotante ring-8 ring-crema-card"
          />
        </Reveal>
      </div>
    </section>
  );
}
