import type { EjercicioPlan } from './training';
import { textoReps } from './prescription';

export default function PrescribedSets({ ejercicio }: { ejercicio: EjercicioPlan }) {
  if (!ejercicio.objetivosSerie) return null;
  return <details className="quiet-details prescribed-sets"><summary>Objetivos guardados en esta sesión</summary><ol>{ejercicio.objetivosSerie.map((o, i) => <li key={o.id}>Serie {i + 1}: {textoReps(o)}{o.segundos===undefined?" reps":""} · {o.rol??"rol sin declarar"}{o.pesoKg !== undefined && ` · ${o.pesoKg.toLocaleString('es-AR')} kg objetivo`}{o.descansoSegundos !== undefined && ` · ${o.descansoSegundos} s de descanso previsto`}</li>)}</ol><p className="muted">Son objetivos, no resultados. No cambian al corregir las series realizadas.</p></details>;
}
