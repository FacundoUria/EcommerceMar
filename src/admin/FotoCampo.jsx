// Campo de foto del panel: muestra cómo se ve en la tienda y deja elegir otra (galería o cámara), recortarla y
// subirla. Si la foto es chica (< 800 px de lado) pregunta antes. Al terminar llama onCambio(url) y
// onSubida(url): el formulario lleva la cuenta de lo que subió para borrarlo si al final no guarda.
// Debajo, "¿Cómo es la foto?" (fondo blanco → el producto "flota" con multiply; persona o fondo de color → en
// un marco): viene elegida la que detectó el navegador y Mar solo la toca si la vista previa se ve mal.
import { useEffect, useId, useRef, useState } from 'react';
import FotoProducto, { tipoFondo } from '../components/product/FotoProducto.jsx';
import { imgFija, registrarFotos } from '../lib/imagenes.js';
import { abrirFoto, empezarEntera, esSubida, LADO_MINIMO, prepararFoto, subirFoto } from './fotos.js';
import Recortador from './Recortador.jsx';
import { Boton, Dialogo, useAvisos } from './ui.jsx';
import { mensajeError } from './util.js';

const tactil = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

// Originales de las últimas fotos subidas en esta visita al panel ({ bitmap, recorte } por URL), para rehacerlas si
// cambia "¿Cómo es la foto?" (también después de "Crear producto", que vuelve a montar el formulario). Solo las
// últimas 3: una foto del celu decodificada ocupa decenas de MB.
const originales = new Map();
function recordarOriginal(url, original) {
  originales.set(url, original);
  while (originales.size > 3) {
    const [viejaUrl, vieja] = originales.entries().next().value;
    originales.delete(viejaUrl);
    if (![...originales.values()].some((o) => o.bitmap === vieja.bitmap)) vieja.bitmap.close?.();
  }
}

const OPCIONES = [
  ['blanco', 'Producto solo sobre fondo blanco'],
  ['escena', 'Foto con persona o fondo de color'],
];

/** La foto como se ve en la tienda: card de producto (4:5) o de categoría (3:4, a sangre). */
function VistaPrevia({ src, fondo, vista, chica }) {
  const ancho = chica ? 'w-28' : 'w-36';
  if (vista === 'categoria')
    return (
      <span className={`block aspect-[3/4] ${ancho} overflow-hidden rounded-3xl shadow-suave`}>
        <FotoProducto src={src} fondo={fondo} sizes="144px" cover zoom={false} />
      </span>
    );
  return (
    <span className={`card block aspect-[4/5] ${ancho} overflow-hidden rounded-3xl`}>
      <FotoProducto src={src} fondo={fondo} sizes="144px" zoom={false} />
    </span>
  );
}

/**
 * `vista`: 'producto' (también variantes) | 'categoria' | 'servicio' (sin "¿Cómo es la foto?": en Servicios
 * todas van en su marco). `fondo` / `onFondo(url, fondo)`: la opción elegida, que se guarda con el formulario.
 */
