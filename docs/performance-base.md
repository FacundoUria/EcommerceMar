# Performance: línea base

Medición antes de optimizar para celulares de gama baja (commit `589ff81`, 2026-11-19). La regla de la
optimización: **no cambiar nada visual**; cada cambio se compara píxel a píxel contra estas capturas.

## Cómo se midió

- **Build de producción** (`npm run build`) servido con un servidor estático propio que comprime como
  Netlify (brotli para HTML/JS/CSS, caché larga en `/assets`, fallback SPA). `vite preview` sirve sin
  comprimir y distorsiona LCP/TBT.
- **Lighthouse 12.6 mobile**, dos perfiles:
  - estándar (el de siempre: CPU 4x, 4G lento simulado), **mediana de 3 corridas** por página;
  - duro: CPU **6x** + **Fast 3G** (562,5 ms de latencia, 1,44 Mbps), 1 corrida.
- **Carga real** en Chrome con CPU 6x + Fast 3G emulados (DevTools), 390 px @3x: LCP, tareas largas
  (> 50 ms) y TBT real (suma de lo que cada tarea pasa de 50 ms), mediana de 3.
- **INP aproximado**: con CPU 6x, la duración del evento más lento de cada interacción (Event Timing API),
  mediana de 3: tocar "Agregar" en una card de /tienda, abrir el chat de mini Mar (botón central) y abrir
  el carrito (header).
- **Frames**: Chrome con ventana (vsync real) y CPU 6x: scroll táctil del inicio (4500 px, gesto sintético),
  3 arrastres del carrusel de favoritos y 3 swipes del mazo de banners. Se registra cada frame con
  `requestAnimationFrame` y los *long animation frames*. El monitor de esta PC es de **179 Hz**: los FPS
  pasan de 60; lo que importa es el p95 del frame y los frames de más de 33/50 ms.
- **Capturas**: todas las páginas en 390 px (mobile) y 1440 px, página completa, en estado quieto: se
  recorre la página para cargar las fotos lazy y disparar las entradas, se vuelve arriba y se congelan las
  animaciones CSS/WAAPI. Se tapan (magenta) solo las zonas que cambian con el reloj y no con el código:
  texto de la barra de anuncio, carruseles con autoplay (favoritos, reseñas), mazo de banners y mini Mar
  desktop. **Ruido medido** (dos capturas seguidas de la misma base): 0 píxeles distintos en 11 de 12; en
  `producto-390` el ancho de la captura varía 393/394 px (artefacto de la captura de página completa:
  en el navegador no hay desborde) y el corrimiento de 1 px da 0,73 %.
- **Límite**: el throttling de DevTools frena la CPU, no la GPU. Lo que en un celular malo traba por GPU
  (capas grandes, imágenes enormes decodificadas) se ve poco en esta PC; eso se evaluó con traces
  (repintados, capas) además de los FPS.

## Resultados

### Lighthouse mobile (perfil estándar: CPU 4x, 4G lento simulado; mediana de 3)

| Página | Performance | Accesibilidad | FCP | LCP | TBT | CLS | Speed Index | Peso |
|---|---|---|---|---|---|---|---|---|
| Inicio | 85 | 100 | 2071 ms | 3898 ms | 109 ms | 0 | 2784 ms | 558 KB |
| Productos | 88 | 100 | 1802 ms | 3680 ms | 86 ms | 0 | 1973 ms | 475 KB |
| Producto | 87 | 100 | 1878 ms | 3829 ms | 30 ms | 0 | 2257 ms | 523 KB |
| Rutina | 93 | 100 | 1802 ms | 3079 ms | 25 ms | 0.01 | 1802 ms | 378 KB |
| Servicios | 92 | 100 | 1802 ms | 3229 ms | 16 ms | 0 | 1925 ms | 432 KB |
| Carrito | 94 | 100 | 1802 ms | 2854 ms | 27 ms | 0 | 1802 ms | 344 KB |

### Lighthouse mobile — perfil duro (CPU 6x + Fast 3G simulado)

