import { Link } from 'react-router';
import Icon from '../ui/Icon.jsx';
import Rulos from '../marca/Rulos.jsx';
import { NEGOCIO, whatsappCon } from '../../config/negocio.js';

const LINKS = [
  { to: '/tienda', label: 'Productos' },
  { to: '/rutina', label: 'Rutina' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/carrito', label: 'Carrito' },
];

/**
 * Footer de borde a borde: degradé arena → salvia con grano. Termina en la línea del copyright
 * (en mobile, con espacio abajo para que el bottom nav no la tape).
 */
export default function Footer() {
  return (
    <footer className="fondo-salvia-abajo grano pt-16 pb-28 md:pt-24 md:pb-10">
      {/* Rulos que terminan de dibujarse justo al llegar al final de la página */}
      <Rulos variante="footer" hastaElFinal />
      <div className="contenedor text-tinta">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-serif text-4xl md:text-5xl">{NEGOCIO.nombre}</p>
            <p className="text-xs font-bold tracking-[0.28em] text-dorado uppercase">{NEGOCIO.bajada}</p>
          </div>
          <nav aria-label="Pie de página">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 font-semibold">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link className="text-tinta hover:text-verde" to={l.to}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="text-sm text-texto-suave">
            {NEGOCIO.direccion && <p>{NEGOCIO.direccion}</p>}
            {NEGOCIO.horarios && <p>{NEGOCIO.horarios}</p>}
            {/* Links de texto: el WhatsApp principal es mini Mar (desktop) / el botón central del bottom nav (mobile) */}
            <div className={`flex flex-wrap gap-x-6 gap-y-2 font-semibold ${NEGOCIO.direccion || NEGOCIO.horarios ? 'mt-4' : ''}`}>
              <a href={whatsappCon()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-tinta transition-colors hover:text-verde">
                <Icon name="whatsapp" size={17} /> WhatsApp
              </a>
              <a href={NEGOCIO.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-tinta transition-colors hover:text-verde">
                <Icon name="instagram" size={17} /> Instagram
              </a>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-linea pt-5 text-xs text-texto-suave">
          © {new Date().getFullYear()} {NEGOCIO.nombre} · {NEGOCIO.ciudad}
        </p>
      </div>
    </footer>
  );
}
