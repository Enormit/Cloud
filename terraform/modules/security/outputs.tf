output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs.id
}

output "database_security_group_id" {
  value = aws_security_group.database.id
}

output "cloudfront_waf_arn" {
  value = aws_wafv2_web_acl.cloudfront.arn
}

output "acm_certificate_arn" {
  value = aws_acm_certificate.main.arn
}

output "acm_domain_validation_options" {
  value = aws_acm_certificate.main.domain_validation_options
}

output "ecs_task_execution_role_arn" {
  value = aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_role_arn" {
  value = aws_iam_role.ecs_task_role.arn
}
