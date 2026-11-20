# Para confirmar con Mar

Pendientes del catálogo (`src/data/products.js`). Lo que figura acá está cargado, pero oculto o con un dato
a revisar. Cuando Mar responda, se actualiza el producto y se borra de esta lista.

## 1. Productos nuevos ocultos: falta precio y foto

Están cargados con la descripción de Mar, pero con `activo: false` y `precio: null`: no se ven en la tienda,
la rutina, los carruseles, la búsqueda ni el chat. Para publicarlos hace falta **el precio y una foto** de
cada uno (y sacar `activo: false`).

| # | Marca | Producto | Tamaño | id | Foto |
|---|---|---|---|---|---|
| 1 | HAN | Tonificante Multipropósito In One | 200 cc | `han-tonificante-in-one` | falta |
| 2 | Salon Line | S.O.S Cachos Kids Hidratação Chiclete Activador de Rulos | 300 ml | `salon-line-kids-chiclete` | falta |
| 3 | Salon Line | Línea #todecacho Activadores de Rulos | 300 ml | `salon-line-activadores` | falta |
| 4 | Curl Girl | Curling Gel Hidratante con Aceite de Jojoba y Almendras | 500 cc | `curl-girl-gel-500` | falta |
| 5 | HAN | Solución de Alfa Keratina Extra Ácida Anti Frizz | 200 cc | `han-alfa-keratina-solucion` | falta |
| 6 | Curl Girl | Curling Gel Hidratante con Aceite de Jojoba y Almendras | 300 cc | `curl-girl-gel-300` | falta |
| 7 | Ossono | Gel High Power Ful con Dosificador | 500 ml | `ossono-gel-500` | falta |
| 8 | Salon Line | Kids Hidra Multy Crema Multifuncional 4 en 1 | 300 ml | `salon-line-kids-hidra-multy` | falta |
| 9 | Curl Girl | Curling Cream Modeladora con Pantenol y Glicerina Vegetal | 300 cc | `curl-girl-curling-cream` | falta |
| 10 | Ossono | Gel High Power Ful en Pote | 250 g | `ossono-gel-250` | falta |
| 11 | HAN | Crema de Peinar Rulos Definidos | 200 cc | `han-crema-rulos-definidos` | falta |
| 12 | Skala | Expert Day After Cachos Gel Líquido | 250 g | `skala-day-after` | falta |
| 13 | HAN | Crema de Peinar Alfa Keratina | 200 cc | `han-crema-alfa-keratina` | falta |
| 14 | Frenzzi | Naturale Cremas de Peinar Sin Siliconas (Cebolla & Ginseng, Almendras Dulces & Chía, Arándanos) | 200 ml | `frenzzi-cremas-naturale` | falta (una por variante, ideal) |
| 15 | Cascada de Proteínas | Nutri-Reparación Instantánea Ginseng y Bambú | 120 ml | `cascada-ginseng-bambu` | falta |
| 16 | HAN | Suero Oleoso Argan Oil | 85 cc | `han-suero-argan` | falta |
| 17 | Cascada de Proteínas | Nutri-Reparación Instantánea Manzanilla y Vainilla | 120 ml | `cascada-manzanilla-vainilla` | falta |
| 18 | Kleno | Perfect Curly Acondicionador Rulos Perfectos | 350 cc | `kleno-acondicionador` | falta |
| 19 | Dompel | Cepillo Definidor Flexible con Bordes Dentados (Lila) | — | `cepillo-definidor-lila` | hay (`cepillo-definidor-lila.jpg`, ex `VERIFICAR-cepillo-violeta`): confirmar que es este cepillo; es chica (224 px) |
| 20 | Rich | Gel Potenciador con Proteína Vegetal | 250 g | `gel-rich-potenciador` | hay (`gel-de-rich-potenciador.jpg`) |

## 2. Bekim Supreme Fixer con dosificador: ¿300 ml u 800 g?

`gel-bekim-800` ahora figura como **Supreme Fixer Gel de Fijación Fuerte, 300 ml, con dosificador** (texto
de Mar, la foto es la botella con dosificador). En Tiendanube decía **800 g** y el precio actual
($ 19.000) viene de ahí. **Confirmar tamaño y precio.**

**Listo para cargar cuando Mar confirme precios de cada tamaño:** el catálogo ya admite precio por variante
(como el Ghee de Lola). Si vende los dos, queda un solo producto con variantes `300 ml` y `800 g`, cada una
con su precio (`['300 ml', foto, precio]`), y la card dice "Desde $ X".

