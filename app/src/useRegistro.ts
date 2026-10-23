import { useEffect, useRef, useState } from 'react';
import { claveEntrenamientos, claveSeries } from './workout';
import { claveRegistroActual } from './training';
import type { RegistroActual } from './training';
import { ConflictoRegistro, TransicionRegistro, escribirRegistro, hayCambiosExternos, leerRegistro } from './storage';
import type { Instantanea } from './storage';

export type ResultadoGuardado = { ok: true } | { ok: false; error: string };

function cargar() {
  try {
    return { instantanea: leerRegistro(localStorage), error: '' };
  } catch {
    const instantanea: Instantanea = { registro: { version: 5, entrenamientos: [] }, textoBase: null, v2: null, v1: null };
    return { instantanea, error: 'No se pudo leer un registro válido. No reemplazamos los datos guardados. Las altas quedan deshabilitadas para protegerlos.' };
  }
}

export function useRegistro() {
  const [inicio] = useState(cargar);
  const [instantanea, setInstantanea] = useState(inicio.instantanea);
  const referencia = useRef(instantanea);
  const [cambioExterno, setCambioExterno] = useState(false);

  useEffect(() => {
    function detectar(evento: StorageEvent) {
      if (evento.key !== null && ![claveRegistroActual, claveEntrenamientos, claveSeries].includes(evento.key)) return;
      try { setCambioExterno(hayCambiosExternos(localStorage, referencia.current)); }
      catch { setCambioExterno(true); }
    }
    window.addEventListener('storage', detectar);
    return () => window.removeEventListener('storage', detectar);
  }, []);

  function guardar(nuevo: RegistroActual): ResultadoGuardado {
    if (inicio.error) return { ok: false, error: inicio.error };
    try {
      const siguiente = escribirRegistro(localStorage, referencia.current, nuevo);
      referencia.current = siguiente;
      setInstantanea(siguiente);
      setCambioExterno(false);
      return { ok: true };
    } catch (problema) {
      if (problema instanceof ConflictoRegistro) setCambioExterno(true);
      return {
        ok: false,
        error: problema instanceof ConflictoRegistro || problema instanceof TransicionRegistro ? problema.message : 'No se pudo guardar. El cambio no se aplicó; revisá el almacenamiento e intentá nuevamente.',
      };
    }
  }

  function verificarVigencia(): ResultadoGuardado {
    if (inicio.error) return { ok: false, error: inicio.error };
    try {
      if (hayCambiosExternos(localStorage, referencia.current)) throw new ConflictoRegistro();
      return { ok: true };
    } catch (problema) {
      if (problema instanceof ConflictoRegistro) setCambioExterno(true);
      return { ok: false, error: problema instanceof ConflictoRegistro ? problema.message : 'No se pudo verificar el registro guardado. No se preparó el respaldo.' };
    }
  }

  return { registro: instantanea.registro, errorCarga: inicio.error, cambioExterno, guardar, verificarVigencia };
}
