import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const SOSModal = () => {
  const {
    authUser,
    emergencyModalOpen,
    setEmergencyModalOpen,
    triggerWebSocketSOS,
    broadcastingSosJob,
    userLocation
  } = useApp();
  const navigate = useNavigate();

  const [emergencyType, setEmergencyType] = useState('spark');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  if (!emergencyModalOpen) return null;

  const handleInstantSOS = () => {
    setIsBroadcasting(true);
    const category = emergencyType === 'burst' ? 'Plumber' : 'Electrician';
    const problem = emergencyType === 'burst' 
      ? 'Severe Water Pipe Burst & Flooding' 
      : 'Main Wire Sparking & MCB Tripping Fire Threat';

    // Broadcast through WebSocket to ALL connected providers!
    triggerWebSocketSOS({
      customerName: authUser?.name || "S. Anand",
      customerPhone: authUser?.mobile ? `+91 ${authUser.mobile}` : "+91 98840 99882",
      category,
      problem,
      address: `Door 14/2, Sivaganga Road, ${userLocation} - 600017`,
      fee: category === 'Plumber' ? 149 : 199
    });

    // Also close modal after short delay and take user to bookings / live radar
    setTimeout(() => {
      setEmergencyModalOpen(false);
      navigate('/bookings');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl p-5 border-2 border-error/30 animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-error animate-ping" />
            <h3 className="font-headline-md text-lg font-bold text-error">
              Emergency SOS Dispatch
            </h3>
          </div>
          <button
            onClick={() => setEmergencyModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Priority Dispatch Banner */}
        <div className="p-3 rounded-2xl bg-error/10 border border-error/30 mb-4 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-error mb-0.5">
            <span className="material-symbols-outlined text-[18px]">sensors</span>
            <span>Real-time WebSocket Siren Active</span>
          </div>
          <p className="text-on-surface-variant text-[11px] leading-relaxed">
            Broadcasts siren alert to all connected provider terminals in {userLocation.split(',')[0]}. First provider to accept is instantly dispatched with a <strong>12-15 min arrival guarantee</strong>.
          </p>
        </div>

        {/* Incident Type Selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-on-surface mb-2">Select Immediate Hazard</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setEmergencyType('spark')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                emergencyType === 'spark'
                  ? 'border-error bg-error/5 text-error font-bold shadow-sm'
                  : 'border-outline-variant/40 bg-surface-container-lowest text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-amber-500 block mb-1">bolt</span>
              <span className="text-xs block">Sparks / Burning Wire</span>
              <span className="text-[10px] text-on-surface-variant font-normal">Tripping MCB or smell</span>
            </button>

            <button
              onClick={() => setEmergencyType('burst')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                emergencyType === 'burst'
                  ? 'border-error bg-error/5 text-error font-bold shadow-sm'
                  : 'border-outline-variant/40 bg-surface-container-lowest text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-blue-500 block mb-1">water_damage</span>
              <span className="text-xs block">Water Pipe Burst</span>
              <span className="text-[10px] text-on-surface-variant font-normal">Flooding / continuous leak</span>
            </button>
          </div>
        </div>

        {/* First Aid Safety Protocol Checklist */}
        <div className="mb-5 p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20">
          <h4 className="font-bold text-xs text-on-surface mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary">health_and_safety</span>
            Safety Checklist while waiting:
          </h4>
          <ul className="space-y-1.5 text-[11px] text-on-surface-variant">
            <li className="flex items-start gap-1.5">
              <span className="text-error font-bold">•</span>
              <span><strong>Turn OFF Main MCB breaker</strong> located near entrance door.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-primary font-bold">•</span>
              <span><strong>Shut off terrace water valve</strong> immediately for pipe burst.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span>Keep children and pets away from damp and electrically charged areas.</span>
            </li>
          </ul>
        </div>

        {/* SOS Action Button */}
        <button
          onClick={handleInstantSOS}
          disabled={isBroadcasting}
          className="w-full h-12 bg-gradient-to-r from-error to-[#b81d1d] text-white rounded-full font-label-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xl active:scale-98 transition-transform disabled:opacity-60 hover:opacity-95"
        >
          {isBroadcasting ? (
            <span className="animate-pulse flex items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
              <span>Broadcasting Siren to All Providers...</span>
            </span>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">e911_emergency</span>
              <span>1-Tap Immediate Dispatch (Broadcast to All)</span>
            </>
          )}
        </button>

        <div className="text-center mt-2.5">
          <a
            href="tel:1800-425-2424"
            className="text-[11px] text-on-surface-variant hover:text-error inline-flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[14px]">call</span>
            <span>Or Call 24/7 Chennai Emergency Line: 1800-425-2424</span>
          </a>
        </div>
      </div>
    </div>
  );
};
