import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';

type Props = {
  ejercicioId: string; disabled: boolean; anterior: boolean; siguiente: boolean;
  onNavegar: (direccion: -1 | 1) => void;
  children: (navegar: (direccion: -1 | 1) => void) => ReactNode;
  vistaAnterior: ReactNode; vistaSiguiente: ReactNode; className?: string;
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
  const [animando, setAnimando] = useState(false);
  const pista = useRef<HTMLDivElement>(null);
  const pendiente = useRef<-1 | 1 | null>(null);
  const ocupada = useRef(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function volver() {
    gesto.current = null;
    setArrastrando(false);
    setDesplazamiento(0);
  }

  function terminarAnimacion() {
    if (!ocupada.current) return;
    clearTimeout(temporizador.current);
    const direccion = pendiente.current;
    pendiente.current = null;
    ocupada.current = false;
    setAnimando(false);
    volver();
    if (direccion && !p.disabled) p.onNavegar(direccion);
  }

  function encajar(direccion: -1 | 1 | null) {
    gesto.current = null;
    setArrastrando(false);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      volver();
      if (direccion) p.onNavegar(direccion);
      return;
    }
    pendiente.current = direccion;
    ocupada.current = true;
    setAnimando(true);
    setDesplazamiento(direccion ? -direccion * ((pista.current?.clientWidth ?? 0) + 12) : 0);
    // Respaldo si el navegador interrumpe transitionend (pestaña oculta, etc.).
    temporizador.current = setTimeout(terminarAnimacion, 320);
  }

  function navegar(direccion: -1 | 1) {
    if (p.disabled || ocupada.current || !(direccion === 1 ? p.siguiente : p.anterior)) return;
    encajar(direccion);
  }

  useLayoutEffect(() => {
    clearTimeout(temporizador.current);
    pendiente.current = null;
    ocupada.current = false;
    setAnimando(false);
    volver();
  }, [p.ejercicioId, p.disabled]);
  useEffect(() => () => clearTimeout(temporizador.current), []);

  function iniciar(e: PointerEvent<HTMLElement>) {
    if (!e.isPrimary) { if (!ocupada.current) encajar(null); return; }
    suprimirClick.current = false;
    if (p.disabled || ocupada.current || e.button !== 0 || (e.target as Element).closest('input, button, a, select, textarea, summary, [contenteditable]')) return;
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
    if (g.eje === 'x') encajar(cambiar ? direccion : null);
    else volver();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return <div className="exercise-swipe-viewport">
    <div ref={pista} className={`exercise-swipe-track ${animando ? 'is-settling' : ''} ${arrastrando ? 'is-dragging' : ''}`}
      style={{ transform: `translateX(${desplazamiento}px)` }}
      onTransitionEnd={e => { if (e.target === e.currentTarget && e.propertyName === 'transform') terminarAnimacion(); }}>
    {p.anterior && <div className="card focus-card exercise-slide-preview preview-previous" aria-hidden="true" inert>{p.vistaAnterior}</div>}
    <section className={`card focus-card swipe-exercise ${p.className ?? ''}`}
      aria-labelledby="ejercicio"
      onPointerDown={iniciar} onPointerMove={mover} onPointerUp={terminar}
      onPointerCancel={() => { if (gesto.current) encajar(null); }} onLostPointerCapture={() => { if (gesto.current) encajar(null); }}
      onClickCapture={e => { if (suprimirClick.current) { e.preventDefault(); e.stopPropagation(); suprimirClick.current = false; } }}>
      {p.children(navegar)}
    </section>
    {p.siguiente && <div className="card focus-card exercise-slide-preview preview-next" aria-hidden="true" inert>{p.vistaSiguiente}</div>}
    </div>
  </div>;
}
