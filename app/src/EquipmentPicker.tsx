import { useState } from 'react';
import type { EquipoReferencia } from './training';

type Props = { actual?: EquipoReferencia; conocidos: EquipoReferencia[]; onCambiar: (equipo?: EquipoReferencia) => void };
export default function EquipmentPicker({ actual, conocidos, onCambiar }: Props) {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const opciones = [...conocidos.filter(e => e.id !== actual?.id), ...(actual ? [actual] : [])];
  return <div className="equipment-picker">
    <label>Equipo concreto<select value={actual?.id ?? ''} onChange={e => { onCambiar(opciones.find(o => o.id === e.target.value)); setError(''); }}><option value="">Equipo no declarado</option>{opciones.map((o, i) => <option key={o.id} value={o.id}>{o.nombre}{opciones.filter(x => x.nombre === o.nombre).length > 1 ? ` · referencia ${i + 1}` : ""}</option>)}</select></label>
    <details className="quiet-details"><summary>Identificar otro equipo</summary><label>Nombre para reconocerlo<input maxLength={80} value={nombre} placeholder="Ej.: prensa del fondo" onChange={e => setNombre(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }} /></label><button type="button" className="button secondary small" disabled={!nombre.trim()} onClick={() => { if (opciones.some(o => o.nombre.trim().toLocaleLowerCase('es') === nombre.trim().toLocaleLowerCase('es'))) { setError('Ya existe un equipo con ese nombre. Seleccionalo arriba o usá un nombre que los distinga.'); return; } onCambiar({ id: crypto.randomUUID(), nombre: nombre.trim() }); setNombre(''); setError(''); }}>Crear y usar equipo</button>{error && <p className="feedback error" role="alert">{error}</p>}</details>
    <p className="muted">Elegir otro equipo limpia los ajustes habituales de esta fila. Las sesiones creadas conservan su equipo y montaje.</p>
  </div>;
}
