import { useEffect, useState } from 'react';
import type { EjercicioPlan, Sesion, SerieEjercicio, ObjetivoSerie } from './training';
import { grupoDe, turnosTrabajo, resuelta, pendiente } from './execution';
const clave = 'gim.app.descanso.v1', ajustesClave = 'gim.app.descanso-ajustes.v1';
type Descanso = { sesionId: string; serieId: string; nombre: string; fin: number; pausado?: number };
function leer(): Descanso | null {
  try {
    const d = JSON.parse(localStorage.getItem(clave) ?? 'null');
    return d && typeof d.sesionId === 'string' && typeof d.serieId === 'string' && typeof d.nombre === 'string' && Number.isFinite(d.fin) && (d.pausado === undefined || (Number.isFinite(d.pausado) && d.pausado >= 0 && d.pausado <= 3600)) ? d : null;
  } catch { return null; }
}
function preferencias() {
  try { const d = JSON.parse(localStorage.getItem(ajustesClave) ?? 'null'); if (d && typeof d.activo === 'boolean' && Number.isInteger(d.segundos) && d.segundos >= 0 && d.segundos <= 3600) return d as { activo: boolean; segundos: number }; } catch { /* Preferencia opcional. */ }
  return { activo: true, segundos: 90 };
}
const restanteDe = (d: Descanso | null, ahora = Date.now()) => d ? d.pausado ?? Math.max(0, Math.ceil((d.fin - ahora) / 1000)) : 0;
export function useRest() {
  const [estado, setEstado] = useState<Descanso | null>(leer), [ajustes, setAjustes] = useState(preferencias), [aviso, setAviso] = useState('');
  useEffect(() => {
    const foco = () => { setEstado(leer()); setAjustes(preferencias()); };
    window.addEventListener('focus', foco); window.addEventListener('storage', foco);
    return () => { window.removeEventListener('focus', foco); window.removeEventListener('storage', foco); };
  }, []);
  function guardar(d: Descanso | null) {
    try { if (d) localStorage.setItem(clave, JSON.stringify(d)); else localStorage.removeItem(clave); setEstado(d); setAviso(''); }
    catch { setAviso('El registro se conserva, pero no se pudo guardar el descanso. Podría perderse al recargar.'); setEstado(d); }
  }
  function configurar(nuevo: typeof ajustes) {
    if (!Number.isInteger(nuevo.segundos) || nuevo.segundos < 0 || nuevo.segundos > 3600) { setAviso('Usá entre 0 y 3600 segundos de descanso.'); return; }
    try { localStorage.setItem(ajustesClave, JSON.stringify(nuevo)); setAjustes(nuevo); setAviso(''); if (!nuevo.activo) guardar(null); }
    catch { setAviso('No se pudo guardar la preferencia de descanso.'); }
  }
  function iniciar(antes: Sesion, despues: Sesion, e: EjercicioPlan, resultado: SerieEjercicio, objetivo?: ObjetivoSerie) {
    if (!resuelta(resultado) || estado?.serieId === resultado.id) return false;
    if (despues.finalizadaEn || !ajustes.activo) { guardar(null); return false; }
    let segundos = objetivo?.descansoSegundos ?? e.descansoSegundos ?? ajustes.segundos;
    const grupo = grupoDe(despues, e.id);
    if (grupo && resultado.rol === 'calentamiento') segundos = objetivo?.descansoSegundos ?? 0;
    if (grupo && resultado.rol !== 'calentamiento') {
      const miembros = grupo.miembros.map(id => despues.ejercicios.find(x => x.id === id)!).filter(x => !despues.pospuestos?.includes(x.id) && !despues.omisiones?.some(o => o.ejercicioId === x.id));
      const rondaAntes = Math.min(...miembros.map(x => turnosTrabajo(antes, x.id)));
      const cerrada = miembros.every(x => turnosTrabajo(despues, x.id) > rondaAntes || !pendiente(despues, x));
      if (!cerrada) { guardar(null); return false; }
      segundos = grupo.descansoSegundos ?? segundos;
    }
    if (segundos === 0) { guardar(null); return false; }
    guardar({ sesionId: despues.id, serieId: resultado.id, nombre: grupo?.nombre ?? e.nombre, fin: Date.now() + segundos * 1000 });
    return true;
  }
  return { estado, ajustes, aviso, iniciar, configurar, omitir: () => guardar(null),
    pausa: () => { const restante = restanteDe(estado); if (estado && restante > 0) guardar({ ...estado, pausado: restante }); },
    reanudar: () => { if (estado?.pausado !== undefined) { const { pausado, ...d } = estado; guardar({ ...d, fin: Date.now() + pausado * 1000 }); } }
  };
}
export type RestController = ReturnType<typeof useRest>;
export function RestPanel({ rest }: { rest: RestController }) {
  const [, setAhora] = useState(Date.now);
  const contando = Boolean(rest.estado && rest.estado.pausado === undefined && rest.estado.fin > Date.now());
  useEffect(() => {
    if (!contando) return;
    const id = setInterval(() => setAhora(Date.now()), 500);
    return () => clearInterval(id);
  }, [contando, rest.estado?.fin]);
  const restante = restanteDe(rest.estado);
  if (!rest.estado) return rest.aviso ? <p className="draft-warning" role="status">{rest.aviso}</p> : null;
  return <div className="rest-panel"><p role="status"><strong>{restante ? `${Math.floor(restante / 60)}:${String(restante % 60).padStart(2, '0')}` : 'Descanso terminado'}</strong> · {rest.estado.nombre}{rest.estado.pausado !== undefined && ' · pausado'}</p><div className="edit-actions">{restante > 0 && <button className="button secondary small" type="button" onClick={rest.estado.pausado !== undefined ? rest.reanudar : rest.pausa}>{rest.estado.pausado !== undefined ? 'Reanudar' : 'Pausar'}</button>}<button type="button" className="edit-button" onClick={rest.omitir}>{restante ? 'Omitir descanso' : 'Listo'}</button></div>{rest.aviso && <p className="draft-warning">{rest.aviso}</p>}</div>;
}
export function RestSettings({ rest }: { rest: RestController }) {
  return <details className="card"><summary>Descansos<span>Temporizador local y duración predeterminada</span></summary><div className="routine-content"><label>Temporizador<select value={rest.ajustes.activo ? 'si' : 'no'} onChange={e => rest.configurar({ ...rest.ajustes, activo: e.target.value === 'si' })}><option value="si">Activado</option><option value="no">Desactivado</option></select></label><label>Duración predeterminada · segundos<input type="number" min="0" max="3600" step="1" value={rest.ajustes.segundos} onChange={e => rest.configurar({ ...rest.ajustes, segundos: Number(e.target.value) })} /></label><p className="muted">La duración de una serie o ronda tiene prioridad. El tiempo se recupera al volver; no se garantiza un aviso con la pantalla bloqueada. Cambiar la duración predeterminada no altera un descanso iniciado.</p></div></details>;
}
