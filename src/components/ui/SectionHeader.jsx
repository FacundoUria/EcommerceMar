import { Link } from 'react-router';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import RevealText from './RevealText.jsx';

/** Título de sección (1 a 3 palabras) + link opcional. Sin eyebrow ni bajada. */
export default function SectionHeader({ titulo, link, linkTexto = 'Ver todo', id }) {
  return (
    <Reveal className="contenedor mb-5 flex items-end justify-between gap-4">
      <RevealText id={id} className="text-3xl leading-tight md:text-4xl">
        {titulo}
      </RevealText>
      {link && (
        <Link to={link} className="group/l inline-flex shrink-0 items-center gap-1 rounded-full px-1 py-2 text-sm font-bold text-verde">
          {linkTexto}
          <Icon name="flecha" size={16} className="transition-transform group-hover/l:translate-x-1" />
        </Link>
      )}
    </Reveal>
  );
}
