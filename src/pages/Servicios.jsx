import Icon from '../components/ui/Icon.jsx';
import HistoriaVideo from '../components/ui/HistoriaVideo.jsx';
import Reveal, { cascada } from '../components/ui/Reveal.jsx';
import RevealText from '../components/ui/RevealText.jsx';
import Expandible from '../components/ui/Expandible.jsx';
import { ConDestellos } from '../components/marca/Destellos.jsx';
import SmartImg from '../components/ui/SmartImg.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { useServiceGroups } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { whatsappCon } from '../config/negocio.js';
import { colorDe } from '../lib/colores.js';
import RevealImagen from '../components/ui/RevealImagen.jsx';
import Rulos from '../components/marca/Rulos.jsx';
import { useTarjeta3D } from '../hooks/useTarjeta3D.jsx';
import { m } from 'motion/react';
import Roll from '../components/ui/Roll.jsx';

export default function Servicios() {
  usePageTitle('Servicios');
  const { data: grupos, loading } = useServiceGroups();

  return (
    <div className="contenedor pt-4 pb-10">
      <Reveal as="header">
        <ConDestellos>
          <RevealText as="h1" className="text-4xl leading-tight md:text-5xl">
            Nuestros <em className="texto-dorado">servicios</em>
          </RevealText>
        </ConDestellos>
      </Reveal>

      {loading ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i}>
              <Skeleton className="aspect-[4/5] rounded-3xl" />
            </li>
          ))}
        </ul>
      ) : (
        (grupos ?? []).map((g, n, todos) => (
          <section key={g.titulo} aria-labelledby={`grupo-${g.titulo}`} className="relative isolate mt-10 md:mt-14">
            {/* Rulo que se dibuja con el scroll del último grupo (el de arriba lo monta App para toda la página) */}
            {n === todos.length - 1 && <Rulos variante="serviciosGrupo" />}
            <RevealText id={`grupo-${g.titulo}`} className="text-3xl leading-tight md:text-4xl">
              {g.titulo}
            </RevealText>
            {/* Asesoramientos: el video del proceso como story protagonista (mobile arriba y centrada;
                desktop en una columna fija a la izquierda de las cards) */}
            <div className={g.titulo === 'Asesoramientos' ? 'mt-5 md:grid md:grid-cols-[220px_1fr] md:items-start md:gap-8' : 'mt-5'}>
              {g.titulo === 'Asesoramientos' && (
                <Reveal delay={0.1} className="mb-8 flex justify-center md:sticky md:top-28 md:mb-0 md:block">
                  <HistoriaVideo
                    src="/video/proceso.mp4"
                    poster="/video/proceso.webp"
                    texto="Mirá cómo es un asesoramiento"
                    etiqueta="Video: cómo es un asesoramiento (con sonido)"
                  />
                </Reveal>
              )}
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                {g.servicios.map((s, i) => (
                  <Reveal as="li" key={s.id} delay={cascada(i, 3)} className="h-full">
                    <CardServicio servicio={s} />
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        ))
      )}

    </div>
  );
}

/**
 * Card de servicio con el vocabulario de las de producto: 3D en desktop, borde y halo con el color de la
 * foto, cortina al entrar, se eleva en hover. Foto, nombre, duración (el reloj gira una vez al entrar),
 * descripción (3 líneas + "Ver más" en mobile) y "¡Reservar!".
 */
function CardServicio({ servicio: s }) {
  const tarjeta = useTarjeta3D();
  return (
    <article
      ref={tarjeta.ref}
      {...tarjeta.eventos}
      style={{ '--color-producto': colorDe(s.imagen) }}
      className="card borde-producto group relative flex h-full flex-col overflow-hidden rounded-3xl transition duration-500 ease-out md:hover:-translate-y-1.5 md:hover:shadow-flotante"
    >
      {tarjeta.brillo}
      <div className="relative aspect-[4/5] overflow-hidden bg-salvia-media">
        <RevealImagen>
          <SmartImg
            src={s.imagen}
            alt=""
            placeholderTitulo={s.nombre}
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </RevealImagen>
        <span className="halo-producto halo-foto" aria-hidden="true" />
      </div>
      <div className="flex flex-1 flex-col px-4 pt-4 pb-4 md:px-5 md:pb-5">
        <h3 className="text-2xl leading-tight">{s.nombre}</h3>
        <p className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-salvia px-3 py-1 text-xs font-bold text-verde">
          <m.span
            className="inline-flex"
            initial={{ rotate: -360 }}
            whileInView={{ rotate: 0 }}
            viewport={{ once: true, amount: 1 }}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <Icon name="reloj" size={14} strokeWidth={2} />
          </m.span>
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
