# TÀI LIỆU KIẾN TRÚC VÀ THIẾT KẾ HỆ THỐNG
## Cloud-Native Course Registration System on AWS

Tài liệu này trình bày toàn diện về kiến trúc, triết lý thiết kế, các quyết định công nghệ (Architectural Decision Records - ADR), phân tích bảo mật, tối ưu hóa chi phí, hiệu năng, khả năng chịu lỗi và cơ chế co giãn tự động (Auto Scaling) của hệ thống Đăng Ký Môn Học Trực Tuyến.

---

## 1. Bối Cảnh Và Lý Do Chọn Đề Tài

### 1.1. Bài toán thực tế
Hệ thống đăng ký tín chỉ/môn học tại các trường đại học là một trong những bài toán kinh điển và thách thức nhất trong ngành phần mềm và hạ tầng đám mây:
- **Hiện tượng Flash Crowd (Tải đột biến cực lớn):** Trong suốt cả năm học, 95% thời gian hệ thống ở trạng thái nhàn rỗi (idle). Tuy nhiên, vào đúng các khung giờ mở cổng đăng ký (ví dụ: 8h00 sáng), hàng nghìn đến hàng chục nghìn sinh viên đồng loạt truy cập, tải trang và nhấn nút gửi đăng ký trong vòng vài phút.
- **Tính toàn vẹn dữ liệu (Data Consistency):** Mỗi môn học đều có giới hạn số lượng sinh viên (slot). Nếu hệ thống xử lý tranh chấp (concurrency race condition) kém, sẽ xảy ra tình trạng "over-booking" (vượt quá sĩ số phòng học).
- **Yêu cầu bảo mật cao:** Hệ thống xử lý thông tin cá nhân sinh viên, điểm số, lịch trình và phân quyền quản trị viên.
- **Nghịch lý chi phí nếu dùng kiến trúc truyền thống:** Nếu duy trì hạ tầng máy chủ lớn quanh năm để phục vụ vài ngày cao điểm, chi phí vận hành sẽ vô cùng lãng phí. Nếu hạ tầng quá nhỏ, hệ thống sẽ sập (Crash / 504 Gateway Timeout) đúng thời điểm quan trọng nhất.

### 1.2. Mục tiêu kiến trúc
Xây dựng một hệ thống **Cloud-Native, Serverless & Containerized** trên nền tảng **AWS**:
1. **Elastic Scaling:** Tự động co giãn theo thời gian thực (từ 2 tasks lên tối đa 4+ tasks khi tải tăng và tự động thu hồi khi hết giờ).
2. **Ultra-Low Cost:** Chi phí duy trì ở trạng thái nhàn rỗi gần như bằng $0, loại bỏ hoàn toàn các dịch vụ đắt đỏ không cần thiết (NAT Gateway, Managed VPC Endpoints đắt tiền).
3. **High Security:** Triệt tiêu hoàn toàn rủi ro lộ IAM Access Key thông qua GitHub Actions OIDC; mô hình Zero-Trust giữa các tầng mạng.
4. **Resilience & Fault Tolerance:** Thiết kế sẵn sàng chạy trên nhiều vùng khả dụng (Multi-AZ), không có điểm lỗi đơn (No Single Point of Failure).

---

## 2. Sơ Đồ Kiến Trúc Tổng Thể (System Architecture)

