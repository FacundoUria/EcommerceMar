import Icon from './Icon.jsx';

export default function QuantityStepper({ value, onChange, min = 1, max = 99, size = 'md', label = 'Cantidad' }) {
  const chico = size === 'sm';
  const btn = `flex items-center justify-center rounded-full text-tinta transition active:scale-90 hover:bg-salvia disabled:opacity-30 ${chico ? 'size-8' : 'size-11'}`;
  return (
    <div
      className={`inline-flex items-center rounded-full border border-verde/15 bg-crema-card ${chico ? 'p-0.5' : 'p-1'}`}
      role="group"
      aria-label={label}
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Restar uno">
        <Icon name="menos" size={chico ? 16 : 18} />
      </button>
      <span className={`text-center font-bold tabular-nums ${chico ? 'w-6 text-sm' : 'w-8'}`} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Sumar uno">
        <Icon name="mas" size={chico ? 16 : 18} />
      </button>
    </div>
  );
}
