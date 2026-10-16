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

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs"
}

variable "ecs_security_group_id" {
  type        = string
  description = "ECS security group ID"
}

variable "target_group_arn" {
  type        = string
  description = "ALB target group ARN"
}

variable "ecs_task_execution_role_arn" {
  type        = string
  description = "ECS task execution role ARN"
}

variable "ecs_task_role_arn" {
  type        = string
  description = "ECS task role ARN"
}

variable "task_cpu" {
  type        = string
  default     = "256"
  description = "Task CPU units"
}

variable "task_memory" {
  type        = string
  default     = "512"
  description = "Task memory in MB"
}

variable "desired_count" {
  type        = number
  default     = 2
  description = "Desired number of tasks"
}

variable "min_capacity" {
  type        = number
  default     = 2
  description = "Minimum capacity"
}

variable "max_capacity" {
  type        = number
  default     = 4
  description = "Maximum capacity"
}

variable "target_cpu_utilization" {
  type        = number
  default     = 70
  description = "Target CPU utilization for scaling"
}

variable "target_memory_utilization" {
  type        = number
  default     = 80
  description = "Target memory utilization for scaling"
}

variable "log_retention_days" {
  type        = number
  default     = 30
  description = "CloudWatch log retention in days"
}

variable "secrets_manager_name" {
  type        = string
  description = "Secrets Manager secret name"
}

variable "email_provider" {
  type        = string
  default     = "ses"
  description = "Email provider used by backend (ses or smtp)"
}

variable "ecr_retain_image_count" {
  type        = number
  default     = 30
  description = "Number of recent tagged ECR images to retain for rollback"
}
