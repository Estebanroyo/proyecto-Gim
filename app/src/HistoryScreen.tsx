import SessionSummary from './SessionSummary';
import { formatoResultado, resumenConteos, realizadas } from './execution';
import { useState } from 'react';
import { mostrarFecha } from './workout';
import type { Sesion } from './training';
import ProgressPanel from './ProgressPanel';
import { etiquetaPeso } from './weight';
import SetupNotes from './SetupNotes';
import { notaDeSesion } from './setup';
import ExerciseReference from './ExerciseReference';
import PrescribedSets from './PrescribedSets';

type Props = { sesiones: Sesion[]; seleccionada: string; onAbrir: (id: string) => void };

export default function HistoryScreen({ sesiones, seleccionada, onAbrir }: Props) {
  const [consultaId, setConsultaId] = useState(seleccionada);
  const [filtro, setFiltro] = useState('');
  const [cronologiaAbierta, setCronologiaAbierta] = useState(false);
  const titulos = [...new Set(sesiones.map(s => s.rutinaOrigen?.id ?? 'libre'))];
  const visibles = sesiones.filter(s => !filtro || (s.rutinaOrigen?.id ?? 'libre') === filtro);
  const sesion = visibles.find(s => s.id === consultaId) ?? visibles[0];
  return <div className="history-module">
    <div className="module-title"><h1 tabIndex={-1}>Historial</h1><p>Lo que hiciste, ordenado por entrenamiento.</p></div>
    {!sesiones.length ? <div className="card empty-state"><h2>Tu historia empieza con una serie</h2><p>Los entrenamientos aparecerán acá cuando empieces a registrarlos.</p></div> : <>
      <div className="history-filters"><label>Rutina<select value={filtro} onChange={e => setFiltro(e.target.value)}><option value="">Todas las rutinas</option>{titulos.map(id => <option key={id} value={id}>{sesiones.find(s => (s.rutinaOrigen?.id ?? 'libre') === id)?.rutinaOrigen?.titulo ?? 'Sin rutina'}</option>)}</select></label><label>Entrenamiento<select value={sesion?.id ?? ''} onChange={e => setConsultaId(e.target.value)}>{visibles.map(s => <option key={s.id} value={s.id}>{mostrarFecha(s.fecha)} · {s.nombre}</option>)}</select></label></div>
      {sesion && <article className="card history-detail"><div className="history-detail-heading"><div><span className="tag">{sesion.fecha === null ? 'Sin fecha' : sesion.finalizadaEn ? 'Finalizado' : 'En curso'}</span><h2>{sesion.nombre}</h2><p className="muted">{mostrarFecha(sesion.fecha)}</p></div><button type="button" className="button secondary small" onClick={() => onAbrir(sesion.id)}>{sesion.finalizadaEn || !sesion.fecha ? 'Ver sesión' : 'Continuar'}</button></div>
        <div className="history-stats"><div><strong>{sesion.series.length}</strong><span>series</span></div><div><strong>{resumenConteos(sesion).trabajo}</strong><span>series de trabajo</span></div></div>
        <SessionSummary sesion={sesion}/><div className="exercise-results">{sesion.ejercicios.map(e => {
          const series = sesion.series.filter(s => s.ejercicioId === e.id);
          return <div key={e.id}><div className="result-title"><h3>{e.nombre}</h3><span>{series.length}/{e.seriesObjetivo ?? '—'} series</span></div><p className="muted">{etiquetaPeso(e)}</p><ExerciseReference ejercicio={e} /><PrescribedSets ejercicio={e} /><SetupNotes montaje={e.montaje} nota={notaDeSesion(sesion, e.id)} />{series.length ? <p className="set-chips">{series.map((s, indice) => <span key={s.id}>#{indice + 1} · {formatoResultado(s)}</span>)}</p> : <p className="muted">Sin series registradas</p>}</div>;
        })}</div>
        <details className="quiet-details" onToggle={e => setCronologiaAbierta(e.currentTarget.open)}><summary>Ver orden cronológico</summary>{cronologiaAbierta && <ol className="compact-diary">{sesion.series.map(s => <li key={s.id}><div><strong>{sesion.ejercicios.find(e => e.id === s.ejercicioId)?.nombre}</strong><span>{formatoResultado(s)} · {s.registradaEn ? new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(s.registradaEn)) : 'Sin hora registrada'}</span></div></li>)}</ol>}</details>
      </article>}
      {sesion && <ProgressPanel sesiones={sesiones} sesion={sesion} frecuencia={visibles} />}
    </>}
  </div>;
}
