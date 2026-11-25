# Para confirmar con Mar

Pendientes del catálogo (la verdad está en Supabase: se edita desde /admin). Lo que figura acá está cargado,
pero oculto o con un dato a revisar. Cuando Mar responda, se actualiza el producto y se borra de esta lista.

## 0. Black Friday (martes 24/11 0:00 al viernes 27/11 23:59) — URGENTE

Cargado y programado: se prende y se apaga solo. Mientras dura, la barra de arriba dice «🖤 BLACK FRIDAY ·
hasta el viernes 27/11 · solo efectivo o transferencia» (no aparece «Aceptamos todos los medios de pago»), el
inicio muestra las 4 ofertas y, si el carrito tiene algo en promo, el pedido solo ofrece efectivo o
transferencia. Confirmar:

1. **Cepillo viral** ($ 13.000): el flyer dice «antes $ 18.000», pero en la web estaba a **$ 16.000**. Por
   ahora se tacha **$ 16.000** (el precio que tenía la web). Si Mar confirma que era $ 18.000, se carga en
   /admin → el producto → Promoción → «Precio de antes (tachado)».
2. **Kit El preferido** ($ 28.000, antes $ 32.000): Shampoo HAN a elección + Gel Supreme Fixer **en pote**
   (Bekim, el de la foto) + Skala 1 kg a elección.
   - «Elegí tu shampoo»: las variantes del **Shampoo low poo HAN** (Carbón Activado, Action Plex, Biotina +
     Ácido Hialurónico, Rulos Definidos, Prevención Caída, Avena & Miel, Ácido hialurónico, Lino). ¿Puede ser
     otro shampoo (Kleno, Skala, Bekim…)?
   - «Elegí tu Skala»: las variantes de **Cremas 2 en 1 Skala 1 kg** (las 21 de $ 6.900; las Expert de
     $ 7.000 no entran). ¿Entran también las Expert?
   - Las dos listas se toman solas del catálogo: si Mar oculta o agrega una variante, el kit se actualiza.
3. **Kit Kleno** ($ 38.000, antes $ 49.000): Shampoo Rulos Perfectos, Crema de Peinar Definition, Activador
   de Rulos en gel y Mousse Rulos Definidos. ¿Son esos cuatro?
4. **Kit Antifrizz** ($ 17.000, antes $ 27.000): cofia, funda y scrunchie de satén. **Resuelto (24/11):**
   sin selector de color; la ficha dice «El color lo coordinás con Mar por WhatsApp» y el pedido «Kit
   Antifrizz (color a coordinar)». **No hay foto del scrunchie**: la foto del kit tiene las cofias y la funda.
5. **Fotos de los kits**: armadas con las fotos reales de cada producto sobre el arena de la marca. Las de
   Kleno y el Supreme Fixer miden 225 px: el Kit Kleno se ve algo blando. Si Mar tiene fotos mejores, se
   cambian desde /admin.
6. Los kits están en la categoría **«Promos»** (aparece en Productos solo durante el Black Friday).

## 1. Productos ocultos: falta precio y foto

Están cargados, pero ocultos: no se ven en la tienda, la rutina, los carruseles, la búsqueda ni el chat. Para
publicarlos hace falta **el precio** y **una foto**. In One, Chiclete, Solución de Alfa Keratina, Kids Hidra
Multy y Suero Argan Oil se publicaron con la tanda del 24/11; después la Máscara Action Plex ($ 16.000) y el
Acondicionador Kleno ($ 10.000, con su foto). El Flexible perfumado con llavero se unificó con el publicado
(ver la sección 12).

| # | Marca | Producto | Tamaño | id | Falta |
|---|---|---|---|---|---|
| 1 | Dream Hair | Scrunchies de satén (24/11): «1 unidad» $ 1.900 y «Pack x2» $ 3.000, color a coordinar con Mar (como las cofias) | — | `scrunchies-saten` | **foto** (y descripción, si quiere) |

Cuando Mar suba la foto desde /admin, los muestra con «Mostrar en la tienda».

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
| 31 | Cepillo Definidor de Rulos y Ondas Anti-Frizz (Rosa) | `cepillo-viral` | `cepillo-viral.webp` (definidor rosa): desde el 23/11 es la foto de la variante Rosa (ver sección 11) |
| 33 | Dompel — Cepillo Definidor Flexible con Bordes Dentados (Lila) | `cepillo-definidor-lila` (nuevo, oculto) | `cepillo-definidor-lila.jpg` (ex `VERIFICAR-cepillo-violeta`) |
| 35 | Cepillo Pulpo Desenredante para Rulos y Ondas | `cepillo-magico` | `cepillo-magico.webp` (varios colores, hileras sueltas) |
| 37 | Cepillo Flexible Curvo Desenredante y Ventilado | `cepillo-pirulito-2` | `cepillo-pirulito-2.webp` (varios colores, cabezal ventilado) |

