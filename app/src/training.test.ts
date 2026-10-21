import { test } from 'node:test';
import assert from 'node:assert/strict';
import { corregirSerie, crearSesion, recuperarRegistroActual, registrarSerie } from './training.ts';
import type { RegistroActual } from './training.ts';
import { diasRutina } from './rutina.ts';

const vacio = (): RegistroActual => ({ version: 3, entrenamientos: [] });

test('las tres plantillas preservan los ejercicios, objetivos y notas de la referencia', () => {
  assert.deepEqual(diasRutina.map(dia => dia.ejercicios.length), [9, 8, 8]);
  assert.deepEqual(diasRutina.map(dia => dia.ejercicios.reduce((total, ejercicio) => total + (ejercicio.seriesObjetivo ?? 0), 0)), [33, 31, 31]);
  assert.equal(diasRutina[0].ejercicios[0].nombre, 'Press plano');
  assert.equal(diasRutina[0].ejercicios[0].repeticionesObjetivo, 10);
  assert.equal(diasRutina[0].ejercicios.find(e => e.nombre === 'Press Hammer')?.notas, 'Biserie con flexiones');
  for (const dia of diasRutina) {
    const registro = crearSesion(vacio(), dia.id, '2026-10-20', 'Prueba', dia);
    assert.equal(registro.entrenamientos[0].series.length, 0);
    assert.equal(registro.entrenamientos[0].ejercicios.length, dia.ejercicios.length);
  }
});

test('la sesión conserva una copia de objetivos y nombres aunque cambie la plantilla', () => {
  const plantilla = structuredClone(diasRutina[0]);
  const registro = crearSesion(vacio(), 'a', '2026-10-20', 'Pecho', plantilla);
  plantilla.ejercicios[0].nombre = 'Nombre futuro';
  plantilla.ejercicios[0].seriesObjetivo = 6;
  plantilla.titulo = 'Rutina futura';
  assert.equal(registro.entrenamientos[0].ejercicios[0].nombre, 'Press plano');
  assert.equal(registro.entrenamientos[0].ejercicios[0].seriesObjetivo, 4);
  assert.equal(registro.entrenamientos[0].rutinaOrigen?.titulo, diasRutina[0].titulo);
});

test('las series quedan aisladas por ejercicio y sesión sin imponer el objetivo como límite', () => {
  const a = crearSesion(vacio(), 'a', '2026-10-20', 'Mañana', diasRutina[0]);
  const b = crearSesion(a, 'b', '2026-10-21', 'Otro día', diasRutina[0]);
  const e1 = diasRutina[0].ejercicios[0].id;
  const e2 = diasRutina[0].ejercicios[1].id;
  let registro = registrarSerie(b, 'a', e1, { id: 's1', pesoKg: 40, repeticiones: 8 });
  registro = registrarSerie(registro, 'a', e2, { id: 's2', pesoKg: 30, repeticiones: 10 });
  for (let i = 0; i < 4; i++) registro = registrarSerie(registro, 'a', e1, { id: `extra-${i}`, pesoKg: 35, repeticiones: 6 });
  assert.equal(registro.entrenamientos.find(s => s.id === 'a')?.series.filter(s => s.ejercicioId === e1).length, 5);
  assert.equal(registro.entrenamientos.find(s => s.id === 'a')?.series.filter(s => s.ejercicioId === e2).length, 1);
  assert.equal(registro.entrenamientos.find(s => s.id === 'b')?.series.length, 0);
  assert.equal(b.entrenamientos.find(s => s.id === 'a')?.series.length, 0);
  assert.throws(() => registrarSerie(registro, 'a', 'ejercicio-inexistente', { id: 'x', pesoKg: 10, repeticiones: 5 }));
  assert.throws(() => registrarSerie(registro, 'b', e1, { id: 's1', pesoKg: 10, repeticiones: 5 }));
});

