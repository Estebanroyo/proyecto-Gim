import { test } from 'node:test';
import assert from 'node:assert/strict';
import { claveRegistroActual, crearSesion } from './training.ts';
import { claveEntrenamientos } from './workout.ts';
import { ConflictoRegistro, escribirRegistro, leerRegistro } from './storage.ts';
import type { Almacen } from './storage';

function memoria(entradas: [string, string][] = []) {
  const datos = new Map(entradas);
  let escrituras = 0;
  const almacen: Almacen = { getItem: clave => datos.get(clave) ?? null, setItem: (clave, texto) => { escrituras++; datos.set(clave, texto); } };
  return { datos, almacen, escrituras: () => escrituras };
}

test('leer y migrar en memoria no escribe ni altera las fuentes', () => {
  const texto = '{"version":2,"entrenamientos":[]}';
  const { almacen, datos, escrituras } = memoria([[claveEntrenamientos, texto]]);
  const base = leerRegistro(almacen);
  assert.equal(base.registro.version, 3);
  assert.equal(escrituras(), 0);
  const nuevo = crearSesion(base.registro, 'a', '2026-10-20', 'Prueba', null);
  const guardado = escribirRegistro(almacen, base, nuevo);
  assert.deepEqual(guardado.registro, nuevo);
  assert.equal(datos.get(claveEntrenamientos), texto);
  assert.equal(escrituras(), 1);
  assert.equal(datos.get(claveRegistroActual), guardado.textoBase);
});

test('rechaza cambios de otra pestaña y no reemplaza un registro nuevo', () => {
  const { almacen, datos, escrituras } = memoria();
  const base = leerRegistro(almacen);
  const otro = crearSesion(base.registro, 'otro', '2026-10-20', 'Otra pestaña', null);
  datos.set(claveRegistroActual, JSON.stringify(otro));
  const mio = crearSesion(base.registro, 'mio', '2026-10-20', 'Mi pestaña', null);
  assert.throws(() => escribirRegistro(almacen, base, mio), ConflictoRegistro);
  assert.deepEqual(JSON.parse(datos.get(claveRegistroActual)!), otro);
  assert.equal(escrituras(), 0);
});

test('una escritura fallida no cambia la instantánea y un dato inválido no se escribe', () => {
  const { almacen, escrituras } = memoria();
  const base = leerRegistro(almacen);
  const copia = structuredClone(base);
  const nuevo = crearSesion(base.registro, 'a', '2026-10-20', 'Prueba', null);
  assert.throws(() => escribirRegistro({ getItem: almacen.getItem, setItem: () => { throw new Error('sin espacio'); } }, base, nuevo));
  assert.deepEqual(base, copia);
  const invalido = structuredClone(nuevo);
  invalido.entrenamientos[0].fecha = 'fecha inválida';
  assert.throws(() => escribirRegistro(almacen, base, invalido));
  assert.equal(escrituras(), 0);
});

test('comprueba cambios en el formato anterior antes de la primera escritura migrada', () => {
  const { almacen, datos } = memoria([[claveEntrenamientos, '{"version":2,"entrenamientos":[]}']]);
  const base = leerRegistro(almacen);
  datos.set(claveEntrenamientos, '{"version":2,"entrenamientos":[],"cambio":true}');
  assert.throws(() => escribirRegistro(almacen, base, base.registro), ConflictoRegistro);
  assert.equal(datos.has(claveRegistroActual), false);
});