Además, `cepillo-viral-flexible` queda como estaba, sin descripción de Mar (comparte foto con otro cepillo).
`cepillo-viral-doble` tiene foto propia desde el 23/11 (sección 11), pero sigue sin descripción de Mar.

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
| Cepillo Definidor viral | foto principal (los 5 colores) / Rosa | 554×554 / 447×447 |

**Tanda del 24/11** (se subieron igual; en la ficha quedan chicas):

| Producto | Foto (variante) | Medida que llegó |
|---|---|---|
| In One Tonificante (HAN) | — | **185×218** |
| Solución de Alfa Keratina (HAN) | — | **185×216** |
| Suero Oleoso Argan Oil (HAN) | — | **224×224** |
| Kids Hidra Multy 4 en 1 (Salon Line) | — | **224×224** |
| Cremas 2 en 1 Skala | Açaí / Mango | **224×224** |
| Tónico Capilar Biotina (HAN) | — | 387×516 |
| Cepillo Dompel con mini llavero (oculto) | — | 399×501 |
| Máscara Action Plex (HAN, oculta) | — | 459×667 |

La foto 14.39.42 (Restauração Espetacular, 199×234) no se usó: la que ya estaba es más grande (469 px).

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
- **Skala 1 kg, separado en dos productos (23/11, pedido de Mar):**
  - **Tratamientos Skala Expert 1 kg** (`skala-expert-tratamientos`, Tratamientos, **$ 7.000**): las 10 Expert
    (Manteca de Karité, Óleo de Argán, Aguacate, Vitamina, Biotina, Maionese Capilar, Amido de Milho,
    Coquetel de Frutas Family, Mais Lisos, Glicólico 3 em 1), con su texto. Foto: la grupal de los potes Expert.
  - **Cremas 2 en 1 Skala 1 kg** (`cremas-skala`, **$ 6.900**): las 21 restantes. ¿Siguen todas las de antes
    (Mais Cachinhos, Dona Skala, Divina Cor, Divino Potão, Mais Cachos, Cachonados, Potão do Amor, Divino
    Potinho, Mais Crespos)? Las nuevas, en la sección 9.
- **Cascada de Proteínas:** un solo producto con las dos variantes, **125 ml** (antes figuraba 120 ml).
- **Cremas de Peinar HAN:** un solo producto con variantes Rulos Definidos y **Keratina** (como en su texto;
  la etiqueta dice "α Keratina").
- **Frenzzi:** la línea quedó como **"Naturals"** (antes figuraba "Naturale").
- **Ossono 250 g:** el "Gel High Power Ful en pote" que estaba oculto es el **Style Fix** de la foto.
- **Shampoo Silver Matizador, Emulsiones de Enjuague HAN y Shampoos Bekim** van en la categoría **Low poo**
  (es la de lavado, paso 1 de la rutina). ¿El Silver es sin sulfatos?
- **Creme Modelador Cachos dos Sonhos**: ahora en **Activadores y modeladores** (pedido de Mar, 23/11).
- **Gorro térmico de aluminio:** foto con maniquí → se muestra "en su marco" (como las cofias), no flotando.

## 9. Cremas Skala 1 kg: variantes nuevas para confirmar

**24/11:** reclasificadas con el criterio de Mar (sección 12). Lo de abajo es cómo quedaron el 23/11.

Las 18 fotos de cremas 2 en 1 del 23/11 (álbum de las 11:48 + 11.49.02) **no coinciden con ninguna de las 9
variantes que ya estaban**: se agregaron como **17 variantes nuevas** (visibles). Confirmar que las vende
todas y a esos precios:

| Línea | Variantes nuevas | Precio |
|---|---|---|
| Skala Expert | Maionese Capilar, Amido de Milho, Coquetel de Frutas Family, Mais Lisos, Glicólico 3 em 1 | **$ 7.000** (como las otras Expert; están en «Tratamientos Skala Expert 1 kg») |
| Skala | Restauração Espetacular 12 em 1 | $ 6.900 |
| Skala Brasil | Caju, Babosa | $ 6.900 |
| Skala Frutástica | Banana, Maracujá, Melancia, Uva, Morango, Cereja, Cacau, Coco, Coquetel de Frutas 3 em 1 | $ 6.900 |

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
- **22.34.51** (álbum del cepillo doble, 430×465): varios cepillos sobre madera; no queda claro cuáles son el
  doble (ver sección 11).
- El álbum de las **20.56.58** era el de Skala Expert repetido (las mismas 6 fotos): se borró.

## 11. Cepillos definidores (23/11, noche)

**24/11:** Mar mandó los colores de todos los cepillos (sección 12): reemplazan a los de esta tabla y
responden las preguntas 2, 3 y 5.

