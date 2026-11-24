import { useEffect, useState } from 'react';
import { CAMPANA } from '../config/promo.js';
import { ahoraPromo, campanaActiva, proximoCambio } from '../lib/promo.js';

/** true mientras dura la campaña (Black Friday). Se prende y se apaga sola, aunque la página quede abierta. */
export function useCampanaActiva() {
  const [activa, setActiva] = useState(campanaActiva);
  useEffect(() => {
    const t = ahoraPromo();
    const prox = proximoCambio([CAMPANA], t);
    if (prox === null || prox - t > 20 * 86400000) return undefined;
    const id = setTimeout(() => setActiva(campanaActiva()), prox - t + 50);
    return () => clearTimeout(id);
  }, [activa]);
  return activa;
}
