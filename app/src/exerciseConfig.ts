import type { EjercicioPlan, Modalidad } from './training';
export function cambiarModalidad(e:EjercicioPlan,modalidad:Modalidad):Partial<EjercicioPlan>{
  if((e.modalidad??'repeticiones')===modalidad)return {modalidad};
  const cantidad=e.seriesObjetivo??1;
  const temporal=modalidad==='tiempo'||modalidad==='cardio';
  return {modalidad,criterioReps:modalidad==="lados"?"por-lado":temporal?undefined:e.criterioReps,...(modalidad==="lados"?{criterioPeso:"por-lado" as const}:e.criterioPeso==="por-lado"?{criterioPeso:"total" as const}:{}),registrarRir:false,progresion:undefined,seriesObjetivo:cantidad,repeticionesObjetivo:temporal?null:10,objetivosSerie:Array.from({length:cantidad},()=>({id:crypto.randomUUID(),rol:'trabajo' as const,...(temporal?{segundos:60}:{repsMin:10,repsMax:10})}))};
}
