import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import Icon from './Icon';

export type SaveNotice = { id: string; titulo: string; detalle: string; destino: 'descanso' | 'cierre' | null };
type Props = {
  aviso: SaveNotice;
  descanso: RefObject<HTMLDivElement | null>;
  entrenamiento: RefObject<HTMLDivElement | null>;
};

export default function SaveFeedback({ aviso, descanso, entrenamiento }: Props) {
  const [fase, setFase] = useState<'visible' | 'saliendo' | 'oculto'>('visible');
  useEffect(() => {
    let interrumpido = false;
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const interrumpir = () => { interrumpido = true; };
    const eventos = ['pointerdown', 'wheel', 'keydown'] as const;
    eventos.forEach(evento => window.addEventListener(evento, interrumpir, { passive: true }));
    if (aviso.destino && entrenamiento.current?.contains(document.activeElement) && document.activeElement instanceof HTMLElement && document.activeElement.matches('input, textarea, select')) {
      document.activeElement.blur();
    }
    const subir = window.requestAnimationFrame(() => {
      if (!interrumpido && aviso.destino) {
        const destino = aviso.destino === 'descanso' ? descanso.current : entrenamiento.current;
        destino?.scrollIntoView({ behavior: reducir ? 'instant' : 'smooth', block: 'start', inline: 'nearest' });
      }
    });
    const desvanecer = window.setTimeout(() => setFase('saliendo'), 1200);
    const quitar = window.setTimeout(() => setFase('oculto'), reducir ? 2200 : 2000);
    return () => {
      window.cancelAnimationFrame(subir); window.clearTimeout(desvanecer); window.clearTimeout(quitar);
      eventos.forEach(evento => window.removeEventListener(evento, interrumpir));
    };
  }, [aviso, descanso, entrenamiento]);

  if (fase === 'oculto') return null;
  return <div className={`save-feedback ${fase === 'saliendo' ? 'is-leaving' : ''}`} role="status" aria-live="polite" aria-atomic="true">
    <Icon nombre="check"/><div><strong>{aviso.titulo}</strong><span>{aviso.detalle}</span></div>
  </div>;
}
