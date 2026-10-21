import { useState } from 'react';
import type { FormEvent } from 'react';
import type { EjercicioPlan, RutinaDia } from './training';
import type { ResultadoGuardado } from './useRegistro';
import Icon from './Icon';

type Props = { rutinas: RutinaDia[]; habilitado: boolean; onGuardar: (rutina: RutinaDia) => ResultadoGuardado; onBorrador: (abierto: boolean) => void };
const nuevoEjercicio = (): EjercicioPlan => ({ id: crypto.randomUUID(), nombre: '', grupo: 'General', seriesObjetivo: 3, repeticionesObjetivo: 10, notas: null, criterioPeso: 'total' });

export default function RoutineEditor({ rutinas, habilitado, onGuardar, onBorrador }: Props) {
  const [borrador, setBorrador] = useState<RutinaDia | null>(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  function abrir(rutina?: RutinaDia) {
    setBorrador(rutina ? structuredClone(rutina) : { id: crypto.randomUUID(), titulo: '', ejercicios: [nuevoEjercicio()] });
    setError(''); setMensaje(''); onBorrador(true);
  }
  function cambiarEjercicio(id: string, cambios: Partial<EjercicioPlan>) {
    setBorrador(actual => actual ? { ...actual, ejercicios: actual.ejercicios.map(e => e.id === id ? { ...e, ...cambios } : e) } : null);
  }
  function mover(indice: number, paso: number) {
    if (!borrador) return;
    const ejercicios = [...borrador.ejercicios];
    [ejercicios[indice], ejercicios[indice + paso]] = [ejercicios[indice + paso], ejercicios[indice]];
    setBorrador({ ...borrador, ejercicios });
  }
  function guardar(evento: FormEvent) {
    evento.preventDefault();
    if (!borrador) return;
    const rutina = { ...borrador, titulo: borrador.titulo.trim(), ejercicios: borrador.ejercicios.map(e => ({ ...e, nombre: e.nombre.trim(), grupo: e.grupo.trim(), notas: e.notas?.trim() || null })) };
    const resultado = onGuardar(rutina);
    if (!resultado.ok) { setError(resultado.error); return; }
    setBorrador(null); onBorrador(false); setError(''); setMensaje('Rutina guardada. Se aplicará a los próximos entrenamientos.');
  }
  return <details className="card routine-editor">
    <summary>Mis rutinas <span>Crear, ordenar y modificar el plan</span></summary>
    <div className="routine-content">
      <p className="muted">Editar el plan conserva intactos los entrenamientos que ya creaste. Para reemplazar un ejercicio por otro diferente, eliminá la fila y agregá una nueva.</p>
      {!borrador ? <><div className="routine-list">{rutinas.map(r => <div key={r.id}><span><strong>{r.titulo}</strong><small>{r.ejercicios.length} ejercicios</small></span><button type="button" className="button secondary small" disabled={!habilitado} onClick={() => abrir(r)}>Modificar</button></div>)}</div><button type="button" className="button" disabled={!habilitado} onClick={() => abrir()}>Crear rutina</button></> :
        <form onSubmit={guardar}>
          <fieldset disabled={!habilitado}>
            <label>Nombre de la rutina<input value={borrador.titulo} maxLength={60} required onChange={e => setBorrador({ ...borrador, titulo: e.target.value })} /></label>
            <ol className="routine-rows">{borrador.ejercicios.map((ejercicio, indice) => <li key={ejercicio.id}>
              <div className="routine-row-title"><strong>Ejercicio {indice + 1}</strong><div><button className="edit-button" type="button" disabled={indice === 0} aria-label={`Subir ejercicio ${indice + 1}`} onClick={() => mover(indice, -1)}><Icon nombre="up" /></button> <button className="edit-button" type="button" disabled={indice === borrador.ejercicios.length - 1} aria-label={`Bajar ejercicio ${indice + 1}`} onClick={() => mover(indice, 1)}><Icon nombre="down" /></button> <button className="edit-button" type="button" disabled={borrador.ejercicios.length === 1} aria-label={`Quitar ejercicio ${indice + 1}`} onClick={() => setBorrador({ ...borrador, ejercicios: borrador.ejercicios.filter(e => e.id !== ejercicio.id) })}>Quitar</button></div></div>
              <div className="editor-fields"><label>Ejercicio<input value={ejercicio.nombre} maxLength={200} required onChange={e => cambiarEjercicio(ejercicio.id, { nombre: e.target.value })} /></label><label>Grupo muscular<input value={ejercicio.grupo} maxLength={100} required onChange={e => cambiarEjercicio(ejercicio.id, { grupo: e.target.value })} /></label><label>Series objetivo<input type="number" min="1" max="100" step="1" required value={ejercicio.seriesObjetivo ?? ''} onChange={e => cambiarEjercicio(ejercicio.id, { seriesObjetivo: e.target.value === '' ? null : Number(e.target.value) })} /></label><label>Repeticiones objetivo<input type="number" min="1" max="100" step="1" required value={ejercicio.repeticionesObjetivo ?? ''} onChange={e => cambiarEjercicio(ejercicio.id, { repeticionesObjetivo: e.target.value === '' ? null : Number(e.target.value) })} /></label><label className="full-field">Notas o biserie<input value={ejercicio.notas ?? ''} maxLength={500} onChange={e => cambiarEjercicio(ejercicio.id, { notas: e.target.value || null })} /></label></div>
              <label>Cómo registrar el peso<select value={ejercicio.criterioPeso ?? 'total'} onChange={e => cambiarEjercicio(ejercicio.id, { criterioPeso: e.target.value as EjercicioPlan['criterioPeso'] })}><option value="total">Carga total (barra y discos / máquina)</option><option value="por-mancuerna">Peso de una mancuerna · reps por lado</option><option value="lastre">Solo lastre añadido · 0 si no hay</option></select></label>
            </li>)}</ol>
            <button className="button secondary" type="button" disabled={borrador.ejercicios.length >= 100} onClick={() => setBorrador({ ...borrador, ejercicios: [...borrador.ejercicios, nuevoEjercicio()] })}>Agregar ejercicio</button>
            <div className="edit-actions"><button type="submit" className="button">Guardar rutina</button><button className="button secondary" type="button" onClick={() => { setBorrador(null); setError(''); onBorrador(false); }}>Cancelar cambios</button></div>
          </fieldset>
        </form>}
      {error && <p className="feedback error" role="alert">{error}</p>}<p className="feedback success" role="status">{mensaje}</p>
    </div>
  </details>;
}
