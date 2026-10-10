/**
 * Giao diện Alzheimer: form 5 nhóm, kiểm tra 32 trường và gọi FastAPI.
 * Không lưu dữ liệu sức khỏe vào localStorage, không tạo kết quả dự đoán giả.
 */
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { emptyValues, features, groups, sample, validate } from './features'
import { requestPrediction } from './api/prediction'
import type { Prediction } from './api/prediction'
import { AssessmentSteps } from './components/AssessmentSteps'
import { FeatureField } from './components/FeatureField'
import { PredictionResult } from './components/PredictionResult'
import './App.css'

export default function App() {
  const [values, setValues] = useState<Record<string, string>>({ ...emptyValues })
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<Prediction | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sampleMode, setSampleMode] = useState(false)
  const requestRef = useRef<AbortController | null>(null)
  const resultRef = useRef<HTMLElement | null>(null)
  const group = groups[step]

  // Hủy request khi rời trang để không giữ kết nối không còn sử dụng.
  useEffect(() => () => requestRef.current?.abort(), [])

  function changeValue(key: string, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => ({ ...previous, [key]: '' }))
    setResult(null)
    setError('')
    setSampleMode(false)
  }

  function fillSample() {
    setValues({ ...sample })
    setErrors({})
    setError('')
    setResult(null)
    setSampleMode(true)
  }

  function reset() {
    setValues({ ...emptyValues })
    setErrors({})
    setError('')
    setResult(null)
    setStep(0)
    setSampleMode(false)
  }

  function nextStep() {
    const nextErrors = Object.fromEntries(
      group.fields.map((field) => [field.key, validate(field, values[field.key])]),
    )
    setErrors(nextErrors)
    if (!Object.values(nextErrors).some(Boolean))
      setStep((current) => Math.min(current + 1, groups.length - 1))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    if (step < groups.length - 1) {
      nextStep()
      return
    }
    // Người dùng có thể chuyển bước trực tiếp, nên kiểm tra lại toàn bộ form trước khi gửi.
    const nextErrors = Object.fromEntries(
      features.map((field) => [field.key, validate(field, values[field.key])]),
    )
    setErrors(nextErrors)
    const invalidGroup = groups.findIndex((item) =>
      item.fields.some((field) => nextErrors[field.key]),
    )
    if (invalidGroup >= 0) {
      setStep(invalidGroup)
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    const controller = new AbortController()
    requestRef.current = controller
    const timeout = window.setTimeout(() => controller.abort(), 30000)
    try {
      // Gửi khóa có tên; backend chịu trách nhiệm sắp đúng thứ tự đầu vào.
      const payload = Object.fromEntries(
        features.map((field) => [field.key, Number(values[field.key])]),
      )
      const body = await requestPrediction(payload, controller.signal)
      setResult(body)
      window.setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
        100,
      )
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError')
        setError('Quá 30 giây chưa nhận được kết quả. Kiểm tra backend và thử lại.')
      else if (cause instanceof TypeError)
        setError(
          'Không kết nối được API. Kiểm tra FastAPI đang chạy ở cổng 8000, VITE_API_URL và cấu hình CORS.',
        )
      else setError(cause instanceof Error ? cause.message : 'Không thể dự đoán. Vui lòng thử lại.')
    } finally {
      window.clearTimeout(timeout)
      requestRef.current = null
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark" aria-hidden="true">
            n
          </span>
          <span>
            neuro<span className="brand-light">DAlab</span>
            <small>ALZHEIMER ASSESSMENT</small>
          </span>
        </a>
        <span className="header-tag">
          <span /> Đánh giá sức khỏe nhận thức
        </span>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">THÔNG TIN SỨC KHỎE · ĐÁNH GIÁ NHẬN THỨC</span>
            <h1>
              Hiểu sức khỏe.
              <br />
              <em>Chủ động chăm sóc.</em>
            </h1>
            <p>
              Cung cấp thông tin sức khỏe, tiền sử và các chỉ số nhận thức để nhận kết quả phân tích
              từ mô hình Alzheimer.
            </p>
            <div className="hero-meta">
              <span>32 thông tin cần hoàn thành</span>
              <i />
              <span>5 bước đánh giá</span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="art-core">
              <span>n</span>
            </div>
            <span className="art-dot dot-one" />
            <span className="art-dot dot-two" />
            <span className="art-label">
              NEURAL NETWORK<span>32 INPUTS / 2 CLASSES</span>
            </span>
          </div>
        </section>

        <div className="workspace-heading">
          <div>
            <span className="eyebrow">PHIẾU THÔNG TIN SỨC KHỎE</span>
            <h2>Thông tin đánh giá</h2>
          </div>
          <button
            type="button"
            className="button secondary"
            disabled={loading}
            onClick={fillSample}
          >
            Dùng thử dữ liệu mẫu
          </button>
        </div>

        <div className="workspace">
          <AssessmentSteps values={values} step={step} loading={loading} onStepChange={setStep} />

          <form className="form-card" onSubmit={submit} noValidate aria-busy={loading}>
            <div className="form-heading">
              <span className="section-badge">{String(step + 1).padStart(2, '0')}</span>
              <div>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
              </div>
            </div>
            <div className="coding-note">
              Vui lòng hoàn thành các trường có dấu *. Sử dụng thông tin và chỉ số đã được ghi nhận.
            </div>
            {sampleMode && (
              <div className="sample-banner" role="status">
                Đã điền đủ 32 trường bằng dữ liệu mẫu. Bạn có thể chỉnh sửa hoặc chọn bước cuối để
                chạy dự đoán.
              </div>
            )}
            <fieldset disabled={loading} className="field-grid">
              <legend className="sr-only">{group.title}</legend>
              {group.fields.map((field) => (
                <FeatureField
                  key={field.key}
                  field={field}
                  value={values[field.key]}
                  error={errors[field.key]}
                  onChange={changeValue}
                />
              ))}
            </fieldset>
            {error && (
              <div className="error-banner" role="alert">
                {error}
              </div>
            )}
            <div className="form-footer">
              <button
                type="button"
                className="button text-button"
                disabled={loading}
                onClick={reset}
              >
                Xóa dữ liệu
              </button>
              <div className="navigation-buttons">
                {step > 0 && (
                  <button
                    type="button"
                    className="button secondary"
                    disabled={loading}
                    onClick={() => setStep((previous) => previous - 1)}
                  >
                    Quay lại
                  </button>
                )}
                <button className="button primary" type="submit" disabled={loading}>
                  {loading
                    ? 'Đang phân tích…'
                    : step === groups.length - 1
                      ? 'Chạy dự đoán →'
                      : 'Tiếp tục →'}
                </button>
              </div>
            </div>
          </form>

          <PredictionResult
            result={result}
            loading={loading}
            sampleMode={sampleMode}
            resultRef={resultRef}
          />
        </div>
        <footer className="page-footer">
          <span>neuroDAlab / Đánh giá sức khỏe nhận thức</span>
          <span>Dữ liệu nhập chỉ giữ trong phiên trang hiện tại.</span>
        </footer>
      </main>
    </div>
  )
}
