import SideProgress from './SideProgress';
import { esSimple, resumenConteos } from './execution';
import { useState } from 'react';
import type { EjercicioPlan, Sesion } from './training';
import { criterioComparable, mismoEjercicio } from './progress';
import { etiquetaPeso } from './weight';
import { fechaLocal, mostrarFecha } from './workout';

function Evolucion({ sesiones, sesion, ejercicio }: { sesiones: Sesion[]; sesion: Sesion; ejercicio: EjercicioPlan }) {
  const registros = sesiones.filter(s => s.fecha && sesion.fecha && s.fecha <= sesion.fecha && mismoEjercicio(s, sesion, ejercicio) && criterioComparable(s, ejercicio) && s.series.some(serie => serie.ejercicioId === ejercicio.id)).sort((a, b) => b.fecha!.localeCompare(a.fecha!));
  const pesos = [...new Set(registros.flatMap(s => s.series.filter(esSimple).filter(serie => serie.ejercicioId === ejercicio.id && serie.rol === 'trabajo' && serie.estado !== 'fallida' && serie.asistenciaKg === undefined).map(serie => serie.pesoKg)))].sort((a, b) => a - b);
  const [eleccion, setEleccion] = useState('');
  const peso = eleccion !== '' && pesos.includes(Number(eleccion)) ? Number(eleccion) : pesos[0];
  const filas = registros.flatMap(s => {
    const series = s.series.filter(esSimple).filter(serie => serie.ejercicioId === ejercicio.id && serie.pesoKg === peso && serie.rol === 'trabajo' && serie.estado !== 'fallida' && serie.asistenciaKg === undefined);
    return series.length ? [{ sesion: s, mejor: Math.max(...series.map(serie => serie.repeticiones)), cantidad: series.length }] : [];
  });
  return <div className="exercise-evolution">
    <p className="muted">{etiquetaPeso(ejercicio)} · Misma rutina, ejercicio, variante y equipo compatible, con el mismo criterio de peso. Hasta la fecha seleccionada. Para máquinas vinculadas a la biblioteca, declarás el equipo en Mis rutinas; el historial anterior no se vincula automáticamente.</p>
    {!ejercicio.criterioPeso ? <p className="muted">Este registro no declara cómo se contó el peso. No calculamos comparaciones numéricas con un criterio desconocido. Las próximas sesiones conservarán el criterio que elijas en Mis rutinas.</p> : !pesos.length ? <p className="muted">Todavía no hay series comparables. El historial original se conserva.</p> : <>
      <label>Comparar con el mismo peso<select value={peso} onChange={e => setEleccion(e.target.value)}>{pesos.map(p => <option key={p} value={p}>{p.toLocaleString('es-AR')} kg</option>)}</select></label>
      {filas.length >= 2 ? <p className="comparison-result">Mejor serie a {peso.toLocaleString('es-AR')} kg: <strong>{filas[1].mejor} → {filas[0].mejor} reps</strong> entre {mostrarFecha(filas[1].sesion.fecha)} y {mostrarFecha(filas[0].sesion.fecha)}.{!filas[0].sesion.finalizadaEn && ' El último registro sigue en curso.'}</p> : <p className="muted">Necesitás otra sesión con este mismo peso y criterio para comparar repeticiones.</p>}
      <div className="progress-table"><table><caption>Mejor serie con el peso elegido · últimas 8 sesiones disponibles</caption><thead><tr><th>Fecha</th><th>Reps</th><th>Series a este peso</th></tr></thead><tbody>{filas.slice(0, 8).map(f => <tr key={f.sesion.id}><td>{mostrarFecha(f.sesion.fecha)}{!f.sesion.finalizadaEn && <small>En curso</small>}</td><td>{f.mejor}</td><td>{f.cantidad}</td></tr>)}</tbody></table></div>
      <p className="muted">Más repeticiones en una serie a la misma carga es un dato comparable, no una evaluación global: técnica, descanso y esfuerzo pueden variar. Los registros con otro criterio o sin declarar quedan fuera.</p>
    </>}
  </div>;
}

export default function ProgressPanel({ sesiones, sesion, frecuencia }: { sesiones: Sesion[]; sesion: Sesion; frecuencia: Sesion[] }) {
  const [id, setId] = useState(sesion.ejercicios[0]?.id ?? '');
  const [abierto, setAbierto] = useState(false);
  const ejercicio = sesion.ejercicios.find(e => e.id === id) ?? sesion.ejercicios[0];
  const hoy = new Date();
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - ((hoy.getDay() + 6) % 7), 12);
  const semanas = Array.from({ length: 4 }, (_, i) => {
    const inicio = new Date(lunes); inicio.setDate(inicio.getDate() - i * 7);
    const fin = new Date(inicio); fin.setDate(fin.getDate() + 6);
    const desde = fechaLocal(inicio), hasta = fechaLocal(fin);
    const datos = frecuencia.filter(s => s.fecha && s.fecha >= desde && s.fecha <= hasta && s.fecha <= fechaLocal(hoy) && s.series.length > 0);
    const resumen = datos.map(resumenConteos);
    return { desde, hasta, dias: new Set(datos.map(s => s.fecha)).size, sesiones: datos.length, trabajo:resumen.reduce((n,c)=>n+c.trabajo,0),calentamiento:resumen.reduce((n,c)=>n+c.calentamiento,0),desconocidas:resumen.reduce((n,c)=>n+c.desconocidas,0) };
  });
  return <section className="card progress-panel"><h2>Tu evolución</h2>
    <p className="muted">Frecuencia del filtro de rutina actual. Solo cuentan fechas con al menos una serie guardada, también en sesiones parciales.</p>
    <div className="progress-table"><table><caption>Últimas 4 semanas · la actual está en curso</caption><thead><tr><th>Semana desde</th><th>Días entrenados</th><th>Sesiones</th><th>Trabajo / calentamiento</th><th>Rol desconocido</th></tr></thead><tbody>{semanas.map((s, i) => <tr key={s.desde}><td>{mostrarFecha(s.desde)}{i === 0 && <small>Semana actual</small>}</td><td>{s.dias}</td><td>{s.sesiones}</td><td>{s.trabajo} / {s.calentamiento}</td><td>{s.desconocidas}</td></tr>)}</tbody></table></div>
    <details className="quiet-details" onToggle={e => setAbierto(e.currentTarget.open)}><summary>Comparar resultados por ejercicio</summary>{abierto && ejercicio && <><label>Ejercicio del entrenamiento seleccionado<select value={ejercicio.id} onChange={e => setId(e.target.value)}>{sesion.ejercicios.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}</select></label>{ejercicio.modalidad === "lados" ? <SideProgress key={`${sesion.id}:${ejercicio.id}`} sesiones={sesiones} sesion={sesion} ejercicio={ejercicio}/> : <Evolucion key={`${sesion.id}:${ejercicio.id}`} sesiones={sesiones} sesion={sesion} ejercicio={ejercicio} />}</>}</details>
  </section>;
}