Cada cepillo quedó como **un solo producto con variantes de color** (no hay un producto por color). Precio
igual para todos los colores.

| Producto | Precio | Colores | Fotos |
|---|---|---|---|
| **Cepillo Definidor viral** (`cepillo-viral`, con picos) | $ 16.000 (Black Friday $ 13.000) | Rosa, Negro, Verde agua, Lila, Beige | principal: los 5 colores (22.33.42); Rosa: la de siempre (frente y dorso) |
| **Cepillo Definidor tenedor** (`cepillo-viral-tenedor`) | $ 15.000 | Rosa, Verde agua, Lila, Negro | principal: los 4 colores (22.34.29); Lila: la de antes (en la mano, el lila adelante) |
| **Cepillo Definidor doble** (`cepillo-viral-doble`) | **$ 13.000** | — | frente y dorso, sacados de la infografía rosa (22.34.52) |

Confirmar:

1. **Doble: ¿$ 13.000?** Mar escribió «13.009»; se tomó como $ 13.000.
2. **Doble: ¿en qué colores viene?** Quedó sin variantes. En la otra foto del álbum (22.34.51) se ve uno lila
   y otros rosa, fucsia y negro, pero no queda claro cuáles son el doble. Tampoco tiene descripción de Mar.
3. **Tenedor:** el tercero de la foto es un **lila muy claro**: ¿se llama «Lila»? En la foto de antes (en la
   mano) también se ve uno **beige/crema**: ¿viene en ese color?
4. **Tenedor: la foto nueva tiene la marca de agua de otra tienda** (una «Y» abajo a la derecha). Se usó
   porque es la que mandó Mar, pero lo ideal es una foto propia o la del proveedor sin marca.
5. **Viral:** ¿Rosa, Negro, Verde agua, Lila y Beige son los nombres con los que los vende?
6. No se unificaron (son otros modelos): el **Definidor Fucsia** (`cepillo-detangle-bounce`, $ 12.000, cabezal
   rectangular con bordes en ondas) y el **Dompel lila** (`cepillo-definidor-lila`, oculto).
7. Los carritos que ya tenían el viral (antes era solo el rosa) siguen andando, con el precio de Black
   Friday, pero el pedido dice «Cepillo Definidor viral» sin el color.

## 12. Tanda del 24/11

Fotos originales en `assets/productos/originales/2026-11-24/` (no se suben al repo).

**Skala 1 kg con el criterio de Mar** (potes de colores = 2 en 1; potes negros de tratamiento = Expert):

| Producto | Precio | Variantes |
|---|---|---|
| **Tratamientos Skala Expert 1 kg** (`skala-expert-tratamientos`) | $ 7.000 | Manteca de Karité, Óleo de Argán, Aguacate, Vitamina, Biotina, Restauração Espetacular 12 em 1 (6) |
| **Cremas 2 en 1 Skala 1 kg** (`cremas-skala`) | $ 6.900 | Mais Cachinhos, Dona Skala, Divina Cor, Divino Potão, Mais Cachos, Cachonados, Potão do Amor, Divino Potinho, Mais Crespos, Maionese Capilar, Amido de Milho, Coquetel de Frutas Family, Mais Lisos, Glicólico 3 em 1, Raízes do Morro, Jaborandi, Caju, Babosa, Açaí, Banana, Mango, Maracujá, Melancia, Uva, Morango, Cereja, Cacau, Coco, Coquetel de Frutas 3 em 1 (29) |

**Confirmado por Mar (24/11): quedan así.** Cómo se decidió:

1. **Pasaron de Expert a 2 en 1 por el criterio** (pote de color): Amido de Milho (lo pidió Mar), Mais Lisos y
   Glicólico (venían en el álbum de «2 en 1 que faltan») y **Maionese Capilar y Coquetel de Frutas Family**
   (no venían en el álbum, pero el pote es de color y dice «2 em 1»).
2. **Vitamina y Biotina** tienen pote **blanco** (no negro): quedaron en Expert porque son tratamientos («Bomba
   de Vitaminas / de Biotina»), están en la foto grupal de Expert y la descripción de Mar los nombra.
3. **Cachonados y Divina Cor** tienen pote negro, pero son las 2 en 1 de peinar (con ilustración): quedaron en
   2 en 1 (Cachonados es la mini-card del inicio).
4. Nuevas en 2 en 1: Açaí, Mango (Frutástica), Jaborandi (Botânica) y Raízes do Morro.

**Cepillos: cómo quedaron (tanda completa de Mar, 24/11 a la noche).** Los ids de dos cepillos estaban
cruzados y se corrigieron; los links y carritos viejos siguen andando (`src/config/renombrados.js`). Respaldo
de las filas de antes en `assets/respaldos/2026-11-24/cepillos-antes-tanda3.json`.

