import type { EjercicioPlan, ObjetivoSerie } from './training';
import { objetivosDe, textoReps } from './prescription';

type Props = { ejercicio: EjercicioPlan; onCambiar: (cambios: Partial<EjercicioPlan>) => void };
const numero = (s: string) => s === '' ? Number.NaN : Number(s);
const mostrar = (n: number | undefined) => n !== undefined && Number.isFinite(n) ? n : '';
export default function PrescriptionEditor({ ejercicio: e, onCambiar }: Props) {
  const objetivos = e.objetivosSerie;
  const temporal = e.modalidad === 'tiempo' || e.modalidad === 'cardio';
  function aplicar(lista: ObjetivoSerie[]) {
    onCambiar({ objetivosSerie: lista, seriesObjetivo: lista.length, repeticionesObjetivo: temporal ? null : lista[0]?.repsMin ?? null });
  }
  function cambiar(id: string, cambios: Partial<ObjetivoSerie>) { aplicar(objetivos!.map(o => o.id === id ? { ...o, ...cambios } : o)); }
  return <details className="quiet-details prescription-editor" onInvalidCapture={ev => { ev.currentTarget.open = true; }}>
    <summary>{objetivos ? `Objetivos por serie · ${objetivos.length} series` : 'Personalizar objetivos por serie'}</summary>
    <p className="muted">Mínimo y máximo iguales indican repeticiones exactas. Los kilos y el descanso son opcionales; no son resultados realizados. El descanso de la serie tiene prioridad sobre el general.</p>
    {!objetivos ? <button type="button" className="button secondary small" onClick={() => aplicar((objetivosDe(e).length ? objetivosDe(e) : Array.from({ length: 3 }, (_, i) => ({ id: String(i), repsMin: 10, repsMax: 10 }))).map(o => ({ ...(temporal ? {segundos:60} : o), id: crypto.randomUUID(), rol: 'trabajo' })))}>Definir cada serie</button> : <>
      <ol className="prescription-rows">{objetivos.map((o, i) => <li key={o.id}>
        <div className="prescription-row-heading"><strong>Serie {i + 1} · {textoReps(o)}{temporal ? "" : " reps"}</strong><div className="edit-actions"><button type="button" className="edit-button" disabled={objetivos.length >= 100} onClick={() => aplicar([...objetivos.slice(0, i + 1), { ...o, id: crypto.randomUUID() }, ...objetivos.slice(i + 1)])}>Duplicar</button><button type="button" className="edit-button" disabled={objetivos.length === 1} onClick={() => aplicar(objetivos.filter(x => x.id !== o.id))}>Quitar</button></div></div>
        <div className="prescription-fields">
          {temporal ? <label>Duración objetivo · segundos<input type="number" min="1" max="86400" step="1" required value={mostrar(o.segundos)} onChange={ev=>cambiar(o.id,{segundos:numero(ev.target.value)})}/></label> : <><label>Reps mínimas<input type="number" min="1" max="100" step="1" inputMode="numeric" required value={mostrar(o.repsMin)} onChange={ev => cambiar(o.id, { repsMin: numero(ev.target.value) })} /></label>
          <label>Reps máximas<input type="number" min={Number.isFinite(o.repsMin) ? Math.max(1, o.repsMin ?? 1) : 1} max="100" step="1" inputMode="numeric" required value={mostrar(o.repsMax)} onChange={ev => cambiar(o.id, { repsMax: numero(ev.target.value) })} /></label>
          </>}<label>Rol de esta serie<select value={o.rol??"trabajo"} onChange={ev=>cambiar(o.id,{rol:ev.target.value as "trabajo"|"calentamiento"})}><option value="trabajo">Trabajo</option><option value="calentamiento">Calentamiento</option></select></label><label>Carga objetivo · kg<input type="number" min="0" max="1000" step="0.01" inputMode="decimal" value={mostrar(o.pesoKg)} placeholder="Sin fijar" onChange={ev => cambiar(o.id, { pesoKg: ev.target.value === '' ? undefined : Number(ev.target.value) })} /></label>
          <label>Descanso · segundos<input type="number" min="0" max="3600" step="1" inputMode="numeric" value={mostrar(o.descansoSegundos)} placeholder="Sin fijar" onChange={ev => cambiar(o.id, { descansoSegundos: ev.target.value === '' ? undefined : Number(ev.target.value) })} /></label>
        </div>
        {(o.repsMin ?? 0) > (o.repsMax ?? 0) && <p className="feedback error">El mínimo no puede superar el máximo.</p>}
      </li>)}</ol>
      <div className="edit-actions"><button type="button" className="button secondary small" disabled={objetivos.length >= 100} onClick={() => aplicar([...objetivos, { ...objetivos.at(-1)!, id: crypto.randomUUID() }])}>Añadir serie</button><button type="button" className="button secondary small" onClick={() => aplicar(objetivos.map((o, i) => i === 0 ? o : { ...objetivos[0], id: o.id }))}>Copiar la primera a todas</button></div>
      <p className="muted">Para volver al plan uniforme, conservamos la cantidad y las repeticiones mínimas de la primera serie; se retiran rangos, cargas y descansos de este borrador.</p>
      {!temporal && <button type="button" className="edit-button" onClick={() => onCambiar({ objetivosSerie: undefined, seriesObjetivo: objetivos.length, repeticionesObjetivo: Number.isFinite(objetivos[0].repsMin) ? objetivos[0].repsMin : 10 })}>Volver a objetivos uniformes</button>}
    </>}
  </details>;
}
