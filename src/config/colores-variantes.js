// Colores de las variantes (cuadraditos de la ficha). El color de cada variante se guarda en Supabase
// (variantes.color_hex) y lo elige Mar en /admin; esto es solo la paleta del panel y las sugerencias por nombre.
import { partesVariante } from '../lib/variantes.js';

/** Paleta del panel: los colores más comunes, en el orden en que se muestran. */
export const PALETA_COLORES = [
  { nombre: 'Negro', hex: '#1f1f1f' },
  { nombre: 'Blanco', hex: '#f8f8f6' },
  { nombre: 'Crema', hex: '#efe3c8' },
  { nombre: 'Gris', hex: '#9b9b9b' },
  { nombre: 'Rosa bebé', hex: '#f6c6d2' },
  { nombre: 'Rosa', hex: '#f09bb3' },
  { nombre: 'Fucsia', hex: '#d63384' },
  { nombre: 'Rojo', hex: '#c8323c' },
  { nombre: 'Lila', hex: '#c4a7dc' },
  { nombre: 'Violeta', hex: '#8a5cb8' },
  { nombre: 'Celeste', hex: '#8ec8ea' },
  { nombre: 'Azul', hex: '#2e5daa' },
  { nombre: 'Verde agua', hex: '#8ed8c8' },
  { nombre: 'Verde claro', hex: '#b4e0a6' },
  { nombre: 'Verde oscuro', hex: '#2f6a46' },
  { nombre: 'Amarillo', hex: '#f5d443' },
];

// Tonos de producto (plástico, satén, microfibra) para los nombres que usa Mar, además de los de la paleta
const OTROS = {
  'rosa claro': '#f5c3cf',
  'rosa clarito': '#f8d5dd',
  'rosa rojizo': '#d9727e',
  'crema clarito': '#f4ecd9',
  beige: '#e6d5b8',
  'gris topo': '#8a7e74',
  'celeste claro': '#bfdff2',
  'celeste oscuro': '#5f93c2',
  'azul marino': '#1f2f56',
  'verde manzana': '#9bcf53',
  turquesa: '#3fbfb5',
  naranja: '#f08a3c',
  bordó: '#7b1f2e',
  marrón: '#7a4e2d',
  dorado: '#c9a45a',
  plateado: '#c0c4c8',
};
const POR_NOMBRE = { ...Object.fromEntries(PALETA_COLORES.map((c) => [c.nombre.toLowerCase(), c.hex])), ...OTROS };

/**
 * Color que corresponde al nombre de una variante, o null. Usa la parte de antes del "·" ("Lila · uva" → lila)
 * y el color más largo con que termina ("Microfibra Celeste claro" → celeste claro).
 */
export function colorSugerido(nombre) {
  const n = partesVariante(nombre.trim())[0].toLowerCase().replace(/\s+/g, ' ');
  let mejor = null;
  for (const k of Object.keys(POR_NOMBRE)) if ((n === k || n.endsWith(` ${k}`)) && (!mejor || k.length > mejor.length)) mejor = k;
  return mejor ? POR_NOMBRE[mejor] : null;
}
