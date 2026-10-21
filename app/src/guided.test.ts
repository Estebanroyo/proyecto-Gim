import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearSesion, recuperarRegistroActual, registrarSerie } from './training.ts';
import type { RegistroActual, RutinaDia } from './training';
import { ejercicioPendiente, finalizarSesion, guardarRutina, reabrirSesion, recuperarNavegacion, siguienteEjercicio, sugerirPeso, sumarPeso } from './guided.ts';
import { analizarImportacion, crearRespaldo, leerRespaldo } from './backup.ts';

const rutina: RutinaDia = { id: 'dia1', titulo: 'Día 1', ejercicios: [
  { id: 'press', nombre: 'Press', grupo: 'Pecho', seriesObjetivo: 2, repeticionesObjetivo: 10, notas: null },
  { id: 'remo', nombre: 'Remo', grupo: 'Espalda', seriesObjetivo: 1, repeticionesObjetivo: 12, notas: null },
] };
const vacio = (): RegistroActual => ({ version: 3, entrenamientos: [] });
const crear = () => crearSesion(vacio(), 'a', '2026-10-20', 'Día 1', rutina);

test('impide duplicar rutina y fecha, permite otras rutinas y otras fechas', () => {
  const r = crear();
  assert.throws(() => crearSesion(r, 'b', '2026-10-20', 'Otro nombre', rutina));
  assert.equal(crearSesion(r, 'b', '2026-10-21', 'Día 1', rutina).entrenamientos.length, 2);
  assert.equal(crearSesion(r, 'b', '2026-10-20', 'Día 2', { ...rutina, id: 'dia2' }).entrenamientos.length, 2);
});

test('sugiere primera serie anterior, nunca la última ni una sesión futura u otra rutina', () => {
  let r = registrarSerie(crear(), 'a', 'press', { id: 's1', pesoKg: 20, repeticiones: 10 });
  r = registrarSerie(r, 'a', 'press', { id: 's2', pesoKg: 40, repeticiones: 8 });
  r = crearSesion(r, 'b', '2026-10-22', 'Día 1', rutina);
  r = crearSesion(r, 'futuro', '2026-10-25', 'Futuro', rutina);
  r = registrarSerie(r, 'futuro', 'press', { id: 'sf', pesoKg: 90, repeticiones: 10 });
  r = crearSesion(r, 'otra', '2026-10-21', 'Otra', { ...rutina, id: 'dia2' });
  r = registrarSerie(r, 'otra', 'press', { id: 'so', pesoKg: 70, repeticiones: 10 });
  const b = r.entrenamientos.find(s => s.id === 'b')!;
  assert.equal(sugerirPeso(r, b, 'press').pesoKg, 20);
  assert.equal(sugerirPeso(r, b, 'remo').pesoKg, 0);
  r = registrarSerie(r, 'b', 'press', { id: 'sb', pesoKg: 25, repeticiones: 10 });
  assert.equal(sugerirPeso(r, r.entrenamientos.find(s => s.id === 'b')!, 'press').pesoKg, 25);
});

test('avanza por cantidad de series aunque las repeticiones sean menores al objetivo', () => {
  let r = registrarSerie(crear(), 'a', 'press', { id: 's1', pesoKg: 20, repeticiones: 10 });
  assert.equal(ejercicioPendiente(r.entrenamientos[0])?.id, 'press');
  r = registrarSerie(r, 'a', 'press', { id: 's2', pesoKg: 40, repeticiones: 8 });
  assert.equal(siguienteEjercicio(r.entrenamientos[0], 'press')?.id, 'remo');
  r = registrarSerie(r, 'a', 'remo', { id: 's3', pesoKg: 30, repeticiones: 6 });
  assert.equal(ejercicioPendiente(r.entrenamientos[0]), undefined);
  assert.equal(siguienteEjercicio(r.entrenamientos[0], 'remo'), undefined);
  assert.deepEqual(r.entrenamientos[0].series.map(s => s.id), ['s1', 's2', 's3']);
});

