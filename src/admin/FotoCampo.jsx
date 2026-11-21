// Campo de foto del panel: muestra la actual y deja elegir otra (galería o cámara), recortarla y subirla.
// Si la foto es chica (< 800 px de lado) pregunta antes. Al terminar llama onCambio(url) y onSubida(url):
// el formulario lleva la cuenta de lo que subió para borrarlo si al final no guarda.
import { useEffect, useRef, useState } from 'react';
import { imgFija } from '../lib/imagenes.js';
import { abrirFoto, generarTamanios, LADO_MINIMO, subirTamanios } from './fotos.js';
import Recortador from './Recortador.jsx';
import { Boton, Dialogo, useAvisos } from './ui.jsx';
import { mensajeError } from './util.js';

const tactil = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export default function FotoCampo({ etiqueta, ayuda, valor, onCambio, onSubida, opcional = false, chica = false }) {
  const galeria = useRef(null);
  const camara = useRef(null);
  const [foto, setFoto] = useState(null); // la elegida, antes de recortar
  const [paso, setPaso] = useState(null); // null | 'chica' | 'recortar'
  const [subiendo, setSubiendo] = useState(false);
  const avisar = useAvisos();

  useEffect(
    () => () => {
      if (!foto) return;
      URL.revokeObjectURL(foto.url);
      foto.bitmap.close?.();
    },
    [foto],
  );

  const elegir = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (!archivo) return;
    try {
      const f = await abrirFoto(archivo);
      setFoto(f);
      setPaso(Math.min(f.ancho, f.alto) < LADO_MINIMO ? 'chica' : 'recortar');
    } catch {
      avisar('No se pudo abrir esa foto. Probá con otra (JPG o PNG).', 'error');
    }
  };

  const cerrar = () => {
    setPaso(null);
    setFoto(null);
  };

  const usar = async (recorte) => {
    setSubiendo(true);
    try {
      const url = await subirTamanios(await generarTamanios(foto.bitmap, recorte));
      onSubida?.(url);
      onCambio(url);
      cerrar();
    } catch (e) {
      avisar(`No se pudo subir la foto. ${mensajeError(e)}`, 'error');
    } finally {
      setSubiendo(false);
    }
  };

  const lado = chica ? 96 : 160;
  return (
    <div className="space-y-2">
      <p className="text-[17px] font-bold text-tinta">
        {etiqueta}
        {opcional && <span className="ml-1.5 font-normal text-texto-suave">(opcional)</span>}
      </p>
      {ayuda && <p className="text-base text-texto-suave">{ayuda}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <div className="shrink-0 overflow-hidden rounded-2xl border border-linea bg-salvia-media" style={{ width: lado, height: lado }}>
          {valor ? (
            <img {...imgFija(valor, lado)} alt="" width={lado} height={lado} className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center p-2 text-center text-base text-tinta/70">Sin foto</span>
          )}
        </div>
        <div className="flex min-w-40 flex-1 flex-col gap-2">
          <Boton variante="secundario" onClick={() => galeria.current.click()}>
            {valor ? 'Cambiar foto' : 'Elegir foto'}
          </Boton>
          {tactil() && (
            <Boton variante="secundario" onClick={() => camara.current.click()}>
              Sacar con la cámara
            </Boton>
          )}
          {valor && (
            <Boton variante="suave" onClick={() => onCambio(null)}>
              Quitar foto
            </Boton>
          )}
        </div>
      </div>
      <input ref={galeria} type="file" accept="image/*" className="hidden" onChange={elegir} aria-label={`${etiqueta}: elegir de la galería`} />
      <input ref={camara} type="file" accept="image/*" capture="environment" className="hidden" onChange={elegir} aria-label={`${etiqueta}: sacar con la cámara`} />

      <Dialogo
        abierto={paso === 'chica'}
        onCerrar={cerrar}
        titulo="Esta foto es chica"
        acciones={
          <>
            <Boton grande ancho onClick={() => { cerrar(); galeria.current.click(); }}>
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

      <Dialogo abierto={paso === 'recortar'} onCerrar={() => !subiendo && cerrar()} titulo="Encuadrá la foto">
        {foto && paso === 'recortar' && <Recortador foto={foto} onListo={usar} onCancelar={cerrar} ocupado={subiendo} />}
      </Dialogo>
    </div>
  );
}
