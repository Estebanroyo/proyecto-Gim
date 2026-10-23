import { useMemo, useState } from 'react';
import { catalogo, coincideBusqueda } from './catalog';
import type { Variante } from './catalog';
import type { EjercicioPlan, RutinaDia } from './training';
import type { useLibraryPreferences } from './useLibraryPreferences';

type Preferencias = ReturnType<typeof useLibraryPreferences>;
type Opcion = { id: string; nombre: string; grupo: string; equipo: string; aliases: string[]; variante?: Variante; personalizado?: EjercicioPlan };
type Props = { rutinas: RutinaDia[]; preferencias: Preferencias; onElegir: (opcion: { variante?: Variante; personalizado?: EjercicioPlan }) => void; onPersonalizado: (nombre: string) => void };
export default function ExercisePicker({ rutinas, preferencias: p, onElegir, onPersonalizado }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [grupo, setGrupo] = useState('');
  const [equipo, setEquipo] = useState('');
  const [soloFavoritos, setSoloFavoritos] = useState(false);
  const opciones = useMemo<Opcion[]>(() => [
    ...catalogo.map(v => ({ id: v.id, nombre: v.nombre, grupo: v.grupo, equipo: v.equipo, aliases: [...v.aliases, v.familia], variante: v })),
    ...rutinas.flatMap(r => r.ejercicios.filter(e => !catalogo.some(v => v.id === e.varianteId)).map(e => ({ id: `propio:${r.id}:${e.id}`, nombre: e.nombre, grupo: e.grupo, equipo: 'Personalizado', aliases: [r.titulo], personalizado: e }))),
  ], [rutinas]);
  const grupos = [...new Set(opciones.map(o => o.grupo))].sort();
  const equipos = [...new Set(opciones.map(o => o.equipo))].sort();
  const resultados = opciones.filter(o => (!grupo || o.grupo === grupo) && (!equipo || o.equipo === equipo) && (!soloFavoritos || p.datos.favoritos.includes(o.id)) && coincideBusqueda(busqueda, [o.nombre, o.grupo, o.equipo, ...o.aliases, Object.hasOwn(p.datos.aliases, o.id) ? p.datos.aliases[o.id] : '']))
    .sort((a, b) => Number(p.datos.favoritos.includes(b.id)) - Number(p.datos.favoritos.includes(a.id)) || (p.datos.recientes.indexOf(a.id) < 0 ? 999 : p.datos.recientes.indexOf(a.id)) - (p.datos.recientes.indexOf(b.id) < 0 ? 999 : p.datos.recientes.indexOf(b.id)) || a.nombre.localeCompare(b.nombre, 'es'));
  return <div className="exercise-picker">
    <button type="button" className="button secondary small" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>{abierto ? 'Cerrar biblioteca' : 'Elegir en la biblioteca'}</button>
    {abierto && <div className="library-content">
      <label>Buscar ejercicio<input type="search" value={busqueda} maxLength={100} placeholder="Ej.: press banca o bench press" onChange={e => setBusqueda(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }} /></label>
      <div className="library-filters"><label>Grupo<select value={grupo} onChange={e => setGrupo(e.target.value)}><option value="">Todos</option>{grupos.map(g => <option key={g}>{g}</option>)}</select></label><label>Tipo de equipo<select value={equipo} onChange={e => setEquipo(e.target.value)}><option value="">Todos</option>{equipos.map(g => <option key={g}>{g}</option>)}</select></label></div>
      <button type="button" className="library-favorite-filter" aria-pressed={soloFavoritos} onClick={() => setSoloFavoritos(!soloFavoritos)}>{soloFavoritos ? 'Viendo favoritos · mostrar todos' : 'Solo favoritos'}</button>
      <p className="muted" role="status">{resultados.length} resultados · favoritos y elegidos recientemente primero.</p>
      <p className="muted">Favoritos, alias y recientes son preferencias de este navegador; no se incluyen en el respaldo.</p>
      <ul className="library-results">{resultados.map(o => <li key={o.id}>
        <div className="library-result-main"><button type="button" className="library-choice" onClick={() => { onElegir(o); p.reciente(o.id); setAbierto(false); }}><strong>{o.nombre}</strong><small>{o.grupo} · {o.equipo}</small></button><button type="button" className="edit-button" aria-pressed={p.datos.favoritos.includes(o.id)} aria-label={`${p.datos.favoritos.includes(o.id) ? 'Quitar de' : 'Agregar a'} favoritos: ${o.nombre}`} onClick={() => p.favorito(o.id)}>{p.datos.favoritos.includes(o.id) ? 'Favorito' : 'Favorito +'}</button></div>
        <details className="quiet-details library-alias"><summary>Alias de búsqueda{Object.hasOwn(p.datos.aliases, o.id) && p.datos.aliases[o.id] ? ` · ${p.datos.aliases[o.id]}` : ''}</summary><label>Tu nombre para encontrarlo<input maxLength={100} defaultValue={Object.hasOwn(p.datos.aliases, o.id) ? p.datos.aliases[o.id] : ''} onBlur={e => p.alias(o.id, e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }} /></label><p className="muted">Se conserva al salir del campo, solo en este navegador. No cambia el nombre ni el historial.</p></details>
      </li>)}</ul>
      {!resultados.length && <p className="muted">No hay coincidencias. Cambiá los filtros o escribí tu propio ejercicio.</p>}
      <button type="button" className="button secondary small" onClick={() => { onPersonalizado(busqueda); setAbierto(false); }}>Usar un ejercicio personalizado</button>
      {p.aviso && <p className="draft-status draft-warning" role="status">{p.aviso}</p>}
    </div>}
  </div>;
}
