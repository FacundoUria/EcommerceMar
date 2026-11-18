import { useEffect, useState } from 'react';

/**
 * Precarga y decodifica una imagen; devuelve true cuando ya se puede pintar sin parpadeo.
 * Si falla la carga devuelve true igual (no bloquear la UI por una imagen).
 */
export function useImagenLista(src) {
  const [lista, setLista] = useState(false);
  useEffect(() => {
    if (!src) return setLista(true);
    let vivo = true;
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    const listo = () => vivo && setLista(true);
    (img.decode ? img.decode() : new Promise((r, e) => ((img.onload = r), (img.onerror = e)))).then(listo, listo);
    return () => {
      vivo = false;
    };
  }, [src]);
  return lista;
}
