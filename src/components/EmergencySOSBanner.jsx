import React from 'react';
import { useApp } from '../context/AppContext';

export const EmergencySOSBanner = () => {
  const { setEmergencyModalOpen } = useApp();

  return (
    <section className="px-4 mb-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-error via-[#b81d1d] to-[#800a0a] text-white p-4 shadow-xl">
        {/* Glow ambient decorative circle */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span className="font-label-md text-[10px] tracking-wider font-extrabold uppercase text-white">
              Emergency SOS
            </span>
          </div>
          <div className="flex items-center gap-1 text-white/95 font-label-md text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">alarm</span>
            <span>15 min avg arrival</span>
          </div>
        </div>

        <h3 className="font-headline-lg-mobile text-xl font-bold text-white mb-1 leading-tight">
          Urgent Spark or Severe Leakage?
        </h3>
        <p className="font-body-sm text-xs text-white/90 mb-3.5 leading-relaxed">
          Nearest verified tradesperson dispatched immediately. Zero pre-booking delay with automated safety routing.
        </p>

        <button
          onClick={() => setEmergencyModalOpen(true)}
          className="w-full h-11 bg-white text-error font-label-lg text-xs rounded-full flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-transform font-bold hover:bg-neutral-50"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            e911_emergency
          </span>
          <span>Request Instant SOS Help (₹0 Extra)</span>
        </button>
      </div>
    </section>
  );
};
