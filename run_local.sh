#!/bin/bash
# Local Development Orchestration Script for Stockway
# Starts all required services: Django, Celery, Redis, and Frontend

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Stockway Local Development Environment${NC}"
echo "=================================================="

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment variables if .env exists
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} Loading environment variables from .env"
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${YELLOW}⚠${NC} No .env file found, using system environment"
fi

# Trap to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill 0
    exit 0
}
trap cleanup SIGINT SIGTERM

# Check if Redis is running, start if not
check_redis() {
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Redis is running"
    else
        echo -e "${YELLOW}⚠${NC} Redis is not running"
        echo -e "${YELLOW}  Starting Redis in the background...${NC}"
        redis-server --daemonize yes --port 6379 > /dev/null 2>&1 || {
            echo -e "${RED}✗${NC} Failed to start Redis"
            echo "Please install Redis and ensure it's in your PATH:"
            echo "     Ubuntu/Debian: sudo apt-get install redis-server"
            echo "     macOS: brew install redis"
            echo "     Docker: docker run -d --name redis -p 6379:6379 redis:alpine"
            echo ""
            read -p "Continue without Redis? (Results backend will not work) [y/N]: " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
            return
        }
        sleep 2
        echo -e "${GREEN}✓${NC} Redis started"
    fi
}

# Check if RabbitMQ is running
check_rabbitmq() {
    if nc -z localhost 5672 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} RabbitMQ is running"
    else
        echo -e "${YELLOW}⚠${NC} RabbitMQ is not running on port 5672"
        echo -e "${YELLOW}  Please start RabbitMQ manually:${NC}"
        echo "     Ubuntu/Debian: sudo service rabbitmq-server start"
        echo "     macOS: brew services start rabbitmq"
        echo "     Docker: docker run -d --name rabbitmq -p 5672:5672 rabbitmq:3-management"
        echo ""
        echo "Or install RabbitMQ:"
        echo "     Ubuntu/Debian: sudo apt-get install rabbitmq-server"
        echo "     macOS: brew install rabbitmq"
        echo ""
        read -p "Continue without RabbitMQ? (Celery will not work) [y/N]: " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Start services
echo -e "\n${GREEN}Checking dependencies...${NC}"
check_redis
check_rabbitmq

echo -e "\n${GREEN}Starting backend services...${NC}"

# Start Django development server
echo -e "${GREEN}→${NC} Starting Django server on http://127.0.0.1:8000"
python manage.py runserver > logs/django_local.log 2>&1 &
DJANGO_PID=$!

# Wait for Django to start
sleep 3

# Start Celery worker
echo -e "${GREEN}→${NC} Starting Celery worker"
celery -A backend worker -l info > logs/celery_local.log 2>&1 &
CELERY_PID=$!

# Start Celery beat (if needed for scheduled tasks)
echo -e "${GREEN}→${NC} Starting Celery beat scheduler"
celery -A backend beat -l info > logs/celery_beat_local.log 2>&1 &
CELERY_BEAT_PID=$!

# Start frontend development server
echo -e "\n${GREEN}Starting frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC} Installing frontend dependencies..."
    npm install
fi
echo -e "${GREEN}→${NC} Starting Vite dev server on http://localhost:5173"
npm run dev > ../logs/frontend_local.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Display status
echo -e "\n${GREEN}=================================================="
echo -e "All services started successfully!${NC}"
echo ""
echo "Services running:"
echo "  • Django:    http://127.0.0.1:8000"
echo "  • Frontend:  http://localhost:5173"
echo "  • Redis:     127.0.0.1:6379"
echo "  • RabbitMQ:  127.0.0.1:5672"
echo ""
echo "Logs available in:"
echo "  • Django:    logs/django_local.log"
echo "  • Celery:    logs/celery_local.log"
echo "  • Celery Beat: logs/celery_beat_local.log"
echo "  • Frontend:  logs/frontend_local.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo "=================================================="

# Wait for all background processes
wait
