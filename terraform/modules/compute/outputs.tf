output "ecr_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_repository_arn" {
  value = aws_ecr_repository.backend.arn
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  value = aws_ecs_cluster.main.arn
}

output "ecs_service_name" {
  value = aws_ecs_service.backend.name
}

output "ecs_service_arn" {
  value = aws_ecs_service.backend.id
}

output "cloudwatch_log_group_name" {
  value = aws_cloudwatch_log_group.ecs.name
}

output "cloudwatch_log_group_arn" {
  value = aws_cloudwatch_log_group.ecs.arn
}
