import { useState } from 'react';

type Preferencias = { favoritos: string[]; recientes: string[]; aliases: Record<string, string> };
const clave = 'gim.app.biblioteca-preferencias.v1';
const vacias = (): Preferencias => ({ favoritos: [], recientes: [], aliases: {} });
function leer(): { datos: Preferencias; aviso: string } {
  try {
    const texto = localStorage.getItem(clave);
    if (!texto) return { datos: vacias(), aviso: '' };
    const dato = JSON.parse(texto);
    const lista = (x: unknown): x is string[] => Array.isArray(x) && x.length <= 500 && x.every(id => typeof id === 'string' && id.length <= 150);
    if (!dato || dato.version !== 1 || !lista(dato.favoritos) || !lista(dato.recientes) || !dato.aliases || typeof dato.aliases !== 'object' || Array.isArray(dato.aliases) || Object.entries(dato.aliases).length > 500 || Object.entries(dato.aliases).some(([id, texto]) => id.length > 150 || typeof texto !== 'string' || texto.length > 100)) throw new Error();
    return { datos: { favoritos: dato.favoritos, recientes: dato.recientes, aliases: dato.aliases }, aviso: '' };
  } catch { return { datos: vacias(), aviso: 'No se pudieron recuperar favoritos y alias de este navegador. Tus rutinas no se modificaron.' }; }
}
export function useLibraryPreferences() {
  const [inicio] = useState(leer);
  const [datos, setDatos] = useState(inicio.datos);
  const [aviso, setAviso] = useState(inicio.aviso);
  function guardar(nuevo: Preferencias) {
    try { localStorage.setItem(clave, JSON.stringify({ version: 1, ...nuevo })); setDatos(nuevo); setAviso(''); }
    catch { setAviso('No se pudo guardar esta preferencia. Podés seguir eligiendo ejercicios.'); }
  }
  return { datos, aviso,
    favorito: (id: string) => guardar({ ...datos, favoritos: datos.favoritos.includes(id) ? datos.favoritos.filter(x => x !== id) : [...datos.favoritos, id].slice(-500) }),
    reciente: (id: string) => guardar({ ...datos, recientes: [id, ...datos.recientes.filter(x => x !== id)].slice(0, 20) }),
    alias: (id: string, texto: string) => { const aliases = Object.fromEntries(Object.entries(datos.aliases).filter(([k]) => k !== id)); if (texto.trim()) aliases[id] = texto.trim().slice(0, 100); guardar({ ...datos, aliases }); },
  };
}