| Cepillo | id | Precio | Colores | Etiquetas | Foto |
|---|---|---|---|---|---|
| **Flexible perfumado con llavero de regalo** (Dompel) | `cepillo-flexible-perfumado` (antes `cepillo-maya-cuadrado`; el oculto `cepillo-definidor-lila` se unificó acá y se borró) | $ 12.000 | Rosa bebé · frutilla, Lila · uva, Verde oscuro · manzana | Perfumado + Llavero | 21:52 (paletas con espiral) |
| **Maya** («Cepillo Flexible Curvo Desenredante y Ventilado») | `cepillo-maya` (antes `cepillo-pirulito-2`) | $ 9.000 | Violeta, Rosa, Verde agua | — | la del abanico |
| **Viral flexible** (Dompel) | `cepillo-viral-flexible` | $ 13.000 | Rojo · frutilla, Lila · uva, Verde agua · manzana | Perfumado + Llavero | 21:53 (tres colores sobre blanco); el Lila, la del lila de bordes dentados |
| **Espiral / Pirulito** (Dompel) | `cepillo-pirulito` | $ 8.000 | Amarillo · limón, Verde agua · manzana, Rojo · frutilla | Perfumado | fondo blanco + madera + exhibidor (galería) |
| **Pulpo** | `cepillo-magico` | $ 12.000 | Rosa · con llavero, Lila · con llavero, Azul · sin llavero, Amarillo (**agotado**) | Llavero en Rosa y Lila | 21:53 (blísteres Dompel PRO) |
| **Viral doble** | `cepillo-viral-doble` | $ 13.000 | Verde agua (antes «Verde manzana»), Crema clarito, Rosa clarito | — | sin cambios |

Confirmar o pedir:
1. **Fotos chicas**: la del Viral flexible (224 px) y la principal del Pirulito (246 px) se ven chicas en la
   ficha (nunca se agrandan). Si Mar tiene esas mismas fotos más grandes, se cambian desde /admin.
2. **Flexible por color**: no se recortó una foto por color: en la foto de 447 px cada par mide ~190 px y se
   vería diminuto al elegir el color.
3. **Maya**: la foto del abanico muestra también uno **negro**: ¿se vende o pedir otra foto?
4. La descripción que tenía el publicado («Cepillo de cuerpo flexible y ventilado que se adapta al contorno de
   la cabeza…») se reemplazó por la del Flexible (la escribió Facu, no Mar: «Cepillo flexible de paleta
   ovalada, perfumado y con mini llavero de regalo…»). Está en el respaldo por si era del Maya.
5. Al Maya y al Pirulito se les agregó «maya» / «pirulito» como otros nombres para el buscador (no se ven).

**Scrunchies** («color a coordinar»): desde el 24/11 hay un producto suelto (`scrunchies-saten`, oculto hasta
que haya foto; ver la sección 1). También van dentro del Kit Antifrizz.

**Sin stock por variante** (pedido de Mar): en /admin, cada variante tiene «Sin stock». En la ficha se ve
tachada con «Agotado» y no se puede elegir; si todas están agotadas, el producto dice «Sin stock» y no se
puede agregar. Hoy: el Amarillo del Pulpo.

**Fotos que se perdieron al cambiar colores:** la del tenedor «en la mano» (era la de la variante Lila, que
ya no existe). El viral Rosa pasó a Rosa rojizo con su foto.

**Sin selector de color** (`src/config/color.js`, solo mientras ninguna variante del producto sea un color):
- Color a coordinar (ficha y pedido): Kit Antifrizz, Ondulador, Cofia XL, Cofia Long y Gorro difusor.
- Un solo color: Sujetadores articulados (trabas cocodrilo) → «Color: Negro» en la ficha.

**Cuadraditos de color (24/11):** los tonos de los 16 productos con colores (cepillos, cofia, funda, turbante,
practiplopping) se cargaron por el nombre, a ojo. Si alguno no se parece al real (sobre todo Rosa rojizo, Gris
topo, Celeste oscuro, Verde oscuro del Dompel), Mar lo cambia en /admin → el producto → la variante → «Otro
color». El turbante dice Lila, Crema y Gris topo, pero la foto muestra verde, celeste y rosa: ¿cuáles son?

**Carritos viejos:** si tenían un color que ya no existe (viral Rosa o Beige, practiplopping «Microfibra» o
«Algodón», tenedor, Restauração en 2 en 1), la línea queda como el producto sin color y el pedido va sin color.
Los colores que solo cambiaron de nombre (Pulpo «Fucsia» → «Rosa», Viral doble «Verde manzana» → «Verde
agua») pasan al nombre nuevo, y los productos con id nuevo, al id nuevo.
