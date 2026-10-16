# Networking Outputs
output "vpc_id" {
  value       = module.networking.vpc_id
  description = "VPC ID"
}

output "alb_dns_name" {
  value       = module.networking.alb_dns_name
  description = "ALB DNS name"
}

output "alb_arn" {
  value       = module.networking.alb_arn
  description = "ALB ARN"
}

# Compute Outputs
output "ecr_repository_url" {
  value       = module.compute.ecr_repository_url
  description = "ECR repository URL for backend image"
}

output "ecs_cluster_name" {
  value       = module.compute.ecs_cluster_name
  description = "ECS cluster name"
}

output "ecs_service_name" {
  value       = module.compute.ecs_service_name
  description = "ECS service name"
}

output "cloudwatch_log_group_name" {
  value       = module.compute.cloudwatch_log_group_name
  description = "CloudWatch log group for ECS"
}

output "dynamodb_tables" {
  value       = module.database.dynamodb_tables
  description = "List of DynamoDB tables"
}

# Storage Outputs
output "frontend_bucket_name" {
  value       = module.storage.frontend_bucket_name
  description = "S3 bucket for frontend"
}

output "frontend_website_endpoint" {
  value       = module.storage.frontend_website_endpoint
  description = "S3 static website endpoint"
}

# CloudFront Outputs
output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.frontend.domain_name
  description = "CloudFront distribution domain name"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.frontend.id
  description = "CloudFront distribution ID"
}

# Monitoring Outputs
output "cloudwatch_dashboard_url" {
  value       = module.monitoring.cloudwatch_dashboard_url
  description = "CloudWatch dashboard URL"
}

output "cloudtrail_bucket_name" {
  value       = module.monitoring.cloudtrail_bucket_name
  description = "S3 bucket for CloudTrail logs"
}
