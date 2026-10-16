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

variable "email_provider" {
  type        = string
  default     = "ses"
  description = "Email provider used by backend (ses or smtp)"
}

# Secrets variables
variable "secrets_manager_name" {
  type        = string
  default     = "prod/app/backend"
  description = "Secrets Manager secret name for backend"
}
