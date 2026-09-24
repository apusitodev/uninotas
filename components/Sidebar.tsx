'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  CheckSquare, 
  Award, 
  GraduationCap, 
  HelpCircle, 
  Settings, 
  Smartphone 
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<any>>; // <--- Cambia esto
  userEmail: string;
  setShowHelpModal: (show: boolean) => void;
  setShowInstallModal: (show: boolean) => void;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  userEmail,
  setShowHelpModal,
  setShowInstallModal,
}: SidebarProps) {
  const router = useRouter();

  return (
    <>
      {/* Fondo oscuro difuminado */}
      <div 
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/15 backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Menú lateral completo */}
      <aside
        className={`fixed top-4 left-4 bottom-4 z-50 w-72 sm:w-80 glass-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 ease-out border border-white/80 ${
          sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Cabecera del menú */}
          <div className="flex items-center gap-3.5 pt-1">
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
              className="w-8 h-8 flex items-center justify-center cursor-pointer p-0 border-none bg-transparent"
            >
              <div className="flex flex-col items-center justify-center gap-1 w-5 h-5 rotate-90 transition-transform duration-300 ease-in-out">
                <span className="w-4 h-[2px] bg-gray-800 rounded-full" />
                <span className="w-4 h-[2px] bg-gray-800 rounded-full" />
                <span className="w-4 h-[2px] bg-gray-800 rounded-full" />
              </div>
            </button>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 leading-none">Menú</h2>
          </div>

          {/* Opciones de navegación principal */}
          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveTab('general'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                sidebarOpen ? 'animate-ios-item-1' : ''
              } ${activeTab === 'general' ? 'bg-white text-[#0071e3] shadow-xs border border-gray-200/70' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'}`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Resumen General</span>
            </button>

            <button
              onClick={() => { setActiveTab('diario'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                sidebarOpen ? 'animate-ios-item-2' : ''
              } ${activeTab === 'diario' ? 'bg-white text-[#0071e3] shadow-xs border border-gray-200/70' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'}`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Horario Diario y Tareas</span>
            </button>

            <button
              onClick={() => { setActiveTab('calendario'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                sidebarOpen ? 'animate-ios-item-3' : ''
              } ${activeTab === 'calendario' ? 'bg-white text-[#0071e3] shadow-xs border border-gray-200/70' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'}`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Calendario Académico</span>
            </button>

            <button
              onClick={() => { setActiveTab('asistencia'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                sidebarOpen ? 'animate-ios-item-4' : ''
              } ${activeTab === 'asistencia' ? 'bg-white text-[#0071e3] shadow-xs border border-gray-200/70' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'}`}
            >
              <CheckSquare className="w-4 h-4 shrink-0" />
              <span>Control de Asistencia</span>
            </button>

            <button
              onClick={() => { setActiveTab('notas'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                sidebarOpen ? 'animate-ios-item-4' : ''
              } ${activeTab === 'notas' ? 'bg-white text-[#0071e3] shadow-xs border border-gray-200/70' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'}`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span>Calificaciones</span>
            </button>
          </nav>
        </div>

        {/* Parte inferior del menú */}
        <div className={`border-t border-gray-200/60 pt-4 space-y-2.5 ${sidebarOpen ? 'animate-ios-item-4' : ''}`}>
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-[#0071e3] shadow-xs shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-gray-900">UniNotas</span>
                <span className="text-[11px] font-normal text-gray-400">EUM</span>
              </div>
              <p className="text-[10px] text-gray-400 truncate mt-0.5">{userEmail}</p>
            </div>
          </div>

          <button
            onClick={() => { setSidebarOpen(false); setShowHelpModal(true); }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-gray-600 shrink-0" />
            <span>Guía y Funcionalidades</span>
          </button>

          <button
            onClick={() => { setSidebarOpen(false); router.push('/dashboard/settings'); }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-gray-600 shrink-0" />
            <span>Ajustes del perfil</span>
          </button>

          <div className="w-full pt-1 md:hidden">
            <button
              onClick={() => {
                setSidebarOpen(false);
                setShowInstallModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-gray-600 shrink-0" />
              <span>Instalar App en el Móvil</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}