/** Danh sách 32 trường theo bảng đã cung cấp; không bao gồm nhãn Diagnosis. */
export type Feature = {
  key: string
  label: string
  kind: 'number' | 'integer' | 'binary'
  positive?: boolean
  options?: { value: number; label: string }[]
}

type FeatureGroup = { title: string; description: string; fields: Feature[] }

const fieldGroups: FeatureGroup[] = [
  {
    title: 'Thông tin chung',
    description: 'Nhập thông tin cá nhân của người được đánh giá.',
    fields: [
      { key: 'Age', label: 'Tuổi', kind: 'integer' },
      {
        key: 'Gender',
        label: 'Giới tính',
        kind: 'binary',
        options: [
          { value: 0, label: 'Nam' },
          { value: 1, label: 'Nữ' },
        ],
      },
      {
        key: 'Ethnicity',
        label: 'Dân tộc',
        kind: 'integer',
        options: [
          { value: 0, label: 'Kinh' },
          { value: 1, label: 'Tày' },
          { value: 2, label: 'Thái' },
          { value: 3, label: 'Mường' },
        ],
      },
      {
        key: 'EducationLevel',
        label: 'Trình độ học vấn',
        kind: 'integer',
        options: [
          { value: 0, label: 'Không đi học' },
          { value: 1, label: 'Trung học phổ thông (THPT)' },
          { value: 2, label: 'Đại học' },
          { value: 3, label: 'Sau đại học (Thạc sĩ / Tiến sĩ)' },
        ],
      },
      { key: 'BMI', label: 'Chỉ số BMI', kind: 'number', positive: true },
    ],
  },
  {
    title: 'Lối sống',
    description: 'Thông tin về thói quen sinh hoạt và chất lượng cuộc sống.',
    fields: [
      {
        key: 'Smoking',
        label: 'Hút thuốc',
        kind: 'binary',
        options: [
          { value: 0, label: 'Không hút thuốc' },
          { value: 1, label: 'Có hút thuốc' },
        ],
      },
      { key: 'AlcoholConsumption', label: 'Mức tiêu thụ đồ uống có cồn', kind: 'number' },
      { key: 'PhysicalActivity', label: 'Hoạt động thể chất', kind: 'number' },
      { key: 'DietQuality', label: 'Chất lượng chế độ ăn', kind: 'number' },
      { key: 'SleepQuality', label: 'Chất lượng giấc ngủ', kind: 'number' },
    ],
  },
  {
    title: 'Tiền sử sức khỏe',
    description: 'Chọn Có hoặc Không cho từng bệnh lý và tiền sử đã ghi nhận.',
    fields: [
      { key: 'FamilyHistoryAlzheimers', label: 'Gia đình có tiền sử Alzheimer', kind: 'binary' },
      { key: 'CardiovascularDisease', label: 'Bệnh tim mạch', kind: 'binary' },
      { key: 'Diabetes', label: 'Đái tháo đường', kind: 'binary' },
      { key: 'Depression', label: 'Trầm cảm', kind: 'binary' },
      { key: 'HeadInjury', label: 'Chấn thương đầu', kind: 'binary' },
      { key: 'Hypertension', label: 'Tăng huyết áp', kind: 'binary' },
    ],
  },
  {
    title: 'Chỉ số sức khỏe',
    description: 'Sử dụng số đo có sẵn; các trường trống cần được bổ sung trước khi dự đoán.',
    fields: [
      { key: 'SystolicBP', label: 'Huyết áp tâm thu', kind: 'integer', positive: true },
      { key: 'DiastolicBP', label: 'Huyết áp tâm trương', kind: 'integer', positive: true },
      { key: 'CholesterolTotal', label: 'Cholesterol toàn phần', kind: 'number' },
      { key: 'CholesterolLDL', label: 'Cholesterol LDL', kind: 'number' },
      { key: 'CholesterolHDL', label: 'Cholesterol HDL', kind: 'number' },
      { key: 'CholesterolTriglycerides', label: 'Triglyceride', kind: 'number' },
    ],
  },
  {
    title: 'Nhận thức & chức năng',
    description: 'Nhập điểm đánh giá và biểu hiện đã ghi nhận trong dữ liệu.',
    fields: [
      { key: 'MMSE', label: 'Điểm MMSE', kind: 'number' },
      { key: 'FunctionalAssessment', label: 'Đánh giá chức năng', kind: 'number' },
      { key: 'MemoryComplaints', label: 'Phản ánh về trí nhớ', kind: 'binary' },
      { key: 'BehavioralProblems', label: 'Vấn đề hành vi', kind: 'binary' },
      { key: 'ADL', label: 'Hoạt động sinh hoạt · ADL', kind: 'number' },
      { key: 'Confusion', label: 'Lú lẫn', kind: 'binary' },
      { key: 'Disorientation', label: 'Mất định hướng', kind: 'binary' },
      { key: 'PersonalityChanges', label: 'Thay đổi tính cách', kind: 'binary' },
      { key: 'DifficultyCompletingTasks', label: 'Khó hoàn thành công việc', kind: 'binary' },
      { key: 'Forgetfulness', label: 'Hay quên', kind: 'binary' },
    ],
  },
]

