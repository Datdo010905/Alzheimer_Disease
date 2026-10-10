"""
API dự đoán Alzheimer.

- Nhận đủ 32 đặc trưng, không nhận cột Diagnosis.
- Giữ thứ tự đầu vào theo bảng dữ liệu đã cung cấp.
- Dùng dữ liệu số trực tiếp vì notebook hiện tại không dùng scaler.
- Diagnosis: 0 = không mắc, 1 = mắc (quy ước đã xác nhận với chủ dự án).
"""

import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from tensorflow.keras.models import load_model

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "modelNN_model.h5"
logger = logging.getLogger("uvicorn.error")

Binary = Literal[0, 1]


class PredictionInput(BaseModel):
    """Các trường bắt buộc, khai báo theo đúng thứ tự đầu vào."""

    # Từ chối trường thừa và các giá trị NaN, vô cực.
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)

    Age: int = Field(ge=0)
    Gender: Binary
    Ethnicity: int = Field(ge=0)
    EducationLevel: int = Field(ge=0)
    BMI: float = Field(gt=0)
    Smoking: Binary
    AlcoholConsumption: float = Field(ge=0)
    PhysicalActivity: float = Field(ge=0)
    DietQuality: float = Field(ge=0)
    SleepQuality: float = Field(ge=0)
    FamilyHistoryAlzheimers: Binary
    CardiovascularDisease: Binary
    Diabetes: Binary
    Depression: Binary
    HeadInjury: Binary
    Hypertension: Binary
    SystolicBP: int = Field(gt=0)
    DiastolicBP: int = Field(gt=0)
    CholesterolTotal: float = Field(ge=0)
    CholesterolLDL: float = Field(ge=0)
    CholesterolHDL: float = Field(ge=0)
    CholesterolTriglycerides: float = Field(ge=0)
    MMSE: float = Field(ge=0)
    FunctionalAssessment: float = Field(ge=0)
    MemoryComplaints: Binary
    BehavioralProblems: Binary
    ADL: float = Field(ge=0)
    Confusion: Binary
    Disorientation: Binary
    PersonalityChanges: Binary
    DifficultyCompletingTasks: Binary
    Forgetfulness: Binary


# Cố định thứ tự bằng thứ tự khai báo ở trên.
# Thứ tự các khóa trong JSON người dùng gửi không ảnh hưởng.
FEATURE_ORDER = tuple(PredictionInput.model_fields)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Tải mô hình khi ứng dụng khởi động."""

    if not MODEL_PATH.is_file():
        raise RuntimeError(f"Không tìm thấy mô hình: {MODEL_PATH}")

    # Chỉ suy luận nên không cần khôi phục optimizer/loss của lần huấn luyện.
    model = load_model(MODEL_PATH, compile=False)

    if model.input_shape != (None, 32):
        raise RuntimeError("Mô hình phải nhận đúng 32 đặc trưng.")

    if model.output_shape != (None, 2):
        raise RuntimeError("Mô hình phải có 2 đầu ra.")

    app.state.model = model
    logger.info("Model loaded; API ready.")

    yield

    app.state.model = None


app = FastAPI(
    title="Alzheimer Prediction API",
    description="API demo phục vụ học tập và thử nghiệm mô hình.",
    version="1.0.0",
    lifespan=lifespan,
)


# Gắn CORS vào chính app chứa routes để xử lý preflight OPTIONS từ trình duyệt.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health():
    """Kiểm tra backend đang hoạt động."""
    return {
        "status": "ok",
        "model_loaded": app.state.model is not None,
    }


@app.post("/predict")
def predict(data: PredictionInput):
    """Chuyển dữ liệu thành mảng rồi gọi mô hình."""

    values = [getattr(data, name) for name in FEATURE_ORDER]

    # Giữ shape (1, 32); kiểm tra lại vì số hữu hạn có thể tràn khi ép sang float32.
    with np.errstate(over="ignore", invalid="ignore"):
        inputs = np.asarray([values], dtype=np.float32)

    if not np.isfinite(inputs).all():
        raise HTTPException(
            status_code=422,
            detail="Dữ liệu chứa giá trị vượt phạm vi xử lý.",
        )

    # Chạy dự đoán, không huấn luyện lại.
    outputs = app.state.model(inputs, training=False).numpy()

    if outputs.shape != (1, 2) or not np.isfinite(outputs).all():
        raise HTTPException(
            status_code=500,
            detail="Mô hình trả về kết quả không hợp lệ.",
        )

    scores = outputs[0]
    predicted_class = int(np.argmax(scores))

    return {
        "predicted_class": predicted_class,
        "model_scores": {
            "class_0": float(scores[0]),
            "class_1": float(scores[1]),
        },
        "note": (
            "Kết quả thử nghiệm của mô hình, không thay thế chẩn đoán y khoa. "
            "Điểm softmax không phải xác suất mắc bệnh đã được kiểm chứng."
        ),
    }
