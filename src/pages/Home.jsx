import { useMemo } from 'react';
import { Link } from 'react-router';
import { m } from 'motion/react';
import Icon from '../components/ui/Icon.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import Carousel from '../components/ui/Carousel.jsx';
import SmartImg from '../components/ui/SmartImg.jsx';
import AutoVideo from '../components/ui/AutoVideo.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import { ProductCardSkeleton, Skeleton } from '../components/ui/Skeleton.jsx';
import { useCategories, useProducts } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { NEGOCIO } from '../config/negocio.js';
import { imgSm } from '../lib/format.js';

export default function Home() {
  usePageTitle(null);
  return (
    <>
      <Hero />
      <Categorias />
      <MasVendidos />
      <RutinaCard />
      <HolaSoyMar />
      <Resultados />
    </>
  );
}

/* ───────── Hero: bloque salvia, video sin texto + frase y botón ───────── */
function Hero() {
  return (
    <section aria-labelledby="hero-titulo" className="mx-auto max-w-6xl px-3 pt-2 md:px-4 md:pt-6">
      <div className="bloque-salvia grid items-center gap-6 p-3 pb-7 md:grid-cols-2 md:gap-12 md:p-10">
        <m.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="md:order-2"
        >
          {/* Foto fija: los cuadros del video no quedan nítidos a este tamaño (el video va en Resultados) */}
          <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl bg-salvia-media md:mx-auto md:max-w-md">
            <SmartImg
              src="/img/mar/mar-con-productos-1.webp"
              alt="Mar, de Dream Hair, con rulos definidos y productos para rulos"
              width={387}
              height={516}
              priority
              className="size-full object-cover object-top"
            />
          </div>
        </m.div>
        <div className="flex flex-col items-start gap-6 px-3 md:order-1 md:px-0">
          <m.h1
            id="hero-titulo"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2.5rem] leading-[1.05] md:text-6xl"
          >
            El cabello es el espejo de tu <em className="text-dorado">amor propio</em>
          </m.h1>
          <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Link to="/tienda" className="btn btn-primario">
              Ver productos <Icon name="flecha" size={18} />
            </Link>
          </m.div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Categorías (fondo arena): foto sobre salvia-media + nombre ───────── */
function Categorias() {
  const { data: categorias, loading } = useCategories();
  return (
    <section aria-labelledby="cat-titulo" className="mt-14">
      <SectionHeader id="cat-titulo" titulo="Categorías" link="/tienda" />
      <Carousel label="Categorías" itemsClassName="gap-3 md:gap-4">
        {loading || !categorias
          ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="aspect-[4/5] w-[58%] shrink-0 rounded-3xl md:w-64" />)
          : categorias.map((c) => (
              <Link key={c.id} to={`/tienda?cat=${c.id}`} className="group w-[58%] shrink-0 snap-start rounded-3xl md:w-64">
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
            ))}
      </Carousel>
    </section>
  );
}

/* ───────── Más vendidos (bloque salvia) ───────── */
function MasVendidos() {
  const { data: productos, loading } = useProducts();
  const destacados = useMemo(() => (productos ?? []).filter((p) => p.destacado), [productos]);
  return (
    <section aria-labelledby="dest-titulo" className="mx-auto mt-14 max-w-6xl px-3 md:px-4">
      <div className="bloque-salvia overflow-hidden py-7 md:py-10">
        <div className="mb-5 flex items-end justify-between gap-4 px-5 md:px-8">
          <h2 id="dest-titulo" className="text-3xl leading-tight md:text-4xl">
            Más vendidos
          </h2>
          <Link to="/tienda" className="group/l inline-flex shrink-0 items-center gap-1 py-2 text-sm font-bold text-verde">
            Ver todo <Icon name="flecha" size={16} className="transition-transform group-hover/l:translate-x-1" />
          </Link>
        </div>
        <Carousel label="Más vendidos" itemsClassName="gap-3 md:gap-4" gutter="1.25rem">
          {loading
            ? Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="w-[62%] shrink-0 sm:w-64">
                  <ProductCardSkeleton />
                </div>
              ))
            : destacados.map((p) => <ProductCard key={p.id} producto={p} className="w-[62%] shrink-0 snap-start sm:w-64" />)}
        </Carousel>
      </div>
    </section>
  );
}

/* ───────── Rutina (bloque salvia): chips de pasos con número ───────── */
const PASOS_CHIPS = ['Lavar', 'Hidratar', 'Definir', 'Proteger'];

function RutinaCard() {
  return (
    <section aria-labelledby="rutina-titulo" className="mx-auto mt-6 max-w-6xl px-3 md:px-4">
      <Reveal className="bloque-salvia flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-10">
        <div>
          <h2 id="rutina-titulo" className="text-3xl md:text-4xl">
            Armá tu rutina
          </h2>
          <ol className="mt-4 flex flex-wrap gap-2">
            {PASOS_CHIPS.map((p, i) => (
              <li key={p} className="flex items-center gap-2 rounded-full border border-linea bg-crema-card py-1.5 pr-3.5 pl-1.5 text-sm font-semibold text-tinta">
                <span className="flex size-6 items-center justify-center rounded-full bg-salvia text-xs font-bold text-verde">{i + 1}</span>
                {p}
              </li>
            ))}
          </ol>
        </div>
        <Link to="/rutina" className="btn btn-primario self-start md:self-auto">
          Empezar<span className="sr-only"> la rutina</span> <Icon name="flecha" size={18} />
        </Link>
      </Reveal>
    </section>
  );
}

/* ───────── Hola, soy Mar ───────── */
function HolaSoyMar() {
  return (
    <section aria-labelledby="mar-titulo" className="mx-auto mt-16 max-w-6xl px-4">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
        <Reveal className="relative mx-auto w-[86%] max-w-sm">
          <div className="absolute -inset-3 rotate-[-4deg] rounded-5xl bg-salvia-media" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-5xl shadow-flotante">
            <SmartImg
              src="/img/mar/mar-con-producto.webp"
              srcSm="/img/mar/mar-con-producto-sm.webp"
              sizes="(min-width: 768px) 384px, 90vw"
              alt="Mar, especialista en rizos de Dream Hair"
              width={900}
              height={1575}
              className="size-full object-cover object-top"
            />
          </div>
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
