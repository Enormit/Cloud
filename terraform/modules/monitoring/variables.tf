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

variable "ecs_cluster_name" {
  type        = string
  description = "ECS cluster name"
}

variable "ecs_service_name" {
  type        = string
  description = "ECS service name"
}

variable "ecs_log_group_name" {
  type        = string
  description = "CloudWatch log group name for ECS service"
}

variable "load_balancer_name" {
  type        = string
  description = "Load balancer name"
}

variable "cloudfront_distribution_id" {
  type        = string
  description = "CloudFront distribution ID"
}

variable "cloudfront_waf_name" {
  type        = string
  description = "CloudFront WAF web ACL metric name"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Environment name"
}

variable "lambda_function_name" {
  type        = string
  default     = ""
  description = "Name of the Email Worker Lambda function for monitoring"
}
