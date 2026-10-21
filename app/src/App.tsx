import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import PwaControls from './PwaControls';
import BackupPanel from './BackupPanel';
import RoutineEditor from './RoutineEditor';
import TrainingScreen from './TrainingScreen';
import Icon from './Icon';
import ExerciseVisual from './ExerciseVisual';
import HistoryScreen from './HistoryScreen';
import { useRegistro } from './useRegistro';
import type { ResultadoGuardado } from './useRegistro';
import { fechaLocal, mostrarFecha, validarSerie } from './workout';
import { corregirSerie, crearSesion, registrarSerie, sesionesPorFecha } from './training';
import type { EjercicioPlan, RegistroActual } from './training';
import { diasRutina } from './rutina';
import { claveNavegacion, ejercicioPendiente, finalizarSesion, guardarRutina, reabrirSesion, recuperarNavegacion, reiniciarSesion, siguienteEjercicio, sugerirPeso, sumarPeso } from './guided';

export default function App() {
  const { registro, errorCarga, cambioExterno, guardar: persistir, verificarVigencia } = useRegistro();
  const [inicio] = useState(() => {
    let texto: string | null = null;
    try { texto = localStorage.getItem(claveNavegacion); } catch { /* Preferencia opcional; los entrenamientos tienen su propio control de errores. */ }
    return recuperarNavegacion(registro, texto);
  });
  const [seleccionado, setSeleccionado] = useState(inicio.sesionId);
  const [ejercicioId, setEjercicioId] = useState(inicio.ejercicioId);
  const rutinas = registro.rutinas ?? diasRutina;
  const [diaId, setDiaId] = useState(rutinas[0]?.id ?? '');
  const [fecha, setFecha] = useState(fechaLocal);
  const [nombre, setNombre] = useState('Entrenamiento');
  const [peso, setPeso] = useState(() => {
    const sesion = registro.entrenamientos.find(s => s.id === inicio.sesionId);
    return sesion ? String(sugerirPeso(registro, sesion, inicio.ejercicioId).pesoKg) : '0';
  });
  const [repeticiones, setRepeticiones] = useState(() => String(registro.entrenamientos.find(s => s.id === inicio.sesionId)?.ejercicios.find(e => e.id === inicio.ejercicioId)?.repeticionesObjetivo ?? 10));
  const [error, setError] = useState(errorCarga);
  const [mensaje, setMensaje] = useState('');
  const [nuevoAbierto, setNuevoAbierto] = useState(!inicio.sesionId);
  const [modulo, setModulo] = useState<'entrenar' | 'historial' | 'configuracion'>('entrenar');
  const [visitados, setVisitados] = useState({ historial: false, configuracion: false });
  const [actualizacion, setActualizacion] = useState(false);
  const [rutinaEnEdicion, setRutinaEnEdicion] = useState(false);
  const [errorNavegacion, setErrorNavegacion] = useState('');
  const [cierrePendiente, setCierrePendiente] = useState(false);
  const [edicion, setEdicion] = useState<{ sesionId: string; ejercicioId: string; serieId: string } | null>(null);
  const [pesoEditado, setPesoEditado] = useState('');
  const [repeticionesEditadas, setRepeticionesEditadas] = useState('');
  const botonEdicion = useRef<HTMLButtonElement | null>(null);
  const formularioSerie = useRef<HTMLDivElement | null>(null);
  const entrenamientos = useMemo(() => sesionesPorFecha(registro.entrenamientos), [registro.entrenamientos]);
  const activo = registro.entrenamientos.find(sesion => sesion.id === seleccionado);
  const ejercicio = activo?.ejercicios.find(item => item.id === ejercicioId) ?? activo?.ejercicios[0];
  const series = activo?.series.filter(serie => serie.ejercicioId === ejercicio?.id) ?? [];
  const puedeRegistrar = Boolean(activo?.fecha && ejercicio) && !activo?.finalizadaEn && !errorCarga && !cambioExterno;
  const sugerencia = activo && ejercicio ? sugerirPeso(registro, activo, ejercicio.id) : null;
  const puedeEscribir = !errorCarga && !cambioExterno;

  useEffect(() => {
    if (!seleccionado) return;
    try {
      localStorage.setItem(claveNavegacion, JSON.stringify({ sesionId: seleccionado, ejercicioId }));
      setErrorNavegacion('');
    } catch { setErrorNavegacion('Se conserva el entrenamiento, pero no se pudo recordar la última pantalla.'); }
  }, [seleccionado, ejercicioId]);

  const claveVista = `${modulo}:${nuevoAbierto}:${seleccionado}`;
  const vistaAnterior = useRef(claveVista);
  useEffect(() => {
    if (vistaAnterior.current === claveVista) return;
    vistaAnterior.current = claveVista;
    document.querySelector<HTMLElement>(`[data-module="${modulo}"] h1`)?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [claveVista, modulo]);

  function cambiarModulo(siguiente: typeof modulo) {
    if (edicion) return;
    if (siguiente !== 'entrenar') setVisitados(actual => ({ ...actual, [siguiente]: true }));
    setModulo(siguiente);
  }

  function guardar(nuevoRegistro: RegistroActual): boolean {
    const resultado = persistir(nuevoRegistro);
    if (resultado.ok) {
      setError('');
      return true;
    }
    setMensaje('');
    setError(resultado.error);
    return false;
  }

  function importar(nuevoRegistro: RegistroActual): ResultadoGuardado {
    const resultado = persistir(nuevoRegistro);
    if (resultado.ok) {
      const primera = sesionesPorFecha(nuevoRegistro.entrenamientos)[0];
      setNuevoAbierto(!primera);
      setSeleccionado(primera?.id ?? '');
      prepararFormulario(primera ? ejercicioPendiente(primera) ?? primera.ejercicios.at(-1) : undefined, primera?.id, nuevoRegistro);
      const disponibles = nuevoRegistro.rutinas ?? diasRutina;
      setDiaId(disponibles.some(r => r.id === diaId) ? diaId : disponibles[0]?.id ?? '');
      setError('');
      setMensaje('');
    }
    return resultado;
  }

  function prepararFormulario(item: EjercicioPlan | undefined, sesionId = seleccionado, datos = registro) {
    setEdicion(null);
    setEjercicioId(item?.id ?? '');
    setCierrePendiente(false);
    const sesion = datos.entrenamientos.find(s => s.id === sesionId);
    setPeso(item && sesion ? String(sugerirPeso(datos, sesion, item.id).pesoKg) : '0');
    setRepeticiones(String(item?.repeticionesObjetivo ?? 10));
  }

  function crear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    empezar(diaId, fecha);
  }

  function empezar(rutinaId: string, fechaSesion = fechaLocal()) {
    if (!puedeEscribir || edicion) return;
    setMensaje('');
    try {
      const dia = rutinaId === '' ? null : rutinas.find(item => item.id === rutinaId);
      if (dia === undefined) throw new Error('Elegí un día de rutina válido.');
      const existente = registro.entrenamientos.find(s => s.fecha === fechaSesion && (s.rutinaOrigen?.id ?? null) === (dia?.id ?? null));
      if (existente) {
        elegirSesion(existente.id);
        setNuevoAbierto(false);
        cambiarModulo('entrenar');
        setMensaje('Abrimos el entrenamiento de esa rutina y fecha; no se creó un duplicado.');
        return;
      }
      const id = crypto.randomUUID();
      const nuevo = crearSesion(registro, id, fechaSesion, dia?.titulo ?? nombre, dia);
      if (guardar(nuevo)) {
        setSeleccionado(id);
        prepararFormulario(nuevo.entrenamientos[0].ejercicios[0], id, nuevo);
        setNuevoAbierto(false);
        cambiarModulo('entrenar');
        setMensaje('Entrenamiento creado. Empezá por la primera serie.');
      }
    } catch (problema) {
      setError(problema instanceof Error ? problema.message : 'No se pudo crear el entrenamiento.');
    }
  }

  function registrar() {
    if (!puedeRegistrar || !activo || !ejercicio || edicion) return;
    setMensaje('');
    if (peso.trim() === '' || repeticiones.trim() === '') {
      setError('Completá el peso y las repeticiones realizadas.');
      return;
    }
    const pesoKg = Number(peso.replace(',', '.'));
    const cantidad = Number(repeticiones);
    const problema = validarSerie(pesoKg, cantidad);
    if (problema) { setError(problema); return; }
    try {
      const ahora = new Date().toISOString();
      const nueva = { id: crypto.randomUUID(), pesoKg, repeticiones: cantidad, registradaEn: ahora };
      let nuevo = registrarSerie(registro, activo.id, ejercicio.id, nueva);
      const sesion = nuevo.entrenamientos.find(s => s.id === activo.id)!;
      const completo = ejercicio.seriesObjetivo !== null && series.length + 1 >= ejercicio.seriesObjetivo;
      const siguiente = completo ? siguienteEjercicio(sesion, ejercicio.id) : undefined;
      const terminado = completo && !ejercicioPendiente(sesion);
      if (terminado) nuevo = finalizarSesion(nuevo, activo.id, ahora);
      if (guardar(nuevo)) {
        if (siguiente) {
          prepararFormulario(siguiente, activo.id, nuevo);
          setMensaje(`${ejercicio.nombre}: ${series.length + 1} series guardadas. Seguís con ${siguiente.nombre}.`);
          formularioSerie.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          setMensaje(terminado ? 'Entrenamiento finalizado. Todas las series quedaron guardadas.' : `Serie ${series.length + 1} de ${ejercicio.nombre} guardada.`);
        }
      }
    } catch (problema) {
      setError(problema instanceof Error ? problema.message : 'No se pudo registrar la serie.');
    }
  }

  function elegirSesion(id: string) {
    const sesion = registro.entrenamientos.find(item => item.id === id);
    setSeleccionado(id);
    prepararFormulario(sesion ? ejercicioPendiente(sesion) ?? sesion.ejercicios.at(-1) : undefined, id);
    setMensaje('');
    setError(errorCarga);
  }

  function elegirEjercicio(id: string) {
    prepararFormulario(activo?.ejercicios.find(item => item.id === id));
    setMensaje('');
    setError(errorCarga);
  }

  function elegirDia(id: string) {
    setDiaId(id);
    const dia = rutinas.find(item => item.id === id);
    if (nombre === 'Entrenamiento' || rutinas.some(item => item.titulo === nombre)) {
      setNombre(dia?.titulo ?? 'Entrenamiento');
    }
  }

  function ajustarPeso(incremento: number) {
    try { setPeso(sumarPeso(peso, incremento)); setError(''); }
    catch (problema) { setError((problema as Error).message); }
  }

  function reiniciarEntrenamiento(): boolean {
    if (!puedeEscribir || !activo?.fecha || edicion) return false;
    try {
      const nuevo = reiniciarSesion(registro, activo.id);
      if (!guardar(nuevo)) return false;
      prepararFormulario(activo.ejercicios[0], activo.id, nuevo);
      setMensaje('Entrenamiento reiniciado. Empezá por la primera serie.');
      requestAnimationFrame(() => formularioSerie.current?.scrollIntoView({ block: 'start' }));
      return true;
    } catch (problema) {
      setError((problema as Error).message);
      return false;
    }
  }

  function cerrarEntrenamiento() {
    if (!activo) return;
    try {
      if (guardar(finalizarSesion(registro, activo.id, new Date().toISOString()))) {
        setCierrePendiente(false);
        setMensaje('Entrenamiento finalizado. Se conservaron las series realizadas y los objetivos pendientes.');
      }
    } catch (problema) { setError((problema as Error).message); }
  }

  function iniciarEdicion(serieId: string, boton: HTMLButtonElement) {
    if (!puedeEscribir || !activo?.fecha || !ejercicio) return;
    const serie = activo.series.find(item => item.id === serieId);
    if (!serie) return;
    prepararFormulario(activo.ejercicios.find(e => e.id === serie.ejercicioId));
    botonEdicion.current = boton;
    setEdicion({ sesionId: activo.id, ejercicioId: serie.ejercicioId, serieId });
    setPesoEditado(String(serie.pesoKg));
    setRepeticionesEditadas(String(serie.repeticiones));
    setMensaje('');
    setError('');
  }

  function cancelarEdicion() {
    setEdicion(null);
    setError(errorCarga);
    setMensaje('Edición cancelada.');
    botonEdicion.current?.focus();
  }

  function guardarCorreccion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!edicion || !puedeEscribir || activo?.id !== edicion.sesionId || ejercicio?.id !== edicion.ejercicioId) return;
    setMensaje('');
    if (pesoEditado.trim() === '' || repeticionesEditadas.trim() === '') {
      setError('Completá el peso y las repeticiones de la corrección.');
      return;
    }
    try {
      const nuevo = corregirSerie(registro, edicion.sesionId, edicion.ejercicioId, edicion.serieId, {
        pesoKg: Number(pesoEditado), repeticiones: Number(repeticionesEditadas),
      });
      if (guardar(nuevo)) {
        setEdicion(null);
        setMensaje('Corrección guardada.');
        botonEdicion.current?.focus();
      }
    } catch (problema) {
      setError(problema instanceof Error ? problema.message : 'No se pudo corregir la serie.');
    }
  }

  const editorSerie = edicion && activo && ejercicio ? (
    <form className="edit-form" onSubmit={guardarCorreccion} aria-labelledby="titulo-edicion">
      <h3 id="titulo-edicion">Corregir serie de {ejercicio.nombre}</h3><p className="muted">Guardá o cancelá esta corrección para cambiar de sección.</p>
      <div className="fields">
        <label>Peso corregido <span>kg</span><input type="number" min="0" max="1000" step="0.01" inputMode="decimal" value={pesoEditado} onChange={e => setPesoEditado(e.target.value)} required autoFocus /></label>
        <label>Repeticiones corregidas<input type="number" min="1" max="100" step="1" inputMode="numeric" value={repeticionesEditadas} onChange={e => setRepeticionesEditadas(e.target.value)} required /></label>
      </div>
      <div className="edit-actions"><button type="submit" className="button" disabled={!puedeEscribir}>Guardar cambios</button><button type="button" className="button secondary" onClick={cancelarEdicion}>Cancelar</button></div>
      {error && <p className="feedback error" role="alert">{error}</p>}
    </form>
  ) : null;

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" type="button" aria-label="GIM, volver al entrenamiento" disabled={Boolean(edicion)} onClick={() => cambiarModulo('entrenar')}><img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="32" height="32" />GIM<span>BITÁCORA</span></button>
        <span className="local-label">Personal · v0.11</span>
      </header>
      <nav className="module-nav" aria-label="Secciones de la aplicación">
        <button type="button" aria-current={modulo === 'entrenar' ? 'page' : undefined} disabled={Boolean(edicion)} onClick={() => cambiarModulo('entrenar')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7v10M2 9v6M19 7v10M22 9v6M5 12h14" /></svg>Entrenar</button>
        <button type="button" aria-current={modulo === 'historial' ? 'page' : undefined} disabled={Boolean(edicion)} onClick={() => cambiarModulo('historial')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v16H4zM4 10h16M8 2v5M16 2v5M8 14h3M14 14h2M8 17h3" /></svg>Historial</button>
        <button type="button" aria-current={modulo === 'configuracion' ? 'page' : undefined} disabled={Boolean(edicion)} onClick={() => cambiarModulo('configuracion')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6" /></svg>Configuración{(rutinaEnEdicion || actualizacion) && <span className="unsaved-dot" aria-label={actualizacion ? 'Actualización disponible' : 'Borrador de rutina pendiente'} />}</button>
      </nav>
      <main>
        {cambioExterno && <p className="external-notice" role="status">El registro cambió en otra pestaña. Recargá para continuar con los últimos datos; los cambios sin guardar del formulario no se conservan.</p>}
        {error && !edicion && <p className="feedback error global-error" role="alert">{error}</p>}
        {errorNavegacion && <p className="feedback error" role="status">{errorNavegacion}</p>}
        {actualizacion && modulo !== 'configuracion' && <p className="update-reminder" role="status">Hay una actualización disponible en Configuración.</p>}

        <section hidden={modulo !== 'entrenar'} aria-label="Entrenar" data-module="entrenar" className="training-module">
          {nuevoAbierto || !activo || !ejercicio ? <>
            <div className="module-title"><h1 tabIndex={-1}>Tu próxima sesión</h1><p>{mostrarFecha(fechaLocal())} · Elegí tu rutina para empezar.</p></div>
            {activo && <button type="button" className="resume-session" onClick={() => setNuevoAbierto(false)}><span>Volver a {activo.nombre}</span><strong>{activo.finalizadaEn ? 'Ver sesión' : 'Continuar'} <Icon nombre="arrow-right" /></strong></button>}
            <div className="start-routines">{rutinas.map(rutina => {
              const hoy = registro.entrenamientos.find(s => s.fecha === fechaLocal() && s.rutinaOrigen?.id === rutina.id);
              return <button type="button" key={rutina.id} className="routine-start-card" disabled={!puedeEscribir || Boolean(edicion)} onClick={() => empezar(rutina.id)}><span className="routine-start-copy"><strong>{rutina.titulo}</strong><small>{rutina.ejercicios.length} ejercicios · {rutina.ejercicios.reduce((n, e) => n + (e.seriesObjetivo ?? 0), 0)} series</small><span>{hoy ? hoy.finalizadaEn ? 'Ver entrenamiento de hoy' : 'Continuar entrenamiento de hoy' : 'Empezar entrenamiento'}</span></span><span className="routine-start-visual">{rutina.ejercicios[0] && <ExerciseVisual ejercicio={rutina.ejercicios[0]} mini />}<Icon nombre="arrow-right" /></span></button>;
            })}</div>
            {!rutinas.length && <div className="card empty-state"><h2>Prepará tu primera rutina</h2><p>Podés crearla desde Configuración.</p><button type="button" className="button" onClick={() => cambiarModulo('configuracion')}>Crear mi rutina</button></div>}
            <p className="start-footnote">Las series se guardan en este dispositivo, también sin conexión.</p>
          </> : <div ref={formularioSerie}>
            <TrainingScreen key={activo.id} sesion={activo} ejercicio={ejercicio} series={series} peso={peso} repeticiones={repeticiones}
              bloqueado={!puedeEscribir || !activo.fecha} editando={Boolean(edicion)} referencia={sugerencia}
              onPeso={setPeso} onRepeticiones={setRepeticiones} onSumar={ajustarPeso} onRegistrar={registrar}
              onEjercicio={elegirEjercicio} onNuevo={() => setNuevoAbierto(true)} onEditar={iniciarEdicion}
              onReabrir={() => { if (guardar(reabrirSesion(registro, activo.id))) setMensaje('Sesión reabierta. Podés seguir registrando.'); }}
              onReiniciar={reiniciarEntrenamiento} onFinalizar={cerrarEntrenamiento} cierrePendiente={cierrePendiente} onPedirCierre={() => setCierrePendiente(true)} onCancelarCierre={() => setCierrePendiente(false)}
              edicion={editorSerie} mensaje={mensaje} />
          </div>}
        </section>

        <section hidden={modulo !== 'historial'} aria-label="Historial" data-module="historial">
          {visitados.historial && <HistoryScreen sesiones={entrenamientos} seleccionada={seleccionado} onAbrir={id => { elegirSesion(id); setNuevoAbierto(false); cambiarModulo('entrenar'); }} />}
        </section>

        <section hidden={modulo !== 'configuracion'} aria-label="Configuración" data-module="configuracion" className="settings-module">
          <div className="module-title"><h1 tabIndex={-1}>Configuración</h1><p>Prepará tus rutinas y cuidá tus registros.</p></div>
          {visitados.configuracion && <>
          <RoutineEditor rutinas={rutinas} habilitado={puedeEscribir} onBorrador={setRutinaEnEdicion} onGuardar={rutina => {
            try {
              const resultado = persistir(guardarRutina(registro, rutinas, rutina));
              if (resultado.ok && !diaId) setDiaId(rutina.id);
              return resultado;
            } catch (problema) { return { ok: false, error: (problema as Error).message }; }
          }} />
          <BackupPanel registro={registro} habilitado={puedeEscribir} importacionBloqueada={Boolean(edicion) || rutinaEnEdicion} onImportar={importar} onVerificar={verificarVigencia} />
          <details className="card advanced-entry"><summary>Registrar en otra fecha <span>Para completar un entrenamiento anterior</span></summary><div>
            <form onSubmit={crear} className="session-form">
              <label className="full-field">Rutina<select value={diaId} onChange={e => elegirDia(e.target.value)} disabled={!puedeEscribir || Boolean(edicion)}><option value="">Sin rutina · Press de banca</option>{rutinas.map(r => <option key={r.id} value={r.id}>{r.titulo}</option>)}</select></label>
              <label>Fecha del entrenamiento<input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required disabled={!puedeEscribir || Boolean(edicion)} /></label>
              {diaId === '' && <label>Nombre del entrenamiento<input value={nombre} onChange={e => setNombre(e.target.value)} required maxLength={60} disabled={!puedeEscribir || Boolean(edicion)} /></label>}
              <button type="submit" className="button" disabled={!puedeEscribir || Boolean(edicion)}>Abrir entrenamiento</button>
            </form>
          </div></details>
          </>}
          <PwaControls onActualizacion={setActualizacion} />
          <p className="settings-footnote">Tus datos se guardan en este navegador. El respaldo permite llevarlos a otro dispositivo; todavía no hay sincronización automática.</p>
        </section>
      </main>
      <footer>GIM · Hecho para entrenar, serie a serie.</footer>
    </div>
  );
}
