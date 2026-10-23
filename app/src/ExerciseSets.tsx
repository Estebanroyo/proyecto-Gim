import { esSimple, formatoResultado } from './execution';
import type { EjercicioPlan, SerieEjercicio } from './training';
import Icon from './Icon';
import { useEffect, useRef } from 'react';
import { objetivosDe, textoReps } from './prescription';

type Props = {
  ejercicio: EjercicioPlan; series: SerieEjercicio[]; peso: string; repeticiones: string;
  disabled: boolean; registrando?: boolean; onPeso: (valor: string) => void; onRepeticiones: (valor: string) => void;
  onEditar?: (id: string, boton: HTMLButtonElement) => void;
};

export default function ExerciseSets({ ejercicio, series, peso, repeticiones, disabled, registrando = true, onPeso, onRepeticiones, onEditar }: Props) {
  const cantidad = Math.max(ejercicio.seriesObjetivo ?? 0, series.length + (registrando ? 1 : 0));
  const objetivos = objetivosDe(ejercicio);
  const contenedor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const elemento = contenedor.current;
    const fila = elemento?.querySelector('.set-row-current');
    if (!elemento || !fila) return;
    const limites = elemento.getBoundingClientRect();
    const posicion = fila.getBoundingClientRect();
    if (posicion.bottom > limites.bottom) elemento.scrollTop += posicion.bottom - limites.bottom + 12;
    else if (posicion.top < limites.top + 40) elemento.scrollTop -= limites.top + 40 - posicion.top;
  }, [series.length, ejercicio.id, registrando]);
  if (ejercicio.modalidad && ejercicio.modalidad !== "repeticiones") return <div className="special-results"><ol>{series.map((s,i)=><li key={s.id}><span>{formatoResultado(s)}</span>{onEditar && <button className="edit-button" type="button" disabled={disabled} onClick={ev=>onEditar(s.id,ev.currentTarget)}>Corregir serie {i+1}</button>}</li>)}</ol></div>;
  return <div ref={contenedor} className="exercise-sets">
    <table>
      <caption className="sr-only">Series de {ejercicio.nombre}. La fila actual se guarda al confirmar.</caption>
      <thead><tr><th scope="col">Serie</th><th scope="col">Peso <span>kg</span></th><th scope="col">Reps</th><th scope="col">{registrando ? 'Guardar' : <span className="sr-only">Estado</span>}</th></tr></thead>
      <tbody>{Array.from({ length: cantidad }, (_, indice) => {
        const registro = series[indice];
        const serie = registro && esSimple(registro) ? registro : undefined;
        const actual = registrando && indice === series.length;
        const objetivo = serie ? ejercicio.objetivosSerie?.find(o => o.id === serie.objetivoId) : objetivos[indice];
        return <tr key={serie?.id ?? `pendiente-${indice}`} className={serie ? 'set-row-saved' : actual ? 'set-row-current' : 'set-row-pending'}>
          <th scope="row">{indice + 1}{ejercicio.objetivosSerie && objetivo && <small className="set-prescription">{textoReps(objetivo)} reps obj.</small>}{ejercicio.seriesObjetivo !== null && indice >= ejercicio.seriesObjetivo && <small>extra</small>}</th>
          <td>{serie ? onEditar ? <button className="set-value-button" type="button" disabled={disabled} aria-label={`Corregir peso de la serie ${indice + 1}`} onClick={e => onEditar(serie.id, e.currentTarget)}>{serie.pesoKg.toLocaleString('es-AR')}</button> : serie.pesoKg.toLocaleString('es-AR') : actual ? <input aria-label={`Peso en kg de la serie ${indice + 1}`} aria-describedby="criterio-peso referencia-carga" type="number" min="0" max="1000" step="0.01" inputMode="decimal" value={peso} onChange={e => onPeso(e.target.value)} onFocus={e => e.target.select()} required disabled={disabled} /> : <span title="Carga objetivo; todavía no registrada">{objetivo?.pesoKg?.toLocaleString("es-AR") ?? "—"}</span>}</td>
          <td>{serie ? onEditar ? <button className="set-value-button" type="button" disabled={disabled} aria-label={`Corregir repeticiones de la serie ${indice + 1}`} onClick={e => onEditar(serie.id, e.currentTarget)}>{serie.repeticiones}</button> : serie.repeticiones : actual ? <input aria-label={`Repeticiones de la serie ${indice + 1}`} type="number" min="1" max="100" step="1" inputMode="numeric" value={repeticiones} onChange={e => onRepeticiones(e.target.value)} onFocus={e => e.target.select()} required disabled={disabled} /> : <span title="Repeticiones objetivo; serie pendiente">{textoReps(objetivo)}</span>}</td>
          <td>{serie ? <span className="set-state saved" title="Serie guardada"><Icon nombre="check" /><span className="sr-only">Guardada</span></span> : actual ? <button type="submit" className="save-set-inline" disabled={disabled} aria-label={`Guardar serie ${indice + 1}`} title="Guardar serie"><Icon nombre="check" /></button> : <span className="set-state pending" title="Serie pendiente"><span className="sr-only">Pendiente</span></span>}</td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}
