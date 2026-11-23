import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CHENNAI_PROVIDERS } from '../data/providersData';

export const SOSPage = () => {
  const { triggerWebSocketSOS, userLocation } = useApp();
  const navigate = useNavigate();

  const [emergencyCategory, setEmergencyCategory] = useState('electric');
  const [dispatching, setDispatching] = useState(false);

  const handleTriggerSOS = (type) => {
    setDispatching(true);
    const category = type === 'plumb' ? 'Plumber' : 'Electrician';
    const problem = type === 'plumb' 
      ? 'Severe Main Water Pipe Burst & Flooding' 
      : 'Main Electrical Spark & MCB Tripping Fire Threat';

    // Broadcast through WebSocket to ALL connected providers!
    triggerWebSocketSOS({
      customerName: "S. Anand",
      customerPhone: "+91 98840 99882",
      category,
      problem,
      address: `Door 14/2, Sivaganga Road, ${userLocation} - 600017`,
      fee: type === 'plumb' ? 149 : 199
    });

    setTimeout(() => {
      setDispatching(false);
      navigate('/bookings');
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24">
      {/* Top Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-error via-[#b81a1a] to-[#7f0a0a] text-white shadow-xl mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span className="font-extrabold text-[11px] uppercase tracking-wider">
              Emergency Dispatch Network
            </span>
          </div>
          <span className="text-xs font-semibold text-white/90">
            {userLocation.split(',')[0]} Sector
          </span>
        </div>

        <h1 className="font-headline-lg-mobile text-2xl font-bold mb-1">
          High-Priority SOS Mode
        </h1>
        <p className="text-xs text-white/90 leading-relaxed mb-4">
          Direct automated siren alert sent to closest certified trade specialists. Pre-assigned arrival target: <strong>12 to 15 minutes</strong>.
        </p>

        {/* 1-Tap Trigger Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => handleTriggerSOS('electric')}
            disabled={dispatching}
            className="w-full h-12 bg-white text-error font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-transform hover:bg-neutral-50 disabled:opacity-70"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
            <span>Dispatch Emergency Electrician Now</span>
          </button>

          <button
            onClick={() => handleTriggerSOS('plumb')}
            disabled={dispatching}
            className="w-full h-12 bg-white/15 text-white border border-white/40 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 active:scale-98 transition-transform hover:bg-white/25 disabled:opacity-70"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              water_drop
            </span>
            <span>Dispatch Emergency Plumber Now</span>
          </button>
        </div>
      </div>

      {/* Immediate Life Safety Checklist */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 mb-4">
        <h3 className="font-bold text-xs text-on-surface mb-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-error">warning</span>
          Crucial Safety Measures (Take immediately):
        </h3>
        <div className="space-y-2 text-xs text-on-surface-variant">
          <div className="p-2.5 rounded-xl bg-surface-container-low flex items-start gap-2">
            <span className="font-bold text-error">1.</span>
            <p><strong>Power Cut:</strong> Flip down the large black/red Main Switch or MCB breaker located on your distribution box.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-low flex items-start gap-2">
            <span className="font-bold text-primary">2.</span>
            <p><strong>Water Cut:</strong> Turn the terrace ball valve or main inlet pipe handle 90 degrees clockwise to stop pressure.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-low flex items-start gap-2">
            <span className="font-bold text-amber-600">3.</span>
            <p><strong>Flooded Floor:</strong> Never walk barefoot into standing water near submerged plugs or inverter batteries.</p>
          </div>
        </div>
      </div>

      {/* Chennai Government Emergency Helplines */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30">
        <h3 className="font-bold text-xs text-on-surface mb-3 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-primary">call</span>
          Chennai Official Helplines (Toll-Free):
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <a
            href="tel:1912"
            className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-center text-center hover:bg-surface-container transition-colors"
          >
            <span className="font-bold text-on-surface text-sm">1912</span>
            <span className="text-[10px] text-on-surface-variant mt-0.5">TNEB Power Helpline</span>
          </a>

          <a
            href="tel:04445674567"
            className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-center text-center hover:bg-surface-container transition-colors"
          >
            <span className="font-bold text-on-surface text-sm">044-45674567</span>
            <span className="text-[10px] text-on-surface-variant mt-0.5">Chennai Metro Water</span>
          </a>

          <a
            href="tel:101"
            className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-center text-center hover:bg-surface-container transition-colors"
          >
            <span className="font-bold text-on-surface text-sm">101</span>
            <span className="text-[10px] text-on-surface-variant mt-0.5">Fire & Rescue</span>
          </a>

          <a
            href="tel:112"
            className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-center text-center hover:bg-surface-container transition-colors"
          >
            <span className="font-bold text-on-surface text-sm">112</span>
            <span className="text-[10px] text-on-surface-variant mt-0.5">National Emergency</span>
          </a>
        </div>
      </div>
    </div>
  );
};
