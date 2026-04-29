variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "finance-tracker"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "RDS database name"
  type        = string
  default     = "finance_tracker"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "backend_image" {
  description = "ECR image URI for backend"
  type        = string
}

variable "frontend_image" {
  description = "ECR image URI for frontend"
  type        = string
}

variable "backend_cpu" {
  description = "Fargate CPU units for backend"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Fargate memory (MB) for backend"
  type        = number
  default     = 512
}

variable "frontend_cpu" {
  description = "Fargate CPU units for frontend"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Fargate memory (MB) for frontend"
  type        = number
  default     = 512
}

variable "django_secret_key" {
  description = "Django SECRET_KEY for production"
  type        = string
  sensitive   = true
}
