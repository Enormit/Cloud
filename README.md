# Hệ Thống Đăng Ký Môn Học Sinh Viên (AWS Cloud Architecture)

Hệ thống đăng ký môn học trực tuyến cho sinh viên được thiết kế theo tiêu chuẩn kiến trúc đám mây AWS hiện đại, tích hợp gửi email tự động khi đăng ký/hủy môn học, phát hiện trùng lịch học, quản lý giới hạn tín chỉ, và bảng điều khiển quản trị viên.

---

## 🌟 Tính Năng Nổi Bật

### 1. Dành Cho Sinh Viên
- 📚 **Đăng ký học phần thông minh**:
  - Tra cứu danh mục môn học theo Khoa/Viện, từ khóa mã môn, tên môn hoặc tên giảng viên.
  - Hiển thị trực quan sĩ số lớp, số chỗ còn lại theo thời gian thực (real-time capacity meter).
  - Kiểm tra điều kiện môn học tiên quyết.
  - **Tự động gửi email xác nhận** (HTML mẫu chuẩn trường đại học) ngay khi đăng ký thành công.
- ⚡ **Kiểm tra trùng lịch học (Clash Detection)**:
  - Cảnh báo ngay lập tức nếu môn học bạn chọn bị trùng thứ và tiết học với một môn đã đăng ký trước đó.
- 🛡️ **Kiểm soát giới hạn tín chỉ (Credit Limit)**:
  - Thanh tiến độ trực quan hiển thị số tín chỉ đã tích lũy (Tối thiểu 10 TC, Tối đa 24 TC).
  - Tự động chặn đăng ký vượt quá giới hạn theo quy chế đào tạo.
- 📅 **Thời khóa biểu tuần học (Weekly Timetable Matrix)**:
  - Lưới thời khóa biểu tự động cập nhật từ Thứ 2 đến Thứ 7, Tiết 1 đến Tiết 12.
  - Phân màu trực quan theo từng môn, hiển thị rõ phòng học và tên giảng viên.
  - Hỗ trợ nút **In thời khóa biểu** trực tiếp từ trình duyệt.
- 📝 **Quản lý học phần đã đăng ký**:
  - Xem danh sách môn học đã chọn, ngày đăng ký, tạm tính học phí theo số tín chỉ.
  - Chức năng **Hủy môn học** kèm hộp thoại xác nhận và **tự động gửi email thông báo hủy môn**.
- 📬 **Hộp thư thông báo trong ứng dụng (In-App Email Inbox)**:
  - Cho phép sinh viên xem trực tiếp các email thông báo đã nhận ngay trên giao diện web (rất tiện lợi cho quá trình kiểm thử local).

### 2. Dành Cho Quản Trị Viên / Giảng Viên (Admin Portal)
- 📊 **Thống kê tổng quan**: Số lượng sinh viên, tổng số học phần, số lượt đăng ký thành công, trạng thái dịch vụ gửi mail.
- 🛠️ **Quản lý học phần**: Thêm mới, chỉnh sửa thông tin, điều chỉnh sĩ số tối đa hoặc xóa môn học.
- 👥 **Xem danh sách sinh viên theo môn (Course Roster)**: Xem chi tiết các sinh viên đã ghi danh vào từng lớp học phần.
- ⏱️ **Cấu hình đợt đăng ký (Registration Window)**: Đóng/Mở cổng đăng ký, hẹn giờ bắt đầu và kết thúc đợt học.
- ✉️ **Công cụ kiểm tra gửi mail (Email Tester)**: Thử nghiệm gửi email thực tế qua AWS SES hoặc SMTP ngay từ giao diện.

---

## 🏗️ Kiến Trúc Hệ Thống (AWS Cloud Architecture)

Kiến trúc triển khai đám mây được đồng bộ và kế thừa từ `/home/ubuntu/Dev/labaws/terraform`:

```
                                 [ Internet / User ]
                                          │
                                          ▼
                             [ AWS CloudFront (CDN + TLS) ]
                              │                         │
            Static Files (/index.html, /assets/*)      API Requests (/api/*)
                              │                         │ (Custom Header: X-Origin-Verify)
                              ▼                         ▼
                     [ S3 Static Website ]    [ Application Load Balancer (ALB) ]
                                                        │
                                                        ▼ (Private Subnets)
                                              [ AWS ECS Fargate Tasks ]
                                              (Backend FastAPI Container)
                                               ├── AWS Secrets Manager (Config/Secrets)
                                               ├── AWS DynamoDB (Accounts, Courses, Regs)
                                               ├── AWS SES (Email Notification Delivery)
                                               └── CloudWatch Logs & Metrics
```

- **Frontend**: Single Page Application (SPA) viết bằng **React 18**, đóng gói trong **Docker** cùng **Nginx Reverse Proxy**.
- **Backend**: **FastAPI** hiệu năng cao, xử lý email bất đồng bộ qua `BackgroundTasks`, kết nối DynamoDB thông qua `boto3`.
- **Bảo mật & Cấu hình**:
  - Không hardcode credentials.
  - Hỗ trợ nạp bí mật cấu hình từ **AWS Secrets Manager** (`USE_AWS_SECRETS=true`) hoặc nạp từ file `.env` khi chạy local.
