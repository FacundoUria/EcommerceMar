// Generador de trazos "rulo": una espiral estirada, como un rulo de pelo visto de costado
// (trocoide: avanza en línea recta mientras gira). Devuelve el atributo `d` de un <path>.
// Todo se calcula una vez al importar (o al medir): no hay librerías ni assets extra.

const r2 = (n) => Math.round(n * 10) / 10;

/** Estrellita de 4 puntas con lados cóncavos (viewBox 0 0 24 24). */
export const PATH_ESTRELLA = 'M12 0C12.9 7.6 16.4 11.1 24 12C16.4 12.9 12.9 16.4 12 24C11.1 16.4 7.6 12.9 0 12C7.6 11.1 11.1 7.6 12 0Z';

/**
 * @param {object} o
 * @param {number} o.x, o.y        punto de partida
 * @param {number} o.largo          distancia que recorre el rulo (px del viewBox)
 * @param {number} o.vueltas        cantidad de bucles
 * @param {number} o.radio          radio de los bucles (> largo / vueltas / 6.3 para que se crucen)
 * @param {number} [o.angulo=0]     dirección en grados (0 = hacia la derecha)
 * @param {number} [o.afinar=0.35]  cuánto se achica el radio hacia el final (0–1)
 * @param {number} [o.ovalo=0.75]   achatamiento de los bucles (1 = círculo)
 * @param {number} [o.puntos=40]    puntos por vuelta
 */
export function rulo({ x, y, largo, vueltas, radio, angulo = 0, afinar = 0.35, ovalo = 0.75, puntos = 40 }) {
  const n = Math.max(8, Math.round(vueltas * puntos));
  const a = (angulo * Math.PI) / 180;
  const [cos, sin] = [Math.cos(a), Math.sin(a)];
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const th = t * vueltas * Math.PI * 2;
    // radio que se afina y "respira" un poco: se ve dibujado a mano, no geométrico
    const r = radio * (1 - afinar * t) * (1 + 0.08 * Math.sin(th * 0.37 + 1.3));
    const lx = largo * t + r * Math.sin(th);
    const ly = r * ovalo * (1 - Math.cos(th));
    const px = x + lx * cos - ly * sin;
    const py = y + lx * sin + ly * cos;
    d += `${i ? 'L' : 'M'}${r2(px)} ${r2(py)}`;
  }
  return d;
}

/** Espiral alrededor de un centro (aro de la intro): de radio `r0` a `r1` en `vueltas`, con colita hacia afuera. */
export function espiral({ cx, cy, r0, r1, vueltas = 1.2, inicio = -90, puntos = 64 }) {
  const n = Math.round(vueltas * puntos);
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const th = ((inicio + t * vueltas * 360) * Math.PI) / 180;
    const r = r0 + (r1 - r0) * t ** 1.6;
    d += `${i ? 'L' : 'M'}${r2(cx + r * Math.cos(th))} ${r2(cy + r * Math.sin(th))}`;
  }
  return d;
}

/** Onda suave a lo ancho (barra de progreso): `largo` px, amplitud `amp`, una ondulación cada `periodo` px. */
export function onda({ largo, alto, periodo = 28, amp = 1.6 }) {
  const n = Math.max(2, Math.round(largo / 4));
  let d = '';
  for (let i = 0; i <= n; i++) {
    const x = (largo * i) / n;
    d += `${i ? 'L' : 'M'}${r2(x)} ${r2(alto / 2 + amp * Math.sin((x / periodo) * Math.PI * 2))}`;
  }
  return d;
}
