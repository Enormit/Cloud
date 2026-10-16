output "dynamodb_tables" {
  value = [
    aws_dynamodb_table.accounts_user.name,
    aws_dynamodb_table.courses_course.name,
    aws_dynamodb_table.courses_registration.name,
    aws_dynamodb_table.courses_registrationwindow.name,
    aws_dynamodb_table.authtoken_token.name,
    aws_dynamodb_table.email_logs.name
  ]
}

output "backup_vault_name" {
  value = aws_backup_vault.dynamodb.name
}
