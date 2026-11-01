# Thư Viện Tài Liệu Dự Án (Project Documentation)

Chào mừng bạn đến với bộ tài liệu kỹ thuật hoàn chỉnh của dự án **Hệ Thống Đăng Ký Môn Học Trực Tuyến Trên Nền Tảng AWS Cloud**.

Bộ tài liệu được chia thành các phần chuyên sâu dưới đây:

---

## 📚 Danh Mục Tài Liệu

### 1. [Kiến Trúc & Thiết Kế Hệ Thống (Architecture & Design)](./ARCHITECTURE_AND_DESIGN.md)
*Tài liệu chuyên sâu phân tích toàn bộ tư duy thiết kế, phù hợp để trình bày đồ án tốt nghiệp, báo cáo kiến trúc và phỏng vấn kỹ thuật Cloud/DevOps.*
- **Lý do chọn đề tài:** Giải bài toán Flash Crowd (tải tăng đột biến vào giờ mở cổng đăng ký), đảm bảo tính toàn vẹn dữ liệu và tối ưu chi phí khi nhàn rỗi.
- **Sơ đồ kiến trúc tổng thể:** Mô hình phòng thủ đa tầng kết hợp CloudFront, WAF, S3, ALB, ECS Fargate, DynamoDB và Lambda Worker.
- **Tại sao kiến trúc này BẢO MẬT (Security-in-Depth):** Xác thực OIDC không lưu key cố định, Custom Origin Header Verify, ALB-only Ingress Security Group, DynamoDB VPC Gateway Endpoint.
- **Tại sao kiến trúc này CHI PHÍ CỰC THẤP:** Bí quyết loại bỏ hoàn toàn NAT Gateway ($0 NAT), Fargate Spot tỷ lệ 4:1, DynamoDB On-Demand. Bảng so sánh chi phí tiết kiệm hơn 85% so với kiến trúc truyền thống.
- **Hiệu năng & Khả năng chịu lỗi:** Xử lý bất đồng bộ, Multi-AZ High Availability, Rolling Update không downtime với Circuit Breaker.
- **Cơ chế Co Giãn Tự Động (Auto Scaling):** Chi tiết công thức tính toán và chu kỳ kích hoạt của Scale-Out (3 phút) và Scale-In (15 phút chống thrashing).
- **Phân tích Ưu & Nhược điểm (Trade-offs):** Đánh giá khách quan và lộ trình nâng cấp hệ thống trong tương lai.

---

### 2. [Hướng Dẫn Triển Khai & Vận Hành (Deployment Guide)](./DEPLOYMENT_GUIDE.md)
*Cẩm nang hướng dẫn thao tác thực chiến từ A-Z dành cho kỹ sư vận hành hệ thống.*
- **Cấu hình Git & GitHub Actions CI/CD:** Các bước cấu hình OIDC Secret trên GitHub Web UI (`AWS_ROLE_TO_ASSUME`, `CLOUDFRONT_DISTRIBUTION_ID`).
- **Khởi tạo hạ tầng với Terraform:** Thứ tự lệnh `init`, `plan`, `apply`, `output` và `destroy`.
- **Nạp dữ liệu mẫu ban đầu (Seeding):** Chạy `seed_data.py` để tạo tài khoản sinh viên `sv001` và admin `admin`.
- **Kiểm thử tải (Stress Test) với k6:** Hướng dẫn chạy k6 giả lập 50 người dùng đồng thời và quan sát ECS tự động scale-out từ 2 lên 4 tasks theo thời gian thực.
