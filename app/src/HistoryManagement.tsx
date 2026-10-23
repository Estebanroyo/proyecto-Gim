import { useEffect, useState } from 'react';
import type { RegistroActual } from './training';
import { recuperarRegistroActual } from './training';
import { analizarImportacion } from './backup';
import type { ResultadoGuardado } from './useRegistro';

const clave = 'gim.app.historial-retirado.v1';
type Copia = { version: 1; retiradaEn: string; registro: RegistroActual };
function leerCopia(): Copia | null {
  const texto = localStorage.getItem(clave);
  if (texto === null) return null;
  const copia = JSON.parse(texto);
  if (copia?.version !== 1 || !Number.isFinite(Date.parse(copia.retiradaEn))) throw new Error('La copia de recuperación no se puede leer. No la reemplazamos.');
  return { version: 1, retiradaEn: copia.retiradaEn, registro: recuperarRegistroActual(JSON.stringify(copia.registro), null, null) };
}
type Props = {
  registro: RegistroActual;
  disabled: boolean;
  onGuardar: (registro: RegistroActual) => ResultadoGuardado;
  onVerificar: () => ResultadoGuardado;
};

export default function HistoryManagement({ registro, disabled, onGuardar, onVerificar }: Props) {
  const [copia, setCopia] = useState<Copia | null>(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [baseConfirmada, setBaseConfirmada] = useState<string | null>(null);
  const base = JSON.stringify(registro);
  useEffect(() => {
    const cargar = () => { try { setCopia(leerCopia()); } catch { setError('No se pudo leer la recuperación local. No limpies el historial hasta resolverlo.'); } };
    cargar();
    const cambio = (e: StorageEvent) => { if (e.key === clave || e.key === null) cargar(); };
    window.addEventListener('storage', cambio);
    return () => window.removeEventListener('storage', cambio);
  }, []);

  function limpiar() {
    setError(''); setMensaje('');
    try {
      if (baseConfirmada !== base) throw new Error('El historial cambió. Revisá otra vez antes de limpiarlo.');
      const vigente = onVerificar(); if (!vigente.ok) throw new Error(vigente.error);
      const previa = leerCopia();
      const retirado: RegistroActual = { version: 5, entrenamientos: registro.entrenamientos };
      const combinado = analizarImportacion(previa?.registro ?? { version: 5, entrenamientos: [] }, retirado);
      if (combinado.conflictos.length) throw new Error('Restaurá la recuperación anterior antes de limpiar: ' + combinado.conflictos[0]);
      const nueva: Copia = { version: 1, retiradaEn: new Date().toISOString(), registro: combinado.registro };
      // La copia recuperable se conserva antes de retirar sesiones de la autoridad.
      localStorage.setItem(clave, JSON.stringify(nueva));
      setCopia(nueva);
      const res = onGuardar({ ...registro, entrenamientos: [] });
      if (!res.ok) throw new Error(res.error);
      setBaseConfirmada(null);
      setMensaje('Historial vacío. Tus rutinas, bloques y configuración se conservaron. Podés restaurar las sesiones retiradas desde acá.');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo limpiar. El historial confirmado se conserva.'); }
  }
  function restaurar() {
    setError(''); setMensaje('');
    try {
      const vigente = onVerificar(); if (!vigente.ok) throw new Error(vigente.error);
      const actual = leerCopia(); if (!actual) throw new Error('No hay una copia de recuperación disponible.');
      const analisis = analizarImportacion(registro, actual.registro);
      if (analisis.conflictos.length) throw new Error('No restauramos sobre cambios distintos: ' + analisis.conflictos[0] + ' Los datos actuales y la recuperación se conservan.');
      const res = onGuardar(analisis.registro); if (!res.ok) throw new Error(res.error);
      setBaseConfirmada(null);
      setMensaje('Historial restaurado. Los entrenamientos nuevos y tus rutinas se conservaron.');
      try { localStorage.removeItem(clave); setCopia(null); }
      catch { setError('Sesiones restauradas; no se pudo retirar la copia duplicada de recuperación.'); }
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo restaurar. Se conserva la recuperación.'); }
  }
  return <details className="card history-management">
    <summary>Gestionar historial<span>Limpiar entrenamientos sin cambiar tus rutinas</span></summary>
    <div className="routine-content">
      <p>{registro.entrenamientos.length} entrenamientos en el historial. Limpiar retira también sus series y notas de la vista y de los próximos respaldos completos.</p>
      <p className="muted">Guardamos una recuperación en este navegador para deshacer la limpieza. No es un borrado permanente ni un respaldo externo.</p>
      {baseConfirmada === null ? <button type="button" className="button secondary" disabled={disabled || !registro.entrenamientos.length} onClick={() => { setBaseConfirmada(base); setError(''); setMensaje(''); }}>Limpiar historial</button> : <div className="finish-confirm">
        <p>Vas a retirar {registro.entrenamientos.length} entrenamientos. Las rutinas, bloques, equipos y preferencias se conservan. Podés deshacerlo desde esta sección.</p>
        <div className="edit-actions"><button type="button" className="button secondary" disabled={disabled || baseConfirmada !== base} onClick={limpiar}>Confirmar limpieza recuperable</button><button type="button" className="button secondary" onClick={() => setBaseConfirmada(null)}>Cancelar</button></div>
        {baseConfirmada !== base && <p className="muted">El registro cambió. Cancelá y revisá de nuevo.</p>}
      </div>}
      {copia && <div className="history-recovery"><p>{copia.registro.entrenamientos.length} entrenamientos recuperables en este navegador.</p><button type="button" className="button secondary" disabled={disabled} onClick={restaurar}>Restaurar historial retirado</button></div>}
      {error && <p className="feedback error" role="alert">{error}</p>}
      {mensaje && <p className="feedback success" role="status">{mensaje}</p>}
    </div>
  </details>;
}
