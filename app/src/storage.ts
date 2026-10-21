import { claveEntrenamientos, claveSeries } from './workout.ts';
import { claveRegistroActual, recuperarRegistroActual } from './training.ts';
import type { RegistroActual } from './training';

export type Almacen = Pick<Storage, 'getItem' | 'setItem'>;
export type Instantanea = {
  registro: RegistroActual;
  textoBase: string | null;
  v2: string | null;
  v1: string | null;
};

export class ConflictoRegistro extends Error {
  constructor() {
    super('El registro cambió en otra pestaña. Recargá antes de seguir para no reemplazar esos cambios.');
  }
}

export function leerRegistro(almacen: Almacen): Instantanea {
  const textoBase = almacen.getItem(claveRegistroActual);
  const v2 = textoBase === null ? almacen.getItem(claveEntrenamientos) : null;
  const v1 = textoBase === null && v2 === null ? almacen.getItem(claveSeries) : null;
  return { registro: recuperarRegistroActual(textoBase, v2, v1), textoBase, v2, v1 };
}

export function hayCambiosExternos(almacen: Almacen, base: Instantanea): boolean {
  return almacen.getItem(claveRegistroActual) !== base.textoBase || (base.textoBase === null && (
    almacen.getItem(claveEntrenamientos) !== base.v2 ||
    (base.v2 === null && almacen.getItem(claveSeries) !== base.v1)
  ));
}

export function escribirRegistro(almacen: Almacen, base: Instantanea, nuevo: RegistroActual): Instantanea {
  if (hayCambiosExternos(almacen, base)) throw new ConflictoRegistro();
  const texto = JSON.stringify(nuevo);
  const validado = recuperarRegistroActual(texto, null, null);
  almacen.setItem(claveRegistroActual, texto);
  return { ...base, registro: validado, textoBase: texto };
}
