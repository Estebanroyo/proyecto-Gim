import type { EjercicioPlan } from './training';

// Coincidencia exacta por nombre normalizado: una rutina editada no hereda
// una imagen incorrecta solo por conservar el ID de un ejercicio antiguo.
const nombres = [
  'Press plano', 'Press inclinado', 'Press Hammer', 'Flexiones', 'Aperturas',
  'Tríceps en polea con barra', 'Tríceps en polea con soga',
  'Tríceps bajo en polea con soga (de espaldas) (Extensión por encima de la cabeza)',
  'Fondos', 'Dominadas (agarre prono)', 'Jalón al pecho cerrado', 'Remo bajo',
  'Remo Hammer', 'Remo con barra T', 'Curl alternado', 'Curl martillo',
  'Curl concentrado en banco Scott', 'Sentadillas', 'Prensa de piernas 45°',
  'Gemelos en máquina de pie', 'Abductores (abriendo)', 'Curl femoral acostado',
  'Extensión de cuádriceps', 'Elevaciones laterales en polea',
  'Press de hombros (mancuernas o máquina)',
];

const normalizar = (texto: string) => texto.trim().toLocaleLowerCase('es-AR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
const indices = new Map(nombres.map((nombre, indice) => [normalizar(nombre), indice]));
indices.set(normalizar('Press de banca'), 0);

export const tieneReferenciaVisual = (nombre: string) => indices.has(normalizar(nombre));

export default function ExerciseVisual({ ejercicio, mini = false }: { ejercicio: EjercicioPlan; mini?: boolean }) {
  const indice = indices.get(normalizar(ejercicio.nombre));
  if (indice === undefined) return <span className={`exercise-visual no-visual ${mini ? 'mini' : ''}`} aria-label="Sin referencia visual"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7v10M2 9v6M19 7v10M22 9v6M5 12h14" /></svg></span>;
  return <span className={`exercise-visual ${mini ? 'mini' : ''}`} role="img" aria-label={`Referencia visual de ${ejercicio.nombre}`} style={{ backgroundPosition: `${(indice % 5) * 25}% ${Math.floor(indice / 5) * 25}%` }} />;
}