export default function FotoCampo({ etiqueta, ayuda, valor, onCambio, onSubida, onFondo, fondo, vista = 'producto', opcional = false, chica = false }) {
  const galeria = useRef(null);
  const camara = useRef(null);
  const [foto, setFoto] = useState(null); // la elegida, antes de recortar
  const [paso, setPaso] = useState(null); // null | 'chica' | 'recortar'
  const [subiendo, setSubiendo] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [elegida, setElegida] = useState(null); // la opción que tocó mientras se rehace la foto (se marca al instante)
  const avisar = useAvisos();
  const nombre = useId();

  useEffect(() => () => foto && URL.revokeObjectURL(foto.url), [foto]);

  const elegir = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (!archivo) return;
    try {
      const f = await abrirFoto(archivo);
      f.entera = empezarEntera(f.bitmap); // producto sobre blanco: que arranque entero (no se corte el frasco)
      setFoto(f);
      setPaso(Math.min(f.ancho, f.alto) < LADO_MINIMO ? 'chica' : 'recortar');
    } catch {
      avisar('No se pudo abrir esa foto. Probá con otra (JPG o PNG).', 'error');
    }
  };

  const cancelar = () => {
    foto?.bitmap.close?.();
    setPaso(null);
    setFoto(null);
  };

  /** Procesa y sube; registra sus datos (color, fondo, miniatura) para que la vista previa sea la de la tienda. */
  const subir = async (bitmap, recorte, opciones) => {
    const preparada = await prepararFoto(bitmap, recorte, opciones);
    const url = await subirFoto(preparada);
    registrarFotos([{ url, ...preparada.datos }]);
    onSubida?.(url);
    return { url, fondo: preparada.datos.fondo };
  };

  const usar = async (recorte) => {
    setSubiendo(true);
    try {
      const { url } = await subir(foto.bitmap, recorte);
      recordarOriginal(url, { bitmap: foto.bitmap, recorte });
      onCambio(url);
      setPaso(null);
      setFoto(null);
    } catch (e) {
      avisar(`No se pudo subir la foto. ${mensajeError(e)}`, 'error');
    } finally {
      setSubiendo(false);
    }
  };

  const actual = valor ? (fondo ?? tipoFondo(valor)) : null;
  const mostrada = elegida ?? actual;
  const conFondo = vista !== 'servicio' && valor && esSubida(valor);

  // Cambiar "¿Cómo es la foto?". Si la foto se subió recién (el original sigue en memoria) se rehace: las de
  // fondo blanco llevan las luces a blanco puro y las otras no. Si es de otro día, cambia solo cómo se muestra.
  const cambiarFondo = async (nuevo) => {
    if (nuevo === actual || procesando) return;
    const o = originales.get(valor);
    if (!o) {
      onFondo?.(valor, nuevo);
      return;
    }
    setProcesando(true);
    setElegida(nuevo);
    try {
      const { url } = await subir(o.bitmap, o.recorte, { fondo: nuevo });
      originales.delete(valor);
      recordarOriginal(url, o);
      onCambio(url);
      onFondo?.(url, nuevo);
    } catch (e) {
      avisar(`No se pudo actualizar la foto. ${mensajeError(e)}`, 'error');
    } finally {
      setProcesando(false);
      setElegida(null);
    }
  };

  const lado = chica ? 96 : 160;
  return (
    <div className="space-y-3">
      <p className="text-[17px] font-bold text-tinta">
        {etiqueta}
        {opcional && <span className="ml-1.5 font-normal text-texto-suave">(opcional)</span>}
      </p>
      {ayuda && <p className="text-base text-texto-suave">{ayuda}</p>}
      <div className="flex flex-wrap items-start gap-4">
        {valor && vista !== 'servicio' ? (
          <figure className="shrink-0 space-y-1.5">
            <VistaPrevia src={valor} fondo={mostrada} vista={vista} chica={chica} />
            <figcaption className="text-center text-[15px] text-texto-suave">Así se ve en la tienda</figcaption>
          </figure>
        ) : (
          <div className="shrink-0 overflow-hidden rounded-2xl border border-linea bg-salvia-media" style={{ width: lado, height: lado }}>
            {valor ? (
              <img {...imgFija(valor, lado)} alt="" width={lado} height={lado} className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center p-2 text-center text-base text-tinta/70">Sin foto</span>
            )}
          </div>
        )}
        <div className="flex min-w-40 flex-1 flex-col gap-2">
          <Boton variante="secundario" disabled={procesando} onClick={() => galeria.current.click()}>
            {valor ? 'Cambiar foto' : 'Elegir foto'}
          </Boton>
          {tactil() && (
            <Boton variante="secundario" disabled={procesando} onClick={() => camara.current.click()}>
              Sacar con la cámara
            </Boton>
          )}
          {valor && (
            <Boton variante="suave" disabled={procesando} onClick={() => onCambio(null)}>
              Quitar foto
            </Boton>
          )}
        </div>
      </div>

      {conFondo && (
        <fieldset className="space-y-2" disabled={procesando}>
          <legend className="mb-2 text-[17px] font-bold text-tinta">¿Cómo es la foto?</legend>
          {OPCIONES.map(([valorOpcion, texto]) => (
            <label
              key={valorOpcion}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-2 text-[17px] ${
                mostrada === valorOpcion ? 'border-verde bg-salvia font-bold' : 'border-tinta/20 bg-white'
              } ${procesando ? 'opacity-60' : ''}`}
            >
              <input
                type="radio"
                name={nombre}
                className="size-6 shrink-0 accent-verde"
                checked={mostrada === valorOpcion}
                onChange={() => cambiarFondo(valorOpcion)}
              />
              {texto}
            </label>
          ))}
          <p className="text-base text-texto-suave" aria-live="polite">
            {procesando ? 'Actualizando la foto…' : 'Elegimos la que nos pareció. Cambiala solo si arriba se ve mal.'}
          </p>
        </fieldset>
      )}

      <input ref={galeria} type="file" accept="image/*" className="hidden" onChange={elegir} aria-label={`${etiqueta}: elegir de la galería`} />
      <input ref={camara} type="file" accept="image/*" capture="environment" className="hidden" onChange={elegir} aria-label={`${etiqueta}: sacar con la cámara`} />

      <Dialogo
        abierto={paso === 'chica'}
        onCerrar={cancelar}
        titulo="Esta foto es chica"
        acciones={
          <>
            <Boton
              grande
              ancho
              onClick={() => {
                cancelar();
                galeria.current.click();
              }}
            >
              Elegir otra
            </Boton>
            <Boton variante="secundario" ancho onClick={() => setPaso('recortar')}>
              Usarla igual
            </Boton>
          </>
        }
      >
        <p>
          Esta foto es chica ({foto?.ancho} × {foto?.alto} px) y se va a ver borrosa. ¿Usarla igual?
        </p>
      </Dialogo>

      <Dialogo abierto={paso === 'recortar'} onCerrar={() => !subiendo && cancelar()} titulo="Encuadrá la foto">
        {foto && paso === 'recortar' && <Recortador foto={foto} entera={foto.entera} onListo={usar} onCancelar={cancelar} ocupado={subiendo} />}
      </Dialogo>
    </div>
  );
}
