variable "project" {
  type        = string
  description = "Project name"
}

variable "region" {
  type        = string
  default     = "ap-southeast-1"
  description = "Primary AWS region"
}

variable "backup_schedule" {
  type        = string
  default     = "cron(0 18 * * ? *)"
  description = "AWS Backup cron schedule for DynamoDB backups (UTC)"
}

variable "backup_delete_after_days" {
  type        = number
  default     = 35
  description = "Retention period in days for AWS Backup recovery points"
}

variable "backup_start_window_minutes" {
  type        = number
  default     = 60
  description = "Backup job start window in minutes"
}

variable "backup_completion_window_minutes" {
  type        = number
  default     = 180
  description = "Backup job completion window in minutes"
}
