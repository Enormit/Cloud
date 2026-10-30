data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/lambda_email/index.py"
  output_path = "${path.module}/email_worker.zip"
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project}-email-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Attach basic execution policy for CloudWatch Logs
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.project}-email-worker"
  retention_in_days = 14
}

# Lambda Function (Runs outside VPC to access Google SMTP directly without NAT Gateway)
resource "aws_lambda_function" "email_worker" {
  function_name    = "${var.project}-email-worker"
  runtime          = "python3.11"
  handler          = "index.handler"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  role             = aws_iam_role.lambda_exec.arn
  timeout          = 30
  memory_size      = 128

  environment {
    variables = {
      SMTP_HOST            = var.smtp_host
      SMTP_PORT            = var.smtp_port
      SMTP_USER            = var.smtp_user
      SMTP_PASSWORD        = var.smtp_password
      DEFAULT_FROM_EMAIL   = var.default_from_email
      EMAIL_SUBJECT_PREFIX = var.email_subject_prefix
    }
  }

  tags = {
    Name    = "${var.project}-email-worker"
    Service = "Email"
  }
}
