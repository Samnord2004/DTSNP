#!/bin/bash
# =====================================================================
# ДТСН «Пенсионер» GIS — Скрипт автоматического запуска для macOS & Linux
# =====================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}================================================================${NC}"
echo -e "${GREEN}   ДТСН «Пенсионер» GIS (Геоинформационная система)${NC}"
echo -e "${BLUE}   Автоматический запуск под macOS & Linux${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""

# 1. Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ОШИБКА] Node.js не найден на вашем компьютере!${NC}"
    echo "Пожалуйста, установите Node.js (v18, v20 или v22):"
    echo " • Через официальный сайт: https://nodejs.org/"
    echo " • Либо через Homebrew: brew install node"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}[OK]${NC} Обнаружен Node.js: ${NODE_VERSION}"

# 2. Проверка и установка зависимостей
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[ИНФО] Папка node_modules не найдена. Устанавливаем зависимости...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ОШИБКА] Сбой при установке зависимостей npm.${NC}"
        exit 1
    fi
fi

# 3. Проверка и сборка проекта
if [ ! -f "dist/index.html" ]; then
    echo -e "${YELLOW}[ИНФО] Сборка проекта dist/ не найдена. Компилируем приложение...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ОШИБКА] Сбой при сборке проекта.${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}Выберите режим запуска:${NC}"
echo " [1] Стандартный локальный запуск (http://localhost:3000)"
echo " [2] Запуск + Бесплатный туннель Cloudflare (ссылка с https:// для любого устройства)"
echo " [3] Запуск + Localtunnel (через npx, без установки дополнительных утилит)"
echo " [4] Пересобрать приложение (npm run build) и запустить"
echo ""
read -p "Введите номер (1-4, по умолчанию 1): " choice
choice=${choice:-1}

# Функция корректного завершения дочерних процессов
cleanup() {
    echo ""
    echo -e "${YELLOW}Остановка серверов и туннелей...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

if [ "$choice" == "4" ]; then
    echo -e "${YELLOW}[ИНФО] Пересборка проекта...${NC}"
    npm run build
    choice=1
fi

if [ "$choice" == "2" ]; then
    echo ""
    echo -e "${BLUE}================================================================${NC}"
    echo -e "${GREEN}Запуск локального сервера в фоновом режиме...${NC}"
    node server.js &
    SERVER_PID=$!
    sleep 2

    # Открытие браузера на macOS
    if command -v open &> /dev/null; then
        open http://localhost:3000
    elif command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3000
    fi

    echo -e "${GREEN}Запуск туннеля Cloudflare. Публичная ссылка с https:// появится ниже:${NC}"
    echo -e "${BLUE}================================================================${NC}"
    if command -v cloudflared &> /dev/null; then
        cloudflared tunnel --url http://localhost:3000
    else
        echo -e "${YELLOW}[ИНФО] cloudflared не установлен глобально. Запуск через npx...${NC}"
        npx cloudflared tunnel --url http://localhost:3000
    fi
    wait $SERVER_PID
    exit 0
fi

if [ "$choice" == "3" ]; then
    echo ""
    echo -e "${BLUE}================================================================${NC}"
    echo -e "${GREEN}Запуск локального сервера в фоновом режиме...${NC}"
    node server.js &
    SERVER_PID=$!
    sleep 2

    if command -v open &> /dev/null; then
        open http://localhost:3000
    elif command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3000
    fi

    echo -e "${GREEN}Запуск Localtunnel...${NC}"
    npx localtunnel --port 3000
    wait $SERVER_PID
    exit 0
fi

# Режим 1: Обычный локальный запуск
echo ""
echo -e "${GREEN}[ИНФО] Запуск автономного сервера...${NC}"
sleep 1
if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
fi

node server.js
