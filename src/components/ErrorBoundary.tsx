import React, { Component, ErrorInfo, ReactNode } from 'react';
import { clearAllDtsnStorage } from '../utils/storage';
import { RefreshCw, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    clearAllDtsnStorage();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Система ДТСН «Пенсионер» временно недоступна
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Произошла ошибка при загрузке данных или отображении карты.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-rose-300 overflow-x-auto max-h-36">
                {this.state.error.name}: {this.state.error.message}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-all shadow"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Повторить попытку</span>
                </button>
                <button
                  onClick={this.handleResetAndReload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-all shadow"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Очистить кэш и перезагрузить</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                «Очистить кэш» восстановит базовые кадастровые границы и снимет поврежденные локальные данные браузера.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
