data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

# Generate random secret token for CloudFront to ALB authentication
resource "random_password" "cloudfront_origin_verify_header" {
  length  = 32
  special = false
}

# Networking Module
module "networking" {
  source = "./modules/networking"

  project                        = var.project
  vpc_cidr                       = var.vpc_cidr
  public_subnet_cidrs            = var.public_subnet_cidrs
  private_subnet_cidrs           = var.private_subnet_cidrs
  alb_security_group_id          = module.security.alb_security_group_id
  ecs_security_group_id          = module.security.ecs_security_group_id
  acm_certificate_arn            = module.security.acm_certificate_arn
  cloudfront_custom_header_token = random_password.cloudfront_origin_verify_header.result
}

# Security Module
module "security" {
  source = "./modules/security"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  project     = var.project
  vpc_id      = module.networking.vpc_id
  domain_name = var.domain_name
  region      = var.aws_region
  account_id  = data.aws_caller_identity.current.account_id
}

# Lambda Email Worker Module (Google Mail via Serverless Lambda)
module "lambda" {
  source = "./modules/lambda"

  project              = var.project
  region               = var.aws_region
  account_id           = data.aws_caller_identity.current.account_id
  smtp_host            = var.smtp_host
  smtp_port            = var.smtp_port
  smtp_user            = var.smtp_user
  smtp_password        = var.smtp_password
  default_from_email   = var.default_from_email
  email_subject_prefix = var.email_subject_prefix
}

# Compute Module (ECS, Fargate)
module "compute" {
  source = "./modules/compute"

  project                     = var.project
  region                      = var.aws_region
  account_id                  = data.aws_caller_identity.current.account_id
  private_subnet_ids          = module.networking.private_subnet_ids
  ecs_security_group_id       = module.security.ecs_security_group_id
  target_group_arn            = module.networking.target_group_arn
  ecs_task_execution_role_arn = module.security.ecs_task_execution_role_arn
  ecs_task_role_arn           = module.security.ecs_task_role_arn
  task_cpu                    = var.task_cpu
  task_memory                 = var.task_memory
  desired_count               = var.desired_count
  min_capacity                = var.min_capacity
  max_capacity                = var.max_capacity
  target_cpu_utilization      = var.target_cpu_utilization
  target_memory_utilization   = var.target_memory_utilization
  log_retention_days          = var.log_retention_days
  secrets_manager_name        = var.secrets_manager_name
  email_provider              = var.email_provider
  container_insights          = var.container_insights
}

# Database Module (DynamoDB)
module "database" {
  source = "./modules/database"

  project = var.project
  region  = var.aws_region
}

# Storage Module (S3)
module "storage" {
  source = "./modules/storage"

  project    = var.project
  account_id = data.aws_caller_identity.current.account_id
}

# Monitoring Module (CloudWatch, CloudTrail)
module "monitoring" {
  source = "./modules/monitoring"

  project                    = var.project
  region                     = var.aws_region
  account_id                 = data.aws_caller_identity.current.account_id
  ecs_cluster_name           = module.compute.ecs_cluster_name
  ecs_service_name           = module.compute.ecs_service_name
  ecs_log_group_name         = module.compute.cloudwatch_log_group_name
  load_balancer_name         = module.networking.alb_arn_suffix
  cloudfront_distribution_id = aws_cloudfront_distribution.frontend.id
  cloudfront_waf_name        = element(split("/", aws_cloudfront_distribution.frontend.web_acl_id), 2)
  environment                = var.environment
  lambda_function_name       = module.lambda.lambda_function_name
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = module.storage.frontend_website_endpoint
    origin_id   = "S3Frontend"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    domain_name = module.networking.alb_dns_name
    origin_id   = "ALBBackend"

    custom_header {
      name  = "X-Origin-Verify"
      value = random_password.cloudfront_origin_verify_header.result
    }

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  web_acl_id          = module.security.cloudfront_waf_arn

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Frontend"

    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    viewer_protocol_policy = "redirect-to-https"
  }

  # API endpoints routed to ALB
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALBBackend"

    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # Managed-CachingDisabled
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3" # Managed-AllViewer

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.project}-cloudfront"
  }
}

# GitHub Actions OIDC CI/CD Module (Keyless Deployment)
module "cicd_oidc" {
  source = "./modules/cicd_oidc"

  project                     = var.project
  environment                 = var.environment
  aws_region                  = var.aws_region
  account_id                  = data.aws_caller_identity.current.account_id
  github_org                  = var.github_org
  github_repo                 = var.github_repo
  github_branch               = var.github_branch
  create_oidc_provider        = var.create_github_oidc_provider
  ecr_repository_name         = module.compute.ecr_repository_name
  ecs_cluster_name            = module.compute.ecs_cluster_name
  ecs_service_name            = module.compute.ecs_service_name
  frontend_bucket_arn         = module.storage.frontend_bucket_arn
  cloudfront_distribution_id  = aws_cloudfront_distribution.frontend.id
  ecs_task_execution_role_arn = module.security.ecs_task_execution_role_arn
  ecs_task_role_arn           = module.security.ecs_task_role_arn
}