```mermaid
flowchart TD
    subgraph Clients["Tầng Người Dùng (Clients)"]
        UserBrowser["Trình duyệt Sinh viên / Admin"]
    end

    subgraph EdgeLayer["Tầng Biên Mạng (Edge & CDN Layer)"]
        R53["Amazon Route 53 (DNS: enormitpham.me)"]
        WAF["AWS WAF v2 (Rate Limiting, SQLi, Common Attacks)"]
        CF["Amazon CloudFront (CDN Cache & HTTPS)"]
    end

    subgraph StorageStatic["Tầng Lưu Trữ Tĩnh"]
        S3Frontend["Amazon S3 Bucket (React Vite SPA)"]
    end

    subgraph VPC["AWS Virtual Private Cloud (10.0.0.0/16)"]
        subgraph PublicSubnets["Public Subnets (Multi-AZ: ap-southeast-1a & 1b)"]
            ALB["Application Load Balancer (HTTPS Dual-AZ)"]
            IGW["Internet Gateway (igw)"]
            
            subgraph ECSCluster["ECS Fargate Cluster"]
                Task1["Task 1 (Fargate On-Demand)"]
                Task2["Task 2 (Fargate Spot)"]
                Task3["Task 3 (Fargate Spot)"]
                Task4["Task 4 (Fargate Spot)"]
            end
        end

        subgraph PrivateSubnets["Private Subnets"]
            LambdaVPCE["VPC Interface Endpoint (Lambda)"]
        end

        VPCE_DDB["VPC Gateway Endpoint (DynamoDB - Miễn phí)"]
    end

    subgraph ManagedServices["Tầng Dịch Vụ Quản Trị AWS"]
        DDB[("Amazon DynamoDB (On-Demand / Pay-per-Request)")]
        LambdaWorker["AWS Lambda (Email Notification Worker)"]
        SES["Amazon SES / Gmail SMTP (Gửi Email xác nhận)"]
        CW["Amazon CloudWatch (Metrics, Logs, Dashboard, Alarms)"]
        ECR["Amazon ECR (Docker Registry)"]
    end

    UserBrowser -->|1. HTTPS Query| R53
    R53 --> CF
    CF --- WAF
    CF -->|2. Tải Static Files (HTML/JS/CSS)| S3Frontend
    CF -->|3. Forward API Traffic (/api/*) + Secret Header| ALB

    ALB -->|4. Port 8000 Reverse Proxy| ECSCluster
    Task1 & Task2 & Task3 & Task4 -.->|Kéo Docker Image & Ghi Log| IGW
    IGW -.-> ECR
    IGW -.-> CW

    ECSCluster -->|5. Đọc/Ghi dữ liệu bảo mật nội bộ qua Gateway VPCE| VPCE_DDB
    VPCE_DDB --> DDB

    ECSCluster -->|6. Kích hoạt gửi mail ngầm| LambdaVPCE
    LambdaVPCE --> LambdaWorker
    LambdaWorker --> SES
    
    ECSCluster -.->|Phát metric CPU/RAM| CW
    CW -->|Kích hoạt Auto Scaling| ECSCluster
```

---

## 3. Phân Tích Chuyên Sâu Các Trụ Cột Kiến Trúc

### 3.1. Trụ Cột Bảo Mật (Security in Depth)

Hệ thống được thiết kế theo mô hình phòng thủ nhiều lớp (Defense-in-Depth):

1. **Bảo mật Tầng Biên (Edge Protection):**
   - **AWS WAF v2:** Gắn trực tiếp lên CloudFront. Tự động kiểm tra và lọc các tấn công phổ biến từ OWASP Top 10, chống SQL Injection, Cross-Site Scripting (XSS), và chặn DDoS thông qua quy tắc giới hạn tần suất request (Rate-Based Rules).
   - **SSL/TLS 1.2+ End-to-End:** Mã hóa toàn bộ đường truyền bằng chứng chỉ công khai từ AWS Certificate Manager (ACM) cấp cho domain `enormitpham.me`.
   - **Custom Header Verification giữa CloudFront và ALB:** Để ngăn chặn kẻ tấn công bypass CloudFront và tấn công trực tiếp vào địa chỉ IP/DNS của ALB, CloudFront tự động chèn một mã bí mật ngẫu nhiên 32 ký tự (`X-Origin-Verify`) vào mỗi request. ALB chỉ chấp nhận điều hướng traffic khi header này khớp hoàn toàn; mọi request khác bị ALB từ chối với mã lỗi `403 Forbidden`.

2. **Bảo mật Mạng (Network Isolation):**
   - **ALB-Only Ingress Security Group:** Các container ECS Fargate backend **không bao giờ** chấp nhận kết nối từ Internet công cộng (`0.0.0.0/0`). Ingress Security Group của ECS chỉ mở cổng 8000 cho duy nhất Security Group ID của ALB.
   - **VPC Gateway Endpoint cho DynamoDB:** Traffic truy vấn cơ sở dữ liệu từ backend đến DynamoDB đi hoàn toàn qua đường trục riêng (AWS Private Backbone Network) thông qua VPC Gateway Endpoint, không bao giờ lộ ra ngoài Internet.

