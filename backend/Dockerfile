# WHAT: Dockerfile for Django backend
# WHY: Creates a containerized Python environment for Django

# Use official Python runtime as base image
FROM python:3.13-slim

# Set environment variables
# PYTHONDONTWRITEBYTECODE: Prevents Python from writing .pyc files
# PYTHONUNBUFFERED: Forces Python output to be sent straight to terminal
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
# Required for psycopg2 (PostgreSQL adapter)
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create directory for static files
RUN mkdir -p staticfiles

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD python manage.py migrate && \
    python manage.py runserver 0.0.0.0:8000