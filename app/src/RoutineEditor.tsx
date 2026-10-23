import ExerciseOptions from './ExerciseOptions';
import GroupEditor from './GroupEditor';
import { cambiarModalidad } from './exerciseConfig';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { EjercicioPlan, RutinaDia, Sesion } from './training';
import type { ResultadoGuardado } from './useRegistro';
import Icon from './Icon';
import { normalizarMontaje } from './setup';
import { equiposConocidos, varianteDe } from './catalog';
import type { Variante } from './catalog';
import ExercisePicker from './ExercisePicker';
import EquipmentPicker from './EquipmentPicker';
import { useLibraryPreferences } from './useLibraryPreferences';
import PrescriptionEditor from './PrescriptionEditor';

type Props = { rutinas: RutinaDia[]; sesiones: Sesion[]; habilitado: boolean; onGuardar: (rutina: RutinaDia) => ResultadoGuardado; onBorrador: (abierto: boolean) => void };
const nuevoEjercicio = (): EjercicioPlan => ({ id: crypto.randomUUID(), nombre: '', grupo: 'General', seriesObjetivo: 3, repeticionesObjetivo: 10, notas: null, criterioPeso: 'total' });

export default function RoutineEditor({ rutinas, sesiones, habilitado, onGuardar, onBorrador }: Props) {
  const [borrador, setBorrador] = useState<RutinaDia | null>(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const preferencias = useLibraryPreferences();
  const equipos = equiposConocidos([...sesiones.slice().reverse().map(s => ({ id: s.id, titulo: s.nombre, ejercicios: s.ejercicios })), ...rutinas, ...(borrador ? [borrador] : [])]);
  function elegirVariante(actual: EjercicioPlan, opcion: { variante?: Variante; personalizado?: EjercicioPlan }) {
    if (opcion.personalizado) {
      cambiarEjercicio(actual.id, { varianteId:undefined,equipoRef:undefined,montaje:undefined,objetivosSerie:undefined,modalidad:undefined,criterioReps:undefined,registrarRir:undefined,progresion:undefined,descansoSegundos:undefined,omitible:undefined,alternativas:undefined,...structuredClone(opcion.personalizado),id:crypto.randomUUID() });
    } else if (opcion.variante) {
      const v=opcion.variante,reemplaza=Boolean(actual.varianteId&&actual.varianteId!==v.id);
      let nuevo:EjercicioPlan={...actual,id:reemplaza?crypto.randomUUID():actual.id,varianteId:v.id,nombre:v.nombre,grupo:v.grupo,criterioPeso:v.criterioPeso,...(reemplaza?{montaje:undefined,equipoRef:undefined,notas:null,objetivosSerie:undefined,progresion:undefined,registrarRir:false}:actual.criterioPeso!==v.criterioPeso&&actual.objetivosSerie?{objetivosSerie:actual.objetivosSerie.map(({pesoKg:_,...o})=>o)}:{})};
      nuevo={...nuevo,...cambiarModalidad(nuevo,v.modalidad??'repeticiones')};
      cambiarEjercicio(actual.id,nuevo);
    }
  }  function usarPersonalizado(actual: EjercicioPlan, busqueda: string) {
    const nombre = busqueda.trim() || actual.nombre;
    const reemplaza = Boolean(actual.varianteId || (actual.nombre && nombre !== actual.nombre));
    cambiarEjercicio(actual.id, { nombre, ...(reemplaza ? { id: crypto.randomUUID(), varianteId: undefined, equipoRef: undefined, montaje: undefined, notas: null, objetivosSerie: undefined, modalidad:"repeticiones",criterioReps:undefined,criterioPeso:"total",repeticionesObjetivo:10,seriesObjetivo:actual.seriesObjetivo??3,registrarRir:false,progresion:undefined } : {}) });
  }
  function abrir(rutina?: RutinaDia) {
    setBorrador(rutina ? structuredClone(rutina) : { id: crypto.randomUUID(), titulo: '', ejercicios: [nuevoEjercicio()] });
    setError(''); setMensaje(''); onBorrador(true);
  }
  function cambiarEjercicio(id: string, cambios: Partial<EjercicioPlan>) {
    setBorrador(actual => actual ? { ...actual, ejercicios: actual.ejercicios.map(e => e.id === id ? { ...e, ...cambios } : e), grupos: actual.grupos?.map(g=>({...g,miembros:g.miembros.map(k=>k===id && cambios.id ? cambios.id : k)})) } : null);
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
    try {
    const rutina = { ...borrador, titulo: borrador.titulo.trim(), ejercicios: borrador.ejercicios.map(e => {
      const { montaje: anterior, ...resto } = e;
      const montaje = normalizarMontaje(anterior?.equipo ?? '', anterior?.ajustes ?? '');
      return { ...resto, nombre: e.nombre.trim(), grupo: e.grupo.trim(), notas: e.notas?.trim() || null, ...(montaje ? { montaje } : {}) };
    }) };
    const resultado = onGuardar(rutina);
    if (!resultado.ok) { setError(resultado.error); return; }
    setBorrador(null); onBorrador(false); setError(''); setMensaje('Rutina guardada. Se aplicará a los próximos entrenamientos.');
    } catch (problema) { setError(problema instanceof Error ? problema.message : 'No se pudo guardar la rutina.'); }
  }
  return <details className="card routine-editor">
    <summary>Mis rutinas <span>Crear, ordenar y modificar el plan</span></summary>
    <div className="routine-content">
      <p className="muted">Editar el plan conserva intactos los entrenamientos que ya creaste. La biblioteca distingue variantes; también podés escribir tus propios ejercicios.</p>
      {!borrador ? <><div className="routine-list">{rutinas.map(r => <div key={r.id}><span><strong>{r.titulo}</strong><small>{r.ejercicios.length} ejercicios</small></span><button type="button" className="button secondary small" disabled={!habilitado} onClick={() => abrir(r)}>Modificar</button></div>)}</div><button type="button" className="button" disabled={!habilitado} onClick={() => abrir()}>Crear rutina</button></> :
        <form onSubmit={guardar}>
          <fieldset disabled={!habilitado}>
            <label>Nombre de la rutina<input value={borrador.titulo} maxLength={60} required onChange={e => setBorrador({ ...borrador, titulo: e.target.value })} /></label>
            <ol className="routine-rows">{borrador.ejercicios.map((ejercicio, indice) => <li key={ejercicio.id}>
              <div className="routine-row-title"><strong>Ejercicio {indice + 1}</strong><div><button className="edit-button" type="button" disabled={indice === 0} aria-label={`Subir ejercicio ${indice + 1}`} onClick={() => mover(indice, -1)}><Icon nombre="up" /></button> <button className="edit-button" type="button" disabled={indice === borrador.ejercicios.length - 1} aria-label={`Bajar ejercicio ${indice + 1}`} onClick={() => mover(indice, 1)}><Icon nombre="down" /></button> <button className="edit-button" type="button" disabled={borrador.ejercicios.length === 1} aria-label={`Quitar ejercicio ${indice + 1}`} onClick={() => setBorrador({ ...borrador, ejercicios: borrador.ejercicios.filter(e => e.id !== ejercicio.id), grupos:borrador.grupos?.map(g=>({...g,miembros:g.miembros.filter(id=>id!==ejercicio.id)})).filter(g=>g.miembros.length>=2) })}>Quitar</button></div></div>
              <ExercisePicker rutinas={rutinas} preferencias={preferencias} onElegir={opcion => elegirVariante(ejercicio, opcion)} onPersonalizado={nombre => usarPersonalizado(ejercicio, nombre)} />
              <p className="library-link-state">{ejercicio.varianteId ? `Variante: ${varianteDe(ejercicio)?.nombre ?? 'Referencia de catálogo no disponible en esta versión'}. El nombre visible es editable.` : 'Sin variante vinculada. Elegila si conocés la ejecución; no deducimos el equipo por el nombre.'}</p>
              <div className="editor-fields"><label>Nombre visible<input value={ejercicio.nombre} maxLength={200} required onChange={e => cambiarEjercicio(ejercicio.id, { nombre: e.target.value })} /></label><label>Grupo muscular<input value={ejercicio.grupo} maxLength={100} required onChange={e => cambiarEjercicio(ejercicio.id, { grupo: e.target.value })} /></label><label>Series objetivo<input disabled={Boolean(ejercicio.objetivosSerie)} type="number" min="1" max="100" step="1" required value={ejercicio.seriesObjetivo ?? ''} onChange={e => cambiarEjercicio(ejercicio.id, { seriesObjetivo: e.target.value === '' ? null : Number(e.target.value) })} /></label><label>Repeticiones objetivo<input disabled={Boolean(ejercicio.objetivosSerie)} type="number" min="1" max="100" step="1" required value={ejercicio.repeticionesObjetivo !== null && Number.isFinite(ejercicio.repeticionesObjetivo) ? ejercicio.repeticionesObjetivo : ''} onChange={e => cambiarEjercicio(ejercicio.id, { repeticionesObjetivo: e.target.value === '' ? null : Number(e.target.value) })} /></label><label className="full-field">Notas o biserie<input value={ejercicio.notas ?? ''} maxLength={500} onChange={e => cambiarEjercicio(ejercicio.id, { notas: e.target.value || null })} /></label></div>
              <ExerciseOptions e={ejercicio} rutinas={rutinas} preferencias={preferencias} onCambiar={cambios=>cambiarEjercicio(ejercicio.id,cambios)}/><PrescriptionEditor ejercicio={ejercicio} onCambiar={cambios => cambiarEjercicio(ejercicio.id, cambios)} /><label>Cómo registrar el peso<select disabled={ejercicio.modalidad==="lados"} value={ejercicio.criterioPeso ?? 'total'} onChange={e => cambiarEjercicio(ejercicio.id, { criterioPeso: e.target.value as EjercicioPlan['criterioPeso'], ...(ejercicio.objetivosSerie ? { objetivosSerie: ejercicio.objetivosSerie.map(({ pesoKg: _, ...o }) => o) } : {}) })}><option value="total">Carga total (barra y discos / máquina)</option><option value="por-mancuerna">Peso de una mancuerna · reps por lado</option><option disabled={ejercicio.modalidad!=="lados"} value="por-lado">Carga y repeticiones por cada lado</option><option value="lastre">Solo lastre añadido · 0 si no hay</option></select></label>
              <details className="quiet-details setup-editor"><summary>Equipo y montaje habitual {ejercicio.montaje?.equipo && `· ${ejercicio.montaje.equipo}`}</summary><div className="setup-fields"><p className="muted">Se copia a las próximas sesiones de esta rutina. No cambia entrenamientos ya creados.</p>
                <EquipmentPicker actual={ejercicio.equipoRef} conocidos={equipos} onCambiar={equipoRef => cambiarEjercicio(ejercicio.id, { equipoRef, montaje: undefined })} />
                <label>Referencia adicional en texto libre<input maxLength={80} value={ejercicio.montaje?.equipo ?? ''} placeholder="Ej.: cerca de la ventana" onChange={e => cambiarEjercicio(ejercicio.id, { montaje: { equipo: e.target.value, ajustes: ejercicio.montaje?.ajustes ?? '' } })} /></label>
                <label>Ajustes habituales<textarea maxLength={500} rows={3} value={ejercicio.montaje?.ajustes ?? ''} placeholder="Ej.: asiento 4, respaldo 2, agarre neutro" onChange={e => cambiarEjercicio(ejercicio.id, { montaje: { equipo: ejercicio.montaje?.equipo ?? '', ajustes: e.target.value } })} /></label>
              </div></details>
            </li>)}</ol>
            <GroupEditor rutina={borrador} onCambiar={grupos=>setBorrador({...borrador,grupos})}/><button className="button secondary" type="button" disabled={borrador.ejercicios.length >= 100} onClick={() => setBorrador({ ...borrador, ejercicios: [...borrador.ejercicios, nuevoEjercicio()] })}>Agregar ejercicio</button>
            <div className="edit-actions"><button type="submit" className="button">Guardar rutina</button><button className="button secondary" type="button" onClick={() => { setBorrador(null); setError(''); onBorrador(false); }}>Cancelar cambios</button></div>
          </fieldset>
        </form>}
      {error && <p className="feedback error" role="alert">{error}</p>}<p className="feedback success" role="status">{mensaje}</p>
    </div>
  </details>;
}