| Página | Performance | Accesibilidad | FCP | LCP | TBT | CLS | Speed Index | Peso |
|---|---|---|---|---|---|---|---|---|
| Inicio | 55 | 100 | 4503 ms | 7273 ms | 396 ms | 0 | 4503 ms | 558 KB |
| Productos | 61 | 100 | 4503 ms | 7600 ms | 211 ms | 0 | 4503 ms | 475 KB |
| Producto | 62 | 100 | 4784 ms | 7599 ms | 142 ms | 0 | 4784 ms | 523 KB |
| Rutina | 65 | 100 | 4503 ms | 6754 ms | 79 ms | 0.01 | 4503 ms | 378 KB |
| Servicios | 65 | 100 | 4502 ms | 6753 ms | 100 ms | 0 | 4502 ms | 432 KB |
| Carrito | 65 | 100 | 4502 ms | 6753 ms | 64 ms | 0 | 4502 ms | 344 KB |

### Carga real (Chrome, CPU 6x + Fast 3G, 390 px; mediana de 3)

| Página | LCP | Tareas largas (> 50 ms) | TBT real | Tarea más larga |
|---|---|---|---|---|
| Inicio | 4920 ms | 5 | 1160 ms | 980 ms |
| Productos | 4892 ms | 6 | 901 ms | 499 ms |

### INP aproximado (CPU 6x; duración del evento más lento de la interacción; mediana de 3)

| Interacción | Duración |
|---|---|
| Tocar "Agregar" en una card (/tienda) | 224 ms |
| Abrir el chat (botón central) | 112 ms |
| Abrir el carrito (header) | 128 ms |

### Frames (Chrome con ventana, CPU 6x, 390 px; monitor de 179 Hz)

| Gesto | FPS | Frame p95 | Frames > 33 ms | Frames > 50 ms | Long animation frames > 50 ms |
|---|---|---|---|---|---|
| Scroll del inicio (4500 px) | 156.3 | 11.2 ms | 0 | 0 | 0 |
| Arrastrar el carrusel de favoritos (3 veces) | 89.6 | 16.7 ms | 0 | 0 | 0 |
| Arrastrar el mazo de banners (3 swipes) | 162 | 11.1 ms | 0 | 0 | 0 |


## Dónde se va el tiempo al cargar el inicio (trace, CPU 6x + Fast 3G)

| Tarea | Duración | Qué tiene adentro |
|---|---|---|
| Evaluar los módulos JS | 193 ms | `v8.evaluateModule` 186 ms |
| **Primer render de React** | **1021 ms** | JS 1014 ms, de los cuales **449 ms son layouts forzados** (efectos que miden el DOM: imágenes, títulos, carruseles, rulos…) y 135 ms de recálculo de estilos |
| Primer pintado | 86 ms | Paint 72 ms |
| Varias de 80–130 ms | — | animaciones de entrada, layouts y pintados |

El render inicial del home monta **todas** las secciones de una vez (hero, categorías, favoritos, cinta,
rutina, "Hola, soy Mar", reseñas, banners) aunque solo el hero se ve al entrar.

## Capturas de la base

En `docs/performance/base/` (webp a la mitad del tamaño; las comparaciones se hacen sobre los PNG
originales):

- [carrito-1440.webp](performance/base/carrito-1440.webp)
- [carrito-390.webp](performance/base/carrito-390.webp)
- [inicio-1440.webp](performance/base/inicio-1440.webp)
- [inicio-390.webp](performance/base/inicio-390.webp)
- [producto-1440.webp](performance/base/producto-1440.webp)
- [producto-390.webp](performance/base/producto-390.webp)
- [productos-1440.webp](performance/base/productos-1440.webp)
- [productos-390.webp](performance/base/productos-390.webp)
- [rutina-1440.webp](performance/base/rutina-1440.webp)
- [rutina-390.webp](performance/base/rutina-390.webp)
- [servicios-1440.webp](performance/base/servicios-1440.webp)
- [servicios-390.webp](performance/base/servicios-390.webp)
