import { catalogo, coincideBusqueda } from './catalog';
import type { RutinaDia, EjercicioPlan, Modalidad } from './training';
import { validarRutinas } from './training';
export const columnasCsv=['rutina','ejercicio','variante_id','personalizado','grupo','series','reps_min','reps_max','carga_kg','descanso_s','modalidad','duracion_s','equipo_id','equipo_nombre','criterio_peso','criterio_reps'];
export const ejemploCsv = [
  columnasCsv,
  ['Ejemplo ficticio','Press plano con barra','press-plano-barra','no','Pecho','3','8','12','','90','repeticiones','','','','total','totales'],
  ['Ejemplo ficticio','Plancha por tiempo','plancha-tiempo','no','Core','2','','','','60','tiempo','30','','','total','']
].map(f=>f.join(';')).join('\n')+'\n';export type VistaCsv={planes:RutinaDia[];errores:string[];ambiguas:{fila:number;nombre:string;ids:string[]}[]};
function celdas(texto:string):string[][]{
 if(texto.length>2*1024*1024)throw new Error('CSV demasiado grande.');const filas:string[][]=[],fila:string[]=[];let campo='',comillas=false;
 for(let i=0;i<texto.length;i++){const c=texto[i];if(c==='"'){if(comillas&&texto[i+1]==='"'){campo+='"';i++;}else if(!campo||comillas)comillas=!comillas;else throw new Error('Comillas inválidas en CSV.');}else if(c===';'&&!comillas){fila.push(campo);campo='';}else if((c==='\n'||c==='\r')&&!comillas){if(c==='\r'&&texto[i+1]==='\n')i++;fila.push(campo);if(fila.some(x=>x.trim()))filas.push([...fila]);fila.length=0;campo='';}else campo+=c;}
 if(comillas)throw new Error('Hay una celda con comillas sin cerrar.');fila.push(campo);if(fila.some(x=>x.trim()))filas.push(fila);if(filas.length>1001)throw new Error('Máximo 1000 filas de ejercicios.');return filas;
}
export function analizarCsv(texto:string,elecciones:Record<number,string>={}):VistaCsv{
 const filas=celdas(texto.replace(/^\uFEFF/,''));if(!filas.length)throw new Error('CSV vacío.');const encabezado=filas.shift()!.map(x=>x.trim());if(encabezado.length!==columnasCsv.length||encabezado.some((c,i)=>c!==columnasCsv[i]))throw new Error('Usá exactamente las columnas de la plantilla, separadas por punto y coma. No se descartan columnas desconocidas.');
 const planes=new Map<string,RutinaDia>(),errores:string[]=[],ambiguas:VistaCsv['ambiguas']=[];
 let objetivosTotales=0;
 filas.forEach((fila,indice)=>{const n=indice+2;try{
 if(fila.length!==columnasCsv.length)throw new Error('Cantidad de columnas incorrecta.');const d=Object.fromEntries(encabezado.map((k,i)=>[k,fila[i].trim()]));
 if(!d.rutina||d.rutina.length>60||!d.ejercicio||d.ejercicio.length>200)throw new Error('Nombre de rutina/ejercicio vacío o demasiado largo.');
 const id=elecciones[n]??d.variante_id;const v=catalogo.find(x=>x.id===id);if(id&&!v)throw new Error('Variante ID desconocida.');
 if(!id&&d.personalizado!=='si'){const candidatas=catalogo.filter(x=>coincideBusqueda(d.ejercicio,[x.nombre,...x.aliases]));ambiguas.push({fila:n,nombre:d.ejercicio,ids:candidatas.map(x=>x.id)});throw new Error('Elegí una variante o declaralo personalizado (si).');}
 if(d.personalizado&&!['si','no'].includes(d.personalizado))throw new Error('personalizado acepta si/no.');
 if(id&&d.personalizado==='si')throw new Error('Elegí una variante o un personalizado, sin declarar ambos.');
 const modo=(d.modalidad||'repeticiones') as Modalidad;if(!['repeticiones','tiempo','cardio'].includes(modo))throw new Error('La plantilla CSV admite repeticiones, tiempo y cardio; lados/tramos/grupos se configuran en el editor.');
 if(v&&(v.modalidad??'repeticiones')!==modo)throw new Error('Modalidad incompatible con la variante elegida.');
 const num=(k:string,min:number,max:number,opcional=false)=>{if(opcional&&!d[k])return undefined;const valor=Number(d[k]);if(!d[k]||!Number.isFinite(valor)||valor<min||valor>max)throw new Error('Revisá '+k+'; números decimales con punto y unidades indicadas en el encabezado.');return valor;};
 const series=num('series',1,100)!;if(!Number.isInteger(series))throw new Error('Series debe ser entero.');objetivosTotales+=series;if(objetivosTotales>5000)throw new Error('La importación supera 5000 objetivos; dividí el archivo.');const temporal=modo!=='repeticiones';
 const min=temporal?undefined:num('reps_min',1,100)!,max=temporal?undefined:num('reps_max',1,100)!;if(!temporal&&(!Number.isInteger(min)||!Number.isInteger(max)||min!>max!))throw new Error('Repeticiones enteras y mínimo no mayor a máximo.');
 if(temporal&&(d.reps_min||d.reps_max))throw new Error('Una duración no lleva repeticiones.');if(!temporal&&d.duracion_s)throw new Error('duracion_s requiere tiempo o cardio.');
 if(Boolean(d.equipo_id)!==Boolean(d.equipo_nombre))throw new Error('El equipo necesita ID y nombre, o ambos vacíos.');
 const peso=num('carga_kg',0,1000,true),descanso=num('descanso_s',0,3600,true),segundos=temporal?num('duracion_s',1,86400)!:undefined;
 if(descanso!==undefined&&!Number.isInteger(descanso))throw new Error('Descanso en segundos enteros.');
 if(d.criterio_peso&&!['total','por-mancuerna','lastre'].includes(d.criterio_peso))throw new Error('criterio_peso acepta total, por-mancuerna o lastre en esta plantilla.');
 if(d.criterio_reps&&!['totales','por-lado','alternadas-totales'].includes(d.criterio_reps))throw new Error('criterio_reps acepta totales, por-lado o alternadas-totales.');
 if(temporal&&d.criterio_reps)throw new Error('Una modalidad temporal no lleva criterio de repeticiones.');
 const e:EjercicioPlan={id:crypto.randomUUID(),nombre:v?.nombre??d.ejercicio,grupo:d.grupo||v?.grupo||'General',seriesObjetivo:series,repeticionesObjetivo:min??null,notas:null,criterioPeso:(d.criterio_peso || v?.criterioPeso || 'total') as EjercicioPlan['criterioPeso'],modalidad:modo,...(v?{varianteId:v.id}:{}),...(d.equipo_id?{equipoRef:{id:d.equipo_id,nombre:d.equipo_nombre}}:{}),objetivosSerie:Array.from({length:series},()=>({id:crypto.randomUUID(),rol:'trabajo',...(temporal?{segundos}:{repsMin:min!,repsMax:max!}),...(peso!==undefined?{pesoKg:peso}:{}),...(descanso!==undefined?{descansoSegundos:descanso}:{})}))};
 if(d.criterio_reps)e.criterioReps=d.criterio_reps as EjercicioPlan['criterioReps'];
 validarRutinas([{id:'fila-csv',titulo:d.rutina,ejercicios:[e]}]);
 const r=planes.get(d.rutina)??{id:crypto.randomUUID(),titulo:d.rutina,ejercicios:[]};r.ejercicios.push(e);planes.set(d.rutina,r);
 }catch(e){errores.push(`Fila ${n}: ${(e as Error).message}`);}});
 if(!errores.length)try{validarRutinas([...planes.values()]);}catch(e){errores.push((e as Error).message);}return {planes:[...planes.values()],errores,ambiguas};
}
const neutralizar=(s:string)=>/^[\s]*[=+\-@]/.test(s)?"'"+s:s;
export function exportarCsv(planes:RutinaDia[]):string{const filas=[columnasCsv];for(const r of planes)for(const e of r.ejercicios){const o=e.objetivosSerie?.[0];if((['lados','tramos'].includes(e.modalidad??'') || e.notas || e.montaje || e.registrarRir || e.progresion || e.omitible || o?.rol === 'calentamiento'||e.alternativas?.length||r.grupos?.length||e.objetivosSerie?.some(x=>JSON.stringify({...x,id:''})!==JSON.stringify({...o,id:''}))))throw new Error('Ese plan tiene detalles que CSV no representa. Exportalo como plan JSON para conservarlos.');filas.push([r.titulo,e.nombre,e.varianteId??'',e.varianteId?'no':'si',e.grupo,String(e.seriesObjetivo??''),String(o?.repsMin??e.repeticionesObjetivo??''),String(o?.repsMax??e.repeticionesObjetivo??''),String(o?.pesoKg??''),String(o?.descansoSegundos??e.descansoSegundos??''),e.modalidad??'repeticiones',String(o?.segundos??''),'','',e.criterioPeso??'total',e.criterioReps??'']);}return filas.map(f=>f.map(s=>'"'+neutralizar(s).replaceAll('"','""')+'"').join(';')).join('\n');}
