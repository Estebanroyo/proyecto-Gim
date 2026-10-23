import { formatoResultado, resumenConteos, realizadas } from './execution';
import type { EjercicioPlan, Sesion } from './training';
import { criterioComparable, sesionAnterior } from './progress';
import { mostrarFecha } from './workout';
import { etiquetaPeso } from './weight';

export default function PreviousExercise({ sesiones, sesion, ejercicio }: { sesiones: Sesion[]; sesion: Sesion; ejercicio: EjercicioPlan }) {
  const anterior = sesionAnterior(sesiones, sesion, ejercicio);
  if (!anterior) return <p className="reference-line">Sin registro anterior compatible con este ejercicio y equipo en esta rutina.</p>;
  const item = anterior.ejercicios.find(e => e.id === ejercicio.id)!;
  return <details className="quiet-details previous-performance"><summary>Última vez · {mostrarFecha(anterior.fecha)}</summary>
    <p className="muted">{etiquetaPeso(item)} · {anterior.finalizadaEn ? 'Sesión finalizada' : 'Registro en curso'}</p>
    {!criterioComparable(anterior, ejercicio) && <p className="muted">El criterio del peso difiere o no se declaró. Consultá estos datos como referencia; no se convierten ni se usan para afirmar una mejora.</p>}
    <ol className="previous-sets">{anterior.series.filter(s => s.ejercicioId === ejercicio.id).map((serie, i) => <li key={serie.id}>Serie {i + 1}: <strong>{formatoResultado(serie)}</strong></li>)}</ol>
  </details>;
}
