import type { Ref } from 'react'
import type { Prediction } from '../api/prediction'

// Quy ước Diagnosis được chủ dự án xác nhận: 0 = không mắc, 1 = mắc Alzheimer.
const assessmentMessages = {
  0: {
    title: 'Dự đoán không bị Alzheimer',
    description:
      'Theo thông tin đã nhập, hệ thống dự đoán bạn thuộc nhóm không mắc Alzheimer. Kết quả này không khẳng định bạn hoàn toàn không mắc bệnh.',
  },
  1: {
    title: 'Dự đoán bạn bị Alzheimer',
    description:
      'Theo thông tin đã nhập, hệ thống dự đoán bạn thuộc nhóm mắc Alzheimer. Cần có đánh giá của bác sĩ để xác định tình trạng thực tế.',
  },
} as const

type Props = {
  result: Prediction | null
  loading: boolean
  sampleMode: boolean
  resultRef: Ref<HTMLElement>
}

export function PredictionResult({ result, loading, sampleMode, resultRef }: Props) {
  return (
    <aside className="result-card" ref={resultRef} aria-live="polite" aria-busy={loading}>
      <div className="result-top">
        <span className="eyebrow">KẾT QUẢ PHÂN TÍCH</span>
      </div>
      <h3>Đánh giá Alzheimer</h3>
      {loading ? (
        <div className="empty-result">
          <span className="spinner" />
          <strong>Đang phân tích thông tin</strong>
          <p>Vui lòng đợi trong giây lát.</p>
        </div>
      ) : result ? (
        <div className="result-content">
          <div
            className={`assessment-summary ${result.predicted_class === 1 ? 'assessment-positive' : 'assessment-negative'}`}
          >
            <span className="result-caption">
              {sampleMode ? 'ĐÁNH GIÁ TỪ DỮ LIỆU MẪU' : 'ĐÁNH GIÁ TỪ THÔNG TIN ĐÃ NHẬP'}
            </span>
            <h4>{assessmentMessages[result.predicted_class].title}</h4>
            <p>{assessmentMessages[result.predicted_class].description}</p>
          </div>
          {sampleMode && (
            <div className="sample-banner">
              Kết quả này sử dụng dữ liệu mẫu, không phải thông tin sức khỏe của bạn.
            </div>
          )}
        </div>
      ) : (
        <div className="empty-result">
          <span className="empty-symbol" aria-hidden="true">
            ◎
          </span>
          <strong>Sẵn sàng khi bạn hoàn tất</strong>
          <p>Điền đủ thông tin và chọn “Chạy dự đoán” ở bước cuối.</p>
        </div>
      )}
      <div className="result-footnote">
        <strong>Kết quả tham khảo</strong>
        <p>Đánh giá tự động dựa trên thông tin bạn nhập, không thay thế chẩn đoán của bác sĩ.</p>
      </div>
    </aside>
  )
}
