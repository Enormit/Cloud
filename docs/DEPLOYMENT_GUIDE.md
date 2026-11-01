# HƯỚNG DẪN TRIỂN KHAI VÀ VẬN HÀNH HỆ THỐNG
## Terraform Infrastructure as Code & GitHub Actions CI/CD

Tài liệu này hướng dẫn chi tiết từng bước cách cấu hình Git, GitHub Actions OIDC, khởi tạo hạ tầng AWS bằng Terraform, nạp dữ liệu mẫu ban đầu, và thực hiện kiểm thử tải (Stress Test) xác thực Auto Scaling.

---

## 1. Yêu Cầu Môi Trường (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
- **AWS CLI v2:** Đã đăng nhập và cấu hình quyền Administrator (`aws configure`).
- **Terraform:** Phiên bản `>= 1.5.0` ([Tải tại đây](https://www.terraform.io/downloads)).
- **Git:** Quản lý mã nguồn.
- **Node.js:** Phiên bản `>= 20.x` và `npm` (cho Frontend React).
- **Python:** Phiên bản `>= 3.11` và `pip` (cho Backend FastAPI).
- **Docker:** Build và chạy container cục bộ.
- **k6:** Công cụ stress test mã nguồn mở ([Tải k6](https://k6.io/docs/get-started/installation/)).

---

## 2. Cấu Hình Git & GitHub Actions OIDC (Keyless CI/CD)

Hệ thống sử dụng cơ chế xác thực **OpenID Connect (OIDC)** giữa GitHub và AWS, loại bỏ hoàn toàn việc lưu `AWS_ACCESS_KEY_ID` cố định.

### 2.1. Cấu trúc Pipeline CI/CD ([`.github/workflows/deploy.yml`](file:///home/ubuntu/Dev/Cloud_AWS/.github/workflows/deploy.yml))
Pipeline tự động chạy khi có sự kiện `push` hoặc `pull_request` vào nhánh `main`:
1. **Job `backend-ci`:**
   - Cài đặt Python 3.11 và các thư viện cần thiết.
   - Chạy linter Flake8 kiểm tra cú pháp và biến chưa định nghĩa.
   - Kiểm tra khả năng nạp FastAPI application (`app.main`).
2. **Job `frontend-ci`:**
   - Cài đặt Node.js 20 và thực hiện `npm ci`.
   - Chạy `npm run build` để xác thực code React/Vite biên dịch sạch lỗi.
3. **Job `deploy` (Chỉ chạy khi push vào `main`):**
   - Đổi OIDC JWT lấy AWS Temporary Credentials qua STS `AssumeRoleWithWebIdentity`.
   - Đăng nhập Amazon ECR, build và tag Docker image backend với mã Git commit SHA và `latest`.
   - Đẩy Docker image lên ECR và kích hoạt ECS service cập nhật (`--force-new-deployment`).
   - Build frontend và đồng bộ file lên S3 bucket (`aws s3 sync --delete`).
   - Gửi yêu cầu Invalidate toàn bộ cache trên CloudFront distribution (`aws cloudfront create-invalidation`).

### 2.2. Các bước cấu hình Secrets trên GitHub
1. Mở Repository trên trình duyệt: **`https://github.com/<owner>/<repo>`**
2. Vào **Settings** ➔ **Secrets and variables** ➔ Chọn **Actions**.
3. Tại mục **Repository secrets**, nhấp nút xanh **New repository secret** và thêm 2 secret sau:

| Tên Secret | Ý Nghĩa | Giá trị mẫu |
| :--- | :--- | :--- |
| `AWS_ROLE_TO_ASSUME` | ARN của IAM Role OIDC cấp quyền deploy | `arn:aws:iam::<ACCOUNT_ID>:role/course-registration-github-actions-deploy-role` |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID phân phối CDN để tự động xóa cache | `E14ZIZ3MBDC0O4` |

> [!NOTE]
> IAM Trust Policy của Role này đã được Terraform cấu hình hỗ trợ định dạng Wildcard (`repo:Enormit*/Cloud*:*`), đảm bảo chấp nhận đầy đủ các định dạng sub-token từ GitHub Actions.

---

## 3. Hướng Dẫn Khởi Tạo Hạ Tầng Với Terraform

### 3.1. Cấu trúc thư mục Terraform
```
terraform/
├── main.tf                 # File cấu hình trung tâm kết nối các module
├── variables.tf            # Khai báo các biến cấu hình toàn cục
├── outputs.tf              # Đầu ra thông tin tài nguyên (ALB DNS, S3, Roles, v.v.)
├── providers.tf            # Cấu hình AWS provider và version constraint
└── modules/
    ├── networking/         # VPC, Subnets (Multi-AZ), IGW, ALB, Target Groups
    ├── security/           # ACM SSL Certificates, IAM Base Roles, WAF
    ├── compute/            # ECR, ECS Fargate, Capacity Providers, Auto Scaling
    ├── database/           # 6 bảng DynamoDB On-Demand & AWS Backup Vault
    ├── storage/            # S3 Bucket lưu trữ React Single Page App
    ├── lambda/             # Lambda Email Worker xử lý gửi email bất đồng bộ
    ├── monitoring/         # CloudWatch Dashboard, Metric Alarms, CloudTrail
    └── cicd_oidc/          # AWS IAM OIDC Provider & GitHub Actions Deploy Role
```

### 3.2. Cấu hình biến môi trường (`terraform/variables.tf`)
Mặc định hệ thống đã có sẵn các giá trị tối ưu, bạn có thể tạo file `terraform.tfvars` nếu muốn tùy biến:
```hcl
aws_region             = "ap-southeast-1"
environment            = "production"
project                = "course-registration"
domain_name            = "enormitpham.me"

# Auto Scaling
min_capacity           = 2
max_capacity           = 4
target_cpu_utilization = 30 # Ngưỡng kích hoạt scale-out

# GitHub OIDC
github_org             = "Enormit"
github_repo            = "Cloud"
github_branch          = "main"
```

### 3.3. Các lệnh thực thi Terraform

1. **Khởi tạo Terraform (Tải providers và modules):**
   ```bash
   cd terraform
   terraform init
   ```

2. **Kiểm tra kế hoạch triển khai (Dry-run):**
   ```bash
   terraform plan
   ```

3. **Áp dụng triển khai hạ tầng lên AWS:**
   ```bash
   terraform apply -auto-approve
   ```
   *Quá trình khởi tạo toàn bộ hạ tầng (VPC, ALB, ECS, DynamoDB, CloudFront, Route 53, ACM) mất khoảng 3 - 5 phút.*

4. **Xem lại các thông tin đầu ra quan trọng:**
   ```bash
   terraform output
   ```

5. **Hủy toàn bộ tài nguyên (Khi muốn dọn dẹp sạch sẽ tránh phát sinh chi phí):**
   ```bash
   terraform destroy -auto-approve
   ```

---

## 4. Nạp Dữ Liệu Khởi Tạo (Database Seeding)

Sau khi hạ tầng và bảng DynamoDB được tạo thành công, chạy script seed dữ liệu mẫu cho hệ thống (bao gồm tài khoản sinh viên, admin, danh sách môn học, phòng học, giảng viên):

```bash
# Cài đặt thư viện boto3 (nếu chưa có)
pip install boto3

# Chạy nạp dữ liệu mẫu vào 6 bảng DynamoDB
python seed_data.py
```

### Tài khoản mẫu mặc định được tạo:
- **Tài khoản Sinh viên:**
  - MSSV: `sv001`
  - Mật khẩu: `student123`
- **Tài khoản Quản trị viên (Admin):**
  - Username: `admin`
  - Mật khẩu: `admin123`

---

## 5. Hướng Dẫn Stress Test & Giám Sát Auto Scaling Bằng k6

Hệ thống đi kèm file k6 script chuyên dụng ([`k6_test.js`](file:///home/ubuntu/Dev/Cloud_AWS/k6_test.js)) để giả lập tải đồng thời và kích hoạt tính năng co giãn tự động của ECS Fargate.

### 5.1. Kịch bản Stress Test (`k6_test.js`)
- **Setup:** Đăng nhập 1 lần duy nhất lấy JWT Token cho `sv001`.
- **Stages:**
  - `20s`: Tăng nhanh từ 0 lên 50 Virtual Users (VUs).
  - `5m00s`: Duy trì tải liên tục 50 VUs (gọi song song `/api/courses/` và `/api/registrations/stats`).
  - `20s`: Hạ tải về 0.

### 5.2. Chạy bài test tải:
```bash
k6 run k6_test.js
```

### 5.3. Giám sát thời gian thực quá trình Auto Scaling:
Trong khi k6 đang chạy, bạn có thể mở một terminal khác và chạy script kiểm tra trạng thái ECS và ALB:
```bash
python3 -c "
import boto3
ecs = boto3.client('ecs', region_name='ap-southeast-1')
elbv2 = boto3.client('elbv2', region_name='ap-southeast-1')
s = ecs.describe_services(cluster='course-registration-cluster', services=['course-registration-backend-service'])['services'][0]
print(f'Desired Count: {s[\"desiredCount\"]} | Running Count: {s[\"runningCount\"]}')
"
```

### 5.4. Kết quả mong đợi trong suốt vòng đời Auto Scaling:
1. **0m - 1m:** 2 Tasks cơ sở chạy ở CPU ~0.5% (Trạng thái nghỉ).
2. **1m - 3m:** 50 VUs đồng loạt gửi request, CPU trung bình vọt lên **60% - 95%** (Vượt ngưỡng 30%).
3. **Phút thứ 4:** CloudWatch gom đủ 3 chu kỳ liên tiếp > 30% ➔ `AlarmHigh` kích hoạt ➔ Target Tracking tính toán và nâng `DesiredCount` từ **2 lên 4 tasks**.
4. **Phút thứ 5:** ECS khởi tạo thêm 2 tasks Fargate Spot mới ➔ Cả 4 tasks đều `healthy` trên ALB ➔ CPU trung bình lập tức hạ nhiệt xuống dưới 30%.
5. **Sau khi hết tải (~15-18 phút):** CloudWatch gom đủ 15 chu kỳ liên tiếp < 27% ➔ `AlarmLow` kích hoạt ➔ Tự động hạ tải an toàn từ **4 về 3**, sau đó về **2 tasks cơ sở**.
