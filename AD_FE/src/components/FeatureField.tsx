import type { Feature } from '../features'

type Props = {
  field: Feature
  value: string
  error?: string
  onChange: (key: string, value: string) => void
}

export function FeatureField({ field, value, error, onChange }: Props) {
  return (
    <div className="field">
      <label htmlFor={field.key}>
        {field.label}
        <span aria-hidden="true"> *</span>
      </label>
      {field.options ? (
        <select
          id={field.key}
          value={value}
          onChange={(event) => onChange(field.key, event.target.value)}
          aria-invalid={!!error}
          aria-describedby={`${field.key}-hint`}
          required
        >
          <option value="">Chọn {field.label.toLocaleLowerCase('vi-VN')}</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={field.key}
          type="number"
          inputMode={field.kind === 'integer' ? 'numeric' : 'decimal'}
          step={field.kind === 'integer' ? '1' : 'any'}
          min="0"
          placeholder="Nhập giá trị"
          value={value}
          onChange={(event) => onChange(field.key, event.target.value)}
          aria-invalid={!!error}
          aria-describedby={`${field.key}-hint`}
          required
        />
      )}
      <small className={error ? 'field-error' : 'field-key'} id={`${field.key}-hint`}>
        {error || field.key}
      </small>
    </div>
  )
}
