import { ayudaRepeticiones } from './weight';
import type { EjercicioPlan } from './training';
import { varianteDe } from './catalog';

export default function ExerciseReference({ ejercicio }: { ejercicio: EjercicioPlan }) {
  const variante = varianteDe(ejercicio);
  return <p className="exercise-reference">{ejercicio.varianteId ? `Variante: ${variante?.nombre ?? 'referencia no disponible en esta versión'}` : 'Variante sin vincular'} · {ejercicio.equipoRef ? `Equipo: ${ejercicio.equipoRef.nombre}` : 'Equipo no declarado'} · {ayudaRepeticiones(ejercicio)}</p>;
}
