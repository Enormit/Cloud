output "github_actions_role_arn" {
  description = "ARN of the IAM Role for GitHub Actions OIDC authentication"
  value       = aws_iam_role.github_actions.arn
}

output "github_actions_role_name" {
  description = "Name of the IAM Role for GitHub Actions"
  value       = aws_iam_role.github_actions.name
}

output "oidc_provider_arn" {
  description = "ARN of the GitHub OIDC Identity Provider in AWS IAM"
  value       = local.oidc_provider_arn
}
