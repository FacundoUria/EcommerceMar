import { useEffect, useMemo, useRef, useState } from 'react';
import { usePausaFueraDePantalla } from '../../hooks/usePausaFueraDePantalla.js';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import Icon from '../ui/Icon.jsx';
import { ANUNCIO } from '../../config/negocio.js';
import { CAMPANA } from '../../config/promo.js';
import { NAVIDAD, textoNavidad } from '../../config/navidad.js';
import { useCampanaActiva, useNavidadActiva } from '../../hooks/useCampana.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

const CADA_MS = 4000;
const EASE = [0.22, 1, 0.36, 1];

/**
 * Mensajes de las promos en curso ({ anuncios, anunciosMobile }) o null: Black Friday y/o Especial de Navidad
 * (hasta el 27/11 conviven: rotan los dos, primero el Black Friday).
 */
function especialesDe(campana, navidad) {
  const lista = [
    campana && { anuncio: CAMPANA.anuncio, anuncioMobile: CAMPANA.anuncioMobile },
    navidad && { anuncio: textoNavidad(NAVIDAD.anuncio), anuncioMobile: NAVIDAD.anuncioMobile.map((x) => textoNavidad(x)) },
  ].filter(Boolean);
  if (!lista.length) return null;
  return { anuncios: lista.map((e) => e.anuncio), anunciosMobile: lista.flatMap((e) => e.anuncioMobile) };
}

/**
 * Franja fina arriba de todo (sobre el header, en todas las páginas). Alto fijo (34px) y en el flujo
 * normal: al scrollear se va con la página y el header sticky queda arriba sin saltos (CLS 0).
 * Un mensaje a la vez, centrado, con su ícono fino en dorado; cambia cada 4 s: sale hacia arriba y entra
 * desde abajo con un blur sutil. Fondo verde con un brillo diagonal que pasa lento (CSS, .barra-brillo).
 * Se pausa con hover o foco. Movimiento reducido: cambia con fade y sin brillo.
 * Lectores de pantalla: los 3 mensajes en una lista oculta (la parte animada es aria-hidden).
 */
export default function BarraAnuncio() {
  const reducido = useReducedMotion();
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  // Fuera de pantalla: brillo en pausa y sin cambiar de mensaje
  const barra = useRef(null);
  const visible = usePausaFueraDePantalla(barra, { margen: '0px' });
  // Campaña (Black Friday) y/o Especial de Navidad: sus mensajes reemplazan a los de siempre y rotan; en
  // mobile, cada uno partido en dos
  const campana = useCampanaActiva();
  const navidad = useNavidadActiva();
  const ancha = useMediaQuery('(min-width: 640px)');
  const especial = useMemo(() => especialesDe(campana, navidad), [campana, navidad]);
  const mensajes = useMemo(
    () => (especial ? (ancha ? especial.anuncios : especial.anunciosMobile).map((texto) => ({ texto })) : ANUNCIO),
    [especial, ancha],
  );

  useEffect(() => {
    if (pausa || !visible || mensajes.length < 2) return;
    const id = setInterval(() => !document.hidden && setI((n) => (n + 1) % mensajes.length), CADA_MS);
    return () => clearInterval(id);
  }, [pausa, visible, mensajes]);

  const msj = mensajes[i % mensajes.length];
  const anim = reducido
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: '100%', filter: 'blur(4px)' },
        animate: { opacity: 1, y: '0%', filter: 'blur(0px)' },
        exit: { opacity: 0, y: '-100%', filter: 'blur(4px)' },
      };

  return (
    <div
      ref={barra}
      role="region"
      aria-label="Novedades de la tienda"
      tabIndex={0}
      onPointerEnter={() => setPausa(true)}
      onPointerLeave={() => setPausa(false)}
      onFocus={() => setPausa(true)}
      onBlur={() => setPausa(false)}
      className="barra-brillo relative h-[34px] overflow-hidden bg-verde text-[13px] font-semibold text-arena outline-none focus-visible:ring-2 focus-visible:ring-arena/70 focus-visible:ring-inset"
    >
      <ul className="sr-only">
        {(especial ? especial.anuncios.map((texto) => ({ texto })) : ANUNCIO).map((a) => (
          <li key={a.texto}>{a.texto}</li>
        ))}
      </ul>
      <AnimatePresence initial={false}>
        <m.p
          key={msj.texto}
          aria-hidden="true"
          {...anim}
          transition={{ duration: reducido ? 0.4 : 0.55, ease: EASE }}
          className="absolute inset-0 flex items-center justify-center gap-2 px-4 whitespace-nowrap"
        >
          {msj.icono && <Icon name={msj.icono} size={16} strokeWidth={1.5} className="shrink-0 text-[#e5cf96]" />}
          {msj.texto}
        </m.p>
      </AnimatePresence>
    </div>
  );
}
