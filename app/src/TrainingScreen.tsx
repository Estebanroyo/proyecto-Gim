import SessionSummary from './SessionSummary';
import { pendiente } from './execution';
import AdvancedSetForm from './AdvancedSetForm';
import { resuelta, grupoDe, turnosTrabajo } from './execution';
import { formatoResultado, resumenConteos, realizadas } from './execution';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Icon from './Icon';
import type { EjercicioPlan, SerieEjercicio, Sesion } from './training';
import { fechaLocal, mostrarFecha } from './workout';
import { siguienteEjercicio } from './guided';
import ExerciseSets from './ExerciseSets';
import ExerciseVisual, { tieneReferenciaVisual } from './ExerciseVisual';
import RoutineOverview from './RoutineOverview';
import SwipeExerciseCard from './SwipeExerciseCard';
import { ayudaPeso, etiquetaPeso } from './weight';
import PreviousExercise from './PreviousExercise';
import SetupNotes from './SetupNotes';
import { notaDeSesion } from './setup';
import type { ResultadoGuardado } from './useRegistro';
import ExerciseReference from './ExerciseReference';
import { objetivoActual, resumenObjetivos, textoReps } from './prescription';
import PrescribedSets from './PrescribedSets';

type Props = {
  sesion: Sesion; ejercicio: EjercicioPlan; series: SerieEjercicio[];
  peso: string; repeticiones: string; bloqueado: boolean; editando: boolean;
  referencia: { pesoKg: number; origen: string } | null;
  onPeso: (valor: string) => void; onRepeticiones: (valor: string) => void;
  onSumar: (valor: number) => void; onRegistrar: () => void; onResultado: (r: Omit<SerieEjercicio, 'ejercicioId'>) => ResultadoGuardado;
  onEjercicio: (id: string) => void; onNuevo: () => void;
  onEditar: (id: string, boton: HTMLButtonElement) => void;
  onReabrir: () => void; onFinalizar: () => void;
  cierrePendiente: boolean; onPedirCierre: () => void; onCancelarCierre: () => void;
  edicion: ReactNode; mensaje: string;
  hayBorrador: boolean; borradorRecuperado: boolean; avisoBorrador: string; sesiones: Sesion[];
  notaHabilitada: boolean; onGuardarNota: (nota: string) => ResultadoGuardado; onEdicionNota: (abierta: boolean) => void;
};

