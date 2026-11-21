// Panel de Mar (/admin): productos, categorías y servicios. Nada de diseño, textos de la página ni banners.
// Chunk aparte (lo monta main.jsx solo en /admin) con supabase-js completo. noindex (meta + header en Netlify).
// Ruteo propio y mínimo (ruta.jsx): /admin/<sección>/<id>, con "¿Salir sin guardar?" también en el botón atrás.
import { useCallback, useEffect, useState } from 'react';
import { imgFija } from '../lib/imagenes.js';
import { ListaCategorias, FormCategoria } from './Categorias.jsx';
import { DatosProvider, DialogoSinGuardar, SucioContext } from './contexto.jsx';
import { FormProducto, ListaProductos } from './Productos.jsx';
import { FormServicio, ListaServicios } from './Servicios.jsx';
import { Enlace, irA, useRuta } from './ruta.jsx';
import { SesionProvider, useSesion } from './sesion.jsx';
import { AvisosProvider, Boton, Campo, Cargando, ENTRADA } from './ui.jsx';
import { mensajeError } from './util.js';

export default function AdminApp() {
  useEffect(() => {
    document.title = 'Panel · Dream Hair';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
  }, []);
  return (
    <AvisosProvider>
      <SesionProvider>
        <Puerta />
      </SesionProvider>
    </AvisosProvider>
  );
}

function Puerta() {
  const { estado } = useSesion();
  if (estado === 'cargando')
    return (
      <Pantalla>
        <Cargando />
      </Pantalla>
    );
  if (estado === 'fuera') return <Login />;
  if (estado === 'recuperar') return <NuevaClave />;
  if (estado === 'sinAcceso') return <SinAcceso />;
  if (estado === 'error') return <SinConexion />;
  return <Panel />;
}

// ───────── Pantallas sin sesión ─────────

function Pantalla({ titulo, children }) {
  return (
    <main className="flex min-h-svh items-start justify-center bg-arena px-4 py-10 sm:items-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img {...imgFija('/img/marca/LOGO.webp', 80)} alt="Dream Hair" width="80" height="80" className="size-20 rounded-full mix-blend-multiply" />
          {titulo && <h1 className="font-serif text-3xl leading-tight text-tinta">{titulo}</h1>}
        </div>
        {children}
      </div>
    </main>
  );
}

function CampoClave({ etiqueta, valor, onCambio, nueva = false, error }) {
  const [ver, setVer] = useState(false);
  return (
    <Campo etiqueta={etiqueta} error={error}>
      {(id, a) => (
        <div className="relative">
          <input
            id={id}
            {...a}
            type={ver ? 'text' : 'password'}
            autoComplete={nueva ? 'new-password' : 'current-password'}
            className={`${ENTRADA} pr-28`}
            value={valor}
            onChange={(e) => onCambio(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setVer(!ver)}
            className="absolute top-1/2 right-1.5 min-h-10 -translate-y-1/2 rounded-lg px-3 text-base font-bold text-verde"
            aria-pressed={ver}
          >
            {ver ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      )}
    </Campo>
  );
}

function Login() {
  const { entrar, pedirMailClave } = useSesion();
  const [modo, setModo] = useState('entrar'); // 'entrar' | 'olvide' | 'enviado'
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError('Escribí tu email.');
    if (modo === 'entrar' && !clave) return setError('Escribí tu contraseña.');
    setOcupado(true);
    try {
      if (modo === 'entrar') await entrar(email, clave);
      else {
        await pedirMailClave(email);
        setModo('enviado');
      }
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setOcupado(false);
    }
  };

  if (modo === 'enviado')
    return (
      <Pantalla titulo="Revisá tu mail">
        <div className="card space-y-4 rounded-3xl p-6 text-[17px] leading-relaxed">
          <p>
            Si <strong>{email.trim()}</strong> es la cuenta del panel, te llega un mail con un link para elegir una contraseña nueva.
          </p>
          <p>Abrilo y tocá el link. Si no lo ves en unos minutos, mirá en «Spam» o «Promociones».</p>
          <Boton variante="secundario" ancho onClick={() => setModo('entrar')}>
            Volver a entrar
          </Boton>
        </div>
      </Pantalla>
    );

  return (
    <Pantalla titulo={modo === 'entrar' ? 'Panel de Dream Hair' : 'Olvidé mi contraseña'}>
      <form onSubmit={enviar} className="card space-y-5 rounded-3xl p-6" noValidate>
        {modo === 'olvide' && <p className="text-[17px]">Escribí tu email y te mandamos un link para elegir una contraseña nueva.</p>}
        <Campo etiqueta="Email">
          {(id, a) => (
            <input id={id} {...a} type="email" inputMode="email" autoComplete="username" className={ENTRADA} value={email} onChange={(e) => setEmail(e.target.value)} />
          )}
        </Campo>
        {modo === 'entrar' && <CampoClave etiqueta="Contraseña" valor={clave} onCambio={setClave} />}
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-[17px] font-semibold text-red-800" role="alert">
            {error}
          </p>
        )}
        <Boton type="submit" grande ancho disabled={ocupado}>
          {ocupado ? 'Un momento…' : modo === 'entrar' ? 'Entrar' : 'Mandarme el mail'}
        </Boton>
        <button
          type="button"
          onClick={() => {
            setModo(modo === 'entrar' ? 'olvide' : 'entrar');
            setError(null);
          }}
          className="block min-h-12 w-full text-[17px] font-bold text-verde underline underline-offset-4"
        >
          {modo === 'entrar' ? 'Olvidé mi contraseña' : 'Volver a entrar'}
        </button>
      </form>
    </Pantalla>
  );
}

