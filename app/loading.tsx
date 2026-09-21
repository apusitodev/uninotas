'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#f4f5f8]">
      <div className="flex flex-col items-center space-y-4 p-8 rounded-3xl bg-white shadow-2xl border border-gray-100 max-w-xs w-full mx-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-12 w-12 rounded-full border-4 border-blue-100"></div>
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0071e3] border-t-transparent"></div>
        </div>
        <div className="flex flex-col items-center space-y-1 text-center">
          <h2 className="text-sm font-black tracking-tight text-gray-900">Uninotas</h2>
          <p className="text-[11px] text-gray-400 font-medium animate-pulse">Sincronizando expediente...</p>
        </div>
      </div>
    </div>
  );
}