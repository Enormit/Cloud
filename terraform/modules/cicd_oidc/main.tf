# GitHub OIDC Provider Certificate
data "tls_certificate" "github" {
  url = "https://token.actions.githubusercontent.com/.well-known/openid-configuration"
}

# 1. AWS IAM OpenID Connect Provider for GitHub Actions
resource "aws_iam_openid_connect_provider" "github" {
  count = var.create_oidc_provider ? 1 : 0

  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  thumbprint_list = distinct(concat(
    [data.tls_certificate.github.certificates[0].sha1_fingerprint],
    ["6938fd4d98bab03faadb97b34396831e3780aea1", "1c58a3a8518e8759bf075b76b750d4f8d264fcd9"]
  ))

  tags = {
    Name        = "${var.project}-github-oidc-provider"
    Environment = var.environment
  }
}

locals {
  oidc_provider_arn = var.create_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : "arn:aws:iam::${var.account_id}:oidc-provider/token.actions.githubusercontent.com"
}

# 2. IAM Role for GitHub Actions (Assumed via OIDC Web Identity)
resource "aws_iam_role" "github_actions" {
  name        = "${var.project}-github-actions-deploy-role"
  description = "Role assumed by GitHub Actions via OIDC for secure, keyless deployments"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = local.oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = [
              "repo:${var.github_org}/${var.github_repo}:*",
              "repo:${lower(var.github_org)}/${var.github_repo}:*",
              "repo:${lower(var.github_org)}/${lower(var.github_repo)}:*",
              "repo:${var.github_org}/${lower(var.github_repo)}:*",
              "repo:*:Cloud:*",
              "repo:*:cloud:*"
            ]
          }
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project}-github-actions-deploy-role"
    Environment = var.environment
  }
}

# 3. Least-Privilege Deployment Policy for CI/CD
resource "aws_iam_policy" "github_actions_deploy" {
  name        = "${var.project}-github-actions-deploy-policy"
  description = "Least privilege permissions for GitHub Actions to build, push ECR, update ECS, deploy S3, and invalidate CloudFront"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # ECR Authentication
      {
        Sid    = "ECRAuth"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },

      # ECR Image Operations (Restricted to project repository)
      {
        Sid    = "ECRImageOperations"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:DescribeRepositories",
          "ecr:ListImages"
        ]
        Resource = "arn:aws:ecr:${var.aws_region}:${var.account_id}:repository/${var.ecr_repository_name}"
      },

      # ECS Deployment (Service update & task definition registration)
      {
        Sid    = "ECSDeployment"
        Effect = "Allow"
        Action = [
          "ecs:DescribeServices",
          "ecs:UpdateService",
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition",
          "ecs:ListTasks",
          "ecs:DescribeTasks"
        ]
        Resource = [
          "arn:aws:ecs:${var.aws_region}:${var.account_id}:service/${var.ecs_cluster_name}/${var.ecs_service_name}",
          "arn:aws:ecs:${var.aws_region}:${var.account_id}:cluster/${var.ecs_cluster_name}",
          "arn:aws:ecs:${var.aws_region}:${var.account_id}:task-definition/*"
        ]
      },

      # IAM PassRole (Only pass task execution & runtime roles to ECS)
      {
        Sid    = "IAMPassRoleToECS"
        Effect = "Allow"
        Action = "iam:PassRole"
        Resource = [
          var.ecs_task_execution_role_arn,
          var.ecs_task_role_arn
        ]
      },

      # S3 Frontend Deployment (Sync dist folder)
      {
        Sid    = "S3FrontendDeploy"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Resource = [
          var.frontend_bucket_arn,
          "${var.frontend_bucket_arn}/*"
        ]
      },

      # CloudFront Cache Invalidation
      {
        Sid    = "CloudFrontInvalidation"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations"
        ]
        Resource = "arn:aws:cloudfront::${var.account_id}:distribution/${var.cloudfront_distribution_id}"
      }
    ]
  })
}

# 4. Attach Policy to Role
resource "aws_iam_role_policy_attachment" "github_actions_attach" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.github_actions_deploy.arn
}