## 3. Cepillos asignados por foto (dudosos)

Las descripciones de Mar se asignaron a los cepillos que ya estaban comparando las fotos. Confirmar que cada
descripción va con esa foto:

| # de Mar | Descripción de Mar | Producto | Foto asignada |
|---|---|---|---|
| 30 | Dompel — Cepillo Flexible Rectangular Desenredante | `cepillo-maya-cuadrado` | `cepillo-maya-cuadrado.webp` (Dompel rosa; es la misma foto que `cepillo-viral-flexible`) |
| 31 | Cepillo Definidor de Rulos y Ondas Anti-Frizz (Rosa) | `cepillo-viral` | `cepillo-viral.webp` (definidor rosa; misma foto que `cepillo-viral-doble`) |
| 33 | Dompel — Cepillo Definidor Flexible con Bordes Dentados (Lila) | `cepillo-definidor-lila` (nuevo, oculto) | `cepillo-definidor-lila.jpg` (ex `VERIFICAR-cepillo-violeta`) |
| 35 | Cepillo Pulpo Desenredante para Rulos y Ondas | `cepillo-magico` | `cepillo-magico.webp` (varios colores, hileras sueltas) |
| 37 | Cepillo Flexible Curvo Desenredante y Ventilado | `cepillo-pirulito-2` | `cepillo-pirulito-2.webp` (varios colores, cabezal ventilado) |

Además, `cepillo-viral-flexible` y `cepillo-viral-doble` quedan como estaban, sin descripción de Mar (cada
uno comparte foto con otro cepillo).

Los dos cepillos Viñeta que mandó Mar en noviembre (`cepillo-tangle`, lila y menta, y `cepillo-pinza`) **no
coinciden con ninguno de estos**: se cargaron como productos nuevos y esta tabla sigue igual.

## 4. Shampoos HAN: variantes que Mar no menciona

Las variantes se renombraron con los nombres de Mar (Carbón Activado, Action Plex, Biotina + Ácido
Hialurónico, Rulos Definidos, Prevención Caída, Avena & Miel). Quedan dos que **no están en su texto**:

- **Ácido hialurónico** (`shampoo-han-acido-hialuronico`)
- **Lino** (`shampoo-han-lino`)

¿Las sigue vendiendo? Si no, se sacan de las variantes.

## 5. Foto de Mar en baja resolución

El mazo de fotos de "Hola, soy Mar" (home) usa `assets/mar/mar-con-productos-1.jpg`, que mide **387×516 px**.
Cuando queda adelante se ve más blanda que las otras dos (se muestra a ~450 px en desktop). Pedirle a Mar el
original en mejor resolución y reemplazarlo en `assets/mar/` (después `npm run assets:optimizar`).

## 6. Falta precio

Nada pendiente: los 7 productos que mandó Mar el 20/11/2026 ya tienen precio (21/11) y están publicados
(Skala #Mais Cachos, Arbell, Atomizador, Difusor, Fidelité, HAN Alfa Keratina y Ghee con un precio por tamaño).

## 7. Fotos para pedirle a Mar

- **Atomizador de Bruma Continua** (`atomizador-day-after`): la foto pesa 5 KB y mide 425×470 px. Se usa
  igual, pero **pedir una foto mejor**.
- **Fidelité Colormaster Crema Ácida** (`tratamientos-fidelite`): no vino foto suelta; usa la foto grupal de
  los cuatro potes.
- **Difusor Plegable** (`difusor-plegable`): 448×448 px, con modelo. Se ve bien en las cards, pero en la
  ficha de producto queda más chica que las demás (nunca se estira). Si hay una más grande, mejor.

## 8. Datos que se asumieron al cargar (nov 2026)

- **Accesorios de tela** (cofias, fundas de satén, turbante y practiplopping): Mar confirmó que los hace un
  modisto y van en bolsita con su nombre → marca "Dream Hair".
- **¿El ondulador también es del modisto?** (`ondulador-saten`) Hoy va sin marca; si lo es, marca "Dream Hair".
- **Practiplopping:** las variantes Microfibra y Algodón usan la misma foto (vino una sola).
- **Mascarillas Lola 450 g:** el álbum trae exactamente las cuatro del texto (Milagre, Dream Cream, Danos
  Vorazes, Morte Súbita): no hay variantes de más.
