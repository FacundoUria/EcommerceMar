// Precio por variante (src/data/products.js: [nombre, foto, precio]). En el catálogo cada variante ya trae
// su precio resuelto (el propio o el del producto); `producto.precio` es el más bajo y `producto.desde`
// dice si las variantes tienen precios distintos ("Desde $ X").

/** Precio de lo que se compra: el de la variante elegida, o el del producto si no hay variante. */
export const precioDe = (producto, variante) => variante?.precio ?? producto.precio;

/** "Desde" solo mientras no hay una variante elegida y los precios cambian según la variante. */
export const esDesde = (producto, variante) => !!producto.desde && !variante;
