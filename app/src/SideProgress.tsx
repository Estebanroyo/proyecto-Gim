import { useState } from 'react';
import type { EjercicioPlan, Sesion } from './training';
import { mismoEjercicio,criterioComparable } from './progress';
import { mostrarFecha } from './workout';
export default function SideProgress({sesiones,sesion,ejercicio}:{sesiones:Sesion[];sesion:Sesion;ejercicio:EjercicioPlan}){
 const [lado,setLado]=useState<'izquierda'|'derecha'>('izquierda'),[peso,setPeso]=useState('');
 const registros=sesiones.filter(s=>s.fecha&&sesion.fecha&&s.fecha<=sesion.fecha&&mismoEjercicio(s,sesion,ejercicio)&&criterioComparable(s,ejercicio)).sort((a,b)=>b.fecha!.localeCompare(a.fecha!));
 const pesos=[...new Set(registros.flatMap(s=>s.series.filter(x=>x.ejercicioId===ejercicio.id&&x.modalidad==='lados'&&x.cerrada&&x.rol==='trabajo'&&x.asistenciaKg===undefined).flatMap(x=>x[lado]?[x[lado]!.pesoKg]:[])))].sort((a,b)=>a-b);
 const eleccion=peso&&pesos.includes(Number(peso))?Number(peso):pesos[0];
 const filas=registros.flatMap(s=>{const datos=s.series.filter(x=>x.ejercicioId===ejercicio.id&&x.modalidad==='lados'&&x.cerrada&&x.rol==='trabajo'&&x.asistenciaKg===undefined&&x[lado]?.pesoKg===eleccion).map(x=>x[lado]!.repeticiones);return datos.length?[{s,reps:Math.max(...datos)}]:[];});
 return <div><label>Lado<select value={lado} onChange={e=>{setLado(e.target.value as typeof lado);setPeso('');}}><option value="izquierda">Izquierda</option><option value="derecha">Derecha</option></select></label>{!pesos.length?<p className="muted">No hay datos comparables de este lado, equipo y criterio. El lado faltante no se completa.</p>:<><label>Carga por lado · kg<select value={eleccion} onChange={e=>setPeso(e.target.value)}>{pesos.map(p=><option key={p} value={p}>{p}</option>)}</select></label><div className="progress-table"><table><caption>Mejor serie del lado elegido a igual carga · trabajo sin asistencia</caption><thead><tr><th>Fecha</th><th>Repeticiones</th></tr></thead><tbody>{filas.slice(0,8).map(f=><tr key={f.s.id}><td>{mostrarFecha(f.s.fecha)}</td><td>{f.reps}</td></tr>)}</tbody></table></div></>}</div>;
}
