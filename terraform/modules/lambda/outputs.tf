output "lambda_arn" {
  value       = aws_lambda_function.email_worker.arn
  description = "ARN of the Email Worker Lambda function"
}

output "lambda_function_name" {
  value       = aws_lambda_function.email_worker.function_name
  description = "Name of the Email Worker Lambda function"
}
