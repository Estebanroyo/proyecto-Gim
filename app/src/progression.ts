import { fechaLocal } from './workout';
import type { EjercicioPlan, RegistroActual, RutinaDia, Sesion } from './training';
import { esSimple } from './execution';
import { mismoEjercicio,criterioComparable } from './progress';
import { objetivosDe } from './prescription';
export function propuestaProgresion(registro:RegistroActual,rutina:RutinaDia,e:EjercicioPlan):{razon?:string;hecho?:string;pesoKg?:number;sesionId?:string;fecha?:string}{
 const p=e.progresion;if(!p)return {razon:'Regla desactivada.'};if(!e.varianteId||!e.criterioPeso||!e.criterioReps||e.modalidad&&e.modalidad!=='repeticiones')return {razon:'Declarás variante, criterio de peso y de repeticiones antes de usar una regla para series simples.'};
 const referencia:Sesion={id:'futuro',fecha:'9999-12-31',nombre:rutina.titulo,rutinaOrigen:{id:rutina.id,titulo:rutina.titulo},ejercicios:rutina.ejercicios,series:[]};
 const sesiones=registro.entrenamientos.filter(s=>s.finalizadaEn&&s.fecha&&s.fecha<=fechaLocal()&&mismoEjercicio(s,referencia,e)&&criterioComparable(s,e)).sort((a,b)=>b.fecha!.localeCompare(a.fecha!));
 const s=sesiones[0];if(!s)return {razon:'No hay una sesión finalizada con variante/equipo/criterio compatibles.'};
 if(s.omisiones?.some(o=>o.ejercicioId===e.id))return {razon:'El último entrenamiento compatible dejó parte del ejercicio omitida.'};
 const todas=s.series.filter(x=>x.ejercicioId===e.id);const trabajo=todas.filter(esSimple).filter(x=>x.rol==='trabajo');
 const fuente=s.ejercicios.find(x=>x.id===e.id)!;const objetivos=objetivosDe(fuente).filter(o=>o.rol==='trabajo');
 if(trabajo.length!==p.series||objetivos.length!==p.series||trabajo.some(x=>x.estado==='fallida'||x.asistenciaKg!==undefined||!x.objetivoId)||objetivos.some(o=>o.repsMin!==p.repsMin||o.repsMax!==p.repsMax)||todas.some(x=>x.cerrada===false))return {razon:'Faltan las series de trabajo completas del rango elegido, o hay asistencia/fallos/datos sin vínculo.'};
 const peso=trabajo[0].pesoKg;if(!trabajo.every(x=>x.pesoKg===peso&&x.repeticiones>=p.repsMax))return {razon:'Las series consideradas todavía no alcanzaron juntas el límite superior con la misma carga.'};
 const futuras=objetivosDe(e).filter(o=>(o.rol??'trabajo')==='trabajo');if(futuras.length!==p.series)return {razon:'La cantidad de objetivos de trabajo del plan futuro no coincide con la regla.'};
 const nuevo=Math.round((peso+p.incrementoKg)*100)/100;if(nuevo>1000)return {razon:'El incremento excede el límite de carga del registro.'};
 if(futuras.every(o=>o.pesoKg===nuevo))return {razon:'El plan futuro ya incorpora este objetivo.'};
 return {hecho:`${p.series} series de trabajo alcanzaron ${p.repsMax} reps o más a ${peso.toLocaleString('es-AR')} kg.`,pesoKg:nuevo,sesionId:s.id,fecha:s.fecha!};
}
export function aceptarProgresion(registro:RegistroActual,rutina:RutinaDia,e:EjercicioPlan):RegistroActual{
 const propuesta=propuestaProgresion(registro,rutina,e);if(propuesta.pesoKg===undefined)throw new Error(propuesta.razon??'No hay propuesta suficiente.');
 const objetivos=objetivosDe(e).map(o=>({...o,id:e.objetivosSerie?o.id:crypto.randomUUID(),rol:o.rol??'trabajo' as const,...((o.rol??'trabajo')==='trabajo'?{pesoKg:propuesta.pesoKg,repsMin:e.progresion!.repsMin,repsMax:e.progresion!.repsMax}:{})}));
 const nueva={...rutina,ejercicios:rutina.ejercicios.map(x=>x.id===e.id?{...x,objetivosSerie:objetivos,seriesObjetivo:objetivos.length,repeticionesObjetivo:objetivos[0].repsMin??null}:x)};
 const rutinas=registro.rutinas??[];return {...registro,rutinas:rutinas.some(r=>r.id===rutina.id)?rutinas.map(r=>r.id===rutina.id?nueva:r):[...rutinas,nueva]};
}
