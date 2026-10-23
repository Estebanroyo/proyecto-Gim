import type { EjercicioPlan, SerieEjercicio, Sesion, GrupoEjercicios } from './training';
export const esSimple = (s: SerieEjercicio): s is SerieEjercicio & { pesoKg: number; repeticiones: number } => (!s.modalidad || s.modalidad === 'repeticiones') && typeof s.pesoKg === 'number' && typeof s.repeticiones === 'number';
export const resuelta = (s: SerieEjercicio) => s.modalidad === 'tramos' || s.modalidad === 'lados' ? s.cerrada === true : true;
export const realizadas = (s: Sesion, id: string) => s.series.filter(x => x.ejercicioId === id && resuelta(x));
export const turnosTrabajo = (s: Sesion, id: string) => realizadas(s,id).filter(x=>x.rol!=='calentamiento').length;
export const trabajoPlanificado = (e: EjercicioPlan) => e.objetivosSerie ? e.objetivosSerie.filter(o=>o.rol!=='calentamiento').length : e.seriesObjetivo ?? 0;
export const formatoNumero = (n: number) => n.toLocaleString('es-AR');
export const formatoResultado = (s: SerieEjercicio): string => {
  const tipo = s.rol === 'calentamiento' ? ' · calentamiento' : s.rol === 'trabajo' ? ' · trabajo' : ' · rol sin declarar';
  let texto = '';
  if (esSimple(s)) texto = `${formatoNumero(s.pesoKg)} kg × ${s.repeticiones} reps${s.estado === 'fallida' ? ' · intento fallido' : ''}${s.rir !== undefined ? ` · RIR ${s.rir}` : ''}`;
  else if (s.modalidad === 'tiempo' || s.modalidad === 'cardio') texto = `${s.segundos} s${s.distanciaMetros !== undefined ? ` · ${formatoNumero(s.distanciaMetros)} m` : ''}${s.pesoKg !== undefined ? ` · ${formatoNumero(s.pesoKg)} kg` : ''}${s.velocidadKmh !== undefined ? ` · ${s.velocidadKmh} km/h` : ''}${s.inclinacionPorcentaje !== undefined ? ` · ${s.inclinacionPorcentaje}% inclinación` : ''}${s.resistenciaNivel !== undefined ? ` · resistencia nivel ${s.resistenciaNivel}` : ''}`;
  else if (s.modalidad === 'lados') texto = `Izq.: ${s.izquierda ? `${formatoNumero(s.izquierda.pesoKg)} kg × ${s.izquierda.repeticiones}` : 'sin registrar'} · Der.: ${s.derecha ? `${formatoNumero(s.derecha.pesoKg)} kg × ${s.derecha.repeticiones}` : 'sin registrar'}${s.cerrada ? '' : ' · abierta'}`;
  else if (s.modalidad === 'tramos') texto = `Dropset: ${(s.tramos ?? []).map(t => `${formatoNumero(t.pesoKg)} kg × ${t.repeticiones}`).join(' → ')}${s.cerrada ? ' · cerrada' : ' · abierta'}`;
  return texto + (s.asistenciaKg !== undefined ? ` · asistencia ${s.asistenciaKg} kg` : '') + tipo;
};
export const omitido = (s: Sesion, id: string) => Boolean(s.omisiones?.some(o => o.ejercicioId === id));
export const pendiente = (s: Sesion, e: EjercicioPlan) => !omitido(s, e.id) && (e.seriesObjetivo === null || realizadas(s, e.id).length < e.seriesObjetivo);
export function grupoDe(s: Sesion, id: string): GrupoEjercicios | undefined { return s.grupos?.find(g => g.miembros.includes(id)); }
export function turnoSiguiente(s: Sesion, actualId?: string): EjercicioPlan | undefined {
  const disponibles = s.ejercicios.filter(e => pendiente(s, e) && !s.pospuestos?.includes(e.id));
  const grupo = actualId ? grupoDe(s, actualId) : undefined;
  if (grupo) {
    const miembros = grupo.miembros.map(id => disponibles.find(e => e.id === id)).filter((e): e is EjercicioPlan => Boolean(e));
    const calienta = (e: EjercicioPlan) => e.objetivosSerie?.[realizadas(s,e.id).length]?.rol==='calentamiento';
    miembros.sort((a, b) => turnosTrabajo(s,a.id)-turnosTrabajo(s,b.id) || Number(calienta(b))-Number(calienta(a)) || grupo.miembros.indexOf(a.id) - grupo.miembros.indexOf(b.id));
    if (miembros[0]) return miembros[0];
  }
  const actual = disponibles.find(e => e.id === actualId);
  if (actual) return actual;
  return disponibles[0];
}
export function resumenConteos(s: Sesion) {
  const cerradas = s.series.filter(resuelta);
  return { trabajo: cerradas.filter(x => x.rol === 'trabajo' && x.estado !== 'fallida').length, calentamiento: cerradas.filter(x => x.rol === 'calentamiento').length, fallidas: cerradas.filter(x => x.estado === 'fallida').length, desconocidas: cerradas.filter(x => !x.rol).length, abiertas: s.series.length - cerradas.length, tramos: s.series.reduce((n, x) => n + (x.tramos?.length ?? 0), 0), segundos: cerradas.reduce((n, x) => n + (x.segundos ?? 0), 0) };
}
export function validarResultado(s: SerieEjercicio): string | null {
  const numero = (n: unknown, min: number, max: number, entero = false) => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max && (!entero || Number.isInteger(n));
  const carga = (x: unknown): x is {pesoKg:number;repeticiones:number} => Boolean(x && typeof x === 'object' && numero((x as any).pesoKg, 0, 1000) && numero((x as any).repeticiones, 1, 100, true));
  if (s.rol !== undefined && !['trabajo', 'calentamiento'].includes(s.rol)) return 'Rol de serie inválido.';
  if (s.rir !== undefined && (!numero(s.rir, 0, 10, true) || !esSimple(s))) return 'RIR debe ser un entero de 0 a 10 en una serie simple.';
  if (s.asistenciaKg !== undefined && (!numero(s.asistenciaKg, 0, 1000) || (s.modalidad && !['repeticiones','lados'].includes(s.modalidad)))) return 'La asistencia debe ser una carga positiva separada en series simples o por lado.';
  if (s.estado !== undefined && !['realizada', 'fallida'].includes(s.estado)) return 'Estado de resultado inválido.';
  if (!s.modalidad || s.modalidad === 'repeticiones') {
    if (!numero(s.pesoKg, 0, 1000) || !numero(s.repeticiones, s.estado === 'fallida' ? 0 : 1, 100, true)) return 'Revisá peso y repeticiones; cero exige intento fallido explícito.';
    if (s.segundos !== undefined || s.tramos !== undefined || s.izquierda !== undefined || s.derecha !== undefined || s.distanciaMetros !== undefined || s.cerrada !== undefined) return 'Resultado con modalidades mezcladas.';
  } else if (s.modalidad === 'tiempo' || s.modalidad === 'cardio') {
    if (!numero(s.segundos, 1, 86400) || s.repeticiones !== undefined || s.tramos !== undefined || s.izquierda !== undefined || s.derecha !== undefined || s.estado === 'fallida' || (s.pesoKg !== undefined && !numero(s.pesoKg, 0, 1000))) return 'Ingresá una duración real válida, sin repeticiones.';
    if (s.modalidad === 'tiempo' && [s.distanciaMetros,s.velocidadKmh,s.inclinacionPorcentaje,s.resistenciaNivel].some(x => x !== undefined)) return 'Los campos de cardio requieren modalidad cardio.';
    if (s.distanciaMetros !== undefined && !numero(s.distanciaMetros, 0, 1000000)) return 'Distancia inválida.';
    if (s.velocidadKmh !== undefined && !numero(s.velocidadKmh, 0, 200)) return 'Velocidad inválida.';
    if (s.inclinacionPorcentaje !== undefined && !numero(s.inclinacionPorcentaje, -30, 100)) return 'Inclinación inválida.';
    if (s.resistenciaNivel !== undefined && !numero(s.resistenciaNivel, 0, 10000)) return 'Nivel de resistencia inválido.';
  } else if (s.modalidad === 'lados') {
    if (typeof s.cerrada !== 'boolean' || (!s.izquierda && !s.derecha) || (s.izquierda && !carga(s.izquierda)) || (s.derecha && !carga(s.derecha)) || s.repeticiones !== undefined || s.pesoKg !== undefined || s.tramos !== undefined || s.segundos !== undefined || s.estado === 'fallida') return 'Anotá al menos un lado, sin completar automáticamente el faltante.';
  } else if (s.modalidad === 'tramos') {
    if (typeof s.cerrada !== 'boolean' || !Array.isArray(s.tramos) || !s.tramos.length || s.tramos.length > 30 || s.pesoKg !== undefined || s.repeticiones !== undefined || s.segundos !== undefined || s.izquierda !== undefined || s.derecha !== undefined || s.estado === 'fallida') return 'Dropset inválido.';
    const ids = new Set<string>();
    for (let i = 0; i < s.tramos.length; i++) { const t = s.tramos[i]; if (!carga(t) || typeof t.id !== 'string' || !t.id || t.id.length > 100 || ids.has(t.id) || !Number.isFinite(Date.parse(t.registradaEn)) || (i && t.pesoKg >= s.tramos[i-1].pesoKg)) return 'Cada tramo necesita ID, fecha y carga descendente, con repeticiones completas.'; ids.add(t.id); }
  } else return 'Modalidad de resultado no compatible.';
  if (s.modalidad !== 'cardio' && [s.distanciaMetros,s.velocidadKmh,s.inclinacionPorcentaje,s.resistenciaNivel].some(x => x !== undefined)) return 'Campos de cardio incompatibles.';
  return null;
}
