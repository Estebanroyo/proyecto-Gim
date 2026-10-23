import type { EjercicioPlan, RutinaDia, EquipoReferencia } from './training';

export const familiasCatalogo = {
  'press-pecho': 'Press de pecho', 'press-inclinado': 'Press inclinado', flexiones: 'Flexiones', aperturas: 'Aperturas',
  'extension-triceps': 'Extensión de tríceps', fondos: 'Fondos', dominadas: 'Dominadas', jalon: 'Jalón', remo: 'Remo',
  'curl-biceps': 'Curl de bíceps', 'curl-scott': 'Curl en banco Scott', sentadilla: 'Sentadilla', prensa: 'Prensa',
  gemelos: 'Gemelos', 'abduccion-cadera': 'Abducción de cadera', 'flexion-rodilla': 'Flexión de rodilla',
  'extension-rodilla': 'Extensión de rodilla', 'elevacion-lateral': 'Elevación lateral', 'press-hombros': 'Press de hombros', cardio:'Cardio', 'core-isometrico':'Core isométrico',
} as const;
export type Variante = {
  id: string; familiaId: keyof typeof familiasCatalogo; familia: string; nombre: string; grupo: string; equipo: string;
  aliases: string[]; criterioPeso: NonNullable<EjercicioPlan['criterioPeso']>;
  medicion: 'carga-repeticiones'; modalidad?: import('./training').Modalidad; recursoVisual: 'sin-recurso-nuevo';
};
// IDs editoriales propios: no son los E001–E150 de la investigación ni IDs de filas.
const v = (id: string, familiaId: keyof typeof familiasCatalogo, nombre: string, grupo: string, equipo: string, aliases: string[], criterioPeso: Variante['criterioPeso'] = 'total'): Variante => ({ id, familiaId, familia: familiasCatalogo[familiaId], nombre, grupo, equipo, aliases, criterioPeso, medicion: 'carga-repeticiones', recursoVisual: 'sin-recurso-nuevo' });
export const catalogo: Variante[] = [
  v('press-plano-barra', 'press-pecho', 'Press plano con barra', 'Pecho', 'Barra', ['press plano', 'press banca', 'press de banca', 'bench press']),
  v('press-plano-mancuernas', 'press-pecho', 'Press plano con mancuernas', 'Pecho', 'Mancuernas', ['press plano', 'press banca', 'bench press', 'dumbbell bench press'], 'por-mancuerna'),
  v('press-plano-smith', 'press-pecho', 'Press plano en Smith', 'Pecho', 'Smith', ['press plano', 'press banca', 'bench press', 'multipower']),
  v('press-inclinado-barra', 'press-inclinado', 'Press inclinado con barra', 'Pecho', 'Barra', ['incline bench press']),
  v('press-inclinado-mancuernas', 'press-inclinado', 'Press inclinado con mancuernas', 'Pecho', 'Mancuernas', ['incline dumbbell press'], 'por-mancuerna'),
  v('press-pecho-convergente', 'press-pecho', 'Press de pecho en máquina convergente', 'Pecho', 'Máquina', ['press hammer', 'hammer chest press']),
  v('flexiones-suelo', 'flexiones', 'Flexiones', 'Pecho', 'Peso corporal', ['push up', 'push ups', 'lagartijas'], 'lastre'),
  v('aperturas-mancuernas', 'aperturas', 'Aperturas con mancuernas', 'Pecho', 'Mancuernas', ['aperturas', 'dumbbell fly'], 'por-mancuerna'),
  v('aperturas-poleas', 'aperturas', 'Aperturas en poleas', 'Pecho', 'Polea', ['aperturas', 'cable fly', 'cruces']),
  v('triceps-polea-barra', 'extension-triceps', 'Tríceps en polea con barra', 'Tríceps', 'Polea', ['triceps pushdown', 'barra recta']),
  v('triceps-polea-soga', 'extension-triceps', 'Tríceps en polea con soga', 'Tríceps', 'Polea', ['rope pushdown', 'cuerda']),
  v('triceps-polea-sobre-cabeza', 'extension-triceps', 'Extensión de tríceps sobre la cabeza con soga', 'Tríceps', 'Polea', ['tríceps bajo de espaldas', 'overhead cable extension']),
  v('fondos-paralelas', 'fondos', 'Fondos en paralelas', 'Tríceps', 'Peso corporal', ['fondos', 'dips'], 'lastre'),
  v('dominadas-pronas', 'dominadas', 'Dominadas (agarre prono)', 'Espalda', 'Peso corporal', ['pull up', 'pull ups'], 'lastre'),
  v('jalon-cerrado', 'jalon', 'Jalón al pecho cerrado', 'Espalda', 'Polea', ['lat pulldown', 'close grip pulldown']),
  v('remo-polea-baja', 'remo', 'Remo bajo en polea', 'Espalda', 'Polea', ['remo bajo', 'seated cable row']),
  v('remo-convergente', 'remo', 'Remo en máquina convergente', 'Espalda', 'Máquina', ['remo hammer', 'hammer row']),
  v('remo-barra-t', 'remo', 'Remo con barra T', 'Espalda', 'Barra', ['t bar row', 'remo landmine']),
  v('curl-alternado-mancuernas', 'curl-biceps', 'Curl alternado con mancuernas', 'Bíceps', 'Mancuernas', ['curl alternado', 'alternating dumbbell curl'], 'por-mancuerna'),
  v('curl-martillo-mancuernas', 'curl-biceps', 'Curl martillo con mancuernas', 'Bíceps', 'Mancuernas', ['curl martillo', 'hammer curl'], 'por-mancuerna'),
  v('curl-scott-barra', 'curl-scott', 'Curl en banco Scott con barra', 'Bíceps', 'Barra', ['curl concentrado en banco scott', 'preacher curl']),
  v('curl-scott-mancuerna', 'curl-scott', 'Curl en banco Scott con mancuerna', 'Bíceps', 'Mancuernas', ['curl concentrado en banco scott', 'preacher curl'], 'por-mancuerna'),
  v('sentadilla-barra', 'sentadilla', 'Sentadilla con barra', 'Piernas', 'Barra', ['sentadillas', 'back squat']),
  v('sentadilla-smith', 'sentadilla', 'Sentadilla en Smith', 'Piernas', 'Smith', ['sentadillas', 'smith squat', 'multipower']),
  v('prensa-45', 'prensa', 'Prensa de piernas 45°', 'Piernas', 'Máquina', ['leg press', 'prensa inclinada']),
  v('gemelos-maquina-pie', 'gemelos', 'Gemelos en máquina de pie', 'Piernas', 'Máquina', ['standing calf raise', 'pantorrillas']),
  v('abductores-maquina', 'abduccion-cadera', 'Abductores (abriendo)', 'Piernas', 'Máquina', ['hip abduction', 'abductores']),
  v('curl-femoral-acostado', 'flexion-rodilla', 'Curl femoral acostado', 'Piernas', 'Máquina', ['lying leg curl', 'isquiotibiales']),
  v('extension-cuadriceps', 'extension-rodilla', 'Extensión de cuádriceps', 'Piernas', 'Máquina', ['leg extension', 'sillon cuadriceps']),
  v('elevacion-lateral-polea', 'elevacion-lateral', 'Elevaciones laterales en polea', 'Hombros', 'Polea', ['cable lateral raise']),
  v('press-hombro-mancuernas', 'press-hombros', 'Press de hombros con mancuernas', 'Hombros', 'Mancuernas', ['shoulder press', 'press militar'], 'por-mancuerna'),
  v('press-hombro-maquina', 'press-hombros', 'Press de hombros en máquina', 'Hombros', 'Máquina', ['shoulder press', 'press militar']),
];
catalogo.push(
  { ...v('plancha-tiempo','core-isometrico','Plancha por tiempo','Core','Peso corporal',['plank','plancha']), modalidad:'tiempo' },
  { ...v('cinta-cardio','cardio','Cinta de correr','Cardio','Máquina',['treadmill','caminar','correr']), familiaId:'cardio',familia:'Cardio',modalidad:'cardio' },
  { ...v('bicicleta-cardio','cardio','Bicicleta fija','Cardio','Máquina',['bike','cycling','bicicleta']), familiaId:'cardio',familia:'Cardio',modalidad:'cardio' }
);
export const normalizarBusqueda = (s: string) => s.toLocaleLowerCase('es-AR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
export function coincideBusqueda(texto: string, campos: string[]): boolean {
  const palabras = normalizarBusqueda(texto).split(' ').filter(Boolean);
  const contenido = normalizarBusqueda(campos.join(' '));
  return palabras.every(p => contenido.includes(p));
}
export const varianteDe = (e: EjercicioPlan) => catalogo.find(v => v.id === e.varianteId);
export function equiposConocidos(rutinas: RutinaDia[]): EquipoReferencia[] {
  const mapa = new Map<string, EquipoReferencia>();
  for (const r of rutinas) for (const e of r.ejercicios) if (e.equipoRef) mapa.set(e.equipoRef.id, e.equipoRef);
  return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}