test('migra sesiones v2 y listas v1 sin inventar objetivos, fechas ni perder identificadores', () => {
  const anterior = JSON.stringify({ version: 2, entrenamientos: [{ id: 'antigua', fecha: '2026-10-19', nombre: 'Anterior', series: [{ id: 'serie-antigua', pesoKg: 42.5, repeticiones: 8 }] }] });
  const registro = recuperarRegistroActual(null, anterior, null);
  const sesion = registro.entrenamientos[0];
  assert.equal(sesion.id, 'antigua');
  assert.equal(sesion.fecha, '2026-10-19');
  assert.equal(sesion.ejercicios[0].nombre, 'Press de banca');
  assert.equal(sesion.ejercicios[0].seriesObjetivo, null);
  assert.deepEqual(sesion.series[0], { id: 'serie-antigua', pesoKg: 42.5, repeticiones: 8, ejercicioId: 'press-banca' });
  const v1 = recuperarRegistroActual(null, null, '[{"id":"v1","pesoKg":40,"repeticiones":10}]');
  assert.equal(v1.entrenamientos[0].fecha, null);
  assert.throws(() => registrarSerie(v1, 'registro-anterior-v1', 'press-banca', { id: 'nueva', pesoKg: 10, repeticiones: 5 }));
  assert.deepEqual(recuperarRegistroActual('{"version":3,"entrenamientos":[]}', 'v2 roto', 'v1 roto'), vacio());
  assert.throws(() => recuperarRegistroActual('v3 roto', anterior, null));
});

test('recupera copias completas y rechaza referencias, duplicados y objetivos corruptos', () => {
  let registro = crearSesion(vacio(), 'a', '2026-10-20', 'Pecho', diasRutina[0]);
  registro = registrarSerie(registro, 'a', diasRutina[0].ejercicios[0].id, { id: 's', pesoKg: 40, repeticiones: 10 });
  assert.deepEqual(recuperarRegistroActual(JSON.stringify(registro), null, null), registro);
  const invalidos = [
    (r: RegistroActual) => { r.entrenamientos[0].series[0].ejercicioId = 'inexistente'; },
    (r: RegistroActual) => { r.entrenamientos[0].ejercicios[0].seriesObjetivo = -1; },
    (r: RegistroActual) => { r.entrenamientos[0].ejercicios[0].seriesObjetivo = null; },
    (r: RegistroActual) => { r.entrenamientos[0].ejercicios.push({ ...r.entrenamientos[0].ejercicios[0] }); },
    (r: RegistroActual) => { r.entrenamientos[0].series.push({ ...r.entrenamientos[0].series[0] }); },
  ];
  for (const alterar of invalidos) {
    const copia = structuredClone(registro);
    alterar(copia);
    assert.throws(() => recuperarRegistroActual(JSON.stringify(copia), null, null));
  }
});

test('una sesión sin rutina mantiene la alternativa inicial de press de banca', () => {
  const registro = crearSesion(vacio(), 'a', '2026-10-20', 'Libre', null);
  assert.equal(registro.entrenamientos[0].ejercicios.length, 1);
  assert.equal(registro.entrenamientos[0].ejercicios[0].nombre, 'Press de banca');
  assert.equal(registro.entrenamientos[0].rutinaOrigen, null);
  assert.throws(() => crearSesion(registro, 'a', '2026-10-20', 'Duplicada', null));
  assert.throws(() => crearSesion(vacio(), 'x', '2026-02-30', 'Fecha inválida', null));
});

