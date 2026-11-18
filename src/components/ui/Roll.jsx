/**
 * Roll de texto en hover: el contenido sube y entra una copia desde abajo (0.3 s, CSS `.roll` en index.css).
 * Va como hijo directo del link/botón: <Link className="btn …"><Roll>Ver productos <Icon …/></Roll></Link>
 * La copia es aria-hidden, así los lectores de pantalla leen una sola vez.
 */
export default function Roll({ children }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}
