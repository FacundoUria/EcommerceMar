import { useState } from 'react';
import Icon from '../components/ui/Icon.jsx';
import Reveal, { cascada } from '../components/ui/Reveal.jsx';
import RevealText from '../components/ui/RevealText.jsx';
import Expandible from '../components/ui/Expandible.jsx';
import { ConDestellos } from '../components/marca/Destellos.jsx';
import SmartImg from '../components/ui/SmartImg.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { useServiceGroups } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { whatsappCon } from '../config/negocio.js';
import { imgSm } from '../lib/format.js';
import Roll from '../components/ui/Roll.jsx';

export default function Servicios() {
  usePageTitle('Servicios');
  const { data: grupos, loading } = useServiceGroups();

  return (
    <div className="contenedor pt-4 pb-10">
      <Reveal as="header" className="flex items-end justify-between gap-4">
        <ConDestellos>
          <RevealText as="h1" className="text-4xl leading-tight md:text-5xl">Servicios</RevealText>
        </ConDestellos>
        <a href={whatsappCon()} target="_blank" rel="noopener noreferrer" className="btn btn-primario">
          <Roll>
            <Icon name="whatsapp" size={18} /> Reservar
          </Roll>
        </a>
      </Reveal>

      {loading ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i}>
              <Skeleton className="aspect-[4/5] rounded-5xl" />
            </li>
          ))}
        </ul>
      ) : (
        (grupos ?? []).map((g) => (
          <section key={g.titulo} aria-labelledby={`grupo-${g.titulo}`} className="mt-10 md:mt-14">
            <RevealText id={`grupo-${g.titulo}`} className="text-3xl leading-tight md:text-4xl">
              {g.titulo}
            </RevealText>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {g.servicios.map((s, i) => (
                <Reveal as="li" key={s.id} delay={cascada(i, 3)} className="h-full">
                  <CardServicio servicio={s} />
                </Reveal>
              ))}
            </ul>
          </section>
        ))
      )}

      <ProcesoVideo />
    </div>
  );
}

/** Card de servicio: foto, nombre, duración, descripción (3 líneas + "Ver más" en mobile) y reserva. */
function CardServicio({ servicio: s }) {
  return (
    <article className="card group flex h-full flex-col overflow-hidden rounded-5xl">
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
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-2xl leading-tight">{s.nombre}</h3>
        <p className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-salvia px-3 py-1 text-xs font-bold text-verde">
          <Icon name="reloj" size={14} strokeWidth={2} />
          <span className="sr-only">Duración:</span> {s.duracion}
        </p>
        <Expandible lineas={3} soloMobile className="mt-3 text-[15px] leading-relaxed text-texto-suave">
          <p>{s.descripcion}</p>
        </Expandible>
        <div className="mt-auto pt-5">
          <a
            href={whatsappCon(`¡Hola Mar! Quiero reservar: ${s.nombre}`)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`¡Reservar! ${s.nombre} por WhatsApp`}
            className="btn btn-primario w-full"
          >
            <Roll>
              <Icon name="whatsapp" size={18} /> ¡Reservar!
            </Roll>
          </a>
        </div>
      </div>
    </article>
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
        <a href={whatsappCon()} target="_blank" rel="noopener noreferrer" className="btn btn-primario mt-6">
          <Roll>
            <Icon name="whatsapp" size={18} /> Reservar
          </Roll>
        </a>
      </Reveal>
      {/* 288px: el video original mide 576px de ancho → se ve a 2x, no estirado */}
      <Reveal delay={0.1} className="mx-auto w-full max-w-[18rem]">
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
