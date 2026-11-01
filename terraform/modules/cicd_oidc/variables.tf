variable "project" {
  type        = string
  description = "Project name"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Environment name (e.g. production, staging, dev)"
}

variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "account_id" {
  type        = string
  description = "AWS account ID"
}

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
  description = "GitHub branch allowed to assume the deploy role"
}

variable "create_oidc_provider" {
  type        = bool
  default     = true
  description = "Whether to create the GitHub OIDC provider (false if already exists in account)"
}

variable "ecr_repository_name" {
  type        = string
  description = "ECR repository name for backend"
}

variable "ecs_cluster_name" {
  type        = string
  description = "ECS cluster name"
}

variable "ecs_service_name" {
  type        = string
  description = "ECS service name"
}

variable "frontend_bucket_arn" {
  type        = string
  description = "S3 bucket ARN for frontend static files"
}

variable "cloudfront_distribution_id" {
  type        = string
  description = "CloudFront distribution ID for cache invalidations"
}

variable "ecs_task_execution_role_arn" {
  type        = string
  description = "IAM Role ARN for ECS Task Execution"
}

variable "ecs_task_role_arn" {
  type        = string
  description = "IAM Role ARN for ECS Task Runtime"
}
