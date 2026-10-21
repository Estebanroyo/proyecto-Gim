type Nombre = 'check' | 'arrow-right' | 'up' | 'down';

const trazos: Record<Nombre, string> = {
  check: 'm5 12 4 4L19 6',
  'arrow-right': 'M4 12h15m-6-6 6 6-6 6',
  up: 'm6 14 6-6 6 6',
  down: 'm6 10 6 6 6-6',
};

export default function Icon({ nombre }: { nombre: Nombre }) {
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={trazos[nombre]} /></svg>;
}
