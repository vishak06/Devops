#!/bin/bash
# ============================================================
# Daily Expense Tracker — EC2 Bootstrap Script
# This script runs on first boot via EC2 user_data
# ============================================================

set -e

# Log output
exec > /var/log/expense-tracker-setup.log 2>&1
echo "=== Starting Expense Tracker Setup ==="

# Update system
yum update -y

# Install Python 3, pip, git, PostgreSQL client
yum install -y python3 python3-pip git postgresql

# Create app directory
APP_DIR="/home/ec2-user/expense-tracker"
mkdir -p $APP_DIR

# Clone repository (replace with your actual repo URL)
# git clone https://github.com/your-username/DevopsProject.git $APP_DIR
# For now, we'll assume code is manually deployed or cloned

# Set up virtual environment
cd $APP_DIR/backend
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Set environment variables for Django
export DB_HOST="${db_host}"
export DB_NAME="${db_name}"
export DB_USER="${db_user}"
export DB_PASSWORD="${db_password}"
export DJANGO_DEBUG="False"
export DJANGO_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
export DJANGO_ALLOWED_HOSTS="*"

# Create .env file for persistence
cat > $APP_DIR/backend/.env << EOF
DB_HOST=${db_host}
DB_NAME=${db_name}
DB_USER=${db_user}
DB_PASSWORD=${db_password}
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
DJANGO_ALLOWED_HOSTS=*
EOF

# Run migrations
python manage.py migrate

# Start Gunicorn (production server)
gunicorn expense_tracker.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --daemon \
    --access-logfile /var/log/gunicorn-access.log \
    --error-logfile /var/log/gunicorn-error.log

echo "=== Expense Tracker Setup Complete ==="
echo "App running at http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000"
