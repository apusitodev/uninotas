// app/loading.tsx
import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-5 p-8 rounded-3xl bg-white shadow-xl border border-gray-100 max-w-sm w-full mx-4">
        {/* Spinner animado con estilo moderno */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-14 w-14 rounded-full border-4 border-blue-100"></div>
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#0071e3] border-t-transparent"></div>
        </div>
        
        {/* Textos institucionales */}
        <div className="flex flex-col items-center space-y-1 text-center">
          <h2 className="text-base font-black tracking-tight text-gray-900">Uninotas</h2>
          <p className="text-xs text-gray-400 font-medium animate-pulse">Sincronizando espacio académico...</p>
        </div>
      </div>
    </div>
  );
}