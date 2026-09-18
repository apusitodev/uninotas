// app/loading.tsx
import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner animado con Tailwind */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full border-4 border-indigo-500/20"></div>
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
        
        {/* Texto de carga personalizado */}
        <div className="flex flex-col items-center space-y-1">
          <h2 className="text-lg font-semibold tracking-wide text-white">Uninotas</h2>
          <p className="text-xs text-slate-400 animate-pulse">Cargando tu espacio académico...</p>
        </div>
      </div>
    </div>
  );
}