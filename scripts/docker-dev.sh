#!/bin/bash

case "$1" in
  start)
    echo "🚀 Starting containers..."
    docker-compose up -d
    ;;
  stop)
    echo "🛑 Stopping containers..."
    docker-compose down
    ;;
  restart)
    echo "🔄 Restarting containers..."
    docker-compose restart
    ;;
  logs)
    docker-compose logs -f $2
    ;;
  shell-backend)
    docker-compose exec backend bash
    ;;
  shell-frontend)
    docker-compose exec frontend sh
    ;;
  migrate)
    echo "🗃️  Running migrations..."
    docker-compose exec backend python manage.py migrate
    ;;
  createsuperuser)
    docker-compose exec backend python manage.py createsuperuser
    ;;
  rebuild)
    echo "🔨 Rebuilding and starting..."
    docker-compose up --build -d
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|logs|shell-backend|shell-frontend|migrate|createsuperuser|rebuild}"
    exit 1
esac