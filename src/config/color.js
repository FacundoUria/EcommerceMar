// Productos sin selector de color (decisión de Mar). Solo valen mientras ninguna variante del producto sea un
// color (variantes.color_hex): si Mar le carga colores desde el panel, manda el selector y esto deja de
// mostrarse. Variantes que no son colores (Scrunchies: "1 unidad" / "Pack x2") no lo cambian.

/** El color lo elige con Mar por WhatsApp: la ficha lo dice y el pedido lleva "(color a coordinar)". */
export const COLOR_A_COORDINAR = ['kit-antifrizz', 'ondulador-saten', 'cofia-xl-saten', 'cofia-long-saten', 'gorro-difusor', 'scrunchies-saten'];

/** Vienen en un solo color: la ficha dice "Color: X" (sin selector). { [id]: color } */
export const COLOR_UNICO = { 'sujetadores-articulados': 'Negro', 'difusor-universal-eurostil': 'Negro' };
