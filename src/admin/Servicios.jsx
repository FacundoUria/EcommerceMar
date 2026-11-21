// Servicios del panel: lista agrupada como en /servicios (con orden dentro de cada grupo) y crear/editar/
// ocultar/borrar con los campos que usa la página: nombre, grupo, duración, descripción y foto.
import { useEffect, useRef, useState } from 'react';
import { Enlace, irA } from './ruta.jsx';
import { imgFija } from '../lib/imagenes.js';
import { useCambiosSinGuardar, useDatos } from './contexto.jsx';
import { borrarServicio, cambiarVisible, guardarServicio, reordenar } from './datos.js';
import FotoCampo from './FotoCampo.jsx';
import { borrarFotos } from './fotos.js';
import { BarraGuardar, DialogoBorrar, EncabezadoForm, ErrorCarga, SubirBajar } from './partes.jsx';
import { Boton, Campo, Cargando, ENTRADA, Insignia, Interruptor, useAvisos } from './ui.jsx';
import { mensajeError } from './util.js';

/** Grupos en el orden en que aparecen (como en la tienda). */
const gruposDe = (servicios) => [...new Set(servicios.map((s) => s.grupo))];

export function ListaServicios() {
  const { datos, error, recargar } = useDatos();
  const avisar = useAvisos();
  const [ocupado, setOcupado] = useState(false);
  if (!datos) return error ? <ErrorCarga onReintentar={() => recargar().catch(() => {})} /> : <Cargando />;
  const todos = datos.servicios;

  const mover = async (servicio, d) => {
    const delGrupo = todos.filter((s) => s.grupo === servicio.grupo);
    const otro = delGrupo[delGrupo.indexOf(servicio) + d];
    const filas = [...todos];
    const a = filas.indexOf(servicio);
    const b = filas.indexOf(otro);
    [filas[a], filas[b]] = [filas[b], filas[a]];
    setOcupado(true);
    try {
      await reordenar('servicios', filas);
      await recargar();
      avisar('Orden guardado ✓');
    } catch (e) {
      avisar(mensajeError(e), 'error');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-3xl text-tinta">Servicios</h1>
      <Enlace to="/admin/servicios/nuevo" className="btn-primario flex min-h-14 w-full items-center justify-center rounded-2xl text-lg font-bold text-arena">
        ＋ Nuevo servicio
      </Enlace>
      {gruposDe(todos).map((grupo) => {
        const lista = todos.filter((s) => s.grupo === grupo);
        return (
          <section key={grupo} className="space-y-3" aria-labelledby={`g-${grupo}`}>
            <h2 id={`g-${grupo}`} className="pt-2 font-serif text-2xl text-tinta">
              {grupo}
            </h2>
            <ul className="space-y-3">
              {lista.map((s, i) => (
                <li key={s.id} className="card flex items-center gap-3 rounded-2xl p-3">
                  <Enlace to={`/admin/servicios/${s.id}`} className="flex min-h-20 min-w-0 flex-1 items-center gap-3">
                    <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-salvia-media">
                      {s.foto && <img {...imgFija(s.foto, 64)} alt="" width="64" height="64" loading="lazy" className="size-full object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1 space-y-1">
                      <span className="block text-[17px] font-bold text-tinta">{s.nombre}</span>
                      <span className="flex flex-wrap items-center gap-2">
                        {s.duracion && <span className="text-base text-texto-suave">{s.duracion}</span>}
                        <Insignia visible={s.activo} />
                      </span>
                    </span>
                  </Enlace>
                  <SubirBajar
                    nombre={s.nombre}
                    primero={i === 0}
                    ultimo={i === lista.length - 1}
                    ocupado={ocupado}
                    onSubir={() => mover(s, -1)}
                    onBajar={() => mover(s, 1)}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

const aForm = (s) => ({
  nombre: s?.nombre ?? '',
  grupo: s?.grupo ?? '',
  duracion: s?.duracion ?? '',
  descripcion: s?.descripcion ?? '',
  foto: s?.foto ?? null,
  activo: s ? s.activo : true,
});

export function FormServicio({ id }) {
  const { datos, error, recargar } = useDatos();
  if (!datos) return error ? <ErrorCarga onReintentar={() => recargar().catch(() => {})} /> : <Cargando />;
  const original = id ? datos.servicios.find((s) => s.id === id) : null;
  if (id && !original)
    return (
      <div className="space-y-4">
        <p className="text-lg">Ese servicio no existe (quizás se borró).</p>
        <Enlace to="/admin/servicios" className="text-[17px] font-bold text-verde underline">
          Volver a servicios
        </Enlace>
      </div>
    );
  return <Formulario key={id ?? 'nuevo'} original={original} datos={datos} recargar={recargar} />;
}

function Formulario({ original, datos, recargar }) {
  const avisar = useAvisos();
  const grupos = gruposDe(datos.servicios);
  const [inicial, setInicial] = useState(() => aForm(original));
  const [form, setForm] = useState(inicial);
  const [grupoNuevo, setGrupoNuevo] = useState(false);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const subidas = useRef([]);
  const sucio = JSON.stringify(form) !== JSON.stringify(inicial);
  const dialogo = useCambiosSinGuardar(sucio);

  useEffect(
    () => () => {
      if (subidas.current.length) borrarFotos(subidas.current).catch(() => {});
    },
    [],
  );

  const cambiar = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  const guardar = async () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Escribí el nombre del servicio.';
    if (!form.grupo.trim()) e.grupo = 'Elegí en qué grupo va.';
    setErrores(e);
    if (Object.keys(e).length) {
      avisar('Revisá lo que está marcado en rojo.', 'error');
      return;
    }
    setGuardando(true);
    try {
      const d = {
        nombre: form.nombre.trim(),
        grupo: form.grupo.trim(),
        duracion: form.duracion.trim() || null,
        descripcion: form.descripcion.trim() || null,
        foto: form.foto,
        activo: form.activo,
      };
      const id = await guardarServicio(d, original, datos.servicios);
      const viejas = [original?.foto, ...subidas.current].filter((u) => u && u !== form.foto);
      subidas.current = [];
      borrarFotos(viejas).catch(() => {});
      const nuevos = await recargar();
      const listo = aForm(nuevos.servicios.find((s) => s.id === id));
      setInicial(listo);
      setForm(listo);
      setGrupoNuevo(false);
      avisar('Guardado ✓');
      if (!original) {
        irA(`/admin/servicios/${id}`, { reemplazar: true, forzar: true });
      }
    } catch (err) {
      avisar(mensajeError(err), 'error');
    } finally {
      setGuardando(false);
    }
  };

  const ocultar = async () => {
    try {
      await cambiarVisible('servicios', original.id, false);
      await recargar();
      setForm((f) => ({ ...f, activo: false }));
      setInicial((f) => ({ ...f, activo: false }));
      avisar('Listo: está oculto ✓');
    } catch (e) {
      avisar(mensajeError(e), 'error');
    }
  };
  const borrar = async () => {
    setGuardando(true);
    try {
      await borrarServicio(original);
      irA('/admin/servicios', { reemplazar: true, forzar: true });
      avisar(`«${original.nombre}» se borró para siempre.`);
      recargar().catch(() => {});
    } catch (e) {
      avisar(mensajeError(e), 'error');
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <EncabezadoForm
        volverA="/admin/servicios"
        textoVolver="Volver a servicios"
        titulo={original ? original.nombre : 'Nuevo servicio'}
        enTienda={original ? '/servicios' : null}
        oculto={original && !original.activo}
      />

      <Interruptor
        activo={form.activo}
        onCambio={(v) => cambiar('activo', v)}
        etiqueta="Mostrar en la tienda"
        descripcion={form.activo ? 'Se ve en Servicios.' : 'Oculto: nadie lo ve en la tienda.'}
        textoSi="Visible"
        textoNo="Oculto"
      />

      <Campo etiqueta="Nombre" error={errores.nombre}>
        {(id, a) => <input id={id} {...a} className={ENTRADA} value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />}
      </Campo>

      <Campo etiqueta="Grupo" ayuda="La sección de la página Servicios donde aparece." error={errores.grupo}>
        {(id, a) =>
          grupoNuevo ? (
            <div className="space-y-2">
              <input id={id} {...a} className={ENTRADA} value={form.grupo} autoFocus placeholder="Nombre del grupo nuevo" onChange={(e) => cambiar('grupo', e.target.value)} />
              <Boton
                variante="suave"
                onClick={() => {
                  setGrupoNuevo(false);
                  cambiar('grupo', inicial.grupo);
                }}
              >
                Elegir un grupo que ya existe
              </Boton>
            </div>
          ) : (
            <select
              id={id}
              {...a}
              className={ENTRADA}
              value={form.grupo}
              onChange={(e) => {
                if (e.target.value === '__nuevo__') {
                  setGrupoNuevo(true);
                  cambiar('grupo', '');
                } else cambiar('grupo', e.target.value);
              }}
            >
              <option value="">Elegí uno…</option>
              {grupos.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
              <option value="__nuevo__">＋ Otro grupo…</option>
            </select>
          )
        }
      </Campo>

      <Campo etiqueta="Duración" opcional ayuda="Ej: 1 h, 1 h 40 min.">
        {(id, a) => <input id={id} {...a} className={ENTRADA} value={form.duracion} onChange={(e) => cambiar('duracion', e.target.value)} />}
      </Campo>

      <Campo etiqueta="Descripción" opcional>
        {(id, a) => (
          <textarea id={id} {...a} rows={6} className={`${ENTRADA} leading-relaxed`} value={form.descripcion} onChange={(e) => cambiar('descripcion', e.target.value)} />
        )}
      </Campo>

      <FotoCampo etiqueta="Foto" opcional vista="servicio" valor={form.foto} onCambio={(v) => cambiar('foto', v)} onSubida={(u) => subidas.current.push(u)} />

      {original && (
        <section className="border-t border-linea pt-6">
          <Boton variante="peligro" ancho onClick={() => setBorrando(true)}>
            Ocultar o borrar este servicio…
          </Boton>
        </section>
      )}

      <BarraGuardar sucio={sucio || !original} guardando={guardando} onGuardar={guardar} texto={original ? 'Guardar cambios' : 'Crear servicio'} />

      {original && (
        <DialogoBorrar
          abierto={borrando}
          onCerrar={() => setBorrando(false)}
          nombre={original.nombre}
          queSeBorra="el servicio y su foto"
          onOcultar={original.activo ? ocultar : null}
          onBorrar={borrar}
          ocupado={guardando}
        />
      )}
      {dialogo}
    </div>
  );
}