3. **Bảo mật Danh Tính & CI/CD (Zero Long-Lived Credentials):**
   - **GitHub Actions OIDC (OpenID Connect):** Tuyệt đối **không tạo** và **không lưu trữ** `AWS_ACCESS_KEY_ID` hay `AWS_SECRET_ACCESS_KEY` dài hạn trên GitHub.
   - Khi GitHub Actions chạy, nó sử dụng JWT Token ký bởi GitHub OIDC Provider để xin quyền tạm thời từ AWS STS (`AssumeRoleWithWebIdentity`) với thời hạn hiệu lực tối đa chỉ 1 giờ.
   - Trust Policy được gắn chặt với danh tính repo: `repo:Enormit*/Cloud*:*` và `aud: sts.amazonaws.com`.

4. **Bảo mật Tầng Ứng Dụng (Application Security):**
   - Mật khẩu người dùng được băm bằng thuật toán `PBKDF2-SHA256` với salt ngẫu nhiên.
   - Cơ chế xác thực phân quyền qua JWT (JSON Web Tokens) với thuật toán mã hóa `HS256`, `SECRET_KEY` dài 64 ký tự được sinh ngẫu nhiên bằng Terraform và nhúng thẳng vào biến môi trường của container.

---

### 3.2. Trụ Cột Tối Ưu Hóa Chi Phí (Cost Optimization - Bí Quyết $0 NAT)

Kiến trúc truyền thống của AWS thường đẩy ECS Task vào Private Subnet và bắt buộc phải dùng **NAT Gateway** để container có thể tải Docker image từ ECR và gửi log lên CloudWatch. Tuy nhiên, NAT Gateway có chi phí rất đắt đối với các dự án sinh viên hoặc startup ($32.40/tháng phí cố định cho mỗi NAT + $0.045/GB dữ liệu).

#### Sáng kiến Tối ưu: Đưa ECS Task ra Public Subnet kết hợp Security Group ALB-Only
- **Cơ chế:** Gán cho Fargate Task thuộc tính `assign_public_ip = true` nằm trong Public Subnet, định tuyến trực tiếp ra Internet Gateway (`igw`).
- **Tại sao vẫn an toàn 100%?** Mặc dù task có Public IP, Security Group của task **chặn toàn bộ Inbound traffic từ 0.0.0.0/0**, chỉ duy nhất chấp nhận traffic từ ALB Security Group trên port 8000. Không ai trên Internet có thể quét cổng hay gửi gói tin vào task.
- **Lợi ích kép:** Container gửi request ra ngoài qua `igw` hoàn toàn **miễn phí** (kéo image từ ECR, đẩy CloudWatch logs, kết nối API ngoài), **tiết kiệm ngay $32 - $65/tháng** tiền NAT Gateway!

#### Bảng So Sánh Chi Phí Thực Tế (Monthly Cost Comparison):

| Thành phần dịch vụ | Kiến trúc truyền thống | Kiến trúc tối ưu hiện tại | Mức tiết kiệm |
| :--- | :--- | :--- | :--- |
| **NAT Gateway (2 AZs)** | ~$65.00 / tháng | **$0.00** (Dùng Internet Gateway) | Tiết kiệm 100% (~$65) |
| **ECR VPC Endpoints** | ~$15.00 / tháng | **$0.00** (Kéo qua IGW) | Tiết kiệm 100% (~$15) |
| **VPC Gateway Endpoint (DynamoDB)** | N/A | **$0.00** (Miễn phí từ AWS) | Miễn phí |
| **ECS Compute (Fargate)** | ~$30.00 (Chỉ dùng On-Demand) | **~$10.00 - $14.00** (Tỷ lệ 4:1 Fargate Spot) | Tiết kiệm ~65% compute |
| **Database (DynamoDB)** | ~$30.00 (Provisioned RCU/WCU) | **~$0.50 - $2.00** (On-Demand Pay-per-request) | Tiết kiệm > 90% |
| **Static Hosting (S3 + CloudFront)** | ~$5.00 | **~$0.50 - $1.00** (Miễn phí 1TB CloudFront) | Tiết kiệm ~80% |
| **Secrets Manager** | ~$1.60 ($0.40/secret/tháng) | **$0.00** (Tạo secret bằng `random_password`) | Tiết kiệm 100% |
| **TỔNG CHI PHÍ ƯỚC TÍNH** | **~$145.00 - $180.00 / tháng** | **~$15.00 - $22.00 / tháng** | **TIẾT KIỆM > 85%** |

