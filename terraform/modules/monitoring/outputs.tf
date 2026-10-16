output "cloudwatch_dashboard_url" {
  value = "https://console.aws.amazon.com/cloudwatch/home?region=${var.region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

output "cloudtrail_arn" {
  value = aws_cloudtrail.main.arn
}

output "cloudtrail_bucket_name" {
  value = aws_s3_bucket.cloudtrail.id
}