const yesNoOptions = [
  { value: 0, label: 'Không' },
  { value: 1, label: 'Có' },
]
// Trường nhị phân dùng Có/Không, trừ trường có lựa chọn riêng như Gender.
export const groups: FeatureGroup[] = fieldGroups.map((group) => ({
  ...group,
  fields: group.fields.map((field) => ({
    ...field,
    options: field.options ?? (field.kind === 'binary' ? yesNoOptions : undefined),
  })),
}))

export const features = groups.flatMap((group) => group.fields)

export const emptyValues = Object.fromEntries(features.map((field) => [field.key, '']))

// Dữ liệu mẫu gồm 32 đầu vào; không gửi nhãn Diagnosis đến API.
export const sample: Record<string, string> = {
  Age: '73',
  Gender: '0',
  Ethnicity: '0',
  EducationLevel: '2',
  BMI: '22.92775',
  Smoking: '0',
  AlcoholConsumption: '13.29722',
  PhysicalActivity: '6.327112',
  DietQuality: '1.347214',
  SleepQuality: '9.025679',
  FamilyHistoryAlzheimers: '0',
  CardiovascularDisease: '0',
  Diabetes: '1',
  Depression: '1',
  HeadInjury: '0',
  Hypertension: '0',
  SystolicBP: '142',
  DiastolicBP: '72',
  CholesterolTotal: '242.3668',
  CholesterolLDL: '56.1509',
  CholesterolHDL: '33.68256',
  CholesterolTriglycerides: '162.1891',
  MMSE: '21.46353',
  FunctionalAssessment: '6.518877',
  MemoryComplaints: '0',
  BehavioralProblems: '0',
  ADL: '1.725883',
  Confusion: '0',
  Disorientation: '0',
  PersonalityChanges: '0',
  DifficultyCompletingTasks: '1',
  Forgetfulness: '0',
}

/** Kiểm tra kiểu và giới hạn cơ bản tương ứng với backend hiện có. */
export function validate(field: Feature, raw: string): string {
  // Kiểm tra chuỗi rỗng trước Number(): Number('') trả 0, vốn là lựa chọn hợp lệ.
  if (raw.trim() === '')
    return field.options ? 'Vui lòng chọn một lựa chọn.' : 'Vui lòng nhập giá trị.'
  const value = Number(raw)
  // Backend chuyển sang float32; từ chối số vượt giới hạn trước khi gửi.
  if (!Number.isFinite(value) || Math.abs(value) > 3.402823466e38) return 'Giá trị không hợp lệ.'
  if (field.options && !field.options.some((option) => option.value === value))
    return 'Lựa chọn không hợp lệ.'
  if (field.kind === 'binary' && value !== 0 && value !== 1) return 'Lựa chọn không hợp lệ.'
  if (field.kind === 'integer' && !Number.isInteger(value)) return 'Vui lòng nhập số nguyên.'
  if (field.positive ? value <= 0 : value < 0)
    return field.positive ? 'Giá trị phải lớn hơn 0.' : 'Giá trị không được âm.'
  return ''
}