export default function TrainingScreen(p: Props) {
  const { sesion, ejercicio, series } = p;
  const [registroAbierto, setRegistroAbierto] = useState(false);
  const { cantidades, ejerciciosPorId } = useMemo(() => {
    const cantidades = new Map<string, number>();
    for (const serie of sesion.series.filter(resuelta)) cantidades.set(serie.ejercicioId, (cantidades.get(serie.ejercicioId) ?? 0) + 1);
    return { cantidades, ejerciciosPorId: new Map(sesion.ejercicios.map(e => [e.id, e])) };
  }, [sesion]);
  const completados = sesion.ejercicios.filter(e => e.seriesObjetivo !== null && (cantidades.get(e.id) ?? 0) >= e.seriesObjetivo).length;
  const conObjetivo = sesion.ejercicios.filter(e => e.seriesObjetivo !== null).length;
  const pendientes = conObjetivo - completados;
  const indice = sesion.ejercicios.findIndex(e => e.id === ejercicio.id);
  function navegar(direccion: -1 | 1) {
    const destino = sesion.ejercicios[indice + direccion];
    if (destino && !p.editando) p.onEjercicio(destino.id);
  }
  const navegacion = (navegar: (direccion: -1 | 1) => void) => <nav className="exercise-navigation" aria-label="Recorrer ejercicios">
    <button type="button" className="button secondary small" disabled={p.editando || indice <= 0} onClick={() => navegar(-1)}><Icon nombre="arrow-left" /> Anterior</button>
    <span aria-live="polite">{indice + 1} / {sesion.ejercicios.length}</span>
    <button type="button" className="button secondary small" disabled={p.editando || indice >= sesion.ejercicios.length - 1} onClick={() => navegar(1)}>Siguiente <Icon nombre="arrow-right" /></button>
  </nav>;
  function vistaPrevia(posicion: number) {
    const item = sesion.ejercicios[posicion];
    if (!item) return null;
    const realizadas = sesion.series.filter(s => s.ejercicioId === item.id);
    return <><div className="exercise-identity"><div><div className="focus-heading"><span className="tag">{item.grupo}</span><span>{posicion + 1} de {sesion.ejercicios.length}</span></div><h3>{item.nombre}</h3></div><figure><ExerciseVisual ejercicio={item} /><figcaption>{tieneReferenciaVisual(item.nombre) ? 'Referencia' : 'Sin imagen'}</figcaption></figure></div>
      <div className="exercise-preview-summary"><strong>{item.seriesObjetivo ? resumenObjetivos(item) : 'A tu ritmo'}</strong><p className="muted">{realizadas.length} series guardadas</p></div>
      <ExerciseSets ejercicio={item} series={realizadas} peso="" repeticiones="" disabled registrando={false} onPeso={() => {}} onRepeticiones={() => {}} /></>;
  }
  const gesto = { ejercicioId: ejercicio.id, disabled: p.editando, anterior: indice > 0, siguiente: indice < sesion.ejercicios.length - 1, onNavegar: navegar, vistaAnterior: vistaPrevia(indice - 1), vistaSiguiente: vistaPrevia(indice + 1) };
  const siguiente = sesion.ejercicios.slice(indice+1).find(e=>pendiente(sesion,e) && !sesion.pospuestos?.includes(e.id));
  const ultimo = series.at(-1);
  const abierta = series.find(s=>s.cerrada===false);
  const grupo = grupoDe(sesion,ejercicio.id);
  const registroAvanzado = Boolean(ejercicio.registrarRir || ejercicio.modalidad && ejercicio.modalidad !== 'repeticiones');
  const objetivo = objetivoActual(sesion, ejercicio);
  const inactivo = p.bloqueado || p.editando || Boolean(sesion.finalizadaEn) || Boolean(sesion.omisiones?.some(o=>o.ejercicioId===ejercicio.id));
  const notaConfirmada = notaDeSesion(sesion, ejercicio.id);
  const ultimaConfirmada = sesion.series.at(-1);
  const contextoNota = { sesionId: sesion.id, ejercicioId: ejercicio.id, base: JSON.stringify([sesion.fecha, sesion.finalizadaEn ?? null, ejercicio.montaje ?? null, notaConfirmada ?? null]) };
  const montaje = <><ExerciseReference ejercicio={ejercicio} /><SetupNotes key={`${sesion.id}:${ejercicio.id}`} montaje={ejercicio.montaje} nota={notaConfirmada} contexto={contextoNota} habilitado={p.notaHabilitada} onGuardar={p.onGuardarNota} onEdicion={p.onEdicionNota} /></>;
  const resueltasActuales = realizadas(sesion,ejercicio.id).length;
  const serieExtra = ejercicio.seriesObjetivo !== null && resueltasActuales >= ejercicio.seriesObjetivo;
  const etiquetaSerie = serieExtra ? `Serie extra ${resueltasActuales - ejercicio.seriesObjetivo! + 1}` : `Serie ${resueltasActuales + 1}${ejercicio.seriesObjetivo ? ` de ${ejercicio.seriesObjetivo}` : ''}`;
  const identidad = <div className="exercise-identity"><div><div className="focus-heading"><span className="tag">{ejercicio.grupo}</span><span>{indice + 1} de {sesion.ejercicios.length}</span></div><h2 id="ejercicio">{ejercicio.nombre}</h2></div><figure><ExerciseVisual ejercicio={ejercicio} /><figcaption>{tieneReferenciaVisual(ejercicio.nombre) ? 'Referencia' : 'Sin imagen'}</figcaption></figure></div>;

  return <>
    <div className="workout-context"><div><h1 tabIndex={-1}>{sesion.nombre}</h1><p>{mostrarFecha(sesion.fecha)}</p></div>{sesion.fecha !== fechaLocal() && !sesion.finalizadaEn ? <button type="button" className="button secondary small" disabled={p.editando} onClick={p.onNuevo}>Entrenar hoy</button> : <span className="session-state">{sesion.finalizadaEn ? 'Finalizado' : 'En curso'}</span>}</div>
    {!sesion.finalizadaEn && sesion.fecha && <p className="session-continuity">{ultimaConfirmada ? `Último registro confirmado: ${ejerciciosPorId.get(ultimaConfirmada.ejercicioId)?.nombre ?? 'Ejercicio'} · ${formatoResultado(ultimaConfirmada)}` : 'Todavía no hay series confirmadas en esta sesión.'}</p>}
    <div className="training-layout"><div className="training-primary">
    {sesion.fecha === null ? <section className="card completion-card"><h2>Registro anterior sin fecha</h2><p className="muted">Conservamos tus series para consulta. Para registrar nuevas, empezá un entrenamiento con tu rutina.</p><button type="button" className="button primary" onClick={p.onNuevo}>Elegir rutina <Icon nombre="arrow-right" /></button></section> : sesion.finalizadaEn ? <section className="card completion-card">
      <span className="completion-mark"><Icon nombre="check" /></span><h2>Sesión finalizada</h2><p className="muted">{sesion.series.length} series guardadas en {cantidades.size} ejercicios.</p>
      {pendientes > 0 && <p className="muted">El registro conserva también los objetivos que quedaron pendientes.</p>}
      <button type="button" className="button primary" onClick={p.onNuevo} disabled={p.editando}>Elegir próximo entrenamiento <Icon nombre="arrow-right" /></button>
      <details className="quiet-details"><summary>Revisar o continuar esta sesión</summary><button className="button secondary" type="button" disabled={p.bloqueado || p.editando} onClick={p.onReabrir}>Continuar agregando series</button><p className="muted">Para corregir una serie, usá el registro que aparece debajo.</p></details>
    </section> : <SwipeExerciseCard {...gesto}>{animar => <>
      {identidad}
      {navegacion(animar)}
      {montaje}{grupo && <p className="prescription-hint">{grupo.nombre} · ronda {turnosTrabajo(sesion,ejercicio.id)+1} de {grupo.rondas}</p>}
      <div className="set-progress"><strong>{etiquetaSerie}</strong><span>{objetivo ? `Objetivo: ${textoReps(objetivo)}${objetivo.segundos === undefined ? " reps" : ""} · ${objetivo.rol ?? "trabajo (nuevo registro)"}` : 'A tu ritmo'}</span></div>
      {objetivo && (objetivo.pesoKg !== undefined || objetivo.descansoSegundos !== undefined) && <p className="prescription-hint">{objetivo.pesoKg !== undefined && `Carga objetivo: ${objetivo.pesoKg.toLocaleString("es-AR")} kg. `}{objetivo.descansoSegundos !== undefined && `Descanso previsto: ${objetivo.descansoSegundos} s.`}</p>}{ejercicio.notas && <p className="exercise-notes">{ejercicio.notas}</p>}
      <p className="weight-convention" id="criterio-peso"><strong>{etiquetaPeso(ejercicio)}</strong> · {ayudaPeso(ejercicio)}</p>
      {p.edicion}
      {(ejercicio.modalidad && ejercicio.modalidad !== 'repeticiones') || ejercicio.registrarRir ? !p.editando && <AdvancedSetForm key={`${ejercicio.id}:${series.length}:${JSON.stringify(abierta)}`} sesion={sesion} ejercicio={ejercicio} peso={p.peso} repeticiones={p.repeticiones} registro={abierta} disabled={inactivo} onGuardar={p.onResultado}/> : <form hidden={p.editando} onSubmit={evento => { evento.preventDefault(); p.onRegistrar(); }}>
        <ExerciseSets ejercicio={ejercicio} series={series} peso={p.peso} repeticiones={p.repeticiones} disabled={inactivo} onPeso={p.onPeso} onRepeticiones={p.onRepeticiones} onEditar={p.onEditar} />
        <p className={`draft-status ${p.avisoBorrador ? 'draft-warning' : ''}`} role="status">{p.avisoBorrador || (p.hayBorrador ? p.borradorRecuperado ? 'Recuperamos tu borrador local. Revisá los valores: la serie todavía no está registrada.' : 'Borrador conservado en este dispositivo. La serie todavía no está registrada.' : 'Valores sugeridos. Tocá el botón de la fila para guardar la serie.')}</p>
        <p className="reference-line" id="referencia-carga">{objetivo?.pesoKg !== undefined ? 'Carga propuesta por el plan. Podés ajustarla a lo realizado.' : ultimo ? `Última serie: ${formatoResultado(ultimo)}` : p.referencia?.origen.startsWith('Primera') ? `Carga inicial anterior: ${p.referencia.pesoKg.toLocaleString('es-AR')} kg · podés ajustarla` : 'Sin carga anterior. Ajustá el peso antes de registrar.'}</p>
        <details className="quiet-details weight-shortcuts"><summary>Ajustar peso con botones</summary>{[1, -1].map(signo => <div className="weight-controls" key={signo}>{[1.25, 5, 10, 20].map(valor => <button type="button" className="weight-step" key={valor} onClick={() => p.onSumar(signo * valor)} disabled={inactivo}>{signo === 1 ? '+' : '−'}{valor.toLocaleString('es-AR')} <span>kg</span></button>)}</div>)}<div className="weight-tools"><button type="button" onClick={() => p.onPeso('0')} disabled={inactivo}>Poner en 0</button></div></details>
        <p className="inline-feedback" role="status" aria-live="polite" aria-atomic="true">{p.mensaje || 'Se guarda al confirmar, también sin conexión.'}</p>
      </form>}
      {!ejercicio.registrarRir && (!ejercicio.modalidad || ejercicio.modalidad === 'repeticiones') && !p.editando && <details className="quiet-details"><summary>Registrar intento fallido o asistencia</summary><AdvancedSetForm key={`${ejercicio.id}:${series.length}`} sesion={sesion} ejercicio={ejercicio} peso={p.peso} repeticiones={p.repeticiones} disabled={inactivo} onGuardar={p.onResultado}/></details>}{series.length > 0 && !p.editando && !registroAvanzado && <p className="reference-line">Tocá el peso o las repeticiones de una serie guardada para corregirla.</p>}
      <PrescribedSets ejercicio={ejercicio} /><PreviousExercise sesiones={p.sesiones} sesion={sesion} ejercicio={ejercicio} />
      {registroAvanzado && !p.editando && <>
        <p className="inline-feedback" role="status">{p.mensaje || 'Se guarda al confirmar; los avances abiertos todavía no completan la serie.'}</p>
        {series.length > 0 && <details className="quiet-details"><summary>Resultados de este ejercicio · {series.length}</summary><ExerciseSets ejercicio={ejercicio} series={series} peso="" repeticiones="" disabled={p.bloqueado || !sesion.fecha} registrando={false} onPeso={p.onPeso} onRepeticiones={p.onRepeticiones} onEditar={p.onEditar}/></details>}
      </>}
      <div className="next-exercise"><span>{grupo ? 'Alternancia del grupo' : 'Después de este ejercicio'}</span><strong>{grupo ? grupo.miembros.map(id=>ejerciciosPorId.get(id)?.nombre).join(' → ') : siguiente?.nombre ?? (sesion.pospuestos?.some(id => sesion.ejercicios.some(e=>e.id===id && pendiente(sesion,e))) ? 'Quedan ejercicios pospuestos para retomar' : 'Fin del entrenamiento')}</strong></div>
    </>}</SwipeExerciseCard>}

    {(sesion.finalizadaEn || sesion.fecha === null) && <SwipeExerciseCard {...gesto} className="reviewed-exercise">{animar => <>{identidad}{navegacion(animar)}{montaje}<p className="muted">{series.length ? `${series.length} series guardadas${ejercicio.seriesObjetivo ? ` · objetivo: ${ejercicio.seriesObjetivo} series` : ''}` : 'Sin series registradas en este ejercicio'}</p><p className="weight-convention"><strong>{etiquetaPeso(ejercicio)}</strong> · {ayudaPeso(ejercicio)}</p>{p.edicion}<div hidden={p.editando}><ExerciseSets ejercicio={ejercicio} series={series} peso={p.peso} repeticiones={p.repeticiones} disabled={p.bloqueado || p.editando} registrando={false} onPeso={p.onPeso} onRepeticiones={p.onRepeticiones} onEditar={p.onEditar} /></div><PrescribedSets ejercicio={ejercicio} /><PreviousExercise sesiones={p.sesiones} sesion={sesion} ejercicio={ejercicio} /></>}</SwipeExerciseCard>}

    </div><aside className="training-sidebar">
    <SessionSummary sesion={sesion}/><div className="session-progress"><span>{conObjetivo ? `${completados} de ${conObjetivo} ejercicios completados` : `${cantidades.size} ejercicios registrados`}</span><span>{sesion.series.length} series</span>{conObjetivo > 0 && <progress value={completados} max={conObjetivo} aria-label="Ejercicios completados" />}</div>

    <RoutineOverview sesion={sesion} ejercicioId={ejercicio.id} cantidades={cantidades} disabled={p.editando} onElegir={id => {
      p.onEjercicio(id);
      requestAnimationFrame(() => document.getElementById('ejercicio')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }} />

    </aside><div className="training-secondary">
    <details className="card session-record" open={registroAbierto} onToggle={e => setRegistroAbierto(e.currentTarget.open)}>
      <summary>Series registradas <span>{sesion.series.length}</span></summary>
      {registroAbierto && <div className="record-content">
        {!sesion.series.length ? <p className="muted">Tu registro aparecerá acá después de la primera serie.</p> : <ol className="compact-diary">{sesion.series.map((serie, indiceSerie) => <li key={serie.id}><span className="diary-order">{indiceSerie + 1}</span><div><strong>{ejerciciosPorId.get(serie.ejercicioId)?.nombre}</strong><span>{formatoResultado(serie)}</span></div><button type="button" className="edit-button" aria-label={`Corregir serie ${indiceSerie + 1} de ${ejerciciosPorId.get(serie.ejercicioId)?.nombre}`} disabled={p.bloqueado || !sesion.fecha || p.editando} onClick={e => p.onEditar(serie.id, e.currentTarget)}>Corregir</button></li>)}</ol>}
      </div>}
    </details>

    {sesion.fecha !== null && <details className="quiet-details session-options"><summary>Opciones de esta sesión</summary>
      <div className="edit-actions"><button className="button secondary" type="button" onClick={p.onNuevo} disabled={p.editando}>Elegir otra rutina</button>{!sesion.finalizadaEn && <button className="button secondary" type="button" disabled={p.bloqueado || p.editando || (!sesion.series.length && !sesion.omisiones?.length)} onClick={p.onPedirCierre}>Terminar antes</button>}</div>
      {p.cierrePendiente && <div className="finish-confirm"><p>Se guardará lo realizado y quedarán visibles los ejercicios pendientes.</p><div className="edit-actions"><button type="button" className="button" onClick={p.onFinalizar} disabled={p.bloqueado}>Finalizar sesión</button><button type="button" className="button secondary" onClick={p.onCancelarCierre}>Seguir entrenando</button></div></div>}
    </details>}
    </div></div>
  </>;
}
