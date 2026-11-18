import { useState } from 'react';
import Icon from '../components/ui/Icon.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import SmartImg from '../components/ui/SmartImg.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { useServices } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { NEGOCIO } from '../config/negocio.js';
import { imgSm } from '../lib/format.js';

export default function Servicios() {
  usePageTitle('Servicios');
  const { data: servicios, loading } = useServices();

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 pb-10">
      <header className="max-w-2xl">
        <p className="text-xs font-bold tracking-[0.22em] text-dorado uppercase">Estudio en {NEGOCIO.ciudad}</p>
        <h1 className="mt-1 text-4xl leading-tight md:text-5xl">
          Servicios para <em className="text-dorado">tus rulos</em>
        </h1>
        <p className="mt-3 text-gris">Cortes, asesoramientos y tratamientos en Dream Hair. Los turnos se reservan por WhatsApp.</p>
        <a href={NEGOCIO.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primario mt-6">
          <Icon name="whatsapp" size={18} /> Reservar por WhatsApp
        </a>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }, (_, i) => (
              <li key={i}>
                <Skeleton className="aspect-[4/5] rounded-5xl" />
              </li>
            ))
          : (servicios ?? []).map((s, i) => (
              <Reveal as="li" key={s.id} delay={(i % 3) * 0.07}>
                <article className="group relative aspect-[4/5] overflow-hidden rounded-5xl bg-verde shadow-suave">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-verde via-verde/30 to-transparent" />
                  <div className="glass-oscuro absolute inset-x-3 bottom-3 rounded-4xl p-5 text-crema">
                    <h2 className="text-2xl leading-tight text-crema">{s.nombre}</h2>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-sm">
                        <span className="text-crema/60">Precio: </span>
                        <span className="font-bold text-amarillo">Consultar</span>
                      </p>
                      <a
                        href={NEGOCIO.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Reservar ${s.nombre} por WhatsApp`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amarillo px-4 py-2.5 text-xs font-extrabold text-verde transition hover:bg-amarillo-300 active:scale-95"
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
    <section aria-labelledby="proceso-titulo" className="mt-16 grid items-center gap-8 md:grid-cols-2 md:gap-14">
      <Reveal>
        <p className="text-xs font-bold tracking-[0.22em] text-dorado uppercase">Así trabajamos</p>
        <h2 id="proceso-titulo" className="mt-2 text-4xl leading-tight md:text-5xl">
          El proceso de un <em className="text-dorado">asesoramiento</em>
        </h2>
        <p className="mt-3 max-w-md text-gris">Mirá cómo es un asesoramiento en el estudio, de principio a fin.</p>
        <a href={NEGOCIO.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-amarillo mt-6">
          <Icon name="whatsapp" size={18} /> Reservar mi turno
        </a>
      </Reveal>
      <Reveal delay={0.1} className="mx-auto w-full max-w-xs">
        <div className="relative aspect-[9/16] overflow-hidden rounded-5xl bg-verde shadow-flotante ring-8 ring-white">
          {activo ? (
            <video
              src="/video/proceso.mp4"
              poster="/video/proceso.webp"
              controls
              autoPlay
              playsInline
              className="size-full object-cover"
            >
              Tu navegador no puede reproducir este video.
            </video>
          ) : (
            <button type="button" onClick={() => setActivo(true)} className="group absolute inset-0" aria-label="Reproducir video del proceso de asesoramiento (con sonido)">
              <img src="/video/proceso.webp" alt="" width="576" height="1024" loading="lazy" className="size-full object-cover" />
              <span className="absolute inset-0 bg-verde/25 transition group-hover:bg-verde/10" />
              <span className="absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amarillo text-verde shadow-flotante transition group-hover:scale-110 group-active:scale-95">
                <span className="pulso absolute inset-0 rounded-full" />
                <Icon name="play" size={30} className="ml-1" />
              </span>
              <span className="glass-oscuro absolute inset-x-4 bottom-4 rounded-full px-4 py-2 text-center text-xs font-semibold text-crema">
                1:12 · con sonido
              </span>
            </button>
          )}
        </div>
      </Reveal>
    </section>
  );
}
