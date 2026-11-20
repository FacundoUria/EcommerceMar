// Costo de envío a domicilio por zona (tarifa de MC Mensajería). Se edita a mano.
// Departamento → zonas { id, localidades, precio }. precio: número en pesos, o null = "a cotizar" (lo
// coordina Mar). La clienta elige su localidad o barrio y le corresponde el precio de su zona; al final de
// cada departamento la UI suma sola "Otra / no sé" (a coordinar).
// Departamento sin zonas (fuera del Gran Mendoza) = el envío se cotiza siempre.
// Los ids de departamento y los nombres de localidad quedan guardados en el navegador de las clientas
// (próximo pedido): si se renombra una localidad, la tiene que volver a elegir (nada más).

export const NOTA_ENVIOS =
  'Tarifas de cadetería. Días de lluvia o pago en efectivo pueden tener un pequeño adicional; Mar te lo confirma.';

export const DEPARTAMENTOS_ENVIO = [
  {
    id: 'ciudad',
    nombre: 'Ciudad de Mendoza',
    zonas: [
      { id: 'ciudad-1', localidades: ['Microcentro', '4ta sección', '5ta sección', '6ta sección'], precio: 3000 },
      { id: 'ciudad-2', localidades: ['7ma sección', 'UNC', 'Dalvian', 'Hospital Lagomaggiore'], precio: 3500 },
    ],
  },
  {
    id: 'godoy-cruz',
    nombre: 'Godoy Cruz',
    zonas: [
      { id: 'godoy-cruz-1', localidades: ['Ciudad', 'Villa Hipódromo', 'Cementerio'], precio: 3500 },
      { id: 'godoy-cruz-2', localidades: ['Palmares', 'Las Tortugas', 'Rodríguez Peña', 'San Francisco del Monte'], precio: 4500 },
    ],
  },
  {
    id: 'guaymallen',
    nombre: 'Guaymallén',
    zonas: [
      { id: 'guaymallen-1', localidades: ['San José', 'Dorrego'], precio: 3500 },
      { id: 'guaymallen-2', localidades: ['Buena Nueva', 'Villa Nueva', 'San Francisco del Monte', 'Bermejo', 'Jesús Nazareno'], precio: 4500 },
      { id: 'guaymallen-3', localidades: ['El Sauce', 'Capilla del Rosario', 'Rodeo de la Cruz'], precio: 6000 },
      { id: 'guaymallen-4', localidades: ['Fray Luis Beltrán', 'Palmira'], precio: null },
    ],
  },
  {
    id: 'las-heras',
    nombre: 'Las Heras',
    zonas: [
      { id: 'las-heras-1', localidades: ['Centro', 'Cieneguita', 'El Challao'], precio: 3500 },
      { id: 'las-heras-2', localidades: ['Panquehua', 'El Resguardo', 'El Plumerillo'], precio: 4500 },
      { id: 'las-heras-3', localidades: ['El Algarrobal', 'El Borbollón', 'Zona Industrial'], precio: 6000 },
    ],
  },
  {
    id: 'lujan',
    nombre: 'Luján de Cuyo',
    zonas: [
      { id: 'lujan-1', localidades: ['Chacras de Coria', 'Carrodilla', 'La Puntilla'], precio: 5000 },
      { id: 'lujan-2', localidades: ['Centro', 'Mayor Drummond', 'Vistalba'], precio: 6000 },
      { id: 'lujan-3', localidades: ['Las Compuertas', 'Perdriel'], precio: 10000 },
      { id: 'lujan-4', localidades: ['Destilería', 'Zona Industrial'], precio: 15000 },
    ],
  },
  {
    id: 'maipu',
    nombre: 'Maipú',
    zonas: [
      { id: 'maipu-1', localidades: ['Luzuriaga', 'Gutiérrez'], precio: 5000 },
      { id: 'maipu-2', localidades: ['Centro', 'Coquimbito'], precio: 6000 },
      { id: 'maipu-3', localidades: ['Russell', 'Lunlunta', 'Cruz de Piedra', 'Rodeo del Medio'], precio: null },
    ],
  },
  // Resto de la provincia: sin tarifa de cadetería, Mar cotiza cada envío
  ...[
    'Lavalle', 'San Martín', 'Junín', 'Rivadavia', 'Santa Rosa', 'La Paz', 'Tunuyán', 'Tupungato', 'San Carlos',
    'San Rafael', 'General Alvear', 'Malargüe',
  ].map((nombre) => ({
    id: nombre.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, '-'),
    nombre,
    zonas: [],
  })),
];

/** Última opción de cada departamento con zonas: a coordinar con Mar. */
export const LOCALIDAD_OTRA = { id: 'otra', nombre: 'Otra / no sé', precio: null, otra: true };

/** Nombres viejos (pedidos guardados antes de las zonas) → id. */
const ALIAS = { Capital: 'ciudad' };

export const departamentoEnvio = (id) =>
  DEPARTAMENTOS_ENVIO.find((d) => d.id === id) ??
  DEPARTAMENTOS_ENVIO.find((d) => d.nombre === id || d.id === ALIAS[id]) ??
  null;

/**
 * Localidades para elegir en el checkout, cada una con el precio de su zona (en el orden de la tarifa) y
 * "Otra / no sé" al final. [] si el departamento no tiene tarifa. id = nombre de la localidad.
 */
export const localidadesDe = (depto) =>
  depto?.zonas.length
    ? [
        ...depto.zonas.flatMap((z) => z.localidades.map((nombre) => ({ id: nombre, nombre, precio: z.precio }))),
        LOCALIDAD_OTRA,
      ]
    : [];

export const localidadEnvio = (depto, id) => (id ? localidadesDe(depto).find((l) => l.id === id) ?? null : null);
