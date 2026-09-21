// app/loading.tsx
'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f4f5f8]">
      <div className="flex flex-col items-center space-y-4 p-8 rounded-3xl bg-white shadow-xl border border-gray-100 max-w-xs w-full mx-4">
        
        {/* Contenedor de la botella animada con SVG nativo */}
        <div className="flex items-center justify-center my-1">
          <svg
            viewBox="0 0 205 615"
            className="w-[40px] h-[90px] animate-pulse stroke-black fill-transparent stroke-[16px] stroke-linecap-round"
          >
            <path d="M47 595c-8 0-26-6-26-34V261c0-17 9-29 16-38s16-28 16-28L68 59l-4-5s3-30 7-36 14-6 32-6 28 0 32 6 7 36 7 36l-4 5 15 136s9 19 16 28 16 21 16 38v300c0 28-18 34-26 34H47z" />
          </svg>
        </div>

        {/* Textos institucionales */}
        <div className="flex flex-col items-center space-y-1 text-center">
          <h2 className="text-sm font-black tracking-tight text-gray-900">Uninotas</h2>
          <p className="text-[11px] text-gray-400 font-medium animate-pulse">Sincronizando expediente...</p>
        </div>
      </div>
    </div>
  );
}