import * as XLSX from 'xlsx';
import { Plot, Coordinates, ResidencyType } from '../types/index.ts';

// Reference base coordinates for fallback
const LAT0 = 55.098612;
const LNG0 = 82.900919;

export interface ExportPlotRow {
  'Номер участка': number;
  'Кадастровый номер': string;
  'Улица': string;
  'ФИО Собственника': string;
  'Телефон': string;
  'Площадь (кв.м)': number;
  'Режим проживания': string;
  'Очередь уборки снега': number;
  'Зимний водопровод (статус)': string;
  'Договор зимней воды': string;
  'Номер ТУ': string;
  'Счетчик воды (№)': string;
  'Показания счетчика (м³)': number | string;
  'Номер пломбы': string;
  'Летний водопровод': string;
  'Электроэнергия (фаз)': number;
  'Выделенная мощность (кВт)': number;
  'Счетчик электричества': string;
  'Газоснабжение': string;
  'Широта центра': number;
  'Долгота центра': number;
}

export function formatPlotToExportRow(plot: Plot): ExportPlotRow {
  const isWinterConn = Boolean(plot.utilities?.winterWater?.connected);
  const winterStatus = isWinterConn
    ? 'Подключен'
    : plot.utilities?.winterWater?.status === 'tu_issued'
    ? 'ТУ выданы'
    : plot.utilities?.winterWater?.status === 'applied'
    ? 'Заявка'
    : 'Не подключен';

  const residencyLabel = plot.residencyType === 'permanent' ? 'Постоянное' : 'Периодическое';
  const summerLabel = plot.utilities?.summerWater ? 'Да' : 'Нет';
  const gasStatus = plot.utilities?.gas?.connected
    ? 'Подключен'
    : plot.utilities?.gas?.status === 'planned'
    ? 'В плане'
    : 'Не подключен';

  return {
    'Номер участка': plot.number,
    'Кадастровый номер': plot.cadastralNumber || `54:19:112001:${100 + plot.number}`,
    'Улица': plot.street || 'ул. Центральная',
    'ФИО Собственника': plot.ownerName || 'Собственник',
    'Телефон': plot.phone || '',
    'Площадь (кв.м)': plot.areaSqm || 800,
    'Режим проживания': residencyLabel,
    'Очередь уборки снега': plot.winterClearingPriority || (plot.residencyType === 'permanent' ? 1 : 2),
    'Зимний водопровод (статус)': winterStatus,
    'Договор зимней воды': plot.utilities?.winterWater?.contractNumber || '',
    'Номер ТУ': plot.utilities?.winterWater?.tuNumber || '',
    'Счетчик воды (№)': plot.utilities?.winterWater?.meterSerial || '',
    'Показания счетчика (м³)': plot.utilities?.winterWater?.meterLastReading ?? '',
    'Номер пломбы': plot.utilities?.winterWater?.sealNumber || '',
    'Летний водопровод': summerLabel,
    'Электроэнергия (фаз)': plot.utilities?.electricity?.phases ?? 1,
    'Выделенная мощность (кВт)': plot.utilities?.electricity?.allocatedPowerKw ?? 15,
    'Счетчик электричества': plot.utilities?.electricity?.meterSerial || '',
    'Газоснабжение': gasStatus,
    'Широта центра': Number(plot.coordinates?.lat?.toFixed(6) || LAT0),
    'Долгота центра': Number(plot.coordinates?.lng?.toFixed(6) || LNG0),
  };
}

/**
 * Export plots to Excel (.xlsx) file
 */
