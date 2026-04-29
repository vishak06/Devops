# 💰 FinanceFlow — Personal Finance Tracker

A full-stack, production-ready personal finance tracker with a premium SaaS-quality UI, built with **React + Vite** (frontend) and **Django REST Framework** (backend).

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Django](https://img.shields.io/badge/Django-5.2-green?logo=django)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)
![Terraform](https://img.shields.io/badge/Terraform-AWS-purple?logo=terraform)

---

## ✨ Features

- **Dashboard** — Balance overview, monthly charts, category breakdown, budget alerts
- **Transactions** — Full CRUD with search, filters, pagination, CSV export
- **Analytics** — Monthly trends, category pie chart, spending insights
- **Authentication** — JWT-based login/signup with token refresh
- **Dark Mode** — Toggle with system preference detection
- **Budget Tracking** — Per-category monthly limits with overspend alerts
- **Responsive** — Mobile-first design with collapsible sidebar
- **Export** — Download all data as CSV

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Recharts, Axios, Lucide Icons |
| Backend | Django 5.2, Django REST Framework, SimpleJWT, django-filter |
| Database | PostgreSQL 16 (SQLite fallback for local dev) |
| Containerization | Docker, Docker Compose |
| Infrastructure | Terraform (AWS ECS Fargate, ALB, RDS, VPC) |
| CI/CD | GitHub Actions |

---

## 📂 Project Structure

```
DevopsProject/
├── finance_tracker/          # Django backend
│   ├── accounts/             # Auth app (register, login, JWT)
│   ├── expenses/             # Core app (expenses, budgets, analytics)
│   ├── finance_tracker/      # Django project settings
│   ├── requirements.txt
│   ├── Dockerfile
│   └── manage.py
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Dashboard, Transactions, Analytics, Auth
│   │   ├── context/          # AuthContext, ThemeContext
│   │   └── services/         # API layer (Axios)
│   ├── Dockerfile
│   └── nginx.conf
├── terraform/                # AWS infrastructure
├── .github/workflows/        # CI/CD pipeline
├── docker-compose.yml
└── .env.example
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+
- (Optional) PostgreSQL 16 or Docker

### 1. Backend Setup

```bash
cd finance_tracker

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (uses SQLite by default)
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:5173` (auto-proxies `/api` to backend)

---

## 🐳 Docker Setup

```bash
# Build and start all services
docker-compose up --build

# Access the app
# Frontend: http://localhost
# Backend API: http://localhost:8000
# PostgreSQL: localhost:5432
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login (returns JWT) |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/auth/profile/` | Get user profile |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses/` | List expenses (paginated, filterable) |
| POST | `/api/expenses/` | Create expense |
| PUT | `/api/expenses/:id/` | Update expense |
| DELETE | `/api/expenses/:id/` | Delete expense |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets/` | List budgets |
| POST | `/api/budgets/` | Create budget |
| PUT | `/api/budgets/:id/` | Update budget |
| DELETE | `/api/budgets/:id/` | Delete budget |

### Analytics & Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/` | Dashboard summary |
| GET | `/api/analytics/monthly/` | Monthly aggregates |
| GET | `/api/analytics/category/` | Category breakdown |
| GET | `/api/export/csv/` | Export as CSV |

---

## ☁️ AWS Deployment

### 1. Push Images to ECR

```bash
# Create ECR repositories
aws ecr create-repository --repository-name finance-tracker-backend
aws ecr create-repository --repository-name finance-tracker-frontend

# Login, build, tag, push (see CI/CD workflow for automation)
```

### 2. Deploy Infrastructure with Terraform

```bash
cd terraform

terraform init
terraform plan -var="db_password=YOUR_PASSWORD" -var="django_secret_key=YOUR_KEY" \
  -var="backend_image=YOUR_ECR_URI/finance-tracker-backend:latest" \
  -var="frontend_image=YOUR_ECR_URI/finance-tracker-frontend:latest"
terraform apply
```

### 3. CI/CD (GitHub Actions)

Set these repository secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Push to `main` triggers automatic build → push → deploy.

---

## 🔐 Environment Variables

See `.env.example` for all available variables.

| Variable | Description | Default |
|----------|-------------|---------|
| `DJANGO_SECRET_KEY` | Django secret key | (insecure default) |
| `DJANGO_DEBUG` | Debug mode | `True` |
| `DB_NAME` | PostgreSQL database name | (empty = SQLite) |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `http://localhost:5173` |

---

## 📄 License

MIT
