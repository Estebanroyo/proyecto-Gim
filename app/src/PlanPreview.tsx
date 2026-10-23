import type { RutinaDia } from './training';
import { resumenObjetivos } from './prescription';
export default function PlanPreview({ planes }: { planes: RutinaDia[] }) {
  return <div className="plan-preview">{planes.map(p => <details key={p.id} className="quiet-details" open><summary>{p.titulo} · {p.ejercicios.length} ejercicios</summary><ul>{p.ejercicios.map(e => <li key={e.id}><strong>{e.nombre}</strong> · {resumenObjetivos(e)} · {e.modalidad ?? 'repeticiones'}{e.equipoRef ? ` · ${e.equipoRef.nombre}` : ''}{e.objetivosSerie?.some(o => o.rol === 'calentamiento') ? ' · incluye calentamientos' : ''}</li>)}</ul>{p.grupos?.map(g => <p key={g.id}>{g.nombre} · {g.miembros.length} miembros · hasta {g.rondas} rondas.</p>)}</details>)}</div>;
}
