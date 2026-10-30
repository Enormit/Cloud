variable "project" {
  type        = string
  description = "Project name"
}

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

variable "alb_security_group_id" {
  type        = string
  description = "Security group ID for ALB"
}

variable "acm_certificate_arn" {
  type        = string
  description = "ACM certificate ARN for ALB HTTPS listener"
  default     = ""
}

variable "cloudfront_custom_header_token" {
  type        = string
  description = "Secret token that CloudFront sends in custom header to authenticate with ALB"
  sensitive   = true
}

variable "ecs_security_group_id" {
  type        = string
  description = "Security group ID for ECS Tasks to allow invoking Lambda VPC endpoint"
}
