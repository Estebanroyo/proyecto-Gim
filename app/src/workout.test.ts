import { test } from 'node:test';
import assert from 'node:assert/strict';
import { agregarSerie, crearEntrenamiento, esFechaValida, fechaLocal, ordenarEntrenamientos, recuperarRegistro, recuperarSeries, validarSerie } from './workout.ts';
import type { Registro } from './workout.ts';

test('acepta una serie realizada y rechaza cantidades o pesos inválidos', () => {
  assert.equal(validarSerie(0, 1), null);
  assert.equal(validarSerie(40.5, 10), null);
  for (const reps of [0, -1, 2.5, 101, NaN, Infinity]) {
    assert.notEqual(validarSerie(40, reps), null);
  }
  for (const peso of [-1, 1001, NaN, Infinity]) {
    assert.notEqual(validarSerie(peso, 10), null);
  }
});

test('recupera series sin perder identidad ni convertir cadenas en números', () => {
  const series = [{ id: 'serie-1', pesoKg: 40, repeticiones: 10 }];
  assert.deepEqual(recuperarSeries(JSON.stringify(series)), series);
  assert.deepEqual(recuperarSeries(null), []);
  assert.throws(() => recuperarSeries('[{"id":"1","pesoKg":"40","repeticiones":10}]'));
});

test('rechaza almacenamiento malformado, datos inválidos e identificadores duplicados', () => {
  for (const texto of [
    'no es JSON', 'null', '{}', '[null]', '[1]',
    '[{"id":"","pesoKg":40,"repeticiones":10}]',
    '[{"id":"1","pesoKg":40,"repeticiones":0}]',
    '[{"id":"1","pesoKg":40,"repeticiones":10},{"id":"1","pesoKg":50,"repeticiones":5}]',
  ]) {
    assert.throws(() => recuperarSeries(texto));
  }
});

test('conserva registros anteriores sin inventar fechas y prioriza el formato nuevo', () => {
  const anterior = JSON.stringify([{ id: 'vieja-1', pesoKg: 40, repeticiones: 10 }]);
  const registro = recuperarRegistro(null, anterior);
  assert.equal(registro.entrenamientos[0].fecha, null);
  assert.equal(registro.entrenamientos[0].series[0].id, 'vieja-1');
  assert.equal(registro.entrenamientos[0].series[0].pesoKg, 40);
  assert.throws(() => agregarSerie(registro, 'registro-anterior-v1', { id: 'x', pesoKg: 10, repeticiones: 2 }));
  assert.deepEqual(recuperarRegistro('{"version":2,"entrenamientos":[]}', 'dato antiguo ilegible'), { version: 2, entrenamientos: [] });
  assert.throws(() => recuperarRegistro('dato nuevo roto', anterior));
});

test('aisla las series por entrenamiento aunque dos sesiones compartan fecha', () => {
  const vacio: Registro = { version: 2, entrenamientos: [] };
  const primero = crearEntrenamiento(vacio, 'a', '2026-10-20', 'Mañana');
  const segundo = crearEntrenamiento(primero, 'b', '2026-10-20', 'Tarde');
  const resultado = agregarSerie(segundo, 'a', { id: 's1', pesoKg: 40, repeticiones: 10 });
  assert.equal(resultado.entrenamientos.find(e => e.id === 'a')?.series.length, 1);
  assert.equal(resultado.entrenamientos.find(e => e.id === 'b')?.series.length, 0);
  assert.equal(segundo.entrenamientos.find(e => e.id === 'a')?.series.length, 0);
  assert.equal(vacio.entrenamientos.length, 0);
  assert.throws(() => agregarSerie(resultado, 'no-existe', { id: 's2', pesoKg: 40, repeticiones: 10 }));
  assert.throws(() => agregarSerie(resultado, 'b', { id: 's1', pesoKg: 40, repeticiones: 10 }));
});

test('valida fechas de calendario y usa fecha local sin desplazamiento UTC', () => {
  assert.equal(esFechaValida('2024-02-29'), true);
  for (const fecha of ['2026-02-29', '2026-02-30', '2026-13-01', '20/10/2026', '']) {
    assert.equal(esFechaValida(fecha), false);
  }
  assert.equal(fechaLocal(new Date(2026, 9, 20, 23, 30)), '2026-10-20');
  assert.throws(() => crearEntrenamiento({ version: 2, entrenamientos: [] }, 'a', '2026-02-30', 'Sesión'));
  assert.throws(() => crearEntrenamiento({ version: 2, entrenamientos: [] }, 'a', '2026-10-20', '   '));
});

test('recupera sesiones, ordena por fecha sin mutar y rechaza referencias inválidas', () => {
  const legado = recuperarRegistro(null, '[{"id":"v1","pesoKg":40,"repeticiones":10}]');
  const primero = crearEntrenamiento(legado, 'a', '2026-10-20', 'Martes');
  const segundo = crearEntrenamiento(primero, 'b', '2026-10-19', 'Lunes');
  assert.deepEqual(ordenarEntrenamientos(segundo.entrenamientos).map(e => e.id), ['a', 'b', 'registro-anterior-v1']);
  assert.equal(segundo.entrenamientos[0].id, 'b');
  assert.deepEqual(recuperarRegistro(JSON.stringify(segundo), null), segundo);
  for (const texto of [
    '{"version":3,"entrenamientos":[]}',
    '{"version":2,"entrenamientos":[null]}',
    '{"version":2,"entrenamientos":[{"id":"x","nombre":"X","fecha":"2026-02-30","series":[]}]}',
    '{"version":2,"entrenamientos":[{"id":"x","nombre":"X","fecha":"2026-10-20","series":[]},{"id":"x","nombre":"Y","fecha":"2026-10-20","series":[]}]}',
  ]) assert.throws(() => recuperarRegistro(texto, null));
});
