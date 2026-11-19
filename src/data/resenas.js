// Reseñas de clientas (textos tal cual los mandó Mar, nov 2026). Las fotos las eligió Mar.
// Foto: recorte cuadrado centrado en la cara, 192px (assets/resenas/ → public/img/resenas/).
export const reviews = [
  {
    id: 'maria-victoria-lovisolo',
    nombre: 'María Victoria Lovisolo',
    estrellas: 5,
    texto:
      'La verdad que muy buena atención, totalmente personalizada con mucha calidez y cuidado. La calidad de los productos, es impecable y luego Marina te hace seguimiento respondiendo cada pregunta que te haya quedado. ¡Muchas gracias por todo!',
  },
  {
    id: 'abril-cabrera',
    nombre: 'Abril Cabrera',
    estrellas: 5,
    texto:
      'Me encantó como se expresó, explicó y me informó. El servicio, los productos, el lugar, todos es excelente. Encanta y 100% recomendado. Te deja como nueva',
  },
  {
    id: 'magali-gonzalez',
    nombre: 'Magalí González',
    estrellas: 5,
    texto:
      '¡¡Mar es una gran experta en rulos de Mendoza!! No solo es amable, sino que tiene grandes capacidades como peluquera de rulos, asesora de productos y encima crea videos con mucha información y contenido cercano para que aprendas sobre todo el mundo curly: productos, accesorios, definiciones rápidas o super meticulosas!! La super recomiendo!!',
  },
  {
    id: 'carina-luna',
    nombre: 'Carina Luna',
    estrellas: 5,
    texto:
      'Hermoso recibimiento, excelente atención, sugerencias productivas, quedas sumamente conforme, y es totalmente recomendable. Animate y pedí turno, no te vas a arrepentir. Saludos',
  },
].map((r) => ({ ...r, foto: `/img/resenas/${r.id}.webp` }));
