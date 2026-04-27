# ============================================================
# Daily Expense Tracker — Terraform Outputs
# ============================================================

output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.expense_tracker_ec2.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.expense_tracker_ec2.public_dns
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.expense_tracker_db.endpoint
}

output "rds_database_name" {
  description = "Name of the RDS database"
  value       = aws_db_instance.expense_tracker_db.db_name
}

output "app_url" {
  description = "URL to access the application"
  value       = "http://${aws_instance.expense_tracker_ec2.public_ip}:8000"
}
