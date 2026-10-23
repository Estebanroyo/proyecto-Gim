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
export class TransicionRegistro extends Error {
  constructor() { super('No se pudo conservar la copia previa a la actualización. El registro anterior sigue intacto; liberá espacio o prepará un respaldo antes de volver a guardar.'); }
}
export const claveCopiaPreviaV4 = 'gim.app.transicion-v4.original-v3';

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
  const validado = recuperarRegistroActual(JSON.stringify(nuevo), null, null);
  const texto = JSON.stringify(validado);
  if (base.textoBase && [3, 4].includes(JSON.parse(base.textoBase).version)) {
    try { almacen.setItem(JSON.parse(base.textoBase).version === 3 ? claveCopiaPreviaV4 : "gim.app.transicion-v5.original-v4", base.textoBase); }
    catch { throw new TransicionRegistro(); }
    if (hayCambiosExternos(almacen, base)) throw new ConflictoRegistro();
  }
  almacen.setItem(claveRegistroActual, texto);
  return { ...base, registro: validado, textoBase: texto };
}
