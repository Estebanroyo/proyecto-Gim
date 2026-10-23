import type { EjercicioPlan, RegistroActual, Sesion } from './training';
import { pendiente } from './execution';
import { realizadas } from './execution';
import { objetivosDe } from './prescription';
import { copiarEjercicioParaSesion } from './training';
function editar(r: RegistroActual, id: string, fn: (s: Sesion) => Sesion): RegistroActual {
  const s = r.entrenamientos.find(x => x.id === id);
  if (!s?.fecha || s.finalizadaEn) throw new Error('Elegí una sesión abierta.');
  return { ...r, entrenamientos: r.entrenamientos.map(x => x.id === id ? fn(x) : x) };
}
function sinSerieAbierta(s: Sesion, ids: Set<string>) {
  if (s.series.some(x => ids.has(x.ejercicioId) && x.cerrada === false)) throw new Error('Cerrá la serie abierta antes de omitir o sustituir lo pendiente.');
}
export function agregarCalentamiento(r: RegistroActual, sid: string, eid: string) {
  return editar(r, sid, s => {
    const e=s.ejercicios.find(x=>x.id===eid);
    if(!e || !pendiente(s,e) || e.modalidad && e.modalidad!=='repeticiones' || e.seriesObjetivo===null) throw new Error('Agregá calentamientos a un ejercicio simple con objetivos pendientes.');
    sinSerieAbierta(s,new Set([eid]));
    const objetivos=e.objetivosSerie?structuredClone(e.objetivosSerie):objetivosDe(e).map(o=>({...o,id:crypto.randomUUID()}));
    if(objetivos.length>=100)throw new Error('Máximo 100 objetivos por ejercicio.');
    objetivos.splice(realizadas(s,eid).length,0,{id:crypto.randomUUID(),repsMin:10,repsMax:10,rol:'calentamiento'});
    return {...s,ejercicios:s.ejercicios.map(x=>x.id===eid?{...x,objetivosSerie:objetivos,seriesObjetivo:objetivos.length,repeticionesObjetivo:objetivos[0].repsMin??null}:x)};
  });
}
export function posponer(r: RegistroActual, sid: string, eid: string, valor: boolean) {
  return editar(r, sid, s => {
    const e = s.ejercicios.find(e => e.id === eid);
    if (!e || !pendiente(s, e)) throw new Error('Ese ejercicio no tiene turnos pendientes disponibles.');
    return { ...s, pospuestos: valor ? [...new Set([...(s.pospuestos ?? []), eid])] : (s.pospuestos ?? []).filter(id => id !== eid) };
  });
}
export function reordenar(r: RegistroActual, sid: string, eid: string, paso: number) {
  return editar(r, sid, s => {
    const a = [...s.ejercicios], i = a.findIndex(e => e.id === eid);
    if (i < 0 || i + paso < 0 || i + paso >= a.length) throw new Error('No se puede mover a esa posición.');
    [a[i], a[i + paso]] = [a[i + paso], a[i]];
    return { ...s, ejercicios: a };
  });
}
export function omitirEjercicio(r: RegistroActual, sid: string, eid: string) {
  return editar(r, sid, s => {
    const e = s.ejercicios.find(e => e.id === eid);
    if (!e || !pendiente(s, e)) throw new Error('No hay turnos pendientes para omitir.');
    sinSerieAbierta(s, new Set([eid]));
    return { ...s, pospuestos: s.pospuestos?.filter(id => id !== eid), omisiones: [...(s.omisiones ?? []).filter(o => o.ejercicioId !== eid), { ejercicioId: eid, motivo: 'usuario' }] };
  });
}
export function restaurarPendiente(r: RegistroActual, sid: string, eid: string) {
  return editar(r, sid, s => {
    if (s.omisiones?.some(o => o.ejercicioId === eid && o.motivo === 'sustituido')) throw new Error('La sustitución conserva ambos registros; no se revierte automáticamente.');
    return { ...s, omisiones: s.omisiones?.filter(o => o.ejercicioId !== eid) };
  });
}
export function versionCorta(r: RegistroActual, sid: string) {
  return editar(r, sid, s => {
    const ids = new Set(s.ejercicios.filter(e => e.omitible && pendiente(s, e)).map(e => e.id));
    for (const g of s.grupos ?? []) if (g.miembros.some(id => ids.has(id))) g.miembros.forEach(id => { const e = s.ejercicios.find(e => e.id === id); if (e && pendiente(s, e)) ids.add(id); });
    if (!ids.size) throw new Error('La rutina no tiene bloques pendientes marcados para omitir.');
    sinSerieAbierta(s, ids);
    return { ...s, pospuestos: s.pospuestos?.filter(id => !ids.has(id)), omisiones: [...(s.omisiones ?? []).filter(o => !ids.has(o.ejercicioId)), ...Array.from(ids, id => ({ ejercicioId: id, motivo: 'version-corta' as const }))] };
  });
}
export function sustituir(r: RegistroActual, sid: string, eid: string, alternativa: EjercicioPlan) {
  return editar(r, sid, s => {
    const original = s.ejercicios.find(e => e.id === eid);
    if (!original?.alternativas?.some(a => a.id === alternativa.id) || !pendiente(s, original)) throw new Error('Elegí una alternativa preparada para un ejercicio pendiente.');
    if (s.grupos?.some(g => g.miembros.includes(eid)) && alternativa.modalidad && alternativa.modalidad !== 'repeticiones') throw new Error('Los grupos actuales admiten peso y repeticiones. Prepará una alternativa simple para este grupo.');
    sinSerieAbierta(s, new Set([eid]));
    const { alternativas: _, ...base } = structuredClone(alternativa);
    const nuevo = copiarEjercicioParaSesion({ ...base, id: crypto.randomUUID() });
    return { ...s, ejercicios: [...s.ejercicios, nuevo], pospuestos: s.pospuestos?.filter(id => id !== eid), omisiones: [...(s.omisiones ?? []).filter(o => o.ejercicioId !== eid), { ejercicioId: eid, motivo: 'sustituido' }], sustituciones: [...(s.sustituciones ?? []), { originalId: eid, nuevoId: nuevo.id, realizadaEn: new Date().toISOString() }], grupos: s.grupos?.map(g => g.miembros.includes(eid) ? { ...g, miembros: g.miembros.map(id => id === eid ? nuevo.id : id), rondas: Math.max(g.rondas, nuevo.seriesObjetivo ?? 0) } : g) };
  });
}
