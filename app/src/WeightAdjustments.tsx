type Props = {
  disabled: boolean;
  onIncrementar: (kg: number) => void;
  onCero: () => void;
};

export default function WeightAdjustments({ disabled, onIncrementar, onCero }: Props) {
  const pasos = [1.25, 5, 10, 20];
  const botones = (signo: 1 | -1) => pasos.map(kg => (
    <button key={kg} type="button" className="weight-step" disabled={disabled}
      onClick={() => onIncrementar(signo * kg)} aria-label={`${signo === 1 ? 'Sumar' : 'Restar'} ${kg.toLocaleString('es-AR')} kilos`}>
      {signo === 1 ? '+' : '−'}{kg.toLocaleString('es-AR')}<span>kg</span>
    </button>
  ));
  return <div className="weight-adjustments">
    <div className="weight-controls" role="group" aria-label="Sumar peso">{botones(1)}</div>
    <details className="quiet-details weight-secondary">
      <summary>Restar peso o volver a cero</summary>
      <div className="weight-controls" role="group" aria-label="Restar peso">{botones(-1)}</div>
      <div className="weight-tools"><button type="button" disabled={disabled} onClick={onCero}>Poner en 0 kg</button></div>
    </details>
  </div>;
}
