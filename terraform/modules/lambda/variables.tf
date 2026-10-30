variable "project" {
  type        = string
  description = "Project name"
}

variable "region" {
  type        = string
  description = "AWS region"
}

variable "account_id" {
  type        = string
  description = "AWS account ID"
}

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
  description = "Gmail address"
}

variable "smtp_password" {
  type        = string
  sensitive   = true
  description = "Gmail App Password"
}

variable "default_from_email" {
  type        = string
  description = "Sender email address"
}

variable "email_subject_prefix" {
  type        = string
  default     = "Đăng Ký Học Phần"
  description = "Prefix for email subjects"
}
