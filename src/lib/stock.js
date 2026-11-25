// "Sin stock" de la tienda (producto.sinStock, ver lib/catalogo.js). Si lo marcó Mar para el producto entero
// (interruptor "Sin stock" en /admin) es porque está por llegar: "Sin stock · llega pronto". Si es porque todas
// sus variantes están agotadas: "Sin stock".
export const textoSinStock = (producto) => (producto.agotado ? 'Sin stock · llega pronto' : 'Sin stock');
