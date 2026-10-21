import { useEffect, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';

type Props = {
  ejercicioId: string; disabled: boolean; anterior: boolean; siguiente: boolean;
  onNavegar: (direccion: -1 | 1) => void; children: ReactNode; className?: string;
};
type Gesto = {
  id: number; x: number; y: number; ancho: number; eje: 'pendiente' | 'x' | 'y';
  muestras: { x: number; tiempo: number }[];
};

export default function SwipeExerciseCard(p: Props) {
  const gesto = useRef<Gesto | null>(null);
  const suprimirClick = useRef(false);
  const [desplazamiento, setDesplazamiento] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);

  function volver() {
    gesto.current = null;
    setArrastrando(false);
    setDesplazamiento(0);
  }

  useEffect(() => {
    gesto.current = null;
    setArrastrando(false);
    setDesplazamiento(0);
  }, [p.ejercicioId, p.disabled]);

  function iniciar(e: PointerEvent<HTMLElement>) {
    if (!e.isPrimary) { volver(); return; }
    suprimirClick.current = false;
    if (p.disabled || e.button !== 0 || (e.target as Element).closest('input, button, a, select, textarea, summary, [contenteditable]')) return;
    gesto.current = { id: e.pointerId, x: e.clientX, y: e.clientY, ancho: e.currentTarget.clientWidth, eje: 'pendiente', muestras: [{ x: e.clientX, tiempo: e.timeStamp }] };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function mover(e: PointerEvent<HTMLElement>) {
    const g = gesto.current;
    if (!g || g.id !== e.pointerId || p.disabled) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (g.eje === 'pendiente') {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 10) return;
      // Ante una diagonal, priorizar el scroll de la página.
      g.eje = Math.abs(dx) > Math.abs(dy) * 1.3 ? 'x' : 'y';
    }
    if (g.eje !== 'x') return;
    g.muestras = [...g.muestras.filter(m => e.timeStamp - m.tiempo <= 100), { x: e.clientX, tiempo: e.timeStamp }];
    suprimirClick.current = true;
    setArrastrando(true);
    const disponible = dx > 0 ? p.anterior : p.siguiente;
    setDesplazamiento(Math.max(-g.ancho, Math.min(g.ancho, dx * (disponible ? 1 : 0.2))));
  }

  function terminar(e: PointerEvent<HTMLElement>) {
    const g = gesto.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const muestra = g.muestras.find(m => e.timeStamp - m.tiempo <= 100);
    const tiempo = muestra ? e.timeStamp - muestra.tiempo : 0;
    const velocidad = muestra && tiempo >= 16 ? (e.clientX - muestra.x) / tiempo : 0;
    const rapido = Math.abs(dx) >= 36 && Math.abs(velocidad) >= 0.5 && Math.sign(velocidad) === Math.sign(dx);
    const direccion = dx < 0 ? 1 : -1;
    const cambiar = !p.disabled && g.eje === 'x' && (Math.abs(dx) >= g.ancho * 0.25 || rapido) && (direccion === 1 ? p.siguiente : p.anterior);
    volver();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (cambiar) p.onNavegar(direccion);
  }

  return <div className="exercise-swipe-viewport">
    <section className={`card focus-card swipe-exercise ${p.className ?? ''} ${arrastrando ? 'is-dragging' : ''}`}
      aria-labelledby="ejercicio" style={{ transform: `translateX(${desplazamiento}px)` }}
      onPointerDown={iniciar} onPointerMove={mover} onPointerUp={terminar}
      onPointerCancel={volver} onLostPointerCapture={() => { if (gesto.current) volver(); }}
      onClickCapture={e => { if (suprimirClick.current) { e.preventDefault(); e.stopPropagation(); suprimirClick.current = false; } }}>
      {p.children}
    </section>
  </div>;
}
