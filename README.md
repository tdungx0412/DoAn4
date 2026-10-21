# 🎓 Wayground — Nền Tảng Luyện Thi Trắc Nghiệm Online Đa Môn Học

> **Đồ Án 4 (DA4)**: Hệ thống khảo thí trực tuyến phong cách **Wayground (Quizizz)** hỗ trợ đa môn học dựa trên nội dung người dùng đóng góp (Crowdsourced / User-Generated Content).

---

## 🌟 Tính Năng Nổi Bật

1. **Khám Phá Đa Môn Học (Explore Hub)**:
   - Bộ lọc danh mục môn học trực quan (Toán Học, Tiếng Anh, Tin Học, Vật Lý & Hóa Học...).
   - Tìm kiếm đề thi theo từ khóa, giáo viên biên soạn, số lượng câu hỏi và lượt thi.
2. **Tham Gia Phòng Thi Bằng Mã PIN 6 Số (Join Code)**:
   - Thí sinh chỉ cần nhập mã PIN 6 chữ số (ví dụ: `101101`, `202202`, `303303`) để vào thi ngay mà không cần tìm kiếm phức tạp.
3. **Bộ Nạp Đề Thông Minh (Creator Studio - Smart Parser)**:
   - **Text Parser**: Cho phép giáo viên / người dùng copy-paste trực tiếp văn bản thô từ Word/PDF hoặc ghi chú, hệ thống tự động bóc tách thành danh sách câu hỏi & đáp án.
   - **Excel Parser**: Hỗ trợ tải file `.xlsx` / `.csv` chứa đề thi để import hàng loạt trong 2 giây.
4. **Phòng Thi Trực Tuyến Hiện Đại (Exam Engine)**:
   - **Đồng hồ đếm ngược**: Đồng bộ chuẩn xác, tự động nộp bài khi thời gian về 0.
   - **Auto-save**: Tự động lưu đáp án sau mỗi lượt click vào `localStorage` phòng trường hợp mất mạng hoặc F5 tải lại trang.
   - **Anti-cheat**: Phát hiện chuyển tab hoặc rời màn hình làm bài, hiển thị cảnh báo và ghi nhận vào lịch sử bài thi.
   - **Bảng điều hướng câu hỏi**: Phân loại trực quan: Đã làm (tím), Chưa làm (xám), Đang xem (xanh), Đánh dấu cần xem lại (vàng).
5. **Hỗ Trợ Công Thức Toán / Hóa Chuẩn ($\LaTeX$ qua KaTeX)**:
   - Render công thức toán học, lý, hóa sắc nét ngay trong câu hỏi và các phương án A/B/C/D.
6. **Báo Cáo Điểm Số & Lời Giải Chi Tiết**:
   - Hiệu ứng pháo hoa chúc mừng (`canvas-confetti`).
   - Chấm điểm tự động trên thang điểm 10, thống kê tỷ lệ chính xác, thời gian hoàn thành.
   - Xem lại toàn bộ bài làm kèm đáp án đúng và lời giải thích chi tiết.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend (`/client`)**:
  - React 19 + Vite 8 + TypeScript
  - Styling: Modern Glassmorphism CSS + Theme Tokens
  - Thư viện: `lucide-react` (Icons), `katex` (Công thức toán LaTeX), `canvas-confetti` (Pháo hoa hoàn thành)
- **Backend (`/server`)**:
  - Node.js + Express + TypeScript
  - ORM: **Prisma ORM**
  - Cơ sở dữ liệu: **SQLite** (sẵn sàng chuyển sang **PostgreSQL** chỉ với 1 dòng trong file `.env`)
  - File Parser: `xlsx` (Excel Reader) & Regex Text Parser
- **Monorepo Root**:
  - `concurrently`: Khởi chạy song song cả Client và Server bằng một lệnh duy nhất.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
C:\DA4\
├── client/                     # Frontend React Vite TypeScript
│   ├── src/
│   │   ├── components/         # Header, Sidebar, QuizCard, CategoryChips, JoinPinModal, MathRenderer...
│   │   ├── pages/              # ExplorePage, ExamRunnerPage, ExamResultPage, CreatorStudioPage, GuidePage...
│   │   ├── services/           # api.ts (RESTful client kết nối Backend)
│   │   ├── types/              # TypeScript Interfaces & Models
│   │   ├── App.tsx             # Luồng điều hướng và State chính
│   │   └── index.css           # Design System & Thẩm mỹ Wayground
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Backend Node.js Express TypeScript
│   ├── src/
│   │   ├── controllers/        # examController, subjectController, uploadController
│   │   ├── routes/             # api.ts (Endpoints /api/exams, /api/subjects...)
│   │   ├── services/           # parserService (Bóc tách Text & Excel)
│   │   ├── prisma/             # schema.prisma & seed.ts (Dữ liệu mẫu)
│   │   └── index.ts            # Entrypoint Express Server (Port 5000)
│   ├── .env                    # PORT=5000, DATABASE_URL="file:./dev.db"
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                # Root package quản lý toàn bộ hệ thống
└── README.md                   # Hướng dẫn chi tiết
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Khởi chạy toàn bộ hệ thống (Một lệnh duy nhất):
Mở terminal tại thư mục gốc `C:\DA4` và chạy:
```bash
npm run dev
```
> Lệnh này sẽ tự động khởi động:
> - **Backend API Server** tại: `http://localhost:5000`
> - **Frontend React Web** tại: `http://localhost:5173`

### 2. Các lệnh độc lập hữu ích:
- Chạy riêng Frontend: `npm run dev:client`
- Chạy riêng Backend: `npm run dev:server`
- Nạp lại dữ liệu mẫu vào database: `npm run db:seed`
- Mở giao diện xem CSDL trực quan của Prisma: `npm run db:studio`

---

## 🔑 Mã PIN Thử Nghiệm Có Sẵn

Bạn có thể bấm vào nút **"Vào phòng bằng mã PIN"** và thử các mã sau:
- **`101101`**: Đề thi Giải tích & Tích phân THPT Quốc Gia (Toán học có công thức LaTeX).
- **`202202`**: Thử thách Ngữ pháp Tiếng Anh B2 - C1 (TOEIC / THPTQG).
- **`303303`**: Kiểm tra Kiến thức Nền tảng JavaScript & Web Development (CNTT).