test('la navegación vuelve al último entrenamiento consultado aunque no sea el más reciente', () => {
  let r = crearSesion(crear(), 'b', '2026-10-22', 'Otro día', rutina);
  assert.deepEqual(recuperarNavegacion(r, JSON.stringify({ sesionId: 'a', ejercicioId: 'remo' })), { sesionId: 'a', ejercicioId: 'remo' });
  for (const texto of ['roto', 'null', '{"sesionId":"borrado"}']) assert.equal(recuperarNavegacion(r, texto).sesionId, 'b');
  r = registrarSerie(r, 'b', 'press', { id: 's1', pesoKg: 20, repeticiones: 10 });
  r = registrarSerie(r, 'b', 'press', { id: 's2', pesoKg: 20, repeticiones: 8 });
  assert.equal(recuperarNavegacion(r, null).ejercicioId, 'remo');
});

test('sumas exactas de 1,25, resta sin negativos y límite de carga', () => {
  assert.equal(sumarPeso('0', 1.25), '1.25');
  assert.equal(sumarPeso('1.25', 1.25), '2.5');
  assert.equal(sumarPeso('1,25', 5), '6.25');
  assert.equal(sumarPeso('0', -1.25), '0');
  assert.equal(sumarPeso('990', 20), '1000');
  assert.throws(() => sumarPeso('abc', 5));
});

test('editar y reordenar una rutina no modifica sesiones anteriores ni pierde identidades', () => {
  const r = crear();
  const cambiada = { ...structuredClone(rutina), titulo: 'Nueva versión' };
  cambiada.ejercicios.reverse();
  cambiada.ejercicios[0].seriesObjetivo = 4;
  const nuevo = guardarRutina(r, [rutina], cambiada);
  assert.deepEqual(nuevo.entrenamientos, r.entrenamientos);
  const siguiente = crearSesion(nuevo, 'b', '2026-10-21', cambiada.titulo, cambiada);
  assert.equal(siguiente.entrenamientos[0].ejercicios[0].id, 'remo');
  assert.equal(siguiente.entrenamientos[1].ejercicios[0].id, 'press');
  assert.deepEqual(siguiente.rutinas, [cambiada]);
  assert.throws(() => guardarRutina(r, [rutina], { ...cambiada, ejercicios: [] }));
  assert.throws(() => guardarRutina(r, [rutina], { ...cambiada, titulo: '' }));
});

test('finalización y reapertura conservan datos; no permite agregar a una sesión cerrada', () => {
  const fecha = '2026-10-20T14:00:00.000Z';
  assert.throws(() => finalizarSesion(crear(), 'a', fecha));
  const r = registrarSerie(crear(), 'a', 'press', { id: 's1', pesoKg: 21.25, repeticiones: 8, registradaEn: fecha });
  const cerrado = finalizarSesion(r, 'a', fecha);
  assert.equal(cerrado.entrenamientos[0].finalizadaEn, fecha);
  assert.throws(() => registrarSerie(cerrado, 'a', 'remo', { id: 's2', pesoKg: 20, repeticiones: 10 }));
  assert.deepEqual(reabrirSesion(cerrado, 'a'), r);
  assert.deepEqual(leerRespaldo(crearRespaldo(cerrado)), cerrado);
  const invalido = structuredClone(cerrado);
  invalido.entrenamientos[0].series[0].registradaEn = 'ayer';
  assert.throws(() => recuperarRegistroActual(JSON.stringify(invalido), null, null));
});

test('respalda catálogo y bloquea planes diferentes o rutina-fecha duplicada', () => {
  const r = guardarRutina(crear(), [rutina], rutina);
  assert.deepEqual(leerRespaldo(crearRespaldo(r)), r);
  const analisis = analizarImportacion(vacio(), r);
  assert.equal(analisis.rutinasNuevas, 1);
  assert.deepEqual(analisis.registro, r);
  assert.equal(analizarImportacion(r, r).rutinasNuevas, 0);
  const otro = crearSesion(vacio(), 'b', '2026-10-20', 'Misma rutina', rutina);
  assert.equal(analizarImportacion(r, otro).conflictos.length, 1);
  const diferente = guardarRutina(vacio(), [rutina], { ...rutina, titulo: 'Cambio' });
  assert.equal(analizarImportacion(r, diferente).conflictos.length, 1);
});
