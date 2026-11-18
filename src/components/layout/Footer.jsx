import { Link } from 'react-router';
import Icon from '../ui/Icon.jsx';
import { BENEFICIOS, NEGOCIO } from '../../config/negocio.js';

export default function Footer() {
  return (
    <footer className="mt-16 rounded-t-5xl bg-verde px-6 pt-14 pb-32 text-crema md:pb-14">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <p className="font-serif text-3xl">{NEGOCIO.nombre}</p>
          <p className="text-xs font-bold tracking-[0.28em] text-amarillo uppercase">{NEGOCIO.bajada}</p>
          <p className="mt-4 max-w-xs font-serif text-lg text-crema/80 italic">“{NEGOCIO.frase}”</p>
        </div>
        <nav aria-label="Pie de página">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-amarillo uppercase">Explorar</p>
          <ul className="space-y-2 text-crema/85">
            <li><Link className="hover:text-amarillo" to="/tienda">Tienda</Link></li>
            <li><Link className="hover:text-amarillo" to="/rutina">Armá tu rutina curly</Link></li>
            <li><Link className="hover:text-amarillo" to="/servicios">Servicios del estudio</Link></li>
            <li><Link className="hover:text-amarillo" to="/carrito">Carrito</Link></li>
          </ul>
        </nav>
        <div>
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-amarillo uppercase">Estudio en {NEGOCIO.ciudad}</p>
          <ul className="space-y-2 text-sm text-crema/85">
            {BENEFICIOS.map((b) => (
              <li key={b.texto} className="flex items-center gap-2">
                <Icon name={b.icono} size={18} className="text-amarillo" /> {b.texto}
              </li>
            ))}
            <li>Dirección: {NEGOCIO.direccion}</li>
            <li>Horarios: {NEGOCIO.horarios}</li>
          </ul>
          <a href={NEGOCIO.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-amarillo mt-5">
            <Icon name="whatsapp" size={18} /> Escribinos por WhatsApp
          </a>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-6xl border-t border-crema/10 pt-6 text-xs text-crema/50">
        © {new Date().getFullYear()} {NEGOCIO.nombre} · {NEGOCIO.bajada} · Mendoza, Argentina
      </p>
    </footer>
  );
}
