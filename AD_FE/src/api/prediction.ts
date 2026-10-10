export type Prediction = {
  predicted_class: 0 | 1
  model_scores: { class_0: number; class_1: number }
  note?: string
}
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

/** Xác minh cấu trúc kết quả để không hiển thị dữ liệu lỗi từ API. */
function isPrediction(value: unknown): value is Prediction {
  if (!value || typeof value !== 'object') return false
  const result = value as Partial<Prediction>
  const scores = result.model_scores
  return (
    (result.predicted_class === 0 || result.predicted_class === 1) &&
    !!scores &&
    [scores.class_0, scores.class_1].every(
      (score) => typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 1,
    ) &&
    (result.note === undefined || typeof result.note === 'string')
  )
}

export async function requestPrediction(
  payload: Record<string, number>,
  signal: AbortSignal,
): Promise<Prediction> {
  const response = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 422)
      throw new Error('API từ chối dữ liệu. Kiểm tra kiểu dữ liệu và tên 32 trường trong backend.')
    throw new Error(`Backend trả lỗi HTTP ${response.status}. Kiểm tra terminal chạy FastAPI.`)
  }
  if (!isPrediction(body)) throw new Error('Kết quả API không đúng cấu trúc dự kiến.')
  return body
}
