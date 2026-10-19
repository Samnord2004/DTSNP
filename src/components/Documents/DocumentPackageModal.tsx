import React, { useState } from 'react';
import { WinterConnectionRequest, Plot, Well } from '../../types/index.ts';
import { SOCIETY_INFO } from '../../data/mockData';
import { ConnectionSchematic } from '../WinterWater/ConnectionSchematic';
import { Printer, Download, CheckCircle, FileText, X, Shield, Calendar, MapPin, User, Check } from 'lucide-react';

interface DocumentPackageModalProps {
  request: WinterConnectionRequest;
  plot: Plot;
  well: Well;
  onClose: () => void;
  onApproveAndSign: () => void;
  canApprove: boolean;
}

export const DocumentPackageModal: React.FC<DocumentPackageModalProps> = ({
  request,
  plot,
  well,
  onClose,
  onApproveAndSign,
  canApprove,
}) => {
  const [activeDocTab, setActiveDocTab] = useState<'tu' | 'schematic' | 'contract' | 'hydraulic_act' | 'sealing_act'>('tu');

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">
                {request.requestNumber}
              </span>
              <span className="text-slate-500">/</span>
              <h2 className="text-lg font-bold text-white">
                Официальный пакет документов на технологическое присоединение
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Собственник: <span className="text-slate-200">{request.ownerName}</span> · Участок № {request.plotNumber} · Колодец {well.code}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              title="Распечатать документ"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Печать</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/30 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveDocTab('tu')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeDocTab === 'tu'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Технические условия (ТУ)
          </button>
          <button
            onClick={() => setActiveDocTab('schematic')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeDocTab === 'schematic'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Графическая схема узла
          </button>
          <button
            onClick={() => setActiveDocTab('contract')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeDocTab === 'contract'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Договор с Обществом
          </button>
          <button
            onClick={() => setActiveDocTab('hydraulic_act')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeDocTab === 'hydraulic_act'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Акт гидравлических испытаний
          </button>
          <button
            onClick={() => setActiveDocTab('sealing_act')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeDocTab === 'sealing_act'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            5. Акт опломбировки узла учёта
          </button>
        </div>

        {/* Document Content Viewport (Styling formatted like official Russian document) */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/60 print:bg-white print:text-black">
          {/* TAB 1: ТЕХНИЧЕСКИЕ УСЛОВИЯ */}
          {activeDocTab === 'tu' && (
            <div className="max-w-3xl mx-auto bg-slate-950 border border-slate-800 rounded-xl p-8 space-y-6 text-slate-200 shadow-inner print:border-none print:bg-white print:text-black">
              {/* Official Header */}
              <div className="text-center border-b border-slate-800 pb-4 space-y-1">
                <p className="text-xs uppercase font-semibold tracking-widest text-slate-400">
                  {SOCIETY_INFO.fullName}
                </p>
                <p className="text-[11px] text-slate-500">
                  ОГРН {SOCIETY_INFO.ogrn} · ИНН {SOCIETY_INFO.inn} · КПП {SOCIETY_INFO.kpp}
                </p>
                <p className="text-[11px] text-slate-500">{SOCIETY_INFO.legalAddress}</p>
                <h3 className="text-base font-bold text-white pt-2">
                  ТЕХНИЧЕСКИЕ УСЛОВИЯ № {request.tuIssuedDate ? `ТУ-В-2026/${request.plotNumber}` : 'ПРОЕКТ ТУ'}
                </h3>
                <p className="text-xs text-sky-400 font-medium">
                  на подключение к распределительной сети круглогодичного (зимнего) водопровода
                </p>
                <p className="text-xs text-slate-400">г. Новосибирск, {currentDateStr}</p>
              </div>

              {/* Applicant Data */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900/80 p-4 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-400 block">Заявитель (Собственник):</span>
                  <span className="font-semibold text-white">{request.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Объект подключения:</span>
                  <span className="font-semibold text-white">
                    Земельный участок № {request.plotNumber} ({plot.street})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Кадастровый номер участка:</span>
                  <span className="font-mono text-slate-300">{request.cadastralNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Контактный телефон:</span>
                  <span className="text-slate-300">{request.ownerPhone}</span>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3 text-xs leading-relaxed">
                <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-1">
                  1. Технические параметры точки подключения и трассы
                </h4>
                <div className="space-y-2 text-slate-300">
                  <p>
                    <b>1.1. Точка подключения (врезки):</b> Смотровой железобетонный колодец{' '}
                    <span className="font-bold text-sky-400">{well.name} ({well.code})</span>. Свободный штуцер d32 с запорным шаровым краном.
                  </p>
                  <p>
                    <b>1.2. Гарантированное рабочее давление в точке врезки:</b> {well.nominalPressureAtm} атм (0.40 - 0.42 МПа).
                  </p>
                  <p>
                    <b>1.3. Расчетная протяженность трассы водопровода:</b> {request.pipeRouteLengthMeters} м (прямое расстояние: {request.wellDistanceMeters} м).
                  </p>
                  <p>
                    <b>1.4. Диаметр и материал трубы:</b> {request.pipeMaterial}. Прокладка цельным отрезком без промежуточных соединений от колодца до узла ввода.
                  </p>
                  <p>
                    <b>1.5. Глубина заложения водопроводной траншеи:</b> Не менее <b>{request.trenchDepthMeters.toFixed(2)} м</b> от планировочной отметки земли (нормативная глубина сезонного промерзания грунта в Новосибирской области — 2.20–2.40 м).
                  </p>
                  <p>
                    <b>1.6. Требования к электрообогреву и теплоизоляции:</b> Обязательный монтаж саморегулирующегося кабеля мощностью не менее {request.heatingCableWattsPerMeter} Вт/м по всей длине трубы + трубная изоляция {request.insulationType}.
                  </p>
                  <p>
                    <b>1.7. Пересечение смежных инженерных коммуникаций:</b>{' '}
                    {request.crossesRoad ? 'Трасса пересекает проезжую часть (прокладка в защитном стальном футляре Ду 100мм методом прокола). ' : ''}
                    {request.crossesPowerCable ? 'Пересечение с кабельной линией 0.4кВ выполнять вручную без применения экскаватора с вызовом дежурного энергетика ДТСН.' : 'Пересечений нет.'}
                  </p>
                </div>

                <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-1 pt-2">
                  2. Требования к узлу коммерческого учёта воды
                </h4>
                <div className="space-y-1.5 text-slate-300">
                  <p>
                    2.1. Установить счетчик холодной воды: <b>{request.meterModel}</b> (заводской № {request.meterSerial}).
                  </p>
                  <p>
                    2.2. Перед счетчиком установить шаровой кран и косой сетчатый фильтр грубой очистки с проушиной под пломбирование.
                  </p>
                  <p>
                    2.3. После счетчика установить обратный клапан для исключения обратного тока теплой воды и слива сети.
                  </p>
                  <p>
                    2.4. Пломбировка узла производится главным инженером Общества с составлением двустороннего Акта опломбировки.
                  </p>
                </div>
              </div>

              {/* Signatures & Seal Box */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <p className="font-semibold text-slate-200">От ДТСН «Пенсионер»:</p>
                  <p className="text-slate-400 mt-2">Председатель Правления</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-medium text-white">{SOCIETY_INFO.chairmanName}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {request.approvedByChairman ? '✓ Подписано ЭЦП' : 'Ожидает подписи'}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-2">Главный инженер</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-medium text-white">{SOCIETY_INFO.chiefEngineer}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {request.approvedByEngineer ? '✓ Согласовано' : 'Ожидает согласования'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-700 rounded-lg">
                  <div className="w-24 h-24 rounded-full border-2 border-sky-500/60 flex flex-col items-center justify-center text-center p-2 text-[9px] text-sky-300">
                    <span className="font-bold">ДТСН «ПЕНСИОНЕР»</span>
                    <span className="text-[8px] text-slate-400">ИНН 5402178940</span>
                    <span className="text-[8px] text-sky-400 font-mono mt-0.5">ОДОБРЕНО</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2">Печать Товарищества</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ГРАФИЧЕСКАЯ СХЕМА */}
          {activeDocTab === 'schematic' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <ConnectionSchematic
                plotNumber={request.plotNumber}
                wellCode={well.code}
                pipeDiameterMm={request.pipeDiameterMm}
                pipeMaterial={request.pipeMaterial}
                meterModel={request.meterModel}
                meterSerial={request.meterSerial}
                sealNumber={request.sealNumber}
                trenchDepthMeters={request.trenchDepthMeters}
                cableWatts={request.heatingCableWattsPerMeter}
                pressureAtm={well.nominalPressureAtm}
              />
            </div>
          )}

          {/* TAB 3: ДОГОВОР С ОБЩЕСТВОМ */}
          {activeDocTab === 'contract' && (
            <div className="max-w-3xl mx-auto bg-slate-950 border border-slate-800 rounded-xl p-8 space-y-6 text-slate-200 text-xs leading-relaxed">
              <div className="text-center border-b border-slate-800 pb-4 space-y-1">
                <h3 className="text-base font-bold text-white">
                  ДОГОВОР № {request.contractNumber || `ДЗВ-${request.plotNumber}/26`}
                </h3>
                <p className="text-xs text-sky-400">
                  о подключении (технологическом присоединении) к инженерным сетям круглогодичного водоснабжения ДТСН «Пенсионер»
                </p>
                <p className="text-slate-400">г. Новосибирск, {currentDateStr}</p>
              </div>

              <div className="space-y-3 text-slate-300">
                <p>
                  <b>{SOCIETY_INFO.fullName}</b>, именуемое в дальнейшем «Общество», в лице Председателя Правления {SOCIETY_INFO.chairmanName}, действующего на основании Устава, с одной стороны, и
                </p>
                <p>
                  Гражданин(ка) <b>{request.ownerName}</b>, собственник земельного участка № {request.plotNumber}, именуемый(ая) в дальнейшем «Заявитель», с другой стороны, совместно именуемые «Стороны», заключили настоящий Договор о нижеследующем:
                </p>

                <h4 className="font-bold text-white pt-2">1. Предмет договора</h4>
                <p>
                  1.1. Общество обязуется предоставить точку технологического присоединения к централизованной сети зимнего водопровода в колодце <b>{well.name} ({well.code})</b>, а Заявитель обязуется выполнить прокладку абонентской водопроводной линии в строгом соответствии с выданными Техническими условиями и оплатить целевой взнос на развитие и поддержание инфраструктуры зимнего водоснабжения.
                </p>

                <h4 className="font-bold text-white pt-2">2. Права и обязанности сторон</h4>
                <p>
                  2.1. <b>Общество обязуется:</b> Обеспечить бесперебойную подачу холодной питьевой воды под гарантированным давлением не менее 3.5 атм круглый год при условии соблюдения Заявителем теплоизоляционного режима узла ввода.
                </p>
                <p>
                  2.2. <b>Заявитель обязуется:</b> Осуществлять укладку трубы ПНД d32 на глубину не менее 2.80 м, обеспечить исправную работу саморегулирующегося кабеля обогрева ввода в зимний период, не допускать несанкционированных врезок до прибора учёта и своевременно передавать показания счетчика до 25 числа каждого месяца.
                </p>

                <h4 className="font-bold text-white pt-2">3. Порядок расчетов и учет</h4>
                <p>
                  3.1. Учет потребленной воды производится по индивидуальному опломбированному прибору учета {request.meterModel} (зав. № {request.meterSerial}). Оплата производится по тарифу, утвержденному Общим собранием членов ДТСН.
                </p>

                <h4 className="font-bold text-white pt-2">4. Ответственность сторон</h4>
                <p>
                  4.1. Границей эксплуатационной ответственности и балансовой принадлежности является запорный кран на штуцере подключения в смотровом колодце {well.code}.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-8">
                <div>
                  <p className="font-bold text-white mb-2">Общество (ДТСН «Пенсионер»):</p>
                  <p className="text-slate-400">ИНН: {SOCIETY_INFO.inn} · БИК: {SOCIETY_INFO.bik}</p>
                  <p className="text-slate-400">Р/счет: {SOCIETY_INFO.account}</p>
                  <p className="text-white mt-3">Председатель: {SOCIETY_INFO.chairmanName} ____________</p>
                </div>
                <div>
                  <p className="font-bold text-white mb-2">Заявитель:</p>
                  <p className="text-slate-400">Собственник уч. № {request.plotNumber}</p>
                  <p className="text-slate-400">{request.ownerName}</p>
                  <p className="text-white mt-3">Подпись: ____________ / {request.ownerName} /</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: АКТ ГИДРАВЛИЧЕСКИХ ИСПЫТАНИЙ */}
          {activeDocTab === 'hydraulic_act' && (
            <div className="max-w-3xl mx-auto bg-slate-950 border border-slate-800 rounded-xl p-8 space-y-6 text-slate-200 text-xs leading-relaxed">
              <div className="text-center border-b border-slate-800 pb-4 space-y-1">
                <h3 className="text-base font-bold text-white">
                  АКТ № АГИ-2026/{request.plotNumber}
                </h3>
                <p className="text-xs text-sky-400">
                  гидравлического испытания напорного трубопровода на прочность и герметичность
                </p>
                <p className="text-slate-400">г. Новосибирск, {currentDateStr}</p>
              </div>

              <div className="space-y-3 text-slate-300">
                <p>
                  Комиссия в составе: Главного инженера ДТСН «Пенсионер» <b>{SOCIETY_INFO.chiefEngineer}</b> и Собственника участка № {request.plotNumber} <b>{request.ownerName}</b> провела освидетельствование и испытание смонтированного ввода зимнего водопровода.
                </p>
                <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <p>• Участок испытания: от колодца {well.code} до узла ввода участка № {request.plotNumber}</p>
                  <p>• Материал и диаметр: {request.pipeMaterial}</p>
                  <p>• Длина испытанного участка: {request.pipeRouteLengthMeters} м</p>
                  <p>• Испытательное давление: <b>6.0 атм (1.5 Pраб)</b></p>
                  <p>• Время выдержки под давлением: <b>120 минут</b></p>
                  <p>• Падение давления за время испытания: <b>0.00 атм</b></p>
                  <p>• Визуальный осмотр: утечек, капели и деформаций стыков не обнаружено</p>
                </div>
                <p className="font-semibold text-emerald-400">
                  ЗАКЛЮЧЕНИЕ: Трубопровод выдержал гидравлическое испытание, признан герметичным и допущен к засыпке траншеи и постоянной эксплуатации.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-slate-400">Главный инженер ДТСН:</p>
                  <p className="font-bold text-white mt-1">{SOCIETY_INFO.chiefEngineer} _________</p>
                </div>
                <div>
                  <p className="text-slate-400">Собственник участка № {request.plotNumber}:</p>
                  <p className="font-bold text-white mt-1">{request.ownerName} _________</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: АКТ ОПЛОМБИРОВКИ */}
          {activeDocTab === 'sealing_act' && (
            <div className="max-w-3xl mx-auto bg-slate-950 border border-slate-800 rounded-xl p-8 space-y-6 text-slate-200 text-xs leading-relaxed">
              <div className="text-center border-b border-slate-800 pb-4 space-y-1">
                <h3 className="text-base font-bold text-white">
                  АКТ ВВОДА В ЭКСПЛУАТАЦИЮ И ОПЛОМБИРОВКИ ПРИБОРА УЧЁТА ВОДЫ № АО-2026/{request.plotNumber}
                </h3>
                <p className="text-xs text-sky-400">
                  ДТСН «Пенсионер», Новосибирская область
                </p>
                <p className="text-slate-400">{currentDateStr}</p>
              </div>

              <div className="space-y-4 text-slate-300">
                <p>
                  Настоящий акт составлен о том, что представителем ДТСН «Пенсионер» в присутствии собственника участка № {request.plotNumber} произведен осмотр узла учета и установлена контрольная антимагнитная пломба.
                </p>

                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Тип и марка счетчика:</span>
                    <span className="font-bold text-white">{request.meterModel}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Заводской серийный номер:</span>
                    <span className="font-mono font-bold text-sky-400">{request.meterSerial}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Номер установленной пломбы:</span>
                    <span className="font-mono font-bold text-rose-400">{request.sealNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Начальные показания при пуске:</span>
                    <span className="font-mono font-bold text-emerald-400">{request.initialReading.toFixed(3)} м³</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded text-amber-200 text-xs">
                  <b>Предупреждение собственнику:</b> При нарушении целостности пломбы, самовольном вмешательстве в узел учета или срыве пломбы расчет водопотребления производится по нормативу с коэффициентом 10 в соответствии с законодательством РФ и Уставом ДТСН.
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-slate-400">Опломбировал (Главный инженер):</p>
                  <p className="font-bold text-white mt-1">{SOCIETY_INFO.chiefEngineer} _________</p>
                </div>
                <div>
                  <p className="text-slate-400">Пломбу на сохранность принял (Собственник):</p>
                  <p className="font-bold text-white mt-1">{request.ownerName} _________</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Статус согласования:</span>
            <span className={`font-semibold ${request.approvedByChairman && request.approvedByEngineer ? 'text-emerald-400' : 'text-amber-400'}`}>
              {request.approvedByChairman && request.approvedByEngineer ? 'Одобрено Правлением и Инженером' : 'Требует утверждения'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canApprove && (!request.approvedByChairman || !request.approvedByEngineer) && (
              <button
                onClick={onApproveAndSign}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-lg transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Утвердить ТУ и подписать пакет документов</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