---

### 3.3. Trụ Cột Hiệu Năng (High Performance)

1. **FastAPI & Uvicorn (Asynchronous Python ASGI):**
   - Viết trên nền tảng async/await không khóa luồng I/O, cho phép một container Fargate đơn lẻ (chỉ 0.25 vCPU, 512MB RAM) xử lý hàng trăm request đồng thời với latency chỉ từ 40ms - 80ms.
2. **DynamoDB Single-Digit Millisecond Latency:**
   - Cơ sở dữ liệu NoSQL phân tán được quản lý bởi AWS, thời gian đọc/ghi theo Primary Key (MSSV, Course ID) ổn định dưới 10ms bất kể quy mô dữ liệu.
3. **CloudFront CDN Edge Caching:**
   - Toàn bộ static assets của Single Page App (React, JS chunks, CSS, Icons) được cache tại các điểm PoP của CloudFront gần người dùng nhất (Time-to-First-Byte < 30ms).
4. **Xử lý Bất Đồng Bộ (Asynchronous Email Processing):**
   - Luồng đăng ký môn học **không** trực tiếp gửi email qua SMTP vì gửi mail mất 1-3 giây. Backend chỉ kích hoạt Lambda worker chạy ngầm, HTTP request đăng ký trả kết quả ngay lập tức cho sinh viên trong < 100ms.

---

### 3.4. Trụ Cột Sẵn Sàng Cao & Chịu Lỗi (Fault Tolerance & High Availability)

1. **Kiến Trúc Multi-AZ (Đa Vùng Khả Dụng):**
   - Hạ tầng mạng trải rộng trên 2 AZs độc lập tại Singapore (`ap-southeast-1a` và `ap-southeast-1b`).
   - ALB tự động cân bằng tải và giám sát tình trạng sức khỏe của từng task Fargate trong các AZ. Nếu một AZ của AWS gặp sự cố, traffic lập tức được định tuyến 100% sang AZ còn lại mà người dùng không nhận biết được.
2. **Zero-Downtime Deployment (Rolling Updates & Circuit Breaker):**
   - Khi có phiên bản code mới được deploy từ CI/CD:
     - `deployment_minimum_healthy_percent = 100`
     - `deployment_maximum_percent = 200`
     - ECS sẽ khởi tạo container mới song song với container cũ, chờ đến khi container mới vượt qua ALB Health Check (`/health`) thành công thì mới chuyển traffic sang và tắt container cũ.
   - **Deployment Circuit Breaker:** Nếu container mới bị lỗi khởi động (crash loop), ECS sẽ tự động hủy đợt deploy và rollback về phiên bản trước đó ngay lập tức.
3. **Fargate Spot Resilience Strategy:**
   - Cấu hình chiến lược năng lực (Capacity Provider Strategy):
     ```hcl
     # Task cơ sở luôn chạy trên Fargate chuẩn (bảo đảm không bị AWS thu hồi)
     capacity_provider_strategy {
       capacity_provider = "FARGATE"
       weight            = 1
       base              = 2
     }
     # Khi scale-out, các task mở rộng chạy trên Fargate Spot (tiết kiệm 70% giá)
     capacity_provider_strategy {
       capacity_provider = "FARGATE_SPOT"
       weight            = 4
       base              = 0
     }
     ```
   - Nhờ có `base = 2` chạy Fargate On-Demand, hệ thống đảm bảo luôn có ít nhất 2 task sống sót ổn định ngay cả khi thị trường Fargate Spot của AWS bị khan hiếm tài nguyên.

---

## 4. Cơ Chế Auto Scaling (Scale Out & Scale In)

Hệ thống sử dụng chính sách **Target Tracking Scaling** dựa trên chỉ số `ECSServiceAverageCPUUtilization` từ CloudWatch.

### 4.1. Quy Luật Scale Out (Mở Rộng Nhanh Khi Tải Tăng)
- **Ngưỡng kích hoạt (Target CPU):** `30%`.
- **Cơ chế đánh giá:** CloudWatch AlarmHigh giám sát metric trung bình CPU trong `3 chu kỳ x 60s = 3 phút`.
- **Công thức tính số lượng task mở rộng:**
  $$\text{Desired Capacity} = \left\lceil \text{Current Capacity} \times \frac{\text{Current Metric}}{\text{Target Metric}} \right\rceil$$
