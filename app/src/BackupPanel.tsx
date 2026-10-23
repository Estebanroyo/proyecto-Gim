import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { analizarImportacion, crearRespaldo, leerRespaldo, limiteRespaldoBytes } from './backup';
import { fechaLocal, mostrarFecha } from './workout';
import type { RegistroActual } from './training';
import type { ResultadoGuardado } from './useRegistro';
import { useBackupStatus } from './useBackupStatus';

type Props = {
  registro: RegistroActual;
  habilitado: boolean;
  importacionBloqueada: boolean;
  onImportar: (registro: RegistroActual) => ResultadoGuardado;
  onVerificar: () => ResultadoGuardado;
};

export default function BackupPanel({ registro, habilitado, importacionBloqueada, onImportar, onVerificar }: Props) {
  const [vista, setVista] = useState<{ nombre: string; datos: RegistroActual; base: string } | null>(null);
  const [leyendo, setLeyendo] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [preparando, setPreparando] = useState(false);
  const respaldo = useBackupStatus(registro);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const lectura = useRef(0);
  const huella = useMemo(() => JSON.stringify(registro), [registro]);
  const analisis = useMemo(() => vista ? analizarImportacion(registro, vista.datos) : null, [registro, vista]);
  const desactualizado = vista !== null && vista.base !== huella;
  const puedeImportar = habilitado && !importacionBloqueada && !desactualizado && Boolean(analisis && (analisis.nuevas + analisis.rutinasNuevas + analisis.bloquesNuevos) > 0 && analisis.conflictos.length === 0);

  async function descargar() {
    if (preparando) return;
    setPreparando(true);
    setError('');
    setMensaje('');
    try {
      const vigente = onVerificar();
      if (!vigente.ok) throw new Error(vigente.error);
      const texto = crearRespaldo(registro);
      const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `gim-respaldo-${fechaLocal()}.json`;
      document.body.append(enlace);
      enlace.click();
      enlace.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      const aviso = await respaldo.preparado(registro);
      setMensaje(`Archivo preparado con los datos confirmados, sin borradores de series ni notas. Comprobá que esté guardado fuera del navegador.${aviso ? ` ${aviso}` : ''}`);
    } catch (problema) {
      setError(problema instanceof Error ? problema.message : 'No se pudo preparar el respaldo.');
    } finally {
      setPreparando(false);
    }
  }

  async function analizar(event: ChangeEvent<HTMLInputElement>) {
    const archivo = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!archivo) return;
    const turno = ++lectura.current;
    setVista(null);
    setError('');
    setMensaje('');
    setLeyendo(true);
    try {
      if (archivo.size > limiteRespaldoBytes) throw new Error('El archivo supera el límite de 2 MB.');
      const datos = leerRespaldo(await archivo.text());
      if (turno !== lectura.current) return;
      setVista({ nombre: archivo.name, datos, base: huella });
    } catch (problema) {
      if (turno === lectura.current) setError(problema instanceof Error ? problema.message : 'No se pudo leer el archivo.');
    } finally {
      if (turno === lectura.current) setLeyendo(false);
    }
  }

  function cancelar() {
    lectura.current++;
    setVista(null);
    setLeyendo(false);
    setError('');
    setMensaje('Importación cancelada. No se modificó el registro.');
  }

  function confirmar() {
    if (!puedeImportar || !analisis) return;
    const resultado = onImportar(analisis.registro);
    if (resultado.ok) {
      setVista(null);
      setError('');
      setMensaje(`Importación completada: ${analisis.nuevas} sesiones y ${analisis.rutinasNuevas} rutinas y ${analisis.bloquesNuevos} bloques agregados.`);
    } else {
      setError(resultado.error);
    }
  }

  return (
    <>
    {respaldo.recordar && <aside className="backup-reminder"><p>{respaldo.estado.preparadoEn ? 'Hay cambios desde el último respaldo preparado.' : 'Tus datos están en este navegador. Prepará una copia para conservarlos aparte.'}</p><div className="edit-actions"><button type="button" className="button secondary small" onClick={() => setAbierto(true)}>Ver respaldo</button><button type="button" className="backup-later" onClick={respaldo.posponer}>Recordar en 7 días</button></div></aside>}
    <details className="card backup-card" open={abierto} onToggle={e => setAbierto(e.currentTarget.open)}>
      <summary>Respaldo de tus entrenamientos<span>Descargar o recuperar sesiones y rutinas personalizadas</span></summary>
      <div className="backup-content">
        <p className="muted">Incluye sesiones, rutinas personalizadas y bloques guardados. Importar agrega datos faltantes; las diferencias se muestran como conflictos y no se sobrescriben.</p>
        <p className="muted">Podés recuperar respaldos anteriores. Los nuevos incluyen objetivos por serie y requieren GIM 0.20 o posterior para abrirlos.</p>
        <p className="backup-state">{respaldo.estado.preparadoEn ? `Último archivo preparado: ${new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(respaldo.estado.preparadoEn))}.` : 'Todavía no hay un respaldo preparado desde esta versión.'} {respaldo.comparacionFallida ? 'No se pudieron comparar los datos; podés preparar un respaldo manualmente.' : respaldo.comprobando ? 'Comparando datos…' : respaldo.pendiente ? 'Hay datos sin incluir en ese archivo.' : respaldo.estado.preparadoEn ? 'No hay cambios respecto del último archivo preparado.' : 'Sin datos pendientes para respaldar.'} La app no puede confirmar si guardaste el archivo.</p>
        {respaldo.aviso && <p className="draft-status draft-warning" role="status">{respaldo.aviso}</p>}
        <div className="backup-actions">
          <button className="button secondary" type="button" onClick={() => void descargar()} disabled={!habilitado || preparando}>{preparando ? 'Preparando…' : 'Descargar respaldo'}</button>
          <label>Seleccionar respaldo JSON<input type="file" accept=".json,application/json" onChange={event => { void analizar(event); }} disabled={!habilitado || importacionBloqueada} /></label>
        </div>
        {importacionBloqueada && <p className="muted">Guardá o cancelá la edición en curso antes de importar.</p>}
        {leyendo && <p role="status">Analizando archivo, sin modificar tus datos…</p>}
        {vista && analisis && (
          <section className="backup-preview" aria-label="Vista previa de importación">
            <h3>Antes de importar</h3>
            <p className="backup-file">{vista.nombre}</p>
            <div className="backup-counts"><span><strong>{analisis.nuevas}</strong> sesiones nuevas</span><span><strong>{analisis.rutinasNuevas}</strong> rutinas nuevas</span><span><strong>{analisis.bloquesNuevos}</strong> bloques nuevos</span><span><strong>{analisis.identicas}</strong> sesiones idénticas</span><span><strong>{analisis.conflictos.length}</strong> conflictos</span></div>
            <ul className="backup-sessions">{vista.datos.entrenamientos.slice(0, 5).map(sesion => <li key={sesion.id}><strong>{sesion.nombre}</strong><span>{mostrarFecha(sesion.fecha)} · {sesion.series.length} {sesion.series.length === 1 ? 'serie' : 'series'}</span></li>)}</ul>
            {vista.datos.entrenamientos.length > 5 && <p className="muted">Y {vista.datos.entrenamientos.length - 5} sesiones más en el archivo.</p>}
            {analisis.conflictos.length > 0 && <div className="backup-conflicts"><p>No se importará nada mientras existan conflictos. Conservamos el registro actual.</p><ul>{analisis.conflictos.slice(0, 5).map((conflicto, indice) => <li key={indice}>{conflicto}</li>)}</ul></div>}
            {analisis.nuevas + analisis.rutinasNuevas + analisis.bloquesNuevos === 0 && analisis.conflictos.length === 0 && <p className="muted">No hay datos nuevos para agregar.</p>}
            {desactualizado && <p className="backup-conflicts">El registro cambió después del análisis. Volvé a seleccionar el archivo para revisar una vista previa actualizada.</p>}
            <div className="edit-actions"><button className="button" type="button" disabled={!puedeImportar} onClick={confirmar}>Confirmar importación</button><button className="button secondary" type="button" onClick={cancelar}>Cancelar importación</button></div>
          </section>
        )}
        {error && <p className="feedback error" role="alert">{error}</p>}
        <p className="feedback success" role="status">{mensaje}</p>
      </div>
    </details>
    </>
  );
}
