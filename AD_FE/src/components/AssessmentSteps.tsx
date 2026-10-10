import { features, groups, validate } from '../features'

type Props = {
  values: Record<string, string>
  step: number
  loading: boolean
  onStepChange: (step: number) => void
}

export function AssessmentSteps({ values, step, loading, onStepChange }: Props) {
  const completed = features.filter((field) => !validate(field, values[field.key])).length
  return (
    <aside className="steps-card" aria-label="Các nhóm thông tin">
      <div className="progress-label">
        <strong>Tiến độ nhập liệu</strong>
        <span>
          {completed}/{features.length}
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Số trường hợp lệ"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={features.length}
      >
        <div style={{ width: `${(completed / features.length) * 100}%` }} />
      </div>
      <nav>
        {groups.map((item, index) => {
          const count = item.fields.filter((field) => !validate(field, values[field.key])).length
          return (
            <button
              key={item.title}
              type="button"
              disabled={loading}
              className={`step-button ${step === index ? 'active' : ''}`}
              onClick={() => onStepChange(index)}
              aria-current={step === index ? 'step' : undefined}
            >
              <span className={`step-number ${count === item.fields.length ? 'done' : ''}`}>
                {count === item.fields.length ? '✓' : String(index + 1).padStart(2, '0')}
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>
                  {count}/{item.fields.length} trường hoàn tất
                </small>
              </span>
            </button>
          )
        })}
      </nav>
      <div className="sidebar-note">
        <strong>Lưu ý khi xem kết quả</strong>
        <p>Kết quả mô hình không thay thế đánh giá hoặc chẩn đoán của chuyên gia y tế.</p>
      </div>
    </aside>
  )
}
