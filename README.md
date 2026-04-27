# Daily Expense Tracker 💰

A full-stack web application to track daily income and expenses, built with **Django** (backend), **HTML/CSS/JavaScript** (frontend), and deployable on **AWS** using **Terraform**.

---

## 📁 Project Structure

```
DevopsProject/
├── backend/                     # Django backend
│   ├── expense_tracker/         # Django project settings
│   │   ├── settings.py          # Database & app configuration
│   │   ├── urls.py              # Root URL routing
│   │   └── wsgi.py              # WSGI entry point
│   ├── tracker/                 # Django app
│   │   ├── models.py            # Transaction model
│   │   ├── views.py             # API views
│   │   └── urls.py              # API URL patterns
│   ├── manage.py
│   └── requirements.txt
├── frontend/                    # Frontend UI
│   ├── index.html               # Main page
│   ├── style.css                # Styling (dark theme)
│   └── app.js                   # Fetch API logic
├── terraform/                   # AWS Infrastructure as Code
│   ├── main.tf                  # EC2, RDS, Security Groups
│   ├── variables.tf             # Input variables
│   ├── outputs.tf               # Output values
│   └── terraform.tfvars.example # Example variable values
├── deploy/
│   └── setup.sh                 # EC2 bootstrap script
├── .gitignore
└── README.md
```

---

## 🚀 Features

- Add **income** and **expense** transactions
- Each transaction has: amount, type, category, date, description
- View **total balance** (income - expense) in real-time
- **Filter** transactions by category
- **Transaction history** table with sorting
- Modern **dark theme** with glassmorphism UI
- **REST API** backend
- **Terraform** scripts for AWS deployment

---

## 🔧 API Endpoints

| Method | Endpoint               | Description                              |
| ------ | ---------------------- | ---------------------------------------- |
| POST   | `/api/add-transaction/`| Add a new transaction                    |
| GET    | `/api/transactions/`   | List all transactions (?category=filter) |
| GET    | `/api/balance/`        | Get total income, expense, and balance   |

---

## 🖥️ Run Locally (Step-by-Step)

### Prerequisites
- Python 3.8+
- pip
- Git

### Steps

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd DevopsProject
```

**2. Create a virtual environment**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Run database migrations**
```bash
python manage.py migrate
```

**5. Start the development server**
```bash
python manage.py runserver
```

**6. Open in browser**
```
http://localhost:8000
```

> The app uses **SQLite** by default for local development — no database setup needed!

---

## ☁️ Deploy on AWS (Step-by-Step)

### Prerequisites
- AWS account with access keys configured
- Terraform installed
- An AWS key pair created in your region

### Steps

**1. Configure Terraform variables**
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:
```hcl
aws_region    = "us-east-1"
key_name      = "your-key-pair-name"
db_password   = "YourStrongPassword123!"
```

**2. Initialize Terraform**
```bash
terraform init
```

**3. Preview the infrastructure**
```bash
terraform plan
```

**4. Deploy**
```bash
terraform apply
```

Type `yes` when prompted. Terraform will create:
- EC2 instance (t2.micro)
- RDS PostgreSQL instance (db.t3.micro)
- Security groups with proper access rules

**5. Access the application**

After deployment, Terraform outputs the app URL:
```
app_url = "http://<EC2-PUBLIC-IP>:8000"
```

**6. SSH into EC2 (if needed)**
```bash
ssh -i your-key.pem ec2-user@<EC2-PUBLIC-IP>
```

**7. Tear down (destroy resources)**
```bash
terraform destroy
```

---

## 🌿 Git Branching Strategy

| Branch     | Purpose                          |
| ---------- | -------------------------------- |
| `main`     | Complete, production-ready code  |
| `backend`  | Django backend development       |
| `frontend` | Frontend UI development          |

### Workflow
```bash
# Backend development
git checkout -b backend
# ... make backend changes ...
git add . && git commit -m "feat: add Django backend with REST API"
git checkout main && git merge backend

# Frontend development
git checkout -b frontend
# ... make frontend changes ...
git add . && git commit -m "feat: add frontend with dark theme UI"
git checkout main && git merge frontend
```

---

## 🗂️ Transaction Categories

| Category      | Emoji |
| ------------- | ----- |
| Food          | 🍔    |
| Travel        | ✈️    |
| Bills         | 🧾    |
| Salary        | 💼    |
| Entertainment | 🎮    |
| Shopping      | 🛒    |
| Health        | 🏥    |
| Other         | 📦    |

---

## 📝 Environment Variables (Production)

| Variable              | Description                    | Default             |
| --------------------- | ------------------------------ | ------------------- |
| `DB_HOST`             | PostgreSQL host                | (SQLite if not set) |
| `DB_NAME`             | Database name                  | expense_tracker_db  |
| `DB_USER`             | Database username              | admin               |
| `DB_PASSWORD`         | Database password              | —                   |
| `DB_PORT`             | Database port                  | 5432                |
| `DJANGO_DEBUG`        | Debug mode                     | True                |
| `DJANGO_SECRET_KEY`   | Django secret key              | (dev key)           |
| `DJANGO_ALLOWED_HOSTS`| Comma-separated allowed hosts  | *                   |

---

## 📄 License

This project is for educational purposes. Feel free to use and modify.
