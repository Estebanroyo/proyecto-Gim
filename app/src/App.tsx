import PlanLibrary from './PlanLibrary';
import HistoryManagement from './HistoryManagement';
import ProgressionPanel from './ProgressionPanel';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useRest, RestPanel, RestSettings } from './Rest';
import AdvancedSetForm from './AdvancedSetForm';
import { esSimple, resuelta, realizadas, pendiente, turnoSiguiente } from './execution';
import SessionTools from './SessionTools';
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
import type { EjercicioPlan, RegistroActual, SerieEjercicio } from './training';
import { diasRutina } from './rutina';
import { completarCriterios, etiquetaPeso } from './weight';
import { escribirBorrador, leerBorrador, quitarBorrador } from './draft';
import { objetivoActual, repeticionesSugeridas } from './prescription';
import { quitarBorradorNota } from './noteDraft';
import { guardarNotaSesion } from './setup';
import { claveNavegacion, ejercicioPendiente, finalizarSesion, guardarRutina, reabrirSesion, recuperarNavegacion, reiniciarSesion, siguienteEjercicio, sugerirPeso, sumarPeso } from './guided';

export default function App() {
  const { registro, errorCarga, cambioExterno, guardar: persistir, verificarVigencia } = useRegistro();
  const rest = useRest();
  const [inicio] = useState(() => {
    let texto: string | null = null;
    try { texto = localStorage.getItem(claveNavegacion); } catch { /* Preferencia opcional; los entrenamientos tienen su propio control de errores. */ }
    return recuperarNavegacion(registro, texto);
  });
  const [seleccionado, setSeleccionado] = useState(inicio.sesionId);
  const [ejercicioId, setEjercicioId] = useState(inicio.ejercicioId);
  const rutinas = useMemo(() => completarCriterios(registro.rutinas ?? diasRutina), [registro.rutinas]);
  const [borradorInicial] = useState(() => {
    const s = registro.entrenamientos.find(s => s.id === inicio.sesionId);
    const e = s?.ejercicios.find(e => e.id === inicio.ejercicioId);
    return s && e ? leerBorrador(s, e) : { borrador: null, aviso: '' };
  });
  const [hayBorrador, setHayBorrador] = useState(Boolean(borradorInicial.borrador));
  const [borradorRecuperado, setBorradorRecuperado] = useState(Boolean(borradorInicial.borrador));
  const [avisoBorrador, setAvisoBorrador] = useState(borradorInicial.aviso);
  const [reinicioPendiente, setReinicioPendiente] = useState(false);
  const [diaId, setDiaId] = useState(rutinas[0]?.id ?? '');
  const [fecha, setFecha] = useState(fechaLocal);
  const [nombre, setNombre] = useState('Entrenamiento');
  const [peso, setPeso] = useState(() => {
    if (borradorInicial.borrador) return borradorInicial.borrador.peso;
    const sesion = registro.entrenamientos.find(s => s.id === inicio.sesionId);
    return sesion ? String(sugerirPeso(registro, sesion, inicio.ejercicioId).pesoKg) : '0';
  });
  const [repeticiones, setRepeticiones] = useState(() => {
    const sesion = registro.entrenamientos.find(s => s.id === inicio.sesionId);
    return borradorInicial.borrador?.repeticiones ?? String(repeticionesSugeridas(sesion, sesion?.ejercicios.find(e => e.id === inicio.ejercicioId)));
  });
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
  const [notaEnEdicion, setNotaEnEdicion] = useState(false);
  const edicionActiva = Boolean(edicion) || notaEnEdicion;
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
    if(!rest.estado || errorCarga)return;
    const origen=registro.entrenamientos.find(s=>s.id===rest.estado!.sesionId);
    if(!origen || origen.finalizadaEn || !origen.series.some(s=>s.id===rest.estado!.serieId))rest.omitir();
  },[registro,errorCarga,rest.estado?.sesionId,rest.estado?.serieId]);

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
    if (edicionActiva) return;
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

  function prepararFormulario(item: EjercicioPlan | undefined, sesionId = seleccionado, datos = registro, recuperar = true) {
    setEdicion(null);
    setEjercicioId(item?.id ?? '');
    setCierrePendiente(false);
    const sesion = datos.entrenamientos.find(s => s.id === sesionId);
    const lectura = item && sesion && recuperar ? leerBorrador(sesion, item) : { borrador: null, aviso: '' };
    setHayBorrador(Boolean(lectura.borrador));
    setBorradorRecuperado(Boolean(lectura.borrador));
    setAvisoBorrador(lectura.aviso);
    setPeso(lectura.borrador?.peso ?? (item && sesion ? String(sugerirPeso(datos, sesion, item.id).pesoKg) : '0'));
    setRepeticiones(lectura.borrador?.repeticiones ?? String(repeticionesSugeridas(sesion, item)));
  }

  function actualizarBorrador(nuevoPeso: string, nuevasReps: string) {
    if (!puedeRegistrar || !activo || !ejercicio || edicionActiva) return;
    setPeso(nuevoPeso);
    setRepeticiones(nuevasReps);
    const aviso = escribirBorrador(activo, ejercicio, nuevoPeso, nuevasReps);
    setHayBorrador(!aviso);
    setBorradorRecuperado(false);
    setAvisoBorrador(aviso);
    setMensaje('');
  }

  function crear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    empezar(diaId, fecha);
  }

  function empezar(rutinaId: string, fechaSesion = fechaLocal()) {
    if (!puedeEscribir || edicionActiva) return;
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
        rest.omitir();
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

  function confirmarResultado(entrada: Omit<SerieEjercicio,'ejercicioId'>, correccion = false): ResultadoGuardado {
    if (!puedeEscribir || !activo?.fecha || !ejercicio || activo.finalizadaEn && !correccion) return {ok:false,error:'No se puede registrar ahora.'};
    try {
      let nuevo = correccion ? { ...registro, entrenamientos: registro.entrenamientos.map(s=>s.id===activo.id?{...s,series:s.series.map(x=>x.id===entrada.id?{...entrada,ejercicioId:ejercicio.id,objetivoId:x.objetivoId,rol:x.rol}:x)}:s) } : registrarSerie(registro,activo.id,ejercicio.id,entrada);
      let sesion = nuevo.entrenamientos.find(s=>s.id===activo.id)!;
      const resultado = sesion.series.find(s=>s.id===entrada.id)!;
      const siguiente = turnoSiguiente(sesion,ejercicio.id);
      const terminado = !correccion && resuelta(resultado) && !sesion.ejercicios.some(e=>pendiente(sesion,e)) && sesion.series.every(resuelta);
      if (terminado) { nuevo=finalizarSesion(nuevo,activo.id,new Date().toISOString()); sesion=nuevo.entrenamientos.find(s=>s.id===activo.id)!; }
      const guardado=persistir(nuevo);
      if(!guardado.ok)return guardado;
      setError('');
      if(correccion){ setEdicion(null);setMensaje('Corrección guardada; objetivo y descanso conservados.');return {ok:true}; }
      if(resuelta(resultado)){
        rest.iniciar(activo,sesion,ejercicio,resultado,objetivoActual(activo,ejercicio));
        const aviso=quitarBorrador(activo,ejercicio);setHayBorrador(false);setBorradorRecuperado(false);setAvisoBorrador(aviso);
        if(siguiente)prepararFormulario(siguiente,activo.id,nuevo,false);
        setMensaje(terminado?'Sesión finalizada; resultados conservados.':siguiente&&siguiente.id!==ejercicio.id?`Registro guardado. Seguís con ${siguiente.nombre}.`:'Resultado guardado.');
      }else setMensaje('Avance guardado. La serie sigue abierta hasta que la cierres.');
      return {ok:true};
    }catch(problema){return {ok:false,error:problema instanceof Error?problema.message:'No se pudo guardar el resultado.'};}
  }
  function registrar(){
    if(!puedeRegistrar||!activo||!ejercicio||edicionActiva)return;
    if(!peso.trim()||!repeticiones.trim()){setError('Completá peso y repeticiones.');return;}
    const resultado=confirmarResultado({id:crypto.randomUUID(),pesoKg:Number(peso.replace(',','.')),repeticiones:Number(repeticiones),registradaEn:new Date().toISOString()});
    if(!resultado.ok)setError(resultado.error);
  }
  function cambiarSesion(nuevo:RegistroActual):ResultadoGuardado{
    if(!puedeEscribir||edicionActiva)return {ok:false,error:'Guardá o cancelá la edición antes de modificar la sesión.'};
    const resultado=persistir(nuevo);if(resultado.ok&&activo){const s=nuevo.entrenamientos.find(x=>x.id===activo.id);const destino=s?turnoSiguiente(s):undefined;if(destino)prepararFormulario(destino,activo.id,nuevo);setMensaje('Cambio aplicado solo a esta sesión.');}return resultado;
  }
  function elegirSesion(id: string) {
    setReinicioPendiente(false);
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
    try { actualizarBorrador(sumarPeso(peso, incremento), repeticiones); setError(''); }
    catch (problema) { setError((problema as Error).message); }
  }

  function reiniciarEntrenamiento(): boolean {
    if (!puedeEscribir || !activo?.fecha || edicionActiva) return false;
    try {
      const nuevo = reiniciarSesion(registro, activo.id);
      if (!guardar(nuevo)) return false; rest.omitir();
      let aviso = '';
      for (const item of activo.ejercicios) {
        aviso = quitarBorrador(activo, item) || aviso;
        aviso = quitarBorradorNota({ sesionId: activo.id, ejercicioId: item.id, base: '' }) || aviso;
        try {
          for (const id of ['nuevo', ...activo.series.filter(s => s.ejercicioId === item.id).map(s => s.id)]) {
            localStorage.removeItem(`gim.app.borrador-avanzado.v1.${activo.id}.${item.id}.${id}`);
          }
        } catch { aviso = 'Sesión reiniciada; no se pudieron retirar todos los borradores avanzados.'; }
      }
      prepararFormulario(activo.ejercicios[0], activo.id, nuevo, false);
      setAvisoBorrador(aviso);
      setReinicioPendiente(false);
      setNuevoAbierto(false);
      cambiarModulo('entrenar');
      setMensaje('Entrenamiento reiniciado. Empezá por la primera serie.');
      requestAnimationFrame(() => formularioSerie.current?.scrollIntoView({ block: 'start' }));
      return true;
    } catch (problema) {
      setError((problema as Error).message);
      return false;
    }
  }

  function cerrarEntrenamiento() {
    if (!activo || edicionActiva) return;
    try {
      if (guardar(finalizarSesion(registro, activo.id, new Date().toISOString()))) { rest.omitir();
        setCierrePendiente(false);
        setMensaje('Entrenamiento finalizado. Se conservaron las series realizadas y los objetivos pendientes.');
      }
    } catch (problema) { setError((problema as Error).message); }
  }

  function iniciarEdicion(serieId: string, boton: HTMLButtonElement) {
    if (!puedeEscribir || !activo?.fecha || !ejercicio || edicionActiva) return;
    const serie = activo.series.find(item => item.id === serieId);
    if (!serie) return;
    if (ejercicio.id !== serie.ejercicioId) prepararFormulario(activo.ejercicios.find(e => e.id === serie.ejercicioId));
    botonEdicion.current = boton;
    setEdicion({ sesionId: activo.id, ejercicioId: serie.ejercicioId, serieId });
    setPesoEditado(serie.pesoKg!==undefined?String(serie.pesoKg):'');
    setRepeticionesEditadas(serie.repeticiones!==undefined?String(serie.repeticiones):'');
    setMensaje('');
    setError('');
  }

  function cancelarEdicion() {
    setEdicion(null);
    setError(errorCarga);
    setMensaje('Edición cancelada.');
    requestAnimationFrame(() => botonEdicion.current?.focus({ preventScroll: true }));
  }

  function guardarNota(nota: string): ResultadoGuardado {
    if (!puedeEscribir || !activo || !ejercicio || edicion) return { ok: false, error: 'No se puede editar la nota de esta sesión ahora.' };
    try { return persistir(guardarNotaSesion(registro, activo.id, ejercicio.id, nota)); }
    catch (problema) { return { ok: false, error: problema instanceof Error ? problema.message : 'No se pudo guardar la nota.' }; }
  }

  const serieEnEdicion = edicion && activo ? activo.series.find(s=>s.id===edicion.serieId) : undefined;
  const editorSerie = serieEnEdicion && activo && ejercicio ? <AdvancedSetForm key={`editar:${serieEnEdicion.id}`} sesion={activo} ejercicio={ejercicio} peso={pesoEditado} repeticiones={repeticionesEditadas} registro={serieEnEdicion} correccion disabled={!puedeEscribir} onGuardar={r=>confirmarResultado(r,true)} onCancelar={cancelarEdicion}/> : null;
  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" type="button" aria-label="GIM, volver al entrenamiento" disabled={edicionActiva} onClick={() => cambiarModulo('entrenar')}><img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="32" height="32" />GIM<span>BITÁCORA</span></button>
        <span className="local-label">Personal · v0.20.1</span>
      </header>
      {actualizacion && <div className="app-update-banner" role="status"><span>Hay una versión nueva de GIM lista para aplicar.</span><button type="button" className="button secondary small" disabled={edicionActiva || rutinaEnEdicion} onClick={() => { cambiarModulo('configuracion'); requestAnimationFrame(() => document.getElementById('instalacion-conexion')?.scrollIntoView({ block: 'center' })); }}>Ver actualización</button></div>}
      <nav className="module-nav" aria-label="Secciones de la aplicación">
        <button type="button" aria-current={modulo === 'entrenar' ? 'page' : undefined} disabled={edicionActiva} onClick={() => cambiarModulo('entrenar')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7v10M2 9v6M19 7v10M22 9v6M5 12h14" /></svg>Entrenar</button>
        <button type="button" aria-current={modulo === 'historial' ? 'page' : undefined} disabled={edicionActiva} onClick={() => cambiarModulo('historial')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v16H4zM4 10h16M8 2v5M16 2v5M8 14h3M14 14h2M8 17h3" /></svg>Historial</button>
        <button type="button" aria-current={modulo === 'configuracion' ? 'page' : undefined} disabled={edicionActiva} onClick={() => cambiarModulo('configuracion')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6" /></svg>Configuración{(rutinaEnEdicion || actualizacion) && <span className="unsaved-dot" aria-label={actualizacion ? 'Actualización disponible' : 'Borrador de rutina pendiente'} />}</button>
      </nav>
      <main>
        {cambioExterno && <p className="external-notice" role="status">El registro cambió en otra pestaña. Recargá para continuar. Si cambió la base de tu borrador, tendrás que revisar sus valores.</p>}
        {error && !edicion && <p className="feedback error global-error" role="alert">{error}</p>}
        {errorNavegacion && <p className="feedback error" role="status">{errorNavegacion}</p>}
        {actualizacion && modulo !== 'configuracion' && <p className="update-reminder" role="status">Hay una actualización disponible en Configuración.</p>}

        <section hidden={modulo !== 'entrenar'} aria-label="Entrenar" data-module="entrenar" className="training-module">
          {nuevoAbierto || !activo || !ejercicio ? <>
            <div className="module-title"><h1 tabIndex={-1}>Tu próxima sesión</h1><p>{mostrarFecha(fechaLocal())} · Elegí tu rutina para empezar.</p></div>
            {activo && <button type="button" className="resume-session" onClick={() => setNuevoAbierto(false)}><span>Volver a {activo.nombre}</span><strong>{activo.finalizadaEn ? 'Ver sesión' : 'Continuar'} <Icon nombre="arrow-right" /></strong></button>}
            <div className="start-routines">{rutinas.map(rutina => {
              const hoy = registro.entrenamientos.find(s => s.fecha === fechaLocal() && s.rutinaOrigen?.id === rutina.id);
              return <button type="button" key={rutina.id} className="routine-start-card" disabled={!puedeEscribir || edicionActiva} onClick={() => empezar(rutina.id)}><span className="routine-start-copy"><strong>{rutina.titulo}</strong><small>{rutina.ejercicios.length} ejercicios · {rutina.ejercicios.reduce((n, e) => n + (e.seriesObjetivo ?? 0), 0)} series</small><span>{hoy ? hoy.finalizadaEn ? 'Ver entrenamiento de hoy' : 'Continuar entrenamiento de hoy' : 'Empezar entrenamiento'}</span></span><span className="routine-start-visual">{rutina.ejercicios[0] && <ExerciseVisual ejercicio={rutina.ejercicios[0]} mini />}<Icon nombre="arrow-right" /></span></button>;
            })}</div>
            {!rutinas.length && <div className="card empty-state"><h2>Prepará tu primera rutina</h2><p>Podés crearla desde Configuración.</p><button type="button" className="button" onClick={() => cambiarModulo('configuracion')}>Crear mi rutina</button></div>}
            <p className="start-footnote">Las series se guardan en este dispositivo, también sin conexión.</p>
          </> : <div ref={formularioSerie}>
            <RestPanel rest={rest} /><TrainingScreen key={activo.id} sesion={activo} ejercicio={ejercicio} series={series} peso={peso} repeticiones={repeticiones}
              bloqueado={!puedeEscribir || !activo.fecha} editando={edicionActiva} referencia={sugerencia}
              onPeso={valor => actualizarBorrador(valor, repeticiones)} onRepeticiones={valor => actualizarBorrador(peso, valor)} onSumar={ajustarPeso} onRegistrar={registrar} onResultado={confirmarResultado}
              onEjercicio={elegirEjercicio} onNuevo={() => setNuevoAbierto(true)} onEditar={iniciarEdicion}
              onReabrir={() => { if (guardar(reabrirSesion(registro, activo.id))) setMensaje('Sesión reabierta. Podés seguir registrando.'); }}
              onFinalizar={cerrarEntrenamiento} cierrePendiente={cierrePendiente} onPedirCierre={() => setCierrePendiente(true)} onCancelarCierre={() => setCierrePendiente(false)}
              edicion={editorSerie} mensaje={mensaje} hayBorrador={hayBorrador} borradorRecuperado={borradorRecuperado} avisoBorrador={avisoBorrador} sesiones={entrenamientos}
              notaHabilitada={puedeEscribir && !edicion && Boolean(activo.fecha) && !activo.finalizadaEn} onGuardarNota={guardarNota} onEdicionNota={setNotaEnEdicion} />
            <SessionTools registro={registro} sesion={activo} ejercicio={ejercicio} disabled={!puedeEscribir || edicionActiva} onCambiar={cambiarSesion}/></div>}
        </section>

        <section hidden={modulo !== 'historial'} aria-label="Historial" data-module="historial">
          {visitados.historial && <HistoryScreen sesiones={entrenamientos} seleccionada={seleccionado} onAbrir={id => { elegirSesion(id); setNuevoAbierto(false); cambiarModulo('entrenar'); }} />}
        </section>

        <section hidden={modulo !== 'configuracion'} aria-label="Configuración" data-module="configuracion" className="settings-module">
          <div className="module-title"><h1 tabIndex={-1}>Configuración</h1><p>Prepará tus rutinas y cuidá tus registros.</p></div>
          {visitados.configuracion && <>
          <RestSettings rest={rest} /><RoutineEditor rutinas={rutinas} sesiones={entrenamientos} habilitado={puedeEscribir} onBorrador={setRutinaEnEdicion} onGuardar={rutina => {
            try {
              const resultado = persistir(guardarRutina(registro, rutinas, rutina));
              if (resultado.ok && !diaId) setDiaId(rutina.id);
              return resultado;
            } catch (problema) { return { ok: false, error: (problema as Error).message }; }
          }} />
          <PlanLibrary registro={registro} rutinas={rutinas} disabled={!puedeEscribir || edicionActiva || rutinaEnEdicion} onGuardar={persistir}/><ProgressionPanel registro={registro} rutinas={rutinas} disabled={!puedeEscribir || edicionActiva || rutinaEnEdicion} onGuardar={persistir}/><BackupPanel registro={registro} habilitado={puedeEscribir} importacionBloqueada={edicionActiva || rutinaEnEdicion} onImportar={importar} onVerificar={verificarVigencia} />
          {activo?.fecha && <details className="card advanced-entry"><summary>Herramientas de prueba <span>Reiniciar la sesión seleccionada</span></summary><div><p className="muted">Sesión: {activo.nombre} · {mostrarFecha(activo.fecha)}. Solo para repetir el flujo de prueba.</p>
            {!reinicioPendiente ? <button type="button" className="button secondary reset-button" disabled={!puedeEscribir || edicionActiva} onClick={() => setReinicioPendiente(true)}>Reiniciar entrenamiento (prueba)</button> : <div className="reset-confirm"><p>Se borrarán las {activo.series.length} series y los borradores de esta sesión. Volverá al primer ejercicio. No se puede deshacer. Los demás entrenamientos se conservan.</p><div className="edit-actions"><button type="button" className="button secondary reset-button" disabled={!puedeEscribir || edicionActiva} onClick={reiniciarEntrenamiento}>Sí, reiniciar</button><button type="button" className="button secondary" onClick={() => setReinicioPendiente(false)}>Cancelar</button></div></div>}
          </div></details>}
          <details className="card advanced-entry"><summary>Registrar en otra fecha <span>Para completar un entrenamiento anterior</span></summary><div>
            <form onSubmit={crear} className="session-form">
              <label className="full-field">Rutina<select value={diaId} onChange={e => elegirDia(e.target.value)} disabled={!puedeEscribir || edicionActiva}><option value="">Sin rutina · Press de banca</option>{rutinas.map(r => <option key={r.id} value={r.id}>{r.titulo}</option>)}</select></label>
              <label>Fecha del entrenamiento<input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required disabled={!puedeEscribir || edicionActiva} /></label>
              {diaId === '' && <label>Nombre del entrenamiento<input value={nombre} onChange={e => setNombre(e.target.value)} required maxLength={60} disabled={!puedeEscribir || edicionActiva} /></label>}
              <button type="submit" className="button" disabled={!puedeEscribir || edicionActiva}>Abrir entrenamiento</button>
            </form>
          </div></details>
          </>}
          {visitados.configuracion && <HistoryManagement registro={registro} disabled={!puedeEscribir || edicionActiva || rutinaEnEdicion} onVerificar={verificarVigencia} onGuardar={nuevo => { const res = importar(nuevo); if (res.ok) { rest.omitir(); if (!nuevo.entrenamientos.length) { try { localStorage.removeItem(claveNavegacion); } catch { setErrorNavegacion('Historial limpio; no se pudo retirar la navegación anterior.'); } } } return res; }} />}
          <PwaControls onActualizacion={setActualizacion} bloqueado={edicionActiva || rutinaEnEdicion} />
          <p className="settings-footnote">Tus datos se guardan en este navegador. El respaldo permite llevarlos a otro dispositivo; todavía no hay sincronización automática.</p>
        </section>
      </main>
      <footer>GIM · Hecho para entrenar, serie a serie.</footer>
    </div>
  );
}
