import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Montaje } from './training';
import type { ResultadoGuardado } from './useRegistro';
import { escribirBorradorNota, leerBorradorNota, quitarBorradorNota } from './noteDraft';
import type { ContextoNota } from './noteDraft';

type Props = {
  montaje?: Montaje; nota?: string; habilitado?: boolean;
  onGuardar?: (nota: string) => ResultadoGuardado; onEdicion?: (abierta: boolean) => void;
  contexto?: ContextoNota;
};

export default function SetupNotes({ montaje, nota, habilitado = false, onGuardar, onEdicion, contexto }: Props) {
  const [inicio] = useState(() => habilitado && contexto ? leerBorradorNota(contexto) : { texto: null, aviso: '' });
  const [editando, setEditando] = useState(inicio.texto !== null);
  const [texto, setTexto] = useState(inicio.texto ?? nota ?? '');
  const [aviso, setAviso] = useState(inicio.aviso);
  const [recuperado, setRecuperado] = useState(inicio.texto !== null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  useEffect(() => () => onEdicion?.(false), [onEdicion]);
  useEffect(() => { if (inicio.texto !== null) onEdicion?.(true); }, [inicio.texto, onEdicion]);

  function abrir() {
    setRecuperado(false);
    setTexto(nota ?? ''); setError(''); setMensaje(''); setEditando(true); onEdicion?.(true);
  }
  function cancelar() {
    setAviso(contexto ? quitarBorradorNota(contexto) : '');
    setEditando(false); setError(''); setMensaje('Cambios de la nota cancelados.'); onEdicion?.(false);
  }
  function guardar(e: FormEvent) {
    e.preventDefault();
    if (!habilitado || !onGuardar) return;
    const resultado = onGuardar(texto);
    if (!resultado.ok) { setError(resultado.error); return; }
    setAviso(contexto ? quitarBorradorNota(contexto) : '');
    setEditando(false); setError(''); setMensaje(texto.trim() ? 'Nota de esta sesión guardada.' : 'Nota de esta sesión eliminada.'); onEdicion?.(false);
  }

  if (!montaje && !nota && !habilitado) return null;
  return <div className="setup-notes">
    {montaje && <div className="setup-snapshot"><h3>Montaje de esta sesión</h3>{montaje.equipo && <strong>{montaje.equipo}</strong>}{montaje.ajustes && <p>{montaje.ajustes}</p>}<small>Copiado de la rutina al crear el entrenamiento.</small></div>}
    {nota && !editando && <div className="session-note"><h3>Nota de esta sesión</h3><p>{nota}</p></div>}
    {editando ? <form className="setup-note-form" onSubmit={guardar}>
      <label>Nota de esta sesión<textarea rows={3} maxLength={500} value={texto} onChange={e => { setTexto(e.target.value); setRecuperado(false); if (contexto) setAviso(escribirBorradorNota(contexto, e.target.value)); }} placeholder="Ej.: hoy usé asiento 5" autoFocus /></label>
      <p className="muted">{aviso ? 'La edición sigue sin confirmar. Revisá el aviso de conservación del borrador.' : recuperado ? 'Recuperamos tu borrador local. Todavía no es una nota confirmada.' : 'Lo escrito se conserva como borrador en este dispositivo, sin incluirlo en el respaldo.'} Guardá o cancelá para seguir.</p>
      <div className="edit-actions"><button type="submit" className="button" disabled={!habilitado}>Guardar nota</button><button type="button" className="button secondary" onClick={cancelar}>Cancelar</button></div>
      {error && <p className="feedback error" role="alert">{error}</p>}
    </form> : habilitado && onGuardar && <button type="button" className="setup-note-action" onClick={abrir}>{nota ? 'Editar nota de esta sesión' : 'Anotar un ajuste de esta sesión'}</button>}
    {aviso && <p className="draft-status draft-warning" role="status">{aviso}</p>}
    {mensaje && <p className="feedback success" role="status">{mensaje}</p>}
  </div>;
}
