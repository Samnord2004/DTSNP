import React, { useState } from 'react';
import {
  Monitor,
  Apple,
  Terminal,
  Globe,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface LocalRunModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalRunModal: React.FC<LocalRunModalProps> = ({ isOpen, onClose }) => {
  const [activeOs, setActiveOs] = useState<'windows' | 'macos'>('windows');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-100 text-sky-800 border border-sky-200">
              <Monitor className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Запуск на локальном компьютере (Windows & macOS) и через туннель
              </h3>
              <p className="text-xs text-slate-500">
                Автономный запуск сервера с доступом по локальной сети и через защищенный HTTPS-туннель
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OS Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
          <button
            onClick={() => setActiveOs('windows')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeOs === 'windows'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Windows (10 / 11)</span>
          </button>
          <button
            onClick={() => setActiveOs('macos')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeOs === 'macos'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>macOS & Linux</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Quick Start Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 space-y-2">
            <span className="font-bold text-sky-950 flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              Готовые скрипты запуска уже встроены в проект
            </span>
            <p className="text-sky-900 leading-relaxed text-[11px]">
              Вам не нужно настраивать сложные конфигурации: проект содержит готовые файлы <b>`start-windows.bat`</b> для Windows и <b>`start-macos.sh`</b> для Mac. Они автоматически проверят Node.js, установят пакеты, соберут билд и запустят приложение на порту 3000.
            </p>
          </div>

          {/* Windows Instructions */}
          {activeOs === 'windows' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                  Запуск в 1 клик через файл .bat
                </h4>
                <p className="text-slate-600 text-[11px] pl-7">
                  В корневой папке проекта найдите и дважды кликните по файлу:
                </p>
                <div className="pl-7">
                  <div className="p-2.5 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl flex items-center justify-between border border-slate-800">
                    <span>start-windows.bat</span>
                    <button
                      onClick={() => copyToClipboard('start-windows.bat', 'win-file')}
                      className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                      title="Скопировать"
                    >
                      {copiedKey === 'win-file' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                  Запуск через командную строку (CMD или PowerShell)
                </h4>
                <div className="pl-7 space-y-2">
                  <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1 font-mono text-[11px] border border-slate-800">
                    <div className="text-slate-400"># Установка зависимостей и сборка (в первый раз):</div>
                    <div className="text-emerald-400">npm install && npm run build</div>
                    <div className="text-slate-400 pt-1"># Запуск production-сервера:</div>
                    <div className="text-sky-300">npm start</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* macOS Instructions */}
          {activeOs === 'macos' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                  Запуск через терминал macOS / Linux
                </h4>
                <p className="text-slate-600 text-[11px] pl-7">
                  Откройте программу «Терминал», перейдите в папку проекта и выполните команду:
                </p>
                <div className="pl-7">
                  <div className="p-2.5 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl flex items-center justify-between border border-slate-800">
                    <span>./start-macos.sh</span>
                    <button
                      onClick={() => copyToClipboard('./start-macos.sh', 'mac-file')}
                      className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                      title="Скопировать"
                    >
                      {copiedKey === 'mac-file' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                  Команды сборки и запуска в терминале
                </h4>
                <div className="pl-7 space-y-2">
                  <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1 font-mono text-[11px] border border-slate-800">
                    <div className="text-slate-400"># Установка и сборка проекта:</div>
                    <div className="text-emerald-400">npm install && npm run build</div>
                    <div className="text-slate-400 pt-1"># Автономный сервер (Node.js):</div>
                    <div className="text-sky-300">npm start</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TUNNEL SECTION */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Публикация через туннель (доступ через интернет без белого IP)
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                HTTPS защита
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Сервер предварительно настроен: хост <code>0.0.0.0</code>, разрешены любые домены (<code>allowedHosts: true</code>), включена поддержка прокси. Выберите любой удобный туннель:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option 1: Cloudflare Tunnel */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Cloudflare Tunnel (Рекомендуется)</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">Бесплатно</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Без регистрации и без настройки роутера. Выдаст постоянную защищенную ссылку https://...trycloudflare.com
                </p>
                <div className="p-2 bg-slate-900 text-emerald-300 font-mono text-[10px] rounded-lg flex items-center justify-between">
                  <span>npm run tunnel:cloudflare</span>
                  <button
                    onClick={() => copyToClipboard('npm run tunnel:cloudflare', 'cf-tunnel')}
                    className="text-slate-400 hover:text-white ml-1"
                  >
                    {copiedKey === 'cf-tunnel' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Option 2: Localtunnel */}
              <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Localtunnel (через npx)</span>
                  <span className="text-[10px] bg-sky-600 text-white px-1.5 py-0.5 rounded font-bold">Без установки</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Мгновенно создает временный адрес для демонстрации с любого браузера и мобильного телефона.
                </p>
                <div className="p-2 bg-slate-900 text-sky-300 font-mono text-[10px] rounded-lg flex items-center justify-between">
                  <span>npm run tunnel:localtunnel</span>
                  <button
                    onClick={() => copyToClipboard('npm run tunnel:localtunnel', 'lt-tunnel')}
                    className="text-slate-400 hover:text-white ml-1"
                  >
                    {copiedKey === 'lt-tunnel' ? <Check className="w-3 h-3 text-sky-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/60">
          <span className="text-[11px] text-slate-500">
            Подробная инструкция сохранена в файле: <b>ИНСТРУКЦИЯ_ЛОКАЛЬНЫЙ_ЗАПУСК_И_ТУННЕЛЬ.md</b>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
