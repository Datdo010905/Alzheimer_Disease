"""
Kiểm tra khả năng tải mô hình Alzheimer đã huấn luyện.
Hiển thị kích thước đầu vào và đầu ra của mô hình.
"""

from pathlib import Path
from tensorflow.keras.models import load_model

# Xác định đường dẫn dựa trên vị trí file Python.
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "modelNN_model.h5"

if not MODEL_PATH.is_file():
    raise FileNotFoundError(f"Không tìm thấy mô hình: {MODEL_PATH}")

# Chỉ nạp mô hình để dự đoán, không cần cấu hình huấn luyện.
model = load_model(MODEL_PATH, compile=False)

print("\nTải mô hình thành công!")
print("Đầu vào:", model.input_shape)
print("Đầu ra:", model.output_shape)