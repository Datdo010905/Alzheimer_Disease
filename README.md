# NeuroDAlab — Alzheimer

React + TypeScript nhập 32 thông tin sức khỏe, gọi FastAPI để dự đoán bằng mô hình TensorFlow có sẵn. Có dữ liệu mẫu để thử nhanh; không lưu dữ liệu vào cơ sở dữ liệu hoặc localStorage.

## Cài đặt và chạy

Yêu cầu: Python 3.13 (môi trường hiện tại), Node.js 22.12+ và npm. Các lệnh dưới đây dùng PowerShell, bắt đầu từ thư mục gốc dự án.

**Terminal 1 — backend:**

```powershell
cd AD_BE
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Nếu đã có `.venv` và thư viện, chỉ chạy lệnh cuối. Cần file `AD_BE/models/modelNN_model.h5`; mô hình được tải khi backend khởi động, không huấn luyện lại.

**Terminal 2 — frontend:**

```powershell
cd AD_FE
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev -- --port 5173 --strictPort
```

Bỏ qua bước copy nếu đã có `.env`. Mở http://localhost:5173. `npm.cmd` tránh lỗi PowerShell chặn `npm.ps1`.

## Sử dụng và cấu hình

1. Nhập đủ thông tin ở 5 bước, hoặc bấm **Dùng thử dữ liệu mẫu**.
2. Chuyển đến bước **Nhận thức & chức năng**, bấm **Chạy dự đoán**.
3. Sửa thông tin sẽ xóa kết quả cũ; **Xóa dữ liệu** đưa form về trạng thái ban đầu.

`AD_FE/.env` cấu hình `VITE_API_URL=http://127.0.0.1:8000`; khởi động lại Vite sau khi sửa. CORS trong `AD_BE/main.py` cho phép `localhost:5173` và `127.0.0.1:5173`; nếu đổi địa chỉ frontend, cập nhật danh sách này.

| API | Chức năng |
| --- | --- |
| `GET /health` | Trạng thái backend và mô hình |
| `POST /predict` | JSON gồm 32 trường, không có `Diagnosis` |
| `/docs` | Thử API tại http://127.0.0.1:8000/docs |

## Cấu trúc code

- `AD_FE/src/App.tsx`: trạng thái form, chuyển bước, gửi dự đoán và hủy request sau 30 giây.
- `AD_FE/src/features.ts`: tên trường, lựa chọn, dữ liệu mẫu và kiểm tra đầu vào.
- `AD_FE/src/components/`: ô nhập, điều hướng bước, hiển thị kết quả.
- `AD_FE/src/api/prediction.ts`: gọi API và kiểm tra cấu trúc phản hồi.
- `AD_FE/src/App.css`, `index.css`: bố cục, responsive và style chung.
- `AD_BE/main.py`: schema, thứ tự đầu vào, tải mô hình, CORS và routes.
- `AD_BE/check_model.py`: kiểm tra kích thước đầu vào/đầu ra của mô hình.

## Kiểm tra và định dạng

Chạy trong `AD_FE`:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run format:check
npm.cmd run format
```

`build` tạo thư mục `dist`; `format` định dạng code bằng Prettier. Backend có thể kiểm tra mô hình bằng `.\.venv\Scripts\python.exe check_model.py` trong `AD_BE`.

## Quy ước và lỗi thường gặp

- `Diagnosis`: 0 = không mắc, 1 = mắc Alzheimer; kết quả chỉ tham khảo, không thay thế chẩn đoán bác sĩ.
- Các lựa chọn hiển thị bằng chữ nhưng gửi mã số. Gender: 0 Nam, 1 Nữ. Ethnicity: 0 Kinh, 1 Tày, 2 Thái, 3 Mường. EducationLevel: 0 Không đi học, 1 THPT, 2 Đại học, 3 Sau đại học. Nhãn dân tộc là tùy chỉnh giao diện, không phải mô hình đã huấn luyện lại cho các nhóm này.
- Không đổi thứ tự `PredictionInput` tùy ý: mô hình phụ thuộc thứ tự 32 đầu vào. Không tự thêm chuẩn hóa nếu chưa thay đổi quy trình huấn luyện tương ứng.
- **405:** `/predict` nhận POST; mở trực tiếp bằng trình duyệt là GET. Nếu lỗi ở OPTIONS, kiểm tra CORS được gắn vào đúng app.
- **422:** thiếu trường, sai kiểu hoặc giá trị không hợp lệ; xem phản hồi trong `/docs`.
- **Không kết nối/timeout:** kiểm tra backend cổng 8000, `VITE_API_URL`, CORS và log tải mô hình.
