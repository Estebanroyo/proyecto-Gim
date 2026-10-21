import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analizarImportacion, crearRespaldo, leerRespaldo, limiteRespaldoBytes } from './backup.ts';
import { corregirSerie, crearSesion, registrarSerie } from './training.ts';
import type { RegistroActual } from './training';

const vacio = (): RegistroActual => ({ version: 3, entrenamientos: [] });
function ejemplo(id: string) {
  const creado = crearSesion(vacio(), id, '2026-10-20', `Sesión ${id}`, null);
  return registrarSerie(creado, id, 'press-banca', { id: `serie-${id}`, pesoKg: 40, repeticiones: 10 });
}

test('el respaldo recupera identidad, objetivos y resultados con formato explícito', () => {
  const registro = ejemplo('a');
  const texto = crearRespaldo(registro, '2026-10-20T12:00:00.000Z');
  const archivo = JSON.parse(texto);
  assert.equal(archivo.aplicacion, 'gim-bitacora');
  assert.equal(archivo.formatoRespaldo, 1);
  assert.equal(archivo.exportadoEn, '2026-10-20T12:00:00.000Z');
  assert.deepEqual(leerRespaldo(texto), registro);
});

test('rechaza archivos incompatibles, grandes o con referencias inválidas', () => {
  for (const texto of ['no JSON', 'null', '{}', '{"aplicacion":"otra"}', ' '.repeat(limiteRespaldoBytes + 1)]) {
    assert.throws(() => leerRespaldo(texto));
  }
  const archivo = JSON.parse(crearRespaldo(ejemplo('a')));
  archivo.datos.entrenamientos[0].series[0].ejercicioId = 'ejercicio inexistente';
  assert.throws(() => leerRespaldo(JSON.stringify(archivo)));
  archivo.formatoRespaldo = 99;
  assert.throws(() => leerRespaldo(JSON.stringify(archivo)));
});

test('agrega sesiones faltantes sin borrar existentes y evita duplicar al reimportar', () => {
  const actual = ejemplo('a');
  const entrante = ejemplo('b');
  const copia = structuredClone(actual);
  const analisis = analizarImportacion(actual, entrante);
  assert.equal(analisis.nuevas, 1);
  assert.equal(analisis.conflictos.length, 0);
  assert.deepEqual(analisis.registro.entrenamientos.map(sesion => sesion.id), ['b', 'a']);
  assert.deepEqual(actual, copia);
  const repetido = analizarImportacion(analisis.registro, entrante);
  assert.equal(repetido.nuevas, 0);
  assert.equal(repetido.identicas, 1);
  assert.equal(repetido.registro.entrenamientos.length, 2);
});

test('una copia vieja de una sesión corregida bloquea toda la importación', () => {
  const viejo = ejemplo('a');
  const actual = corregirSerie(viejo, 'a', 'press-banca', 'serie-a', { pesoKg: 45, repeticiones: 9 });
  const entrante: RegistroActual = { version: 3, entrenamientos: [...viejo.entrenamientos, ...ejemplo('b').entrenamientos] };
  const analisis = analizarImportacion(actual, entrante);
  assert.equal(analisis.nuevas, 1);
  assert.equal(analisis.conflictos.length, 1);
  assert.deepEqual(analisis.registro, actual);
});

test('una serie repetida en otra sesión se trata como conflicto', () => {
  const entrante = ejemplo('b');
  entrante.entrenamientos[0].series[0].id = 'serie-a';
  const actual = ejemplo('a');
  const analisis = analizarImportacion(actual, entrante);
  assert.equal(analisis.conflictos.length, 1);
  assert.deepEqual(analisis.registro, actual);
});

test('el orden de propiedades JSON no genera un conflicto de datos idénticos', () => {
  const actual = ejemplo('a');
  const sesion = actual.entrenamientos[0];
  const entrante: RegistroActual = { version: 3, entrenamientos: [{ series: sesion.series, ejercicios: sesion.ejercicios, rutinaOrigen: sesion.rutinaOrigen, nombre: sesion.nombre, fecha: sesion.fecha, id: sesion.id }] };
  const analisis = analizarImportacion(actual, entrante);
  assert.equal(analisis.identicas, 1);
  assert.equal(analisis.conflictos.length, 0);
});
