# Para confirmar con Mar

Pendientes del catálogo (la verdad está en Supabase: se edita desde /admin). Lo que figura acá está cargado,
pero oculto o con un dato a revisar. Cuando Mar responda, se actualiza el producto y se borra de esta lista.

## 1. Productos ocultos: falta precio y foto

Están cargados con la descripción de Mar, pero ocultos y sin precio: no se ven en la tienda, la rutina, los
carruseles, la búsqueda ni el chat. Para publicarlos hace falta **el precio y una foto** de cada uno.
Ninguno vino en la tanda del 23/11 (los demás de esta lista ya se publicaron con esa tanda).

| # | Marca | Producto | Tamaño | id | Foto |
|---|---|---|---|---|---|
| 1 | HAN | Tonificante Multipropósito In One | 200 cc | `han-tonificante-in-one` | falta |
| 2 | Salon Line | S.O.S Cachos Kids Hidratação Chiclete Activador de Rulos | 300 ml | `salon-line-kids-chiclete` | falta (el 23/11 vino la **Gelatina** S.O.S Cachos Kids 400 g: es otro producto, `salon-line-kids-gelatina`) |
| 3 | HAN | Solución de Alfa Keratina Extra Ácida Anti Frizz | 200 cc | `han-alfa-keratina-solucion` | falta |
| 4 | Salon Line | Kids Hidra Multy Crema Multifuncional 4 en 1 | 300 ml | `salon-line-kids-hidra-multy` | falta |
| 5 | HAN | Suero Oleoso Argan Oil | 85 cc | `han-suero-argan` | falta |
| 6 | Kleno | Perfect Curly Acondicionador Rulos Perfectos | 350 cc | `kleno-acondicionador` | falta |
| 7 | Dompel | Cepillo Definidor Flexible con Bordes Dentados (Lila) | — | `cepillo-definidor-lila` | hay (`cepillo-definidor-lila.jpg`, ex `VERIFICAR-cepillo-violeta`): confirmar que es este cepillo; es chica (224 px) |

## 2. Bekim Supreme Fixer con dosificador: ¿300 ml u 800 g?

`gel-bekim-800` ahora figura como **Supreme Fixer Gel de Fijación Fuerte, 300 ml, con dosificador** (texto
de Mar, la foto es la botella con dosificador). En Tiendanube decía **800 g** y el precio actual
($ 19.000) viene de ahí. **Confirmar tamaño y precio.**

**Listo para cargar cuando Mar confirme precios de cada tamaño:** el catálogo ya admite precio por variante
(como el Ghee de Lola). Si vende los dos, queda un solo producto con variantes `300 ml` y `800 g`, cada una
con su precio (`['300 ml', foto, precio]`), y la card dice "Desde $ X".

Los **shampoos Bekim de 250 g** que mandó el 23/11 (Memory Low Shampoo y Organic Treatment Argán,
`bekim-shampoos`) **no resuelven esta duda**: son otro producto. Sigue pendiente.

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

Las fotos de esas dos variantes dicen **Shampoo** (no son las Emulsiones de Enjuague que llegaron el 23/11):
las emulsiones van en su propio producto (`han-emulsiones-enjuague`, con su "Ácido Hialurónico"), así que
no chocan. La pregunta sigue en pie.

## 5. Foto de Mar en baja resolución

El mazo de fotos de "Hola, soy Mar" (home) usa `assets/mar/mar-con-productos-1.jpg`, que mide **387×516 px**.
Cuando queda adelante se ve más blanda que las otras dos (se muestra a ~450 px en desktop). Pedirle a Mar el
original en mejor resolución y reemplazarlo en `assets/mar/` (después `npm run assets:optimizar`).

## 6. Falta precio

