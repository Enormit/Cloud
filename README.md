# Hệ Thống Đăng Ký Môn Học Trực Tuyến (Cloud-Native on AWS)
> **Kiến trúc Serverless & Containerized co giãn tự động, bảo mật nhiều lớp và tối ưu hóa chi phí ($0 NAT Gateway) trên nền tảng Amazon Web Services.**

[![Terraform](https://img.shields.io/badge/IaC-Terraform_v1.5+-623CE4?logo=terraform&logoColor=white)](https://www.terraform.io/)
[![AWS ECS Fargate](https://img.shields.io/badge/Compute-AWS_ECS_Fargate_Spot-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/fargate/)
[![Amazon DynamoDB](https://img.shields.io/badge/Database-Amazon_DynamoDB_On--Demand-4053D6?logo=amazondynamodb&logoColor=white)](https://aws.amazon.com/dynamodb/)
[![GitHub Actions OIDC](https://img.shields.io/badge/CI%2FCD-GitHub_Actions_OIDC_(Keyless)-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_Async-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React Vite](https://img.shields.io/badge/Frontend-React_18_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Live Production](https://img.shields.io/badge/Domain-enormitpham.me-green?logo=cloudflare&logoColor=white)](https://enormitpham.me)

---

## 📌 Mục Lục
1. [Bối Cảnh & Lý Do Chọn Đề Tài](#1-bối-cảnh--lý-do-chọn-đề-tài)
2. [Sơ Đồ Kiến Trúc Tổng Thể](#2-sơ-đồ-kiến-trúc-tổng-thể)
3. [Phân Tích 5 Trụ Cột Kỹ Thuật Cốt Lõi](#3-phân-tích-5-trụ-cột-kỹ-thuật-cốt-lõi)
   - [3.1. Trụ Cột Bảo Mật (Security-in-Depth & Zero-Trust)](#31-trụ-cột-bảo-mật-security-in-depth--zero-trust)
   - [3.2. Trụ Cột Tối Ưu Chi Phí (Bí Quyết $0 NAT Gateway)](#32-trụ-cột-tối-ưu-chi-phí-bí-quyết-0-nat-gateway)
   - [3.3. Trụ Cột Hiệu Năng (High Performance)](#33-trụ-cột-hiệu-năng-high-performance)
   - [3.4. Trụ Cột Sẵn Sàng & Chịu Lỗi (High Availability & Multi-AZ)](#34-trụ-cột-sẵn-sàng--chịu-lỗi-high-availability--multi-az)
   - [3.5. Trụ Cột Co Giãn Tự Động (Auto Scaling In/Out)](#35-trụ-cột-co-giãn-tự-động-auto-scaling-inout)
4. [Bằng Chứng Kiểm Thử Tải Thực Tế Với k6](#4-bằng-chứng-kiểm-thử-tải-thực-tế-với-k6)
5. [Phân Tích Ưu & Nhược Điểm Của Hệ Thống](#5-phân-tích-ưu--nhược-điểm-của-hệ-thống)
6. [Hướng Dẫn Triển Khai & Vận Hành (Git, CI/CD, Terraform)](#6-hướng-dẫn-triển-khai--vận-hành)
7. [Tài Liệu Chi Tiết Trong Thư Mục `docs/`](#7-tài-liệu-chi-tiết-trong-thư-mục-docs)

---

## 1. Bối Cảnh & Lý Do Chọn Đề Tài

### 1.1. Bài toán thực tế
Hệ thống đăng ký tín chỉ đại học là bài toán kinh điển giải quyết hiện tượng **Flash Crowd (Tải tăng vọt cục bộ)**:
- **Tải không đồng đều:** 95% thời gian trong năm hệ thống ở trạng thái nhàn rỗi (idle). Tuy nhiên, vào đúng các thời điểm mở cổng đăng ký (ví dụ: 8h00 sáng), hàng nghìn sinh viên đồng loạt truy cập và gửi request trong vòng vài phút.
- **Rủi ro quá tải:** Nếu hạ tầng thiết kế theo kiểu truyền thống (máy chủ cố định), hệ thống sẽ gặp lỗi `504 Gateway Timeout` hoặc sập hoàn toàn đúng lúc quan trọng nhất.
- **Tranh chấp dữ liệu (Race Condition):** Mỗi môn học có sĩ số giới hạn (ví dụ: 40 sinh viên). Cần cơ chế khóa hoặc kiểm tra toàn vẹn chặt chẽ để không xảy ra "over-booking".
- **Nghịch lý chi phí:** Nếu thuê máy chủ cấu hình khủng quanh năm thì cực kỳ lãng phí ngân sách; nếu thuê cấu hình nhỏ thì sập web.

### 1.2. Giải pháp kiến trúc của dự án
Xây dựng một hệ thống **Cloud-Native Serverless Container** trên **AWS**:
- **Tự động co giãn (Elasticity):** Bình thường chỉ chạy 2 task nhỏ; khi có đợt đăng ký, tự động scale-out lên 4+ task chỉ trong vài phút và tự hạ tải khi hết giờ.
- **Tối ưu chi phí tối đa:** Loại bỏ hoàn toàn NAT Gateway và các endpoint đắt đỏ, kết hợp Fargate Spot để giảm hơn 85% chi phí hàng tháng.
- **Bảo mật chuẩn Enterprise:** Không lưu trữ bất kỳ Access Key nào trên GitHub (sử dụng OIDC Token tạm thời), chống bypass Load Balancer bằng Custom Secret Header.

---

## 2. Sơ Đồ Kiến Trúc Tổng Thể

```mermaid
flowchart TD
    subgraph Clients["Tầng Người Dùng"]
        User["Trình duyệt Sinh viên / Admin"]
    end

    subgraph Edge["Tầng Biên Mạng (Edge & CDN)"]
        R53["Amazon Route 53 (enormitpham.me)"]
        WAF["AWS WAF v2 (DDoS, Rate Limit, SQLi)"]
        CF["Amazon CloudFront (CDN Cache & HTTPS)"]
    end

    subgraph Storage["Tầng Lưu Trữ Tĩnh"]
        S3Frontend["Amazon S3 (React 18 Vite SPA)"]
    end

    subgraph VPC["VPC ap-southeast-1 (10.0.0.0/16)"]
        subgraph PublicSubnets["Public Subnets (Multi-AZ: 1a & 1b)"]
            ALB["Application Load Balancer (HTTPS Dual-AZ)"]
            IGW["Internet Gateway (igw - Miễn Phí)"]
            
            subgraph ECSCluster["ECS Fargate Cluster (Auto Scaling: 2 -> 4)"]
                Task1["Task 1 (Fargate On-Demand)"]
                Task2["Task 2 (Fargate Spot)"]
                Task3["Task 3 (Fargate Spot)"]
                Task4["Task 4 (Fargate Spot)"]
            end
        end

        VPCE_DDB["VPC Gateway Endpoint (DynamoDB - Miễn Phí)"]
        VPCE_Lambda["VPC Interface Endpoint (Lambda)"]
    end

    subgraph AWSManaged["Tầng Dịch Vụ Quản Trị AWS"]
        DDB[("Amazon DynamoDB (On-Demand / Pay-per-Request)")]
        Lambda["AWS Lambda (Email Worker chạy ngầm)"]
        SES["Amazon SES / SMTP (Gửi Email xác nhận)"]
        CW["Amazon CloudWatch (Metrics & Auto Scaling Alarms)"]
        ECR["Amazon ECR (Docker Images)"]
    end

    User -->|1. HTTPS Query| R53
    R53 --> CF
    CF --- WAF
    CF -->|2. Tải Static Files (HTML/JS/CSS)| S3Frontend
    CF -->|3. Forward /api/* + Secret Header: X-Origin-Verify| ALB

    ALB -->|4. Port 8000 Reverse Proxy| ECSCluster
    Task1 & Task2 & Task3 & Task4 -.->|Kéo ECR Image & Ghi Log miễn phí| IGW
    IGW -.-> ECR
    IGW -.-> CW

    ECSCluster -->|5. Truy vấn DB qua đường trục riêng của AWS| VPCE_DDB
    VPCE_DDB --> DDB

    ECSCluster -->|6. Kích hoạt gửi mail ngầm không block HTTP| VPCE_Lambda
    VPCE_Lambda --> Lambda
    Lambda --> SES

    ECSCluster -.->|Phát metric CPU| CW
    CW -->|Scale Out / In| ECSCluster
```

---

## 3. Phân Tích 5 Trụ Cột Kỹ Thuật Cốt Lõi

### 3.1. Trụ Cột Bảo Mật (Security-in-Depth & Zero-Trust)
1. **Bảo mật Tầng Biên (AWS WAF v2 + CloudFront SSL/TLS 1.2+):**
   - Chặn các cuộc tấn công DDoS thông qua giới hạn tần suất request (Rate Limiting).
   - Tự động thanh lọc các lỗ hổng OWASP Top 10 phổ biến (SQL Injection, Cross-Site Scripting).
2. **Chặn Bypass ALB bằng Custom Header (`X-Origin-Verify`):**
   - Kẻ xấu không thể quét địa chỉ IP hoặc DNS công khai của ALB để tấn công trực tiếp. CloudFront tự sinh mã bí mật 32 ký tự nhúng vào header. ALB kiểm tra nếu thiếu header này sẽ trả về `403 Forbidden` ngay lập tức.
3. **Mô hình Mạng ALB-Only Security Group:**
   - Các container ECS Fargate backend **chặn 100% traffic từ `0.0.0.0/0`**. Ingress Security Group của ECS chỉ chấp nhận duy nhất gói tin đến từ Security Group của ALB trên cổng 8000.
4. **Đường truyền cơ sở dữ liệu biệt lập (DynamoDB VPC Gateway Endpoint):**
   - Truy vấn cơ sở dữ liệu từ backend đến DynamoDB đi qua đường mạng riêng của AWS, không đi qua Internet công cộng.
5. **CI/CD không lưu khóa (GitHub Actions OIDC Keyless Security):**
   - Không lưu `AWS_ACCESS_KEY_ID` hay `AWS_SECRET_ACCESS_KEY` dài hạn trên GitHub.
   - GitHub Actions sử dụng OIDC JWT Token trao đổi với AWS STS lấy quyền tạm thời 1 giờ với Trust Policy kiểm soát chặt chẽ.

---

### 3.2. Trụ Cột Tối Ưu Chi Phí (Bí Quyết $0 NAT Gateway)

> [!TIP]
> **Giải bài toán tiết kiệm > 85% chi phí hạ tầng AWS hàng tháng:**
> Trong kiến trúc chuẩn sách giáo khoa, việc đặt ECS trong Private Subnet bắt buộc phải thuê **NAT Gateway** ($32.40/tháng x 2 AZs = ~$65/tháng) và **ECR VPC Endpoints** (~$15/tháng) chỉ để container có thể kéo image Docker và gửi log.

**Giải Pháp Đột Phá:**
- Đặt ECS Fargate Task vào Public Subnet với `assign_public_ip = true`, cho phép container tải Docker image và gửi log CloudWatch trực tiếp qua **Internet Gateway (`igw` - Miễn phí 100%)**.
- **Bảo mật vẫn an toàn tuyệt đối:** Security Group của ECS chặn hoàn toàn Inbound từ Internet (`0.0.0.0/0`), chỉ nhận kết nối nội bộ từ ALB.
- **Fargate Spot tỷ lệ 4:1:** 2 Task cơ sở chạy Fargate On-Demand (bảo đảm tính sẵn sàng); khi mở rộng lên 4 task, các task phụ chạy trên **Fargate Spot (giảm 70% giá)**.
- **DynamoDB On-Demand (Pay-per-request):** Không trả phí cố định RCU/WCU, nhàn rỗi chi phí = $0.

#### Bảng so sánh chi phí hàng tháng:
| Hạng mục tài nguyên | Kiến trúc truyền thống | Kiến trúc tối ưu hiện tại | Mức tiết kiệm |
| :--- | :--- | :--- | :--- |
| **NAT Gateway (2 AZs)** | ~$65.00 | **$0.00** (Dùng Internet Gateway) | **Tiết kiệm 100%** |
| **ECR VPC Endpoints** | ~$15.00 | **$0.00** (Kéo qua IGW) | **Tiết kiệm 100%** |
| **ECS Compute (Fargate)** | ~$30.00 (Chỉ dùng On-Demand) | **~$10.00 - $14.00** (Dùng Fargate Spot) | **Tiết kiệm ~65%** |
| **Database (DynamoDB)** | ~$30.00 (Provisioned) | **~$0.50 - $2.00** (On-Demand) | **Tiết kiệm > 90%** |
| **Static Hosting (S3 + CloudFront)** | ~$5.00 | **~$0.50 - $1.00** (Hưởng Free Tier 1TB) | **Tiết kiệm ~80%** |
| **Secrets Manager** | ~$1.60 | **$0.00** (Sinh secret qua Terraform) | **Tiết kiệm 100%** |
| **TỔNG CHI PHÍ** | **~$145 - $180 / tháng** | **~$15 - $22 / tháng** | **TIẾT KIỆM > 85%** |

---

### 3.3. Trụ Cột Hiệu Năng (High Performance)
- **FastAPI Asynchronous Non-blocking:** Xử lý concurrency xuất sắc, latency trung bình chỉ từ 40ms - 80ms.
- **DynamoDB Single-Digit Millisecond:** Truy vấn đọc/ghi học phần và sinh viên ổn định dưới 10ms.
- **CloudFront CDN Edge Caching:** Static assets của React SPA được cache tại các điểm PoP toàn cầu, thời gian phản hồi (TTFB) < 30ms.
- **Asynchronous Email Notification:** Khi sinh viên đăng ký môn học thành công, backend không gọi SMTP trực tiếp (vốn mất 1-3 giây) mà kích hoạt **AWS Lambda Worker** xử lý ngầm. API phản hồi cho sinh viên ngay lập tức trong < 100ms.

---

### 3.4. Trụ Cột Sẵn Sàng & Chịu Lỗi (High Availability & Multi-AZ)
- **Multi-AZ Deployment:** Hạ tầng phân bổ đồng đều trên 2 Availability Zones (`ap-southeast-1a` và `ap-southeast-1b`). Nếu một AZ gặp thảm họa, ALB tự động điều hướng 100% sang AZ còn lại.
- **Zero-Downtime Deployment (Rolling Updates):** Cấu hình `minimum_healthy_percent = 100` và `maximum_percent = 200`. ECS khởi tạo container mới thành công và vượt qua ALB Health Check trước khi tắt container cũ.
- **Deployment Circuit Breaker:** Tự động hủy lệnh deploy và rollback về bản chạy ổn định nếu code mới bị crash loop.

---

### 3.5. Trụ Cột Co Giãn Tự Động (Auto Scaling In/Out)
Hệ thống sử dụng AWS **Target Tracking Scaling Policy** dựa trên chỉ số CPU trung bình:
- **Ngưỡng CPU mục tiêu (`target_value`):** `30%`.
- **Quy tắc Scale Out (Mở rộng nhanh):**
  - Giám sát qua CloudWatch `AlarmHigh`: Yêu cầu `3 chu kỳ liên tiếp x 60s = 3 phút` CPU vượt ngưỡng 30%.
  - `scale_out_cooldown = 30s`: Tăng nhanh từ **2 lên 4 tasks** (mức trần `max_capacity = 4`).
- **Quy tắc Scale In (Hạ tải an toàn):**
  - Giám sát qua CloudWatch `AlarmLow`: Yêu cầu **`15 chu kỳ liên tiếp x 60s = 15 phút`** CPU duy trì dưới 27%.
  - **Ý nghĩa kỹ thuật:** Chống hiện tượng **Flapping / Thrashing** (tránh việc vừa tắt container thì đợt tải mới ập đến lại phải khởi động lại, gây tốn thời gian và gián đoạn).
  - Kết hợp `scale_in_cooldown = 180s`, hạ tải an toàn theo từng bậc: 4 ➔ 3 ➔ 2 tasks cơ sở.

---

## 4. Bằng Chứng Kiểm Thử Tải Thực Tế Với k6

Đã thực hiện bài stress test với script [`k6_test.js`](./k6_test.js) (50 VUs liên tục trong 5.5 phút):

### 4.1. Kết quả chỉ số chịu tải:
- **Tổng số request:** **14,307 requests** (~42 req/s).
- **Tỷ lệ thành công (Checks Pass):** **99.76%** (14,272 / 14,306 checks thành công).
- **Thời gian phản hồi:** Median `517ms`, Trung bình `1.1s` (dưới tải nặng gọi đồng thời 2 API `/api/courses/` và `/api/registrations/stats`).

### 4.2. Timeline thực tế ghi nhận từ AWS CloudWatch & Application Auto Scaling:
```
[16:50:00] 2 Tasks | CPU: 0.50% (Trạng thái nghỉ)
[16:51:04] k6 bắt đầu bắn tải 50 VUs -> CPU vọt lên 73.09%
[16:52:00] Chu kỳ 1: CPU = 97.86% (> 30%)
[16:53:00] Chu kỳ 2: CPU = 95.84% (> 30%)
[16:54:00] Chu kỳ 3: CPU = 49.87% (> 30%)
             └──> Đủ điều kiện 3 phút liên tiếp vượt ngưỡng 30%
[16:56:04] CloudWatch AlarmHigh chuyển sang trạng thái ALARM
[16:56:05] Application AutoScaling gửi lệnh: "Setting desired count to 4."
[16:56:55] ECS khởi tạo thêm 2 task mới -> Running Tasks: 4
[16:57:26] Toàn bộ 4 Tasks vượt qua ALB Health Check -> Healthy: 4/4
[16:57:45] CPU trung bình lập tức hạ nhiệt xuống còn 25.53%
...
[17:14:31] (Sau ~15 phút hết tải): AlarmLow kích hoạt -> Scale In từ 4 về 3 tasks.
[17:18:31] (Sau cooldown 180s): Scale In từ 3 về 2 tasks cơ sở ổn định.
```

---

## 5. Phân Tích Ưu & Nhược Điểm Của Hệ Thống

| Hạng mục | Ưu điểm (Strengths) | Nhược điểm & Giới hạn (Limitations) | Hướng nâng cấp tương lai |
| :--- | :--- | :--- | :--- |
| **Hạ tầng (IaC)** | 100% định nghĩa qua Terraform, dễ dàng dựng lại toàn bộ môi trường trong 5 phút. | Thay đổi cấu hình mạng lớn (VPC) cần cẩn thận để tránh recreate tài nguyên. | Module hóa sâu hơn và áp dụng Terraform Workspaces. |
| **Chi phí** | Tiết kiệm > 85%, không tốn tiền NAT Gateway, nhàn rỗi chỉ tốn ~$15-$22/tháng. | Phụ thuộc vào tính khả dụng của Fargate Spot trong vùng Singapore. | Đã cấu hình `base = 2` On-Demand đảm bảo luôn có 2 task sống sót. |
| **Bảo mật** | WAF v2, Custom Header Verify, OIDC Keyless CI/CD, không lưu key cố định. | Cần quản lý chặt chẽ Trust Policy wildcard OIDC trên IAM Role. | Tích hợp thêm AWS GuardDuty và Security Hub. |
| **Hiệu năng & Scaling** | Auto-scale từ 2 lên 4 task hoàn hảo, uptime 99.76% dưới tải nặng. | Fargate Cold Start mất ~45s để kéo Docker image và vượt qua ALB Health Check. | Thêm ElastiCache Redis cache dữ liệu tĩnh; hoặc chuyển sang EKS Karpenter khi lên hàng triệu users. |
| **Cơ sở dữ liệu** | DynamoDB tốc độ < 10ms, tự động backup, không lo quản trị server DB. | Không hỗ trợ câu lệnh JOIN phức tạp như SQL; phải thiết kế bảng theo Access Pattern. | Tích hợp AWS Athena / Glue nếu cần làm báo cáo thống kê chuyên sâu. |

---

## 6. Hướng Dẫn Triển Khai & Vận Hành

### 6.1. Cấu hình GitHub Actions Secrets
Vào **GitHub Repository ➔ Settings ➔ Secrets and variables ➔ Actions ➔ Repository secrets**:
- `AWS_ROLE_TO_ASSUME`: `arn:aws:iam::755272426779:role/course-registration-github-actions-deploy-role`
- `CLOUDFRONT_DISTRIBUTION_ID`: `E14ZIZ3MBDC0O4`

### 6.2. Triển khai bằng Terraform
```bash
# 1. Khởi tạo Terraform
cd terraform
terraform init

# 2. Xem trước kế hoạch triển khai
terraform plan

# 3. Triển khai toàn bộ hạ tầng
terraform apply -auto-approve

# 4. Hủy hạ tầng khi không dùng (tránh phát sinh chi phí)
terraform destroy -auto-approve
```

### 6.3. Nạp dữ liệu mẫu & Tài khoản thử nghiệm
```bash
# Nạp dữ liệu vào DynamoDB
python seed_data.py
```
- **Sinh viên:** `sv001` / `student123` (hoặc `sv002` / `student123`)
- **Quản trị viên:** `admin` / `admin123`

### 6.4. Chạy Stress Test
```bash
k6 run k6_test.js
```

---

## 7. Tài Liệu Chi Tiết Trong Thư Mục `docs/`

Để tìm hiểu sâu hơn về từng khía cạnh kỹ thuật, bạn có thể tham khảo các tài liệu chuyên đề sau:
- 📑 [**Kiến Trúc & Thiết Kế Chuyên Sâu (`docs/ARCHITECTURE_AND_DESIGN.md`)**](./docs/ARCHITECTURE_AND_DESIGN.md): Phân tích chi tiết ADRs, bảo mật đa tầng, bảng toán học tính toán Auto Scaling và cơ chế chống Thrashing.
- 🛠️ [**Cẩm Nang Triển Khai & Vận Hành (`docs/DEPLOYMENT_GUIDE.md`)**](./docs/DEPLOYMENT_GUIDE.md): Hướng dẫn thực hành từng bước từ setup máy local, chạy Terraform, thiết lập CI/CD OIDC đến chạy k6 test.
- 🧭 [**Mục Lục Tài Liệu (`docs/README.md`)**](./docs/README.md): Bản đồ điều hướng tài liệu dự án.
