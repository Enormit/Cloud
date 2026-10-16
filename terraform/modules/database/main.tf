# DynamoDB Table: accounts_user
resource "aws_dynamodb_table" "accounts_user" {
  name         = "accounts_user"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  point_in_time_recovery {
    enabled = true
  }

  attribute {
    name = "id"
    type = "N"
  }

  global_secondary_index {
    name            = "username-index"
    hash_key        = "username"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "mssv-index"
    hash_key        = "mssv"
    projection_type = "ALL"
  }

  attribute {
    name = "username"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "mssv"
    type = "S"
  }

  tags = {
    Name = "accounts_user"
  }
}

# DynamoDB Table: courses_course
resource "aws_dynamodb_table" "courses_course" {
  name         = "courses_course"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "N"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "courses_course"
  }
}

# DynamoDB Table: courses_registration
resource "aws_dynamodb_table" "courses_registration" {
  name         = "courses_registration"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  point_in_time_recovery {
    enabled = true
  }

  attribute {
    name = "id"
    type = "N"
  }

  global_secondary_index {
    name            = "student_course-index"
    hash_key        = "student_id"
    range_key       = "course_id"
    projection_type = "ALL"
  }

  attribute {
    name = "student_id"
    type = "N"
  }

  attribute {
    name = "course_id"
    type = "N"
  }

  tags = {
    Name = "courses_registration"
  }
}

# DynamoDB Table: courses_registrationwindow
resource "aws_dynamodb_table" "courses_registrationwindow" {
  name         = "courses_registrationwindow"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "N"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "courses_registrationwindow"
  }
}

# DynamoDB Table: authtoken_token
resource "aws_dynamodb_table" "authtoken_token" {
  name         = "authtoken_token"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "key"

  attribute {
    name = "key"
    type = "S"
  }

  tags = {
    Name = "authtoken_token"
  }
}

# DynamoDB Table: email_logs
resource "aws_dynamodb_table" "email_logs" {
  name         = "email_logs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = "email_logs"
  }
}

# AWS Backup Vault for DynamoDB
resource "aws_backup_vault" "dynamodb" {
  name = "${var.project}-dynamodb-backup-vault"
}