- **Thực tế Stress Test k6 (50 VUs):**
  - CPU đo được duy trì ở mức ~60% - 95%.
  - Tính toán: $2 \times (60\% / 30\%) = 4 \text{ tasks}$ (đạt trần `max_capacity = 4`).
  - `scale_out_cooldown = 30s`: Cho phép mở rộng thần tốc để giải tỏa nghẽn cổ chai ngay lập tức.

### 4.2. Quy Luật Scale In (Hạ Tải An Toàn & Chống Thrashing)
- **Ngưỡng kích hoạt:** `27%` (90% của ngưỡng mục tiêu).
- **Cơ chế đánh giá:** CloudWatch AlarmLow yêu cầu **`15 chu kỳ liên tiếp x 60s = 15 phút`** CPU duy trì dưới 27%.
- **Ý nghĩa kỹ thuật của thời gian 15 phút:**
  - Ngăn ngừa hiện tượng **"Thrashing / Flapping"**: Tình trạng tải vừa giảm nhẹ được 1-2 phút thì hệ thống vội vã tắt container, ngay sau đó đợt sinh viên mới vào lại phải khởi động container mới (mất 45-60s để Fargate pull image và health check).
  - Đảm bảo hạ tải mượt mà theo từng bậc: từ 4 tasks -> 3 tasks -> 2 tasks cơ sở kết hợp `scale_in_cooldown = 180s`.

---

## 5. Phân Tích Toàn Diện Ưu & Nhược Điểm (Trade-offs)

### 5.1. Ưu Điểm Nổi Bật (Strengths)
1. **Hoàn toàn tự động hóa (Full GitOps / Infrastructure as Code):** 100% hạ tầng định nghĩa qua Terraform; 100% quy trình release qua GitHub Actions OIDC.
2. **Chi phí vận hành siêu rẻ:** Chi phí nhàn rỗi dưới $20/tháng; không phát sinh hóa đơn "bất ngờ" từ NAT Gateway hay VPC Peering.
3. **Hiệu năng và độ tin cậy được chứng thực:** Đã vượt qua bài kiểm tra stress test với 14,307 requests, tỷ lệ thành công 99.76% và tự động kích hoạt scale-out lên 4 tasks hoàn hảo.
4. **Bảo mật chuẩn Enterprise:** Không lưu key cố định, chặn truy cập trực tiếp vào ALB bằng header bí mật, WAF chặn tấn công từ tầng biên.

### 5.2. Nhược Điểm & Giới Hạn Cần Lưu Ý (Limitations)
1. **Độ trễ khởi động của Serverless Container (Fargate Cold Start):**
   - Khi scale-out, AWS Fargate cần khoảng 45-60 giây để cấp phát máy ảo ngầm, tải Docker image từ ECR và vượt qua 2 vòng health check của ALB trước khi chính thức nhận request.
   - *Cách khắc phục:* Đặt ngưỡng Target CPU nhạy (30%) để hệ thống kích hoạt scale-out từ sớm trước khi hệ thống chạm mức nghẽn 100%.
2. **Mô hình dữ liệu NoSQL (DynamoDB):**
   - DynamoDB không hỗ trợ các câu truy vấn phức tạp (complex JOINs, subqueries) như PostgreSQL hay MySQL. Mọi thiết kế bảng phải dựa trên Access Patterns cụ thể.
   - *Đánh giá:* Rất phù hợp với nghiệp vụ đăng ký tín chỉ (tra cứu môn học, lấy số lượng slot, ghi nhận MSSV), nhưng nếu muốn làm báo cáo thống kê phức tạp nhiều bảng sẽ cần tích hợp thêm AWS Athena hoặc Glue.

### 5.3. Định Hướng Mở Rộng Tương Lai (Future Enhancements)
- **Caching Tầng Ứng Dụng:** Bổ sung Amazon ElastiCache (Redis) Serverless để cache danh sách môn học công khai, giảm 80% truy vấn đọc vào DynamoDB.
- **Nâng Cấp Khi Lên Quy Mô Cấp Quốc Gia (Enterprise Scale):** Sử dụng Amazon EKS (Kubernetes) kết hợp Karpenter để thời gian co giãn container rút ngắn từ 45s xuống dưới 10s.