function NuevaClave() {
  const { nuevaClave, salir } = useSesion();
  const [clave, setClave] = useState('');
  const [otra, setOtra] = useState('');
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const enviar = async (e) => {
    e.preventDefault();
    if (clave.length < 8) return setError('Tiene que tener al menos 8 letras o números.');
    if (clave !== otra) return setError('Las dos contraseñas no son iguales.');
    setOcupado(true);
    try {
      await nuevaClave(clave);
    } catch (err) {
      setError(mensajeError(err));
      setOcupado(false);
    }
  };
  return (
    <Pantalla titulo="Elegí tu contraseña nueva">
      <form onSubmit={enviar} className="card space-y-5 rounded-3xl p-6" noValidate>
        <CampoClave etiqueta="Contraseña nueva" valor={clave} onCambio={setClave} nueva />
        <CampoClave etiqueta="Repetila" valor={otra} onCambio={setOtra} nueva />
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-[17px] font-semibold text-red-800" role="alert">
            {error}
          </p>
        )}
        <Boton type="submit" grande ancho disabled={ocupado}>
          {ocupado ? 'Guardando…' : 'Guardar contraseña'}
        </Boton>
        <Boton variante="suave" ancho onClick={salir}>
          Cancelar
        </Boton>
      </form>
    </Pantalla>
  );
}

function SinAcceso() {
  const { usuario, salir } = useSesion();
  return (
    <Pantalla titulo="Esta cuenta no tiene acceso">
      <div className="card space-y-5 rounded-3xl p-6 text-[17px]">
        <p>
          Entraste como <strong>{usuario?.email}</strong>, pero esta cuenta no puede usar el panel.
        </p>
        <Boton grande ancho onClick={salir}>
          Salir
        </Boton>
      </div>
    </Pantalla>
  );
}

function SinConexion() {
  const { reintentar, salir } = useSesion();
  return (
    <Pantalla titulo="No hay conexión">
      <div className="card space-y-4 rounded-3xl p-6 text-[17px]">
        <p>No pudimos conectarnos. Revisá internet y probá de nuevo.</p>
        <Boton grande ancho onClick={reintentar}>
          Probar de nuevo
        </Boton>
        <Boton variante="suave" ancho onClick={salir}>
          Salir
        </Boton>
      </div>
    </Pantalla>
  );
}

// ───────── Panel ─────────

const PESTANIAS = [
  ['productos', 'Productos'],
  ['categorias', 'Categorías'],
  ['servicios', 'Servicios'],
];

function Layout({ seccion, children }) {
  const { salir, usuario } = useSesion();
  const [sucio, setSucio] = useState(false);
  const [preguntar, setPreguntar] = useState(false);
  const marcar = useCallback((v) => setSucio(v), []);
  const pedirSalir = () => (sucio ? setPreguntar(true) : salir());

  return (
    <SucioContext.Provider value={marcar}>
      <DatosProvider>
        <div className="min-h-svh bg-arena text-tinta">
          <header className="sticky top-0 z-40 border-b border-linea bg-arena/95 backdrop-blur">
            <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2">
              <img {...imgFija('/img/marca/LOGO.webp', 40)} alt="" width="40" height="40" className="size-10 rounded-full mix-blend-multiply" />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl leading-tight">Panel de Mar</p>
                <p className="truncate text-sm text-texto-suave">{usuario?.email}</p>
              </div>
              <Boton variante="secundario" onClick={pedirSalir}>
                Salir
              </Boton>
            </div>
            <nav aria-label="Secciones del panel" className="mx-auto grid max-w-2xl grid-cols-3 gap-2 px-4 pb-3">
              {PESTANIAS.map(([ruta, texto]) => (
                <Enlace
                  key={ruta}
                  to={`/admin/${ruta}`}
                  aria-current={seccion === ruta ? 'page' : undefined}
                  className={`flex min-h-12 items-center justify-center rounded-xl border-2 px-2 text-[17px] font-bold transition ${
                    seccion === ruta ? 'border-verde bg-verde text-arena' : 'border-tinta/15 bg-white text-tinta hover:border-verde'
                  }`}
                >
                  {texto}
                </Enlace>
              ))}
            </nav>
          </header>
          <main className="mx-auto max-w-2xl px-4 pt-5 pb-36">
            {children}
          </main>
        </div>
        <DialogoSinGuardar
          abierto={preguntar}
          onQuedarse={() => setPreguntar(false)}
          onSalir={() => {
            setPreguntar(false);
            salir();
          }}
        />
      </DatosProvider>
    </SucioContext.Provider>
  );
}

// /admin/<sección>[/<id> | /nuevo | /nueva] → pantalla. Cualquier otra ruta → Productos.
const VISTAS = {
  productos: [ListaProductos, FormProducto, 'nuevo'],
  categorias: [ListaCategorias, FormCategoria, 'nueva'],
  servicios: [ListaServicios, FormServicio, 'nuevo'],
};

function Panel() {
  const ruta = useRuta();
  const m = ruta.match(/^\/admin\/(productos|categorias|servicios)(?:\/([^/]+))?\/?$/);
  useEffect(() => {
    if (!m) irA('/admin/productos', { reemplazar: true, forzar: true });
  }, [m, ruta]);
  if (!m) return null;
  const [, seccion, parte] = m;
  const [Lista, Form, nuevo] = VISTAS[seccion];
  let vista = <Lista />;
  if (parte === nuevo) vista = <Form key="nuevo" id={null} />;
  else if (parte) vista = <Form key={parte} id={decodeURIComponent(parte)} />;
  return <Layout seccion={seccion}>{vista}</Layout>;
}
