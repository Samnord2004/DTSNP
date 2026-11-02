@echo off
chcp 65001 > nul
title ДТСН «Пенсионер» GIS — Запуск локального сервера

echo ================================================================
echo    ДТСН «Пенсионер» GIS (Геоинформационная система)
echo    Автоматический запуск под Windows (10 / 11)
echo ================================================================
echo.

:: 1. Проверка наличия Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ОШИБКА] Node.js не найден на вашем компьютере!
    echo Пожалуйста, установите Node.js (версия 18, 20 или 22):
    echo Скачать: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Проверка и установка зависимостей
if not exist "node_modules\" (
    echo [ИНФО] Папка node_modules не найдена. Устанавливаем зависимости...
    echo Это займет около 1-2 минут при первом запуске.
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ОШИБКА] Не удалось установить npm зависимости.
        pause
        exit /b 1
    )
)

:: 3. Проверка и сборка проекта
if not exist "dist\index.html" (
    echo [ИНФО] Сборка проекта dist\ не найдена. Компилируем приложение...
    call npm run build
    if %ERRORLEVEL% neq 0 (
        echo [ОШИБКА] Ошибка при сборке проекта.
        pause
        exit /b 1
    )
)

echo.
echo Выберите режим запуска:
echo  [1] Стандартный локальный запуск (http://localhost:3000)
echo  [2] Запуск + Бесплатный туннель Cloudflare (доступ из интернета без белого IP)
echo  [3] Запуск + Localtunnel (через npx, без установки дополнительных программ)
echo  [4] Пересобрать приложение (npm run build) и запустить
echo.
set /p choice="Введите номер (1-4, по умолчанию 1): "
if "%choice%"=="" set choice=1

if "%choice%"=="4" (
    echo [ИНФО] Пересборка проекта...
    call npm run build
    set choice=1
)

if "%choice%"=="2" (
    echo.
    echo ================================================================
    echo Запуск сервера и Cloudflare Tunnel...
    echo ================================================================
    start "DTSN GIS Server" node server.js
    timeout /t 3 /nobreak > nul
    start http://localhost:3000
    echo Запускаем туннель Cloudflare. Ссылка с https:// появится ниже:
    where cloudflared >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        cloudflared tunnel --url http://localhost:3000
    ) else (
        echo [ИНФО] cloudflared не установлен глобально. Запускаем через npx cloudflared...
        npx cloudflared tunnel --url http://localhost:3000
    )
    pause
    exit /b 0
)

if "%choice%"=="3" (
    echo.
    echo ================================================================
    echo Запуск сервера и Localtunnel...
    echo ================================================================
    start "DTSN GIS Server" node server.js
    timeout /t 3 /nobreak > nul
    start http://localhost:3000
    echo Запускаем Localtunnel:
    call npx localtunnel --port 3000
    pause
    exit /b 0
)

:: Стандартный запуск (Режим 1)
echo.
echo [ИНФО] Запуск автономного сервера...
start http://localhost:3000
node server.js
pause
