/**
 * High-quality Technical Engineering Photos and Presets for DTSN "Pensioner"
 * Provides realistic visual assets for wells, valves, meters, switchboards, and hydrants.
 */
import { AssetPhoto } from '../types/index.ts';

// Helper to create clean technical SVG data URIs
function createTechSvg(title: string, subtitle: string, tag: string, colorHex: string, accentHex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#64748b"/>
        <stop offset="50%" stop-color="#475569"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="0.8" opacity="0.3"/>
      </pattern>
    </defs>
    <rect width="800" height="500" fill="url(#bg)"/>
    <rect width="800" height="500" fill="url(#grid)"/>
    
    <!-- Central Engineering Diagram Symbol -->
    <g transform="translate(400, 220)">
      <circle r="120" fill="none" stroke="${colorHex}" stroke-width="4" stroke-dasharray="10 6" opacity="0.4"/>
      <circle r="95" fill="url(#metal)" stroke="${colorHex}" stroke-width="5"/>
      <circle r="75" fill="#0f172a" stroke="${accentHex}" stroke-width="3"/>
      <!-- Inner cross/valve spokes -->
      <line x1="-60" y1="0" x2="60" y2="0" stroke="${colorHex}" stroke-width="6"/>
      <line x1="0" y1="-60" x2="0" y2="60" stroke="${colorHex}" stroke-width="6"/>
      <circle r="22" fill="${colorHex}" stroke="#ffffff" stroke-width="3"/>
      <!-- Bolts around perimeter -->
      <circle cx="0" cy="-85" r="5" fill="#f8fafc"/>
      <circle cx="60" cy="-60" r="5" fill="#f8fafc"/>
      <circle cx="85" cy="0" r="5" fill="#f8fafc"/>
      <circle cx="60" cy="60" r="5" fill="#f8fafc"/>
      <circle cx="0" cy="85" r="5" fill="#f8fafc"/>
      <circle cx="-60" cy="60" r="5" fill="#f8fafc"/>
      <circle cx="-85" cy="0" r="5" fill="#f8fafc"/>
      <circle cx="-60" cy="-60" r="5" fill="#f8fafc"/>
    </g>

    <!-- Top Badge -->
    <rect x="36" y="32" width="180" height="32" rx="16" fill="${colorHex}" opacity="0.2"/>
    <rect x="36" y="32" width="180" height="32" rx="16" fill="none" stroke="${colorHex}" stroke-width="1.5"/>
    <text x="126" y="53" fill="${colorHex}" font-family="monospace, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">${tag}</text>

    <!-- Date Watermark -->
    <text x="760" y="53" fill="#94a3b8" font-family="monospace, sans-serif" font-size="12" text-anchor="end">ДТСН «ПЕНСИОНЕР» · 2026</text>

    <!-- Bottom Caption Card -->
    <rect x="36" y="390" width="728" height="78" rx="14" fill="#020617" opacity="0.88" stroke="#334155" stroke-width="1"/>
    <text x="56" y="424" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold">${title}</text>
    <text x="56" y="450" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="13">${subtitle}</text>
    
    <rect x="670" y="414" width="74" height="28" rx="6" fill="${accentHex}"/>
    <text x="707" y="433" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ПОВЕРЕНО</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_TECHNICAL_PHOTOS: {
  id: string;
  category: 'well' | 'valve' | 'switchboard' | 'substation' | 'hydrant' | 'pipeline' | 'common';
  title: string;
  subtitle: string;
  photo: AssetPhoto;
}[] = [
  {
    id: 'tp-well-cover',
    category: 'well',
    title: 'Оголовок и утепленный люк колодца',
    subtitle: 'Ж/б кольцо КС 15-9, утепленная термокрышка с замком',
    photo: {
      id: 'p-well-cover',
      url: createTechSvg('Оголовок и утепленный люк колодца', 'Кольцо КС 15-9, крышка Пеноплекс 50мм, антивандальный замок', 'УЗЕЛ КВ · ОГОЛОВОК', '#0284c7', '#0369a1'),
      caption: 'Оголовок колодца с термокрышкой и замком',
      uploadedAt: '2026-09-15',
      uploadedBy: 'Главный инженер Кузнецов М.В.',
    },
  },
  {
    id: 'tp-well-manifold',
    category: 'well',
    title: 'Внутренняя распределительная гребенка',
    subtitle: 'Труба ПНД d160, шаровые краны Bugatti PN16, свободные штуцеры',
    photo: {
      id: 'p-well-manifold',
      url: createTechSvg('Распределительная гребенка и штуцеры', 'Труба ПНД-100 d160, шаровые краны Ду 32, манометр ДМ-05 6 атм', 'ГРЕБЕНКА ВРЕЗОК', '#0ea5e9', '#0284c7'),
      caption: 'Узел обвязки колодца с портами врезки',
      uploadedAt: '2026-09-20',
      uploadedBy: 'Кузнецов М.В.',
    },
  },
  {
    id: 'tp-well-meter',
    category: 'well',
    title: 'Узел учета со счетчиком и номерной пломбой',
    subtitle: 'Счетчик холодной воды Бетар СХВ-15, опломбирован номерной пломбой',
    photo: {
      id: 'p-well-meter',
      url: createTechSvg('Узел коммерческого учета (Водомер)', 'Счетчик СВК-15 с импульсным выходом, номерная роторная пломба', 'ПРИБОР УЧЕТА', '#10b981', '#059669'),
      caption: 'Опломбированный прибор учета в колодце',
      uploadedAt: '2026-10-02',
      uploadedBy: 'Кузнецов М.В.',
    },
  },
  {
    id: 'tp-heating-cable',
    category: 'well',
    title: 'Ввод греющего кабеля и термостат',
    subtitle: 'Саморегулирующийся кабель Raychem 17 Вт/м в защитной муфте',
    photo: {
      id: 'p-heating-cable',
      url: createTechSvg('Ввод саморегулирующегося кабеля обогрева', 'Кабель 17 Вт/м, сальниковый ввод 1/2", контроль температуры', 'ОБОГРЕВ · ТЕРМОСТАТ', '#f59e0b', '#d97706'),
      caption: 'Узел ввода греющего кабеля в трубопровод',
      uploadedAt: '2026-10-04',
      uploadedBy: 'Алексеев А.Н.',
    },
  },
  {
    id: 'tp-valve-gate',
    category: 'valve',
    title: 'Фланцевая чугунная задвижка 30ч6бр',
    subtitle: 'Задвижка клиновая Ду 100 с выдвижным шпинделем и ковером',
    photo: {
      id: 'p-valve-gate',
      url: createTechSvg('Задвижка чугунная фланцевая Ду 100', 'Марка 30ч6бр, Ру 10 атм, чугунный ковер и удлинительная штанга', 'АРМАТУРА ЗК-01', '#8b5cf6', '#7c3aed'),
      caption: 'Запорная арматура магистрального водопровода',
      uploadedAt: '2026-09-18',
      uploadedBy: 'Кузнецов М.В.',
    },
  },
  {
    id: 'tp-switchboard-vr',
    category: 'switchboard',
    title: 'Шкаф распределительный ВРУ / ШР',
    subtitle: 'Вводной автомат 250А, рубильник, учет электроэнергии Меркурий',
    photo: {
      id: 'p-switchboard-vr',
      url: createTechSvg('Шкаф распределительный силовой ВРУ-01', 'Вводной автомат ВА57 250А, счетчик Меркурий 234, УЗИП 3P', 'ЭЛЕКТРОЩИТОВАЯ', '#f59e0b', '#b45309'),
      caption: 'Панель вводно-распределительного устройства',
      uploadedAt: '2026-09-10',
      uploadedBy: 'Алексеев А.Н.',
    },
  },
  {
    id: 'tp-ktpn-substation',
    category: 'substation',
    title: 'Трансформаторная подстанция КТПН 10/0.4кВ',
    subtitle: 'Трансформатор ТМ-250 кВА, разъединитель РЛНД-10, заземляющий контур',
    photo: {
      id: 'p-ktpn-substation',
      url: createTechSvg('Трансформаторная подстанция КТПН-1', 'Трансформатор 250 кВА, уровень масла в норме, заземление 3.8 Ом', 'ПОДСТАНЦИЯ КТПН', '#e11d48', '#be123c'),
      caption: 'Подстанция КТПН и охранная зона',
      uploadedAt: '2026-09-01',
      uploadedBy: 'Алексеев А.Н.',
    },
  },
  {
    id: 'tp-fire-hydrant',
    category: 'hydrant',
    title: 'Пожарный гидрант московского типа',
    subtitle: 'Гидрант h=2.5м на подставке ППФ, проверен на водоотдачу 26 л/с',
    photo: {
      id: 'p-fire-hydrant',
      url: createTechSvg('Пожарный гидрант ПГ-01 ГОСТ 8220', 'Высота 2.5м, статическое давление 4.2 атм, термочехол на зиму', 'ГИДРАНТ МЧС', '#dc2626', '#b91c1c'),
      caption: 'Пожарный гидрант с зимним утеплением',
      uploadedAt: '2026-09-22',
      uploadedBy: 'Кузнецов М.В.',
    },
  },
  {
    id: 'tp-pipeline-trench',
    category: 'pipeline',
    title: 'Траншея и укладка трубы ПНД-100',
    subtitle: 'Глубина заложения 2.80м (ниже промерзания), песчаная подушка 15см',
    photo: {
      id: 'p-pipeline-trench',
      url: createTechSvg('Прокладка зимнего водовода d63', 'Глубина 2.80м, сигнальная лента «Осторожно! Водопровод»', 'ТРАССА ВОДОВОДА', '#0284c7', '#0369a1'),
      caption: 'Траншея и монтаж трубопровода',
      uploadedAt: '2026-09-28',
      uploadedBy: 'Кузнецов М.В.',
    },
  },
];
