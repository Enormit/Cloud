# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose
Cổng Đăng Ký Học Phần Đại Học trực tuyến (University Course Registration System) phục vụ sinh viên đăng ký môn học và tín chỉ trong các đợt cao điểm mở cổng, đồng thời hỗ trợ Ban Đào Tạo quản lý khóa học. Thành công của sản phẩm được định nghĩa bằng: hệ thống không bị nghẽn mạng trong đợt cao điểm, phản hồi đăng ký/hủy môn học tức thì (<100ms), trực quan hóa lịch học tuần chính xác (không trùng lịch) và thông báo xác nhận tự động tới người học.

## Positioning
Hệ thống đăng ký tín chỉ đám mây chịu tải cao (High-Concurrency Cloud-Native Architecture) kết hợp với tính năng trực quan hóa thời khóa biểu học tập trực tiếp theo tuần. Khác biệt với các hệ thống đăng ký tín chỉ truyền thống hay gặp lỗi đơ lag hoặc trùng môn, hệ thống cung cấp phản hồi tức thời, tự động kiểm tra xung đột thời khóa biểu và gửi thư xác nhận minh bạch qua email.

## Operating Context
- **Đối tượng chính:** Sinh viên đại học thực hiện tra cứu, đăng ký, đổi lớp, hủy môn học trong các khung giờ cao điểm mở cổng (Registration Windows).
- **Đối tượng quản trị:** Cán bộ Phòng Đào tạo / Giảng viên thiết lập môn học, quản lý sĩ số lớp, mở/đóng đợt đăng ký và giám sát hệ thống.
- **Môi trường hoạt động:** Trình duyệt web (Desktop, Laptop, Tablet, Mobile Web).
- **Hạ tầng hỗ trợ:** AWS Cloud-Native (ECS Fargate trong Private Subnet, ALB, CloudFront WAF, DynamoDB NoSQL, AWS Lambda Notification Worker).

## Capabilities and Constraints
- **Chức năng chính đã xác nhận:**
  - Xác thực người dùng (JWT Authentication) phân quyền Sinh viên và Quản trị viên (Staff/Admin).
  - Tra cứu, tìm kiếm và lọc danh mục học phần mở theo chuyên ngành/khoa.
  - Đăng ký và hủy học phần theo thời gian thực với ràng buộc tín chỉ (tối thiểu 10, tối đa 24 tín chỉ).
  - Trực quan hóa thời khóa biểu học tập: Lịch học trực quan theo tuần (Thứ 2 - Chủ nhật, các tiết học trong ngày), cảnh báo xung đột lịch.
  - Hộp thư nội bộ và gửi email xác nhận tức thì qua Google SMTP bằng Serverless Lambda.
  - Quản trị viên: Quản lý môn học, mở/đóng đợt đăng ký, xem thống kê, kiểm tra gửi mail.
- **Ràng buộc kỹ thuật:**
  - Frontend: React 18, Vite, Tailwind CSS, Lucide React, Nginx.
  - Backend: FastAPI (Python 3.11), DynamoDB, AWS Lambda Worker.
  - Quy ước thuật ngữ: MSSV (Mã số sinh viên), Tín chỉ (Credits), Học phần (Course), Tiết học (Periods), Đợt đăng ký (Registration Window).

## Brand Commitments
- **Tên dự án:** Cổng Đăng Ký Học Phần Đại Học (Course Registration System)
- **Giọng điệu:** Nghiêm túc, chuẩn mực môi trường học thuật đại học, hiện đại, thân thiện và minh bạch thông tin.

## Evidence on Hand
- Mã nguồn giao diện hiện tại: `frontend/src/` (Dashboard, Login, AdminDashboard, CourseCatalog, StudentTimetable, EmailInboxModal, ProfileModal).
- Dữ liệu thử nghiệm đã nạp sẵn trong DynamoDB: `seed_data.py` (tài khoản `sv001`, `sv002`, `admin`, danh mục học phần CNTT, KTPM, Mạng máy tính).

## Product Principles
1. **Trực quan & Phòng tránh lỗi (Clarity over Guesswork):** Thời khóa biểu và xung đột lịch phải được hiển thị rõ ràng trực quan trước khi sinh viên bấm xác nhận; không để sinh viên phải tự nhẩm tiết học.
2. **Tốc độ & Phản hồi tức thì (Instant Feedback):** Mọi thao tác chọn môn, kiểm tra điều kiện tiên quyết và thêm vào giỏ học phần phải phản hồi ngay lập tức, không gây hoang mang trong giờ cao điểm.
3. **Nhất quán & Chuẩn mực Design System (Design System Consistency):** Thiết lập một hệ thống Token màu sắc, typography, card, badge và bảng biểu nhất quán xuyên suốt giữa phân hệ Sinh viên và Admin.
4. **Minh bạch trạng thái (State Transparency):** Trạng thái số lượng chỗ còn lại, số tín chỉ đã chọn / tối đa, tình trạng đợt mở đăng ký luôn được thể hiện rõ ràng.

## Accessibility & Inclusion
- Hỗ trợ tốt trên màn hình máy tính và thiết bị di động (Responsive).
- Đảm bảo độ tương phản màu sắc đạt chuẩn WCAG AA cho văn bản và các trạng thái học phần (Đã đăng ký, Đầy chỗ, Trùng lịch).