export function exportPlotsToExcel(plots: Plot[], customFileName?: string) {
  const rows: ExportPlotRow[] = (plots || [])
    .slice()
    .sort((a, b) => a.number - b.number)
    .map(formatPlotToExportRow);

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Номер участка
    { wch: 22 }, // Кадастровый номер
    { wch: 20 }, // Улица
    { wch: 28 }, // ФИО Собственника
    { wch: 18 }, // Телефон
    { wch: 16 }, // Площадь
    { wch: 18 }, // Режим проживания
    { wch: 20 }, // Очередь уборки снега
    { wch: 24 }, // Зимний водопровод
    { wch: 22 }, // Договор
    { wch: 18 }, // ТУ
    { wch: 22 }, // Счетчик воды
    { wch: 22 }, // Показания
    { wch: 16 }, // Пломба
    { wch: 18 }, // Летний водопровод
    { wch: 20 }, // Фаз
    { wch: 24 }, // Мощность
    { wch: 24 }, // Счетчик электричества
    { wch: 18 }, // Газ
    { wch: 16 }, // Широта
    { wch: 16 }, // Долгота
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Реестр участков ДТСН');

  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = customFileName || `Реестр_участков_ДТСН_Пенсионер_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}

/**
 * Export plots to CSV file with UTF-8 BOM (properly opens in Excel without mojibake)
 */
export function exportPlotsToCsv(plots: Plot[], customFileName?: string) {
  const rows: ExportPlotRow[] = (plots || [])
    .slice()
    .sort((a, b) => a.number - b.number)
    .map(formatPlotToExportRow);

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });

  // Add UTF-8 BOM so Excel on Windows recognizes Cyrillic correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', customFileName || `Реестр_участков_ДТСН_Пенсионер_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download an exemplary template Excel file
 */
export function downloadPlotsTemplateExcel() {
  const templateRows: ExportPlotRow[] = [
    {
      'Номер участка': 1,
      'Кадастровый номер': '54:19:112001:101',
      'Улица': 'ул. Центральная',
      'ФИО Собственника': 'Иванов Иван Иванович',
      'Телефон': '+7 (913) 123-45-67',
      'Площадь (кв.м)': 850,
      'Режим проживания': 'Постоянное',
      'Очередь уборки снега': 1,
      'Зимний водопровод (статус)': 'Подключен',
      'Договор зимней воды': 'ДЗВ-01/22',
      'Номер ТУ': 'ТУ-В-2022/01',
      'Счетчик воды (№)': 'СВК-15 № 12345',
      'Показания счетчика (м³)': 142.5,
      'Номер пломбы': 'РТ-10293',
      'Летний водопровод': 'Да',
      'Электроэнергия (фаз)': 3,
      'Выделенная мощность (кВт)': 15,
      'Счетчик электричества': 'Меркурий 230 № 8812',
      'Газоснабжение': 'Подключен',
      'Широта центра': 55.101812,
      'Долгота центра': 82.898619,
    },
    {
      'Номер участка': 2,
      'Кадастровый номер': '54:19:112001:102',
      'Улица': 'ул. Центральная',
      'ФИО Собственника': 'Петрова Анна Сергеевна',
      'Телефон': '+7 (913) 987-65-43',
      'Площадь (кв.м)': 750,
      'Режим проживания': 'Периодическое',
      'Очередь уборки снега': 2,
      'Зимний водопровод (статус)': 'Заявка',
      'Договор зимней воды': '',
      'Номер ТУ': '',
      'Счетчик воды (№)': '',
      'Показания счетчика (м³)': '',
      'Номер пломбы': '',
      'Летний водопровод': 'Да',
      'Электроэнергия (фаз)': 1,
      'Выделенная мощность (кВт)': 5,
      'Счетчик электричества': 'Нева 103 № 3411',
      'Газоснабжение': 'В плане',
      'Широта центра': 55.101412,
      'Долгота центра': 82.898819,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Шаблон для импорта');
  XLSX.writeFile(workbook, 'Шаблон_импорта_участков_ДТСН.xlsx');
}

export interface ParsedPlotResult {
  plots: Plot[];
  newCount: number;
  updatedCount: number;
  errors: string[];
}

/**
 * Parse an uploaded Excel or CSV file and convert into Plot items
 */
export async function parsePlotsFromFile(
  file: File,
  existingPlots: Plot[]
): Promise<ParsedPlotResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const errors: string[] = [];
  const parsedPlots: Plot[] = [];

  let newCount = 0;
  let updatedCount = 0;

  if (rawRows.length === 0) {
    errors.push('Файл пуст или не содержит строк с данными.');
    return { plots: [], newCount: 0, updatedCount: 0, errors };
  }

  rawRows.forEach((row, idx) => {
    // Find plot number under various possible column names
    const rawNumber =
      row['Номер участка'] ??
      row['Номер'] ??
      row['№'] ??
      row['№ участка'] ??
      row['Участок'] ??
      row['plotNumber'] ??
      row['number'];

    const plotNum = Number(rawNumber);
    if (!plotNum || isNaN(plotNum) || plotNum <= 0) {
      errors.push(`Строка ${idx + 2}: Не указан или некорректен номер участка ("${rawNumber}")`);
      return;
    }

    const existing = existingPlots.find((p) => p.number === plotNum);

    // Cadastral number
    const cadastralNumber = String(
      row['Кадастровый номер'] ??
      row['Кадастр'] ??
      row['Кадастровый №'] ??
      row['cadastralNumber'] ??
      (existing ? existing.cadastralNumber : `54:19:112001:${100 + plotNum}`)
    ).trim();

    // Street
    const street = String(
      row['Улица'] ??
      row['Адрес'] ??
      row['street'] ??
      (existing ? existing.street : 'ул. Центральная')
    ).trim();

    // Owner
    const ownerName = String(
      row['ФИО Собственника'] ??
      row['Собственник'] ??
      row['ФИО'] ??
      row['Владелец'] ??
      row['ownerName'] ??
      (existing ? existing.ownerName : 'Собственник')
    ).trim();

    // Phone
    const phone = String(
      row['Телефон'] ??
      row['Контакт'] ??
      row['phone'] ??
      (existing ? existing.phone : '')
    ).trim();

    // Area
    const rawArea =
      row['Площадь (кв.м)'] ??
      row['Площадь'] ??
      row['areaSqm'] ??
      row['area'];
    const areaSqm = Number(rawArea) > 0 ? Number(rawArea) : existing?.areaSqm || 800;

    // Residency
    const rawResidency = String(
      row['Режим проживания'] ??
      row['Проживание'] ??
      row['residencyType'] ??
      ''
    ).toLowerCase();

    let residencyType: ResidencyType = existing?.residencyType || 'occasional';
    if (rawResidency.includes('постоян') || rawResidency.includes('permanent')) {
      residencyType = 'permanent';
    } else if (rawResidency.includes('период') || rawResidency.includes('сезон') || rawResidency.includes('occasional')) {
      residencyType = 'occasional';
    }

    // Winter clearing priority
    const rawPriority = row['Очередь уборки снега'] ?? row['Очередь'] ?? row['winterClearingPriority'];
    const winterClearingPriority = Number(rawPriority) === 1 ? 1 : Number(rawPriority) === 2 ? 2 : (residencyType === 'permanent' ? 1 : 2);

    // Winter water
    const rawWinterWater = String(
      row['Зимний водопровод (статус)'] ??
      row['Зимний водопровод'] ??
      row['Зимняя вода'] ??
      row['winterWater'] ??
      ''
    ).toLowerCase();

    const isWinterConn =
      rawWinterWater.includes('подключ') ||
      rawWinterWater.includes('да') ||
      rawWinterWater.includes('true') ||
      rawWinterWater === '1' ||
      (existing ? Boolean(existing.utilities?.winterWater?.connected) : false);

    const winterStatus = isWinterConn
      ? 'connected'
      : rawWinterWater.includes('ту')
      ? 'tu_issued'
      : rawWinterWater.includes('заявк')
      ? 'applied'
      : (existing?.utilities?.winterWater?.status || 'none');

    const contractNumber = String(row['Договор зимней воды'] ?? row['Договор'] ?? existing?.utilities?.winterWater?.contractNumber ?? '').trim();
    const tuNumber = String(row['Номер ТУ'] ?? row['ТУ'] ?? existing?.utilities?.winterWater?.tuNumber ?? '').trim();
    const meterSerial = String(row['Счетчик воды (№)'] ?? row['Счетчик воды'] ?? existing?.utilities?.winterWater?.meterSerial ?? '').trim();
    const rawMeterReading = row['Показания счетчика (м³)'] ?? row['Показания'] ?? existing?.utilities?.winterWater?.meterLastReading;
    const meterLastReading = !isNaN(Number(rawMeterReading)) ? Number(rawMeterReading) : undefined;
    const sealNumber = String(row['Номер пломбы'] ?? row['Пломба'] ?? existing?.utilities?.winterWater?.sealNumber ?? '').trim();

    // Summer water
    const rawSummer = String(row['Летний водопровод'] ?? row['Летняя вода'] ?? '').toLowerCase();
    const summerWater = rawSummer.includes('нет') || rawSummer.includes('false') || rawSummer === '0' ? false : (existing?.utilities?.summerWater ?? true);

    // Electricity
    const rawPhases = Number(row['Электроэнергия (фаз)'] ?? row['Фазы'] ?? existing?.utilities?.electricity?.phases ?? 1);
    const phases = rawPhases === 3 ? 3 : 1;
    const rawPower = Number(row['Выделенная мощность (кВт)'] ?? row['Мощность'] ?? existing?.utilities?.electricity?.allocatedPowerKw ?? 15);
    const allocatedPowerKw = rawPower > 0 ? rawPower : 15;
    const elecMeter = String(row['Счетчик электричества'] ?? existing?.utilities?.electricity?.meterSerial ?? '').trim();

    // Gas
    const rawGas = String(row['Газоснабжение'] ?? row['Газ'] ?? '').toLowerCase();
    const isGasConn = rawGas.includes('подключ') || (existing ? Boolean(existing.utilities?.gas?.connected) : false);
    const gasStatus = isGasConn ? 'connected' : rawGas.includes('план') ? 'planned' : (existing?.utilities?.gas?.status || 'none');

    // Coordinates: use file if provided, otherwise preserve existing, or generate valid offset
    const fileLat = Number(row['Широта центра'] ?? row['Широта'] ?? row['lat']);
    const fileLng = Number(row['Долгота центра'] ?? row['Долгота'] ?? row['lng']);

    let coordinates: Coordinates;
    if (!isNaN(fileLat) && !isNaN(fileLng) && fileLat > 50 && fileLng > 70) {
      coordinates = { lat: Number(fileLat.toFixed(6)), lng: Number(fileLng.toFixed(6)) };
    } else if (existing?.coordinates && typeof existing.coordinates.lat === 'number') {
      coordinates = existing.coordinates;
    } else {
      // Generate realistic location inside DTSN based on plot number
      const rowOffset = Math.floor((plotNum - 1) / 4);
      const colOffset = (plotNum - 1) % 4;
      coordinates = {
        lat: Number((LAT0 + 0.0030 - rowOffset * 0.0007).toFixed(6)),
        lng: Number((LNG0 - 0.0020 + colOffset * 0.0009).toFixed(6)),
      };
    }

    // Polygon: preserve existing or create rectangle around coordinates
    let polygon: Coordinates[];
    if (existing?.polygon && existing.polygon.length >= 3) {
      polygon = existing.polygon;
    } else {
      polygon = [
        { lat: Number((coordinates.lat + 0.0002).toFixed(6)), lng: Number((coordinates.lng - 0.0002).toFixed(6)) },
        { lat: Number((coordinates.lat + 0.0002).toFixed(6)), lng: Number((coordinates.lng + 0.0002).toFixed(6)) },
        { lat: Number((coordinates.lat - 0.0002).toFixed(6)), lng: Number((coordinates.lng + 0.0002).toFixed(6)) },
        { lat: Number((coordinates.lat - 0.0002).toFixed(6)), lng: Number((coordinates.lng - 0.0002).toFixed(6)) },
      ];
    }

    const constructedPlot: Plot = {
      id: existing ? existing.id : `plot-imported-${plotNum}`,
      number: plotNum,
      street,
      ownerName,
      phone,
      cadastralNumber,
      areaSqm,
      residencyType,
      winterClearingPriority: winterClearingPriority as 1 | 2,
      coordinates,
      polygon,
      utilities: {
        winterWater: {
          connected: isWinterConn,
          status: winterStatus as any,
          contractNumber: contractNumber || undefined,
          tuNumber: tuNumber || undefined,
          meterSerial: meterSerial || undefined,
          meterLastReading,
          sealNumber: sealNumber || undefined,
          wellId: existing?.utilities?.winterWater?.wellId || 'w-1',
        },
        summerWater,
        electricity: {
          connected: true,
          phases,
          allocatedPowerKw,
          substationId: existing?.utilities?.electricity?.substationId || 'ktp-1',
          meterSerial: elecMeter || existing?.utilities?.electricity?.meterSerial || `Э-${plotNum}`,
        },
        gas: {
          connected: isGasConn,
          status: gasStatus as any,
        },
      },
    };

    if (existing) {
      updatedCount++;
    } else {
      newCount++;
    }

    parsedPlots.push(constructedPlot);
  });

  return {
    plots: parsedPlots,
    newCount,
    updatedCount,
    errors,
  };
}
