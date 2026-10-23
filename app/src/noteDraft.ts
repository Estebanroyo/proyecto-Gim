export type ContextoNota = { sesionId: string; ejercicioId: string; base: string };
const clave = (c: ContextoNota) => `gim.app.borrador-nota.v1.${encodeURIComponent(c.sesionId)}.${encodeURIComponent(c.ejercicioId)}`;

export function leerBorradorNota(c: ContextoNota): { texto: string | null; aviso: string } {
  try {
    const contenido = localStorage.getItem(clave(c));
    if (!contenido) return { texto: null, aviso: '' };
    const dato: unknown = JSON.parse(contenido);
    if (!dato || typeof dato !== 'object' || !('base' in dato) || dato.base !== c.base || !('texto' in dato) || typeof dato.texto !== 'string' || dato.texto.length > 500) return { texto: null, aviso: 'El borrador de nota no coincide con esta sesión. Revisá la nota confirmada antes de editar.' };
    return { texto: dato.texto, aviso: '' };
  } catch { return { texto: null, aviso: 'No se pudo recuperar el borrador de nota de este dispositivo.' }; }
}

export function escribirBorradorNota(c: ContextoNota, texto: string): string {
  try { localStorage.setItem(clave(c), JSON.stringify({ base: c.base, texto })); return ''; }
  catch { return 'No se pudo conservar el borrador de nota. Lo escrito sigue en pantalla, pero podría perderse al recargar.'; }
}

export function quitarBorradorNota(c: ContextoNota): string {
  try { localStorage.removeItem(clave(c)); return ''; }
  catch { return 'No se pudo limpiar el borrador de nota; podría reaparecer al recargar.'; }
}
