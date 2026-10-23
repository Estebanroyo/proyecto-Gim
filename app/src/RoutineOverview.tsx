import type { Sesion } from './training';
import Icon from './Icon';
import ExerciseVisual from './ExerciseVisual';
import { useEffect, useRef } from 'react';

type Props = { sesion: Sesion; ejercicioId: string; cantidades: Map<string, number>; disabled: boolean; onElegir: (id: string) => void };

export default function RoutineOverview({ sesion, ejercicioId, cantidades, disabled, onElegir }: Props) {
  const lista = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const contenedor = lista.current;
    const actual = contenedor?.querySelector('[aria-current="step"]');
    if (!contenedor || !actual) return;
    const limites = contenedor.getBoundingClientRect();
    const posicion = actual.getBoundingClientRect();
    if (posicion.bottom > limites.bottom) contenedor.scrollTop += posicion.bottom - limites.bottom + 8;
    else if (posicion.top < limites.top) contenedor.scrollTop -= limites.top - posicion.top + 8;
  }, [ejercicioId]);
  return <section className="routine-overview" aria-labelledby="tu-rutina">
    <div className="routine-overview-heading"><h2 id="tu-rutina">Tu rutina</h2><span>{sesion.ejercicios.length} ejercicios</span></div>
    <ol ref={lista}>{sesion.ejercicios.map((ejercicio, indice) => {
      const realizadas = cantidades.get(ejercicio.id) ?? 0;
      const completo = ejercicio.seriesObjetivo !== null && realizadas >= ejercicio.seriesObjetivo;
      const actual = ejercicio.id === ejercicioId;
      const estado = sesion.omisiones?.some(o=>o.ejercicioId===ejercicio.id) ? 'Omitido (conserva registros)' : sesion.pospuestos?.includes(ejercicio.id) ? 'Pospuesto' : completo ? 'Completado' : sesion.finalizadaEn ? realizadas ? 'Registro parcial' : 'Sin realizar' : actual ? 'Ahora' : realizadas ? 'En curso' : 'Pendiente';
      return <li key={ejercicio.id}><button className={`routine-exercise ${actual ? 'is-current' : ''} ${completo ? 'is-done' : ''}`} type="button" aria-current={actual ? 'step' : undefined} disabled={disabled} onClick={() => onElegir(ejercicio.id)}>
        <ExerciseVisual ejercicio={ejercicio} mini />
        <span className="routine-exercise-copy"><strong>{ejercicio.nombre}</strong><span>{realizadas}/{ejercicio.seriesObjetivo ?? '—'} series · {estado}</span></span>
        <span className="routine-exercise-state">{completo ? <Icon nombre="check" /> : <span>{indice + 1}</span>}</span>
      </button></li>;
    })}</ol>
  </section>;
}
