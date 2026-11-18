import { useState } from 'react';
import Icon from '../components/ui/Icon.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import RevealText from '../components/ui/RevealText.jsx';
import SmartImg from '../components/ui/SmartImg.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { useServices } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { NEGOCIO } from '../config/negocio.js';
import { imgSm } from '../lib/format.js';
import Roll from '../components/ui/Roll.jsx';

export default function Servicios() {
  usePageTitle('Servicios');
  const { data: servicios, loading } = useServices();

  return (
    <div className="contenedor pt-4 pb-10">
      <Reveal as="header" className="flex items-end justify-between gap-4">
        <RevealText as="h1" className="text-4xl leading-tight md:text-5xl">Servicios</RevealText>
        <a href={NEGOCIO.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primario">
          <Roll>
            <Icon name="whatsapp" size={18} /> Reservar
          </Roll>
        </a>
      </Reveal>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }, (_, i) => (
              <li key={i}>
                <Skeleton className="aspect-[4/5] rounded-5xl" />
              </li>
            ))
          : (servicios ?? []).map((s, i) => (
              <Reveal as="li" key={s.id} delay={(i % 3) * 0.07}>
                <article className="card group overflow-hidden rounded-5xl">
                  <div className="aspect-[4/5] overflow-hidden bg-salvia-media">
                  <SmartImg
                    src={s.imagen}
                    srcSm={imgSm(s.imagen)}
                    sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
                    alt=""
                    width={900}
                    height={1125}
                    placeholderTitulo={s.nombre}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  </div>
                  <div className="p-5">
                    <RevealText className="text-2xl leading-tight">{s.nombre}</RevealText>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-dorado">Consultar</p>
                      <a
                        href={NEGOCIO.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Reservar ${s.nombre} por WhatsApp`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-verde px-4 py-2.5 text-xs font-extrabold text-arena transition hover:bg-verde-700 active:scale-95"
                      >
                        <Icon name="whatsapp" size={16} /> Reservar
                      </a>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
      </ul>

      <ProcesoVideo />
    </div>
  );
}

/** Video del proceso: con audio, NO se reproduce solo. Click → se carga y reproduce. */
function ProcesoVideo() {
  const [activo, setActivo] = useState(false);
  return (
    <section aria-labelledby="proceso-titulo" className="fondo-salvia grano mt-14 mx-[calc(50%-50vw)] grid items-center gap-8 px-[calc(50vw-50%)] py-16 md:grid-cols-2 md:gap-20 md:py-24">
      <Reveal>
        <RevealText id="proceso-titulo" className="text-4xl leading-tight md:text-5xl">
          El <em className="texto-dorado">proceso</em>
        </RevealText>
        <a href={NEGOCIO.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primario mt-6">
          <Roll>
            <Icon name="whatsapp" size={18} /> Reservar
          </Roll>
        </a>
      </Reveal>
      <Reveal delay={0.1} className="mx-auto w-full max-w-xs">
        <div className="relative aspect-[9/16] overflow-hidden rounded-5xl border border-linea bg-salvia-media shadow-suave">
          {activo ? (
            <video
              src="/video/proceso.mp4"
              poster="/video/proceso.webp"
              controls
              autoPlay
              preload="none"
              playsInline
              className="size-full object-cover"
            >
              Tu navegador no puede reproducir este video.
            </video>
          ) : (
            <button type="button" onClick={() => setActivo(true)} className="group absolute inset-0" aria-label="Reproducir video del proceso de asesoramiento (con sonido)">
              <img src="/video/proceso.webp" alt="" width="576" height="1024" loading="lazy" className="size-full object-cover" />
              <span className="absolute inset-0 bg-black/5 transition group-hover:bg-transparent" />
              <span className="absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-crema-card text-verde shadow-flotante transition group-hover:scale-110 group-active:scale-95">
                <span className="pulso absolute inset-0 rounded-full" />
                <Icon name="play" size={30} className="ml-1" />
              </span>
            </button>
          )}
        </div>
      </Reveal>
    </section>
  );
}
