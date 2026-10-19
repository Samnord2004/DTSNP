import React from 'react';
import { SeasonMode, UserProfile } from '../types/index.ts';
import {
  Snowflake,
  Sun,
  Sprout,
  Leaf,
  Layers,
  FileText,
  Calendar,
  Home,
  User,
  Check,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'winter_water' | 'inspections' | 'schedule' | 'plots' | 'admin';
  season: SeasonMode;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectTab: (tab: 'map' | 'winter_water' | 'inspections' | 'schedule' | 'plots' | 'admin') => void;
  onSelectSeason: (season: SeasonMode) => void;
  onSwitchUser: (userId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  season,
  currentUser,
  allUsers,
  onSelectTab,
  onSelectSeason,
  onSwitchUser,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title, one line wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center font-bold text-white shadow-sm">
            ДП
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('map');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 hover:text-sky-600 transition-colors whitespace-nowrap"
          >
            ДТСН «Пенсионер»
          </a>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onSelectTab('map')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              activeTab === 'map' ? 'text-sky-600 font-bold border-b-2 border-sky-600 pb-0.5' : ''
            }`}
          >
            Интерактивная карта
          </button>

          <button
            onClick={() => onSelectTab('winter_water')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              activeTab === 'winter_water' ? 'text-sky-600 font-bold border-b-2 border-sky-600 pb-0.5' : ''
            }`}
          >
            Зимний водопровод & ТУ
          </button>

          <button
            onClick={() => onSelectTab('inspections')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              activeTab === 'inspections' ? 'text-sky-600 font-bold border-b-2 border-sky-600 pb-0.5' : ''
            }`}
          >
            Журнал осмотров
          </button>

          <button
            onClick={() => onSelectTab('schedule')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              activeTab === 'schedule' ? 'text-sky-600 font-bold border-b-2 border-sky-600 pb-0.5' : ''
            }`}
          >
            График & Сметы
          </button>

          <button
            onClick={() => onSelectTab('plots')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              activeTab === 'plots' ? 'text-sky-600 font-bold border-b-2 border-sky-600 pb-0.5' : ''
            }`}
          >
            Реестр участков
          </button>

          <button
            onClick={() => onSelectTab('admin')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              activeTab === 'admin' ? 'text-sky-600 font-bold border-b-2 border-sky-600 pb-0.5' : ''
            }`}
          >
            Администрирование
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Season Pills & Role Switcher) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 4-Season Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => onSelectSeason('winter')}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                season === 'winter' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Зимний режим: снегоотвалы, чистка, МЧС, КТПН, уличные фонари"
            >
              <Snowflake className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Зима</span>
            </button>

            <button
              onClick={() => onSelectSeason('spring')}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                season === 'spring' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Весенний режим: пропуск паводка, ливнёвка, расконсервация"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Весна</span>
            </button>

            <button
              onClick={() => onSelectSeason('summer')}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                season === 'summer' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Летний режим: поливочный водопровод, ремонт дорог, покос"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Лето</span>
            </button>

            <button
              onClick={() => onSelectSeason('autumn')}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                season === 'autumn' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Осенний режим: консервация водопровода, утепление колодцев"
            >
              <Leaf className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Осень</span>
            </button>
          </div>

          {/* Role Profile Switcher */}
          <select
            value={currentUser.id}
            onChange={(e) => onSwitchUser(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer shadow-xs"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.roleTitle} ({u.name.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-t border-slate-100 overflow-x-auto text-xs bg-slate-50">
        <button
          onClick={() => onSelectTab('map')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${activeTab === 'map' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600'}`}
        >
          Карта
        </button>
        <button
          onClick={() => onSelectTab('winter_water')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${activeTab === 'winter_water' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600'}`}
        >
          Зимняя вода & ТУ
        </button>
        <button
          onClick={() => onSelectTab('inspections')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${activeTab === 'inspections' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600'}`}
        >
          Осмотры
        </button>
        <button
          onClick={() => onSelectTab('schedule')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${activeTab === 'schedule' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600'}`}
        >
          График работ
        </button>
        <button
          onClick={() => onSelectTab('plots')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${activeTab === 'plots' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600'}`}
        >
          Участки
        </button>
        <button
          onClick={() => onSelectTab('admin')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${activeTab === 'admin' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600'}`}
        >
          Админ
        </button>
      </div>
    </header>
  );
};
