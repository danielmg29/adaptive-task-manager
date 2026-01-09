# Adaptive Task Manager

A modern task management system built with the **Adaptive Convergence** philosophy.

## 🚀 Live Demo

- **Frontend**: [https://adaptive-task-manager-tan.vercel.app](https://adaptive-task-manager-tan.vercel.app)
- **Backend API**: [https://adaptive-task-manager-production.up.railway.app/api/schema/Task/](https://adaptive-task-manager-production.up.railway.app/api/schema/Task/)

## ✨ Features

- ✅ Schema-driven UI generation (add model field → UI updates automatically)
- ✅ Zero-redundancy CRUD operations
- ✅ React Query caching with optimistic updates
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ 96% backend test coverage
- ✅ 89% frontend test coverage

## 🛠️ Tech Stack

**Backend:**
- Django 5.1 + Django REST Framework
- PostgreSQL (Neon)
- Functional programming patterns
- pytest (testing)

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- React Query (TanStack Query)
- shadcn/ui + Tailwind CSS
- Jest + React Testing Library

**Deployment:**
- Railway (backend)
- Vercel (frontend)
- GitHub Actions (CI/CD)

## 🏗️ Architecture

This project demonstrates **Adaptive Convergence**: the backend schema is the single source of truth, and the frontend adapts automatically.

**Traditional Approach:** 100 models = 300+ files (serializers, views, forms)  
**Adaptive Convergence:** 100 models = 100 model files + reusable infrastructure

## 📦 Local Development
```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

## 🧪 Testing
```bash
# Backend tests (pytest)
cd backend
pytest --cov

# Frontend tests (Jest)
cd frontend
npm test
```

## 📄 License

MIT License - feel free to use this for learning!

## 🙏 Acknowledgments

Built following Adaptive Convergence principles for schema-driven development.