Nada pendiente: los 7 productos que mandó Mar el 20/11/2026 ya tienen precio (21/11) y están publicados
(Skala #Mais Cachos, Arbell, Atomizador, Difusor, Fidelité, HAN Alfa Keratina y Ghee con un precio por tamaño).
Los 33 del 23/11 también: los tres que faltaban los confirmó ese día (Máscara Loira de Farmácia $ 25.000,
Hair Jelly #Mais Cachos $ 16.000 y Gel Modelador No Graso HAN $ 19.000).

## 7. Pedir foto mejor

- **Atomizador de Bruma Continua** (`atomizador-day-after`): la foto pesa 5 KB y mide 425×470 px. Se usa
  igual, pero **pedir una foto mejor**.
- **Fidelité Colormaster Crema Ácida** (`tratamientos-fidelite`): no vino foto suelta; usa la foto grupal de
  los cuatro potes.
- **Difusor Plegable** (`difusor-plegable`): 448×448 px, con modelo. Se ve bien en las cards, pero en la
  ficha de producto queda más chica que las demás (nunca se estira). Si hay una más grande, mejor.

**Tanda del 23/11:** ninguno de estos productos estaba en su Tiendanube, así que van las fotos de WhatsApp.
Estas miden menos de 600 px (se ven bien en las cards, pero en la ficha quedan chicas: nunca se estiran).
Ideal: la foto original del proveedor, de 1000 px o más. Se reemplazan desde /admin ("Cambiar foto").

| Producto | Foto (variante) | Medida que llegó |
|---|---|---|
| Mascarillas Skala Brasil 450 g | Hidratación y Nutrición | **225×225** |
| | Reconstrucción | 381×492 |
| | foto principal (las tres) | 447×447 |
| S.O.S Cachos Kids Gelatina (Salon Line) | — | **225×225** |
| Emulsiones de Enjuague HAN | Ácido Hialurónico | **225×225** |
| | Prevención Caída | 387×516 |
| | Avena & Miel, Action Plex, Biotina + Ácido Hialurónico, Rulos Definidos | 447×447 |
| Shampoo Extractos Frutales HAN Kids | — | 242×500 |
| Gorro difusor para secador | — (la foto de la modelo) | 333×500 |
| Day After #todecacho (Activadores Salon Line) | Day After | 317×500 |
| Ampolla Keratin Complex (Fidelité) | — | 381×524 |
| Gelatina Alta Definição Fixação 7 (Salon Line) | — | 384×520 |
| Cremas de Peinar HAN | Rulos Definidos | 399×501 |
| Cremas 2 en 1 Skala | Manteca de Karité | 400×500 |
| | Óleo de Argán, Aguacate, Vitamina | 447×447 |
| | Biotina | 554×554 |
| | Caju | **224×224** |
| | las otras 16 nuevas (ver sección 9) | 392×500 a 500×500 |
| Ossono | Gel High Power Ful 500 ml / Style Fix 250 g | 432×462 / 442×452 |
| Gorro térmico de aluminio | — | 444×450 |
| Cepillo de crepar Eurostil | — | 449×445 |
| Curl Girl | Curling Gel, Shampoo y Curling Cream | 447×447 (las tres pesan 6–7 KB) |
| Óleo Umectante Coco Puro (Salon Line) | — | 447×447 |
| Proteína Ela é Carioca (Lola) | — | 447×447 |
| Sprays HAN | Emulsión de Peinar Coco y Protector Térmico | 447×447 |
| Cascada de Proteínas | Ginseng y Bambú / Manzanilla y Vainilla | 447×447 / 427×468 |
| Gel Líquido Day After Cachos (Skala) | — | 480×480 |
| Shampoos Bekim | Organic Treatment Argán / Memory | 480×480 / 554×554 |
| Gelatinas Frutástica (Skala) | Melancia / Maracujá | 484×500 / 500×500 |
| Cepillo masajeador de silicona | — | 500×442 |
| Cremas de Peinar Naturals (Frenzzi) | Cebolla & Ginseng, Almendras Dulces & Chía, Arándanos | 554×554 |
| Activadores #todecacho (Salon Line) | Cachos dos Sonhos | 554×554 |

## 8. Datos que se asumieron al cargar (nov 2026)

- **Accesorios de tela** (cofias, fundas de satén, turbante y practiplopping): Mar confirmó que los hace un
  modisto y van en bolsita con su nombre → marca "Dream Hair".
- **¿El ondulador también es del modisto?** (`ondulador-saten`) Hoy va sin marca; si lo es, marca "Dream Hair".
- **Practiplopping:** las variantes Microfibra y Algodón usan la misma foto (vino una sola).
- **Mascarillas Lola 450 g:** el álbum trae exactamente las cuatro del texto (Milagre, Dream Cream, Danos
  Vorazes, Morte Súbita): no hay variantes de más.

**Tanda del 23/11:**

- **Gorro difusor para secador** (`gorro-difusor`): va **sin marca**. ¿Lo hace el modisto? Si sí, marca
  "Dream Hair". Se usó la foto de la modelo con el gorro negro; la del gorro azul de satén (168×300) era
  demasiado chica. ¿Cuál es el que vende?
- **Sujetadores articulados:** $ 4.000 **el par** (confirmado): el nombre dice "x2".
- **Curling Gel Curl Girl:** un solo producto con variantes **300 cc** ($ 15.000) y **500 cc** ($ 18.000)
  ("cc" como dice la etiqueta; en el texto decía "g"). Antes eran dos productos ocultos, uno por tamaño.
- **Shampoo Hidratante Curl Girl:** 250 ml (confirmado).
- **Cremas Skala 1 kg** (`cremas-skala`): **precio por variante**: las 5 de tratamiento Expert (Manteca de
  Karité, Óleo de Argán, Aguacate, Vitamina, Biotina) a **$ 7.000** y todas las demás a **$ 6.900** (la card
  dice "Desde $ 6.900"). ¿Siguen todas las de antes (Mais Cachinhos, Dona Skala, Divina Cor, Divino Potão,
  Mais Cachos, Cachonados, Potão do Amor, Divino Potinho, Mais Crespos)? Las 17 nuevas, en la sección 9.
- **Cascada de Proteínas:** un solo producto con las dos variantes, **125 ml** (antes figuraba 120 ml).
- **Cremas de Peinar HAN:** un solo producto con variantes Rulos Definidos y **Keratina** (como en su texto;
  la etiqueta dice "α Keratina").
- **Frenzzi:** la línea quedó como **"Naturals"** (antes figuraba "Naturale").
- **Ossono 250 g:** el "Gel High Power Ful en pote" que estaba oculto es el **Style Fix** de la foto.
- **Shampoo Silver Matizador, Emulsiones de Enjuague HAN y Shampoos Bekim** van en la categoría **Low poo**
  (es la de lavado, paso 1 de la rutina). ¿El Silver es sin sulfatos?
- **Creme Modelador Cachos dos Sonhos** va en **Cremas de peinar** (como la Curling Cream de Curl Girl).
- **Gorro térmico de aluminio:** foto con maniquí → se muestra "en su marco" (como las cofias), no flotando.

## 9. Cremas Skala 1 kg: variantes nuevas para confirmar

Las 18 fotos de cremas 2 en 1 del 23/11 (álbum de las 11:48 + 11.49.02) **no coinciden con ninguna de las 9
variantes que ya estaban**: se agregaron como **17 variantes nuevas a $ 6.900** (visibles). Confirmar que las
vende todas y a ese precio:

| Línea | Variantes nuevas |
|---|---|
| Skala Expert | Maionese Capilar, Amido de Milho, Coquetel de Frutas Family, Mais Lisos, Glicólico 3 em 1 |
| Skala | Restauração Espetacular 12 em 1 |
| Skala Brasil | Caju, Babosa |
| Skala Frutástica | Banana, Maracujá, Melancia, Uva, Morango, Cereja, Cacau, Coco, Coquetel de Frutas 3 em 1 |

- **Amido de Milho:** vinieron dos fotos, el envase viejo (dice "Co-Wash") y el nuevo. Quedó una sola
  variante con la foto del nuevo. ¿Es el mismo producto?
- **Coquetel de Frutas:** son dos distintos: el Expert "Family" (2 en 1) y el Frutástica (3 en 1,
  melancia + coco + uva). Quedaron como dos variantes.
- **Glicólico** y **Restauração Espetacular** dicen "3 em 1" y "12 em 1" en el pote, no "2 en 1": quedaron
  igual dentro de Cremas 2 en 1.

## 10. Fotos del 23/11 que no se usaron

Están en `assets/productos/originales/2026-11-23/` (no se suben al repo).

- **14.59.15:** el flyer de **Black Friday** (martes 24/11 al viernes 27/11: El preferido $ 28.000, Cepillo
  viral $ 13.000, Kit Kleno $ 38.000, Kit Antifrizz $ 17.000). No es un producto.
- **11.18.57:** la misma foto que 11.16.01 (Curling Gel).
- **11.06.16 (Gel Potenciador Rich):** se dejó la que ya estaba, que es más grande (600×900).
- Repetidas o de menor calidad: Emulsión Action Plex en escena, la góndola de las Gelatinas Frutástica
  (357 px; la principal es la de Uva), el grupo de Skala Expert y el gorro azul de satén.
