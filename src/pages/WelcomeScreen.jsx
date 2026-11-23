import React from 'react';
import { useApp } from '../context/AppContext';

export const WelcomeScreen = ({ onSelectAuth }) => {
  const { demoMode, setDemoMode, enterDemoMode } = useApp();

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between max-w-md mx-auto px-4 py-6 font-body-md antialiased text-on-surface">
      {/* Top Header & Demo Mode Switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              build_circle
            </span>
          </div>
          <div>
            <h1 className="font-outfit font-bold text-base tracking-tight text-on-surface leading-none">
              Skill<span className="text-primary-container">Connect</span>
            </h1>
            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
              Chennai Trade Network
            </span>
          </div>
        </div>

        {/* Demo Mode Switch for Judges */}
        <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-full border border-outline-variant/30 text-xs shadow-sm">
          <span className="text-[10px] text-on-surface-variant font-medium">Demo Mode</span>
          <button
            onClick={() => enterDemoMode()}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              demoMode
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-amber-100'
            }`}
            title="Skip login and enter app with pre-seeded test accounts"
          >
            {demoMode ? 'ON' : 'SKIP LOGIN'}
          </button>
        </div>
      </div>

      {/* Hero Splash Content */}
      <div className="my-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/30 text-primary border border-primary/20 text-xs font-bold mb-3">
          <span className="material-symbols-outlined text-[14px]">verified</span>
          <span>Govt. Udyam Micro-Enterprise Backed</span>
        </div>

        <h2 className="font-headline-lg-mobile text-3xl font-extrabold text-on-surface leading-tight tracking-tight mb-2">
          Chennai's Verified Craft & Emergency Dispatch
        </h2>
        <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
          Connect directly with certified local trade specialists for transparent visits, or trigger high-priority emergency SOS dispatches with sub-15 minute arrival targets.
        </p>

        {/* Prototype Transparency Notice */}
        <div className="mt-3.5 p-3 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-start gap-2 text-xs text-amber-900">
          <span className="material-symbols-outlined text-[16px] text-amber-600 flex-shrink-0 mt-0.5">info</span>
          <p className="leading-snug">
            <strong>Prototype Evaluation Notice:</strong> Mobile numbers and email IDs are simulated for testing convenience (no SMS OTP gateway required).
          </p>
        </div>
      </div>

      {/* Two Big Role Selection Cards */}
      <div className="space-y-4 my-2">
        {/* Option 1: Customer Card */}
        <div className="bg-surface-container-lowest rounded-3xl p-5 border-2 border-primary/20 shadow-md hover:border-primary transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                home
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              Doorstep OTP
            </span>
          </div>

          <h3 className="font-headline-md text-lg font-bold text-on-surface mb-1">
            I need a service (Customer)
          </h3>
          <p className="font-body-sm text-xs text-on-surface-variant mb-4 leading-relaxed">
            Find vetted electricians, plumbers, and carpenters near you. Transparent ₹149-₹199 inspection fees with 30-day rework warranty.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onSelectAuth('customer-login')}
              className="py-2.5 px-3 rounded-2xl bg-primary-container text-white text-xs font-bold shadow hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Log In</span>
              <span className="material-symbols-outlined text-[14px]">login</span>
            </button>
            <button
              onClick={() => onSelectAuth('customer-register')}
              className="py-2.5 px-3 rounded-2xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-all border border-outline-variant/30 flex items-center justify-center gap-1.5"
            >
              <span>Register</span>
              <span className="material-symbols-outlined text-[14px]">person_add</span>
            </button>
          </div>
        </div>

        {/* Option 2: Provider Card */}
        <div className="bg-surface-container-lowest rounded-3xl p-5 border-2 border-slate-navy/20 shadow-md hover:border-slate-navy transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-navy/10 flex items-center justify-center text-slate-navy">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                handyman
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
              Atomic Dispatch
            </span>
          </div>

          <h3 className="font-headline-md text-lg font-bold text-on-surface mb-1">
            I provide services (Provider)
          </h3>
          <p className="font-body-sm text-xs text-on-surface-variant mb-4 leading-relaxed">
            Join as a certified trade specialist. Receive neighborhood dispatches, real-time emergency SOS alerts, and earn transparent wages.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onSelectAuth('provider-login')}
              className="py-2.5 px-3 rounded-2xl bg-slate-navy text-white text-xs font-bold shadow hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Technician Log In</span>
              <span className="material-symbols-outlined text-[14px]">engineering</span>
            </button>
            <button
              onClick={() => onSelectAuth('provider-register')}
              className="py-2.5 px-3 rounded-2xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-all border border-outline-variant/30 flex items-center justify-center gap-1.5"
            >
              <span>Provider Register</span>
              <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Credentials Quick-Reference for Judges */}
      <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant mt-2">
        <div className="font-bold text-[11px] text-on-surface uppercase tracking-wider mb-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-primary">key</span>
          <span>Pre-Seeded Demo Credentials for Evaluation</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] mt-1 font-mono">
          <div className="p-1.5 rounded-lg bg-white border border-outline-variant/20">
            <span className="text-primary font-bold block">Customer:</span>
            <span>Mob: 9000000001</span><br/>
            <span>Pass: demo123</span>
          </div>
          <div className="p-1.5 rounded-lg bg-white border border-outline-variant/20">
            <span className="text-slate-navy font-bold block">Provider:</span>
            <span>Mob: 9000000002</span><br/>
            <span>Pass: demo123</span>
          </div>
        </div>
      </div>
    </div>
  );
};
