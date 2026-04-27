# ============================================================
# Daily Expense Tracker — Terraform Configuration
# Creates: EC2 instance, RDS PostgreSQL, Security Groups
# ============================================================

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ──────────────────────────────────────
#  Data Sources
# ──────────────────────────────────────

# Use default VPC for simplicity
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ──────────────────────────────────────
#  Security Group — EC2
# ──────────────────────────────────────

resource "aws_security_group" "ec2_sg" {
  name        = "expense-tracker-ec2-sg"
  description = "Allow SSH, HTTP, and app port for EC2"
  vpc_id      = data.aws_vpc.default.id

  # SSH access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP access
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Django dev server / Gunicorn
  ingress {
    description = "App Port"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "expense-tracker-ec2-sg"
    Project = "DailyExpenseTracker"
  }
}

# ──────────────────────────────────────
#  Security Group — RDS
# ──────────────────────────────────────

resource "aws_security_group" "rds_sg" {
  name        = "expense-tracker-rds-sg"
  description = "Allow PostgreSQL access from EC2 only"
  vpc_id      = data.aws_vpc.default.id

  # PostgreSQL from EC2 security group
  ingress {
    description     = "PostgreSQL from EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "expense-tracker-rds-sg"
    Project = "DailyExpenseTracker"
  }
}

# ──────────────────────────────────────
#  DB Subnet Group
# ──────────────────────────────────────

resource "aws_db_subnet_group" "expense_tracker" {
  name       = "expense-tracker-db-subnet"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name    = "expense-tracker-db-subnet"
    Project = "DailyExpenseTracker"
  }
}

# ──────────────────────────────────────
#  RDS PostgreSQL Instance
# ──────────────────────────────────────

resource "aws_db_instance" "expense_tracker_db" {
  identifier     = "expense-tracker-db"
  engine         = "postgres"
  engine_version = "15"
  instance_class = var.db_instance_class

  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.expense_tracker.name

  publicly_accessible = false
  skip_final_snapshot  = true
  multi_az             = false

  tags = {
    Name    = "expense-tracker-db"
    Project = "DailyExpenseTracker"
  }
}

# ──────────────────────────────────────
#  EC2 Instance
# ──────────────────────────────────────

resource "aws_instance" "expense_tracker_ec2" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]

  # Bootstrap script to set up the application
  user_data = templatefile("${path.module}/../deploy/setup.sh", {
    db_host     = aws_db_instance.expense_tracker_db.address
    db_name     = var.db_name
    db_user     = var.db_username
    db_password = var.db_password
  })

  tags = {
    Name    = "expense-tracker-ec2"
    Project = "DailyExpenseTracker"
  }
}