- **Cơ sở dữ liệu**: **Amazon DynamoDB** (bảng `accounts_user`, `courses_course`, `courses_registration`, `courses_registrationwindow`, `email_logs`) với Global Secondary Indexes (GSI) và Point-in-time recovery (PITR).
- **Hạ tầng dưới dạng mã (IaC)**: **Terraform** đầy đủ các module:
  - `networking`: VPC, Public/Private Subnets 2 AZs, Gateway Endpoints (S3, DynamoDB), Interface Endpoints, ALB.
  - `security`: AWS WAFv2 (chống bot, giới hạn rate limit), IAM Roles (ECS Task Execution & Application Roles), Security Groups.
  - `compute`: AWS ECR Repository, ECS Fargate Cluster, Task Definition, Autoscaling CPU/Memory.
  - `database`: DynamoDB Tables & AWS Backup Vault.
  - `storage`: S3 Frontend Hosting Bucket.
  - `monitoring`: CloudWatch Alarms, Dashboard và CloudTrail Audit Logs.

---

## 🚀 Hướng Dẫn Chạy & Kiểm Thử Local

Ứng dụng được đóng gói hoàn chỉnh trong Docker Compose, hỗ trợ kiểm thử local **100% không phụ thuộc tài khoản AWS**:

### 1. Khởi động hệ thống với Docker Compose
```bash
cd /home/ubuntu/Dev/Cloud_AWS
docker compose up --build
```

Container sẽ tự động khởi động:
- `dynamodb-local`: Cơ sở dữ liệu DynamoDB local trên cổng 8001/8000.
- `db-init`: Tự động khởi tạo bảng và seed sẵn tài khoản sinh viên, môn học mẫu.
- `backend`: REST API chạy tại `http://localhost:8000` (Swagger Docs: `http://localhost:8000/api/docs`).
- `frontend`: Giao diện React phục vụ qua Nginx tại `http://localhost` (hoặc `http://localhost:3000`).

### 2. Tài khoản thử nghiệm có sẵn
| Tài khoản | Mật khẩu | Quyền hạn | Ghi chú |
| :--- | :--- | :--- | :--- |
| `sv001` (hoặc MSSV: `21000101`) | `student123` | Sinh viên | Nguyễn Văn An (Khoa CNTT) |
| `sv002` (hoặc MSSV: `21000102`) | `student123` | Sinh viên | Trần Thị Bình (Khoa CNTT) |
| `admin` | `admin123` | Quản trị viên | Toàn quyền quản trị & test mail |

*(Trên giao diện đăng nhập có sẵn các nút bấm 1-click để đăng nhập nhanh).*

---

## ☁️ Hướng Dẫn Chuyển Sang Chạy Trên AWS Cloud

Để chuyển từ chế độ Local sang AWS Cloud thực tế:

1. **Cập nhật cấu hình `.env`**:
   ```ini
   USE_AWS_SECRETS=true
   AWS_SECRET_NAME=prod/app/backend
   AWS_REGION=ap-southeast-1
   USE_LOCAL_DYNAMODB=false
   EMAIL_PROVIDER=ses
   DEFAULT_FROM_EMAIL=your-verified-email@domain.com
   ```

2. **Triển khai hạ tầng Terraform**:
   ```bash
   cd /home/ubuntu/Dev/Cloud_AWS/terraform
   terraform init
   terraform plan
   terraform apply
   ```

3. **Build và đẩy Docker image lên ECR**:
   ```bash
   aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <ECR_URL>
   docker build -t course-registration-backend ./backend
   docker tag course-registration-backend:latest <ECR_URL>:latest
   docker push <ECR_URL>:latest
   ```

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
Cloud_AWS/
├── .env                  # Cấu hình môi trường runtime
├── .env.example          # Mẫu cấu hình mẫu
├── .gitignore            # Loại trừ file tạm, cache, secrets
├── docker-compose.yml    # Định nghĩa các dịch vụ Docker (FE, BE, DynamoDB Local)
├── seed_data.py          # Script khởi tạo bảng & dữ liệu mẫu
├── README.md             # Tài liệu dự án
├── backend/              # Mã nguồn FastAPI Backend
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py       # Điểm khởi chạy API & Middleware CORS
│       ├── config.py     # Cấu hình & tích hợp AWS Secrets Manager
│       ├── database.py   # Kết nối DynamoDB (Local/AWS)
│       ├── auth.py       # Xác thực JWT & phân quyền
│       ├── email_service.py # Dịch vụ gửi mail SES / SMTP / Mock
│       ├── schemas.py    # Pydantic Schemas validation
│       └── routers/      # API Endpoints (auth, courses, registrations, admin, emails)
├── frontend/             # Mã nguồn React Frontend (Vite)
│   ├── Dockerfile        # Multi-stage build với Nginx
│   ├── nginx.conf        # Cấu hình Nginx Reverse Proxy
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api.js        # API Client giao tiếp backend
│       ├── index.css     # Hệ thống thiết kế Design System & Glassmorphism
│       ├── components/   # Navbar, CourseCard, Timetable, Inbox, Admin,...
│       └── pages/        # LoginPage, DashboardPage
└── terraform/            # Hạ tầng AWS Cloud IaC
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    ├── versions.tf
    └── modules/          # networking, security, compute, database, storage, monitoring
```
