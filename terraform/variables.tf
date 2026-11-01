variable "aws_region" {
  type        = string
  default     = "ap-southeast-1"
  description = "AWS region"
}

variable "project" {
  type        = string
  default     = "course-registration"
  description = "Project name"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Environment (development, staging, production)"
}

variable "domain_name" {
  type        = string
  default     = "course-registration.edu.vn"
  description = "Domain name for application"
}

# Network variables
variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "VPC CIDR block"
}

variable "public_subnet_cidrs" {
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
  description = "Public subnet CIDR blocks"
}

variable "private_subnet_cidrs" {
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
  description = "Private subnet CIDR blocks"
}

# Compute variables
variable "task_cpu" {
  type        = string
  default     = "256"
  description = "Task CPU units (256, 512, 1024, 2048, 4096)"
}

variable "task_memory" {
  type        = string
  default     = "512"
  description = "Task memory in MB"
}

variable "desired_count" {
  type        = number
  default     = 2
  description = "Desired number of ECS tasks"
}

variable "min_capacity" {
  type        = number
  default     = 2
  description = "Minimum ECS capacity"
}

variable "max_capacity" {
  type        = number
  default     = 4
  description = "Maximum ECS capacity"
}

variable "target_cpu_utilization" {
  type        = number
  default     = 70
  description = "Target CPU utilization percentage for autoscaling"
}

variable "target_memory_utilization" {
  type        = number
  default     = 80
  description = "Target memory utilization percentage for autoscaling"
}

variable "log_retention_days" {
  type        = number
  default     = 30
  description = "CloudWatch log retention in days"
}

variable "container_insights" {
  type        = string
  default     = "enhanced"
  description = "Container Insights mode for ECS: enhanced (task/container level) or enabled"
}

variable "email_provider" {
  type        = string
  default     = "lambda"
  description = "Email provider used by backend (lambda, ses or smtp)"
}

# Lambda Google SMTP variables
variable "smtp_host" {
  type        = string
  default     = "smtp.gmail.com"
  description = "SMTP host (Gmail)"
}

variable "smtp_port" {
  type        = string
  default     = "587"
  description = "SMTP port"
}

variable "smtp_user" {
  type        = string
  default     = "phamquyet472k4@gmail.com"
  description = "Gmail address for Lambda email worker"
}

variable "smtp_password" {
  type        = string
  default     = ""
  sensitive   = true
  description = "Gmail App Password"
}

variable "default_from_email" {
  type        = string
  default     = "phamquyet472k4@gmail.com"
  description = "Sender email address"
}

variable "email_subject_prefix" {
  type        = string
  default     = "Đăng Ký Học Phần"
  description = "Prefix for email subjects"
}

# Secrets variables
variable "secrets_manager_name" {
  type        = string
  default     = "prod/app/backend"
  description = "Secrets Manager secret name for backend"
}

# GitHub OIDC CI/CD variables
variable "github_org" {
  type        = string
  default     = "Enormit"
  description = "GitHub organization or user owning the repository"
}

variable "github_repo" {
  type        = string
  default     = "Cloud"
  description = "GitHub repository name"
}

variable "github_branch" {
  type        = string
  default     = "main"
  description = "GitHub branch allowed to deploy via OIDC"
}

variable "create_github_oidc_provider" {
  type        = bool
  default     = true
  description = "Whether to create GitHub OIDC identity provider (set false if already created in AWS account)"
}
