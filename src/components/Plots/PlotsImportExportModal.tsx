import React, { useState, useRef } from 'react';
import { Plot } from '../../types/index.ts';
import {
  exportPlotsToExcel,
  exportPlotsToCsv,
  downloadPlotsTemplateExcel,
  parsePlotsFromFile,
  ParsedPlotResult,
} from '../../utils/plotExcelUtils';
import {
  FileSpreadsheet,
  Download,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Table,
  HelpCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface PlotsImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plots: Plot[];
  onImportPlots: (importedPlots: Plot[]) => void;
}

export const PlotsImportExportModal: React.FC<PlotsImportExportModalProps> = ({
  isOpen,
  onClose,
  plots,
  onImportPlots,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedPlotResult | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setIsLoading(true);
    setSelectedFileName(file.name);
    setImportSuccessMessage(null);
    try {
      const result = await parsePlotsFromFile(file, plots);
      setParseResult(result);
    } catch (err: any) {
      setParseResult({
        plots: [],
        newCount: 0,
        updatedCount: 0,
        errors: [`Ошибка чтения файла: ${err.message || 'Не удалось распознать формат Excel/CSV'}`],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileProcess(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileProcess(file);
    }
  };

  const handleApplyImport = () => {
    if (!parseResult || parseResult.plots.length === 0) return;
    onImportPlots(parseResult.plots);
    setImportSuccessMessage(
      `Успешно импортировано ${parseResult.plots.length} участков (${parseResult.newCount} новых, ${parseResult.updatedCount} обновлено)!`
    );
    setParseResult(null);
    setSelectedFileName(null);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Экспорт и импорт базы участков (Excel / CSV)
              </h3>
              <p className="text-xs text-slate-500">
                Обмен реестром земельных участков, собственников и коммуникаций ДТСН «Пенсионер»
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

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Экспорт базы в файл</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Импорт из Excel / CSV</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Готов к выгрузке реестр из {plots.length} участков</span>
                </div>
                <p className="text-emerald-800 leading-relaxed text-[11px]">
                  Файл экспорта включает полную информацию: кадастровые номера НСПД, ФИО собственников, контакты, площадь, режимы проживания, очередность уборки снега, договоры, статусы и номера счетчиков зимней воды, электроэнергии и газа.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Excel Export */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      <span>Таблица Microsoft Excel (.xlsx)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Удобный структурированный формат с автоподбором ширины колонок и русскоязычными заголовками.
                    </p>
                  </div>
                  <button
                    onClick={() => exportPlotsToExcel(plots)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Скачать .XLSX файл</span>
                  </button>
                </div>

                {/* CSV Export */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <FileText className="w-5 h-5 text-sky-600" />
                      <span>Текстовый CSV файл (.csv)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Универсальный формат (разделитель «;», кодировка UTF-8 с BOM для корректного открытия в Excel).
                    </p>
                  </div>
                  <button
                    onClick={() => exportPlotsToCsv(plots)}
                    className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Скачать .CSV файл</span>
                  </button>
                </div>
              </div>

              {/* Data Preview Summary */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                  <Table className="w-4 h-4 text-slate-500" />
                  Состав выгружаемых полей (21 колонка):
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Номер участка</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Кадастровый номер</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Улица</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">ФИО Собственника</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Телефон</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Площадь</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Проживание</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Очередь снега</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Зимняя вода & Договор</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Счетчики воды & Пломбы</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Электроэнергия & Фазы</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Газоснабжение</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Координаты центра</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              {/* Template Download Prompt */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    Нужен готовый образец для заполнения?
                  </span>
                  <p className="text-[11px] text-amber-800">
                    Скачайте предзаполненный шаблон со всеми нужными заголовками колонок.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadPlotsTemplateExcel}
                  className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-amber-700" />
                  <span>Скачать шаблон .XLSX</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {selectedFileName ? selectedFileName : 'Нажмите или перетащите файл Excel (.xlsx, .xls) или CSV'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Поддерживаются русские и английские заголовки колонок
                </p>
              </div>

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-slate-600">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Чтение и валидация файла...</span>
                </div>
              )}

              {/* Success Notification */}
              {importSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2 font-bold animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSuccessMessage}</span>
                </div>
              )}

              {/* Parsing Results / Preview */}
              {parseResult && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Status Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 text-white rounded-xl text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold">Распознано строк: {parseResult.plots.length}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        +{parseResult.newCount} новых
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        ~{parseResult.updatedCount} обновлений
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyImport}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <span>Применить импорт</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Errors if any */}
                  {parseResult.errors.length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1 text-rose-900">
                      <div className="font-bold flex items-center gap-1.5 text-rose-800">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Предупреждения валидации ({parseResult.errors.length}):</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-rose-700">
                        {parseResult.errors.slice(0, 5).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                        {parseResult.errors.length > 5 && (
                          <li>... и еще {parseResult.errors.length - 5} предупреждений</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Preview Table of first 6 items */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="p-2.5 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center justify-between">
                      <span>Предварительный просмотр данных (первые {Math.min(parseResult.plots.length, 6)} из {parseResult.plots.length})</span>
                      <span className="text-[10px] text-slate-500 font-normal">Проверьте перед сохранением</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[11px]">
                            <th className="p-2">№</th>
                            <th className="p-2">Кадастровый №</th>
                            <th className="p-2">Собственник</th>
                            <th className="p-2">Улица</th>
                            <th className="p-2">Площадь</th>
                            <th className="p-2">Зимняя вода</th>
                            <th className="p-2">Электро</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          {parseResult.plots.slice(0, 6).map((plot) => (
                            <tr key={plot.number} className="hover:bg-slate-50/80">
                              <td className="p-2 font-bold font-mono text-slate-900">№ {plot.number}</td>
                              <td className="p-2 font-mono text-slate-600">{plot.cadastralNumber}</td>
                              <td className="p-2 font-semibold text-slate-800">{plot.ownerName}</td>
                              <td className="p-2 text-slate-600">{plot.street}</td>
                              <td className="p-2 text-slate-600">{plot.areaSqm} м²</td>
                              <td className="p-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  plot.utilities?.winterWater?.connected
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {plot.utilities?.winterWater?.connected ? 'Подключен' : 'Не подкл.'}
                                </span>
                              </td>
                              <td className="p-2 text-slate-600 font-mono">
                                {plot.utilities?.electricity?.phases}ф., {plot.utilities?.electricity?.allocatedPowerKw}кВт
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