test('corregir conserva identidad, objetivos y series ajenas sin agregar registros', () => {
  const ejercicio = diasRutina[0].ejercicios[0].id;
  const otroEjercicio = diasRutina[0].ejercicios[1].id;
  let registro = crearSesion(vacio(), 'a', '2026-10-20', 'Pecho', diasRutina[0]);
  registro = crearSesion(registro, 'b', '2026-10-19', 'Otro día', diasRutina[0]);
  registro = registrarSerie(registro, 'a', ejercicio, { id: 's1', pesoKg: 40, repeticiones: 10 });
  registro = registrarSerie(registro, 'a', ejercicio, { id: 's2', pesoKg: 42.5, repeticiones: 8 });
  registro = registrarSerie(registro, 'a', otroEjercicio, { id: 's3', pesoKg: 30, repeticiones: 12 });
  registro = registrarSerie(registro, 'b', ejercicio, { id: 's4', pesoKg: 50, repeticiones: 6 });
  const original = structuredClone(registro);
  const corregido = corregirSerie(registro, 'a', ejercicio, 's1', { pesoKg: 45, repeticiones: 9 });
  const antes = original.entrenamientos.find(item => item.id === 'a')!;
  const despues = corregido.entrenamientos.find(item => item.id === 'a')!;
  assert.equal(corregido.version, 3);
  assert.equal(despues.series.length, antes.series.length);
  assert.deepEqual(despues.series[0], { ...antes.series[0], pesoKg: 45, repeticiones: 9 });
  assert.deepEqual(despues.series.slice(1), antes.series.slice(1));
  assert.deepEqual(despues.ejercicios, antes.ejercicios);
  assert.deepEqual(despues.rutinaOrigen, antes.rutinaOrigen);
  assert.equal(despues.fecha, antes.fecha);
  assert.deepEqual(corregido.entrenamientos.find(item => item.id === 'b'), original.entrenamientos.find(item => item.id === 'b'));
  assert.deepEqual(registro, original);
  assert.deepEqual(recuperarRegistroActual(JSON.stringify(corregido), null, null), corregido);
});

test('rechaza correcciones inválidas o de una serie fuera del contexto seleccionado', () => {
  const ejercicio = diasRutina[0].ejercicios[0].id;
  const otroEjercicio = diasRutina[0].ejercicios[1].id;
  let registro = crearSesion(vacio(), 'a', '2026-10-20', 'Pecho', diasRutina[0]);
  registro = crearSesion(registro, 'b', '2026-10-21', 'Otro entrenamiento', diasRutina[0]);
  registro = registrarSerie(registro, 'a', ejercicio, { id: 's1', pesoKg: 40, repeticiones: 10 });
  const valido = { pesoKg: 45, repeticiones: 9 };
  assert.throws(() => corregirSerie(registro, 'inexistente', ejercicio, 's1', valido));
  assert.throws(() => corregirSerie(registro, 'b', ejercicio, 's1', valido));
  assert.throws(() => corregirSerie(registro, 'a', otroEjercicio, 's1', valido));
  assert.throws(() => corregirSerie(registro, 'a', ejercicio, 'inexistente', valido));
  for (const cambios of [{ pesoKg: -1, repeticiones: 10 }, { pesoKg: NaN, repeticiones: 10 }, { pesoKg: 40, repeticiones: 0 }, { pesoKg: 40, repeticiones: 2.5 }]) {
    assert.throws(() => corregirSerie(registro, 'a', ejercicio, 's1', cambios));
  }
  assert.equal(registro.entrenamientos.find(item => item.id === 'a')!.series[0].pesoKg, 40);
});

test('corrige series recuperadas de v2 sin cambiar su identidad y protege registros sin fecha', () => {
  const textoV2 = '{"version":2,"entrenamientos":[{"id":"antigua","fecha":"2026-10-19","nombre":"Anterior","series":[{"id":"s-v2","pesoKg":40,"repeticiones":10}]}]}';
  const recuperado = recuperarRegistroActual(null, textoV2, null);
  const corregido = corregirSerie(recuperado, 'antigua', 'press-banca', 's-v2', { pesoKg: 42.5, repeticiones: 8 });
  assert.deepEqual(corregido.entrenamientos[0].series[0], { id: 's-v2', pesoKg: 42.5, repeticiones: 8, ejercicioId: 'press-banca' });
  assert.equal(corregido.entrenamientos[0].ejercicios[0].seriesObjetivo, null);
  const sinFecha = recuperarRegistroActual(null, null, '[{"id":"s-v1","pesoKg":40,"repeticiones":10}]');
  assert.throws(() => corregirSerie(sinFecha, 'registro-anterior-v1', 'press-banca', 's-v1', { pesoKg: 42.5, repeticiones: 8 }));
});
