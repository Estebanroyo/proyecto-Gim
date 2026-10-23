import { trabajoPlanificado } from './execution';
import { useState } from 'react';
import type { RutinaDia, GrupoEjercicios } from './training';
export default function GroupEditor({ rutina, onCambiar }: { rutina: RutinaDia; onCambiar: (grupos: GrupoEjercicios[]) => void }) {
  const [primero, setPrimero] = useState(''), [segundo, setSegundo] = useState('');
  const grupos = rutina.grupos ?? [];
  const disponibles = rutina.ejercicios.filter(e => (!e.modalidad || e.modalidad === 'repeticiones') && e.seriesObjetivo !== null && !grupos.some(g => g.miembros.includes(e.id)));
  const a = disponibles.find(e => e.id === primero) ?? disponibles[0];
  const b = disponibles.find(e => e.id === segundo && e.id !== a?.id) ?? disponibles.find(e => e.id !== a?.id);
  const cambiar = (id: string, cambios: Partial<GrupoEjercicios>) => onCambiar(grupos.map(g => g.id === id ? { ...g, ...cambios } : g));
  return <details className="quiet-details group-editor"><summary>Parejas y rondas · {grupos.length} grupos</summary>
    <p className="muted">De 2 a 6 ejercicios simples por grupo. El orden de miembros define los turnos. Las rondas son un máximo: no se fabrican series cuando un miembro ya terminó sus objetivos.</p>
    {grupos.map(g => <div className="group-row" key={g.id}>
      <label>Nombre del grupo<input maxLength={60} value={g.nombre} onChange={e => cambiar(g.id, { nombre: e.target.value })} /></label>
      <ol>{g.miembros.map((id, i) => <li key={id}><strong>{rutina.ejercicios.find(e => e.id === id)?.nombre}</strong><div className="edit-actions">
        <button type="button" className="edit-button" disabled={i === 0} onClick={() => { const orden = [...g.miembros]; [orden[i - 1], orden[i]] = [orden[i], orden[i - 1]]; cambiar(g.id, { miembros: orden }); }}>Adelantar turno</button>
        <button type="button" className="edit-button" disabled={i === g.miembros.length - 1} onClick={() => { const orden = [...g.miembros]; [orden[i + 1], orden[i]] = [orden[i], orden[i + 1]]; cambiar(g.id, { miembros: orden }); }}>Atrasar turno</button>
        <button type="button" className="edit-button" onClick={() => onCambiar(grupos.map(x => x.id === g.id ? { ...x, miembros: x.miembros.filter(k => k !== id) } : x).filter(x => x.miembros.length >= 2))}>Quitar del grupo</button>
      </div></li>)}</ol>
      <div className="fields"><label>Rondas máximas<input type="number" min="1" max="100" step="1" value={g.rondas} onChange={e => cambiar(g.id, { rondas: Number(e.target.value) })} /></label><label>Descanso al terminar ronda · segundos<input type="number" min="0" max="3600" step="1" value={g.descansoSegundos ?? ''} onChange={e => cambiar(g.id, { descansoSegundos: e.target.value === '' ? undefined : Number(e.target.value) })} /></label></div>
      {g.miembros.length < 6 && <label>Añadir miembro<select value="" onChange={e => { if (e.target.value) cambiar(g.id, { miembros: [...g.miembros, e.target.value], rondas: Math.max(g.rondas, trabajoPlanificado(rutina.ejercicios.find(x => x.id === e.target.value)!)) }); }}><option value="">Elegir ejercicio</option>{disponibles.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}</select></label>}
      <button type="button" className="edit-button" onClick={() => onCambiar(grupos.filter(x => x.id !== g.id))}>Separar grupo</button>
    </div>)}
    <div className="fields"><label>Primer ejercicio<select value={a?.id ?? ''} onChange={e => setPrimero(e.target.value)}><option value="">Elegir</option>{disponibles.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}</select></label><label>Segundo ejercicio<select value={b?.id ?? ''} onChange={e => setSegundo(e.target.value)}><option value="">Elegir</option>{disponibles.filter(e => e.id !== a?.id).map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}</select></label></div>
    <button type="button" className="button secondary small" disabled={!a || !b} onClick={() => { if (a && b) onCambiar([...grupos, { id: crypto.randomUUID(), nombre: 'Biserie', miembros: [a.id, b.id], rondas: Math.max(1,trabajoPlanificado(a),trabajoPlanificado(b)), descansoSegundos: 90 }]); }}>Crear grupo con estos ejercicios</button>
  </details>;
}
