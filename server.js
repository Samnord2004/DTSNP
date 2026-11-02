/**
 * ДТСН «Пенсионер» GIS — Локальный автономный production-сервер
 * Поддерживает запуск на Windows, macOS и Linux.
 * Полная совместимость с внешними туннелями: Cloudflare Tunnel, ngrok, localtunnel, Tailscale.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Разрешаем работу через обратные прокси и туннели (Cloudflare, ngrok, localtunnel)
app.set('trust proxy', true);

// CORS заголовки для туннелей
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '20mb' }));

// Healthcheck endpoint (используется туннелями и системами мониторинга)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ДТСН «Пенсионер» GIS',
    version: '1.0.0',
    port: PORT,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Проверяем наличие собранного билда dist/
const distPath = path.resolve(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.warn('\n⚠️  Внимание: Папка dist/index.html не найдена!');
  console.warn('   Для сборки запустите: npm run build\n');
}

// Раздача статических файлов из dist с правильным кэшированием
app.use(
  express.static(distPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      // index.html не кэшируем для актуальности интерфейса
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  })
);

// SPA fallback: любой неизвестный маршрут возвращает index.html
app.get('*', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(indexPath);
  } else {
    res.status(503).send(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <title>ДТСН «Пенсионер» GIS — Сборка не найдена</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #0f172a; color: #f8fafc; text-align: center; }
          .card { max-width: 600px; margin: 60px auto; background: #1e293b; padding: 30px; border-radius: 16px; border: 1px solid #334155; }
          h1 { color: #38bdf8; font-size: 22px; }
          code { background: #0284c7; color: #fff; padding: 4px 10px; border-radius: 6px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>ДТСН «Пенсионер» — Требуется сборка</h1>
          <p>Скомпилированные файлы приложения пока не найдены в папке <code>dist/</code>.</p>
          <p style="margin-top: 20px;">В терминале выполните команду сборки:</p>
          <p style="margin: 15px 0;"><code>npm run build</code></p>
          <p style="color: #94a3b8; font-size: 13px;">После завершения сборки обновите эту страницу.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// Получаем локальные IP-адреса компьютера для удобства
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

app.listen(PORT, HOST, () => {
  const ips = getLocalIpAddresses();
  console.log('\n================================================================');
  console.log('   🌳 ДТСН «Пенсионер» GIS — Локальный сервер запущен!');
  console.log('================================================================');
  console.log(` • Локальный доступ:     http://localhost:${PORT}`);
  console.log(` • Сеть (0.0.0.0):       http://127.0.0.1:${PORT}`);
  ips.forEach((ip) => {
    console.log(` • Доступ по Wi-Fi/LAN:  http://${ip}:${PORT}`);
  });
  console.log('----------------------------------------------------------------');
  console.log(' 🌐 ЗАПУСК ЧЕРЕЗ ТУННЕЛЬ ДЛЯ УДАЛЕННОГО ДОСТУПА:');
  console.log('   Вариант 1 (Cloudflare — бесплатно, без регистрации):');
  console.log(`     cloudflared tunnel --url http://localhost:${PORT}`);
  console.log('   Вариант 2 (Localtunnel — через npx, установка не требуется):');
  console.log(`     npx localtunnel --port ${PORT}`);
  console.log('   Вариант 3 (ngrok):');
  console.log(`     ngrok http ${PORT}`);
  console.log('================================================================\n');
});
