import { useEffect, useMemo, useState } from 'react';
import type { RegistroActual } from './training';

const claveEstado = 'gim.app.estado-respaldo.v1';
type Estado = { preparadoEn?: string; huella?: string; pospuestoHasta?: string };
const fechaValida = (valor: unknown): valor is string => typeof valor === 'string' && Number.isFinite(Date.parse(valor));

function leer(): { estado: Estado; aviso: string } {
  try {
    const texto = localStorage.getItem(claveEstado);
    if (!texto) return { estado: {}, aviso: '' };
    const dato = JSON.parse(texto) as Record<string, unknown> | null;
    if (!dato || Array.isArray(dato) || dato.version !== 1 ||
      ((dato.preparadoEn !== undefined || dato.huella !== undefined) && (!fechaValida(dato.preparadoEn) || typeof dato.huella !== 'string' || !/^[a-f0-9]{64}$/.test(dato.huella))) ||
      (dato.pospuestoHasta !== undefined && !fechaValida(dato.pospuestoHasta))) throw new Error();
    return { estado: { preparadoEn: dato.preparadoEn as string | undefined, huella: dato.huella as string | undefined, pospuestoHasta: dato.pospuestoHasta as string | undefined }, aviso: '' };
  } catch { return { estado: {}, aviso: 'No se pudo leer el estado del recordatorio. Tus entrenamientos no se modificaron.' }; }
}

async function firma(texto: string): Promise<string> {
  const resultado = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(resultado), n => n.toString(16).padStart(2, '0')).join('');
}

export function useBackupStatus(registro: RegistroActual) {
  const [inicio] = useState(leer);
  const [estado, setEstado] = useState(inicio.estado);
  const [aviso, setAviso] = useState(inicio.aviso);
  const [ahora, setAhora] = useState(Date.now);
  const texto = useMemo(() => JSON.stringify(registro), [registro]);
  const [huella, setHuella] = useState<{ base: string; valor: string } | null>(null);
  const [falloComparacion, setFalloComparacion] = useState('');
  const firmaActual = huella?.base === texto ? huella.valor : null;
  const hayDatos = registro.entrenamientos.length > 0 || Boolean(registro.rutinas?.length);

  useEffect(() => {
    let vigente = true;
    void firma(texto).then(valor => { if (vigente) { setHuella({ base: texto, valor }); setFalloComparacion(''); } }).catch(() => { if (vigente) setFalloComparacion(texto); });
    return () => { vigente = false; };
  }, [texto]);

  useEffect(() => {
    function actualizar() { const lectura = leer(); setEstado(lectura.estado); setAviso(lectura.aviso); setAhora(Date.now()); }
    function desdeOtraPestana(e: StorageEvent) { if (e.key === null || e.key === claveEstado) actualizar(); }
    window.addEventListener('focus', actualizar);
    window.addEventListener('storage', desdeOtraPestana);
    return () => { window.removeEventListener('focus', actualizar); window.removeEventListener('storage', desdeOtraPestana); };
  }, []);

  useEffect(() => {
    const restante = estado.pospuestoHasta ? Date.parse(estado.pospuestoHasta) - Date.now() : 0;
    if (restante <= 0) return;
    const temporizador = setTimeout(() => setAhora(Date.now()), Math.min(restante + 50, 2_147_483_647));
    return () => clearTimeout(temporizador);
  }, [estado.pospuestoHasta, ahora]);

  function guardar(nuevo: Estado): string {
    try { localStorage.setItem(claveEstado, JSON.stringify({ version: 1, ...nuevo })); setEstado(nuevo); setAviso(''); setAhora(Date.now()); return ''; }
    catch { const mensaje = 'No se pudo recordar el estado del respaldo en este dispositivo.'; setAviso(mensaje); return mensaje; }
  }

  async function preparado(datos: RegistroActual): Promise<string> {
    const preparadoEn = new Date().toISOString();
    try { return guardar({ preparadoEn, huella: await firma(JSON.stringify(datos)) }); }
    catch { const mensaje = 'El archivo fue preparado, pero no se pudo recordar qué datos incluía.'; setAviso(mensaje); return mensaje; }
  }

  function posponer() { guardar({ ...estado, pospuestoHasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }); }
  const pendiente = Boolean(hayDatos && firmaActual && firmaActual !== estado.huella);
  const pospuesto = Boolean(estado.pospuestoHasta && Date.parse(estado.pospuestoHasta) > ahora);
  return { estado, aviso, pendiente, recordar: pendiente && !pospuesto, comprobando: firmaActual === null && falloComparacion !== texto, comparacionFallida: falloComparacion === texto, preparado, posponer };
}
