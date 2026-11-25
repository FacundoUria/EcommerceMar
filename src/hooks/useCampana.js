import { useEffect, useState } from 'react';
import { CAMPANA } from '../config/promo.js';
import { NAVIDAD } from '../config/navidad.js';
import { ahoraPromo, proximoCambio, vigente } from '../lib/promo.js';

/** true mientras `rango` ({ desde, hasta }) está vigente. Se prende y se apaga sola, aunque la página quede abierta. */
function useVigente(rango) {
  const ahora = () => vigente(rango.desde, rango.hasta);
  const [activa, setActiva] = useState(ahora);
  useEffect(() => {
    const t = ahoraPromo();
    const prox = proximoCambio([rango], t);
    // setTimeout no aguanta esperas tan largas: más de 20 días, se resuelve al volver a abrir
    if (prox === null || prox - t > 20 * 86400000) return undefined;
    const id = setTimeout(() => setActiva(vigente(rango.desde, rango.hasta)), prox - t + 50);
    return () => clearTimeout(id);
  }, [activa, rango]);
  return activa;
}

/** true mientras dura la campaña (Black Friday). */
export const useCampanaActiva = () => useVigente(CAMPANA);

/** true mientras dura el Especial de Navidad. */
export const useNavidadActiva = () => useVigente(NAVIDAD);
