// Ayudas para mostrar variantes (los nombres son los de Mar tal cual).

/** "Rosa bebé · frutilla" → ['Rosa bebé', 'frutilla']; "Negro" → ['Negro', null]. */
export function partesVariante(nombre) {
  const i = nombre.indexOf(' · ');
  return i < 0 ? [nombre, null] : [nombre.slice(0, i), nombre.slice(i + 3)];
}

/** Color claro (blanco, crema, rosa bebé…): el tilde de seleccionado va oscuro en vez de blanco. */
export function esColorClaro(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 165;
}
