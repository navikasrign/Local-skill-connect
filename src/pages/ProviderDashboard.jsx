import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ProviderDashboard = () => {
  const {
    activeProviderId,
    setActiveProviderId,
    currentProvider,
    providers,
    providerOnline,
    setProviderOnline,
    providerRequests,
    setProviderRequests,
    bookings,
    updateJobStatusBackend,
    acceptJobViaWebSocket,
    triggerWebSocketSOS,
    demoMode,
    setDemoMode,
    wsConnected
  } = useApp();

  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [finalBillAmount, setFinalBillAmount] = useState(199);
  const [isUpdating, setIsUpdating] = useState(false);

  // Active job for this provider
  const ongoingJob = bookings.find(
    b => b.providerId === activeProviderId && b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
  );

  // Requirement 1: Step-by-step lifecycle actions
  const handleStartDriving = async () => {
    if (!ongoingJob) return;
    setIsUpdating(true);
    const res = await updateJobStatusBackend(ongoingJob.id, 'ON_THE_WAY');
    setIsUpdating(false);
    if (res.success) {
      setSuccessToast("Status updated: ON THE WAY (Driving to customer).");
      setTimeout(() => setSuccessToast(''), 4000);
    } else {
      alert(res.error);
    }
  };

  const handleMarkArrived = async () => {
    if (!ongoingJob) return;
    setIsUpdating(true);
    const res = await updateJobStatusBackend(ongoingJob.id, 'ARRIVED');
    setIsUpdating(false);
    if (res.success) {
      setSuccessToast("Status updated: ARRIVED at customer doorstep. Ask for start-of-service OTP.");
      setTimeout(() => setSuccessToast(''), 4000);
    } else {
      alert(res.error);
    }
  };

  // Requirement 2: Arrived asks for OTP. Only accept if it matches OTP shown to customer.
  const handleVerifyOtpAndStart = async () => {
    if (!ongoingJob) return;
    setOtpError('');
    setIsUpdating(true);
    const res = await updateJobStatusBackend(ongoingJob.id, 'IN_PROGRESS', enteredOtp.trim());
    setIsUpdating(false);
    if (res.success) {
      setEnteredOtp('');
      setSuccessToast("OTP Verified! Work started.");
      setTimeout(() => setSuccessToast(''), 4000);
    } else {
      setOtpError(res.error || "Incorrect OTP. Please enter the 4 digits shown on the customer screen.");
    }
  };

  // Requirement 3: Completed lets provider enter final amount (default to base fee)
  const handleOpenCompletion = () => {
    if (!ongoingJob) return;
    setFinalBillAmount(ongoingJob.final_amount || ongoingJob.fee || 199);
    setShowCompletionDialog(true);
  };

  const handleConfirmCompletion = async () => {
    if (!ongoingJob) return;
    setIsUpdating(true);
    const res = await updateJobStatusBackend(ongoingJob.id, 'COMPLETED', null, Number(finalBillAmount));
    setIsUpdating(false);
    setShowCompletionDialog(false);
    if (res.success) {
      setSuccessToast(`Job COMPLETED! Final Bill: ₹${finalBillAmount}. Payment collected.`);
      setTimeout(() => setSuccessToast(''), 5000);
    } else {
      alert(res.error);
    }
  };

  const handleAcceptRequest = (req) => {
    acceptJobViaWebSocket(req.id);
    setSuccessToast(`Accepting dispatch for ${req.id}...`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleDeclineRequest = (reqId) => {
    setProviderRequests(prev => prev.filter(r => r.id !== reqId));
  };

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl animate-in fade-in slide-in-from-top-2">
          {successToast}
        </div>
      )}

      {/* Demo Mode Bar (Requirement 12) */}
      <div className="flex items-center justify-between bg-surface-container-low px-3 py-1.5 rounded-2xl mb-3 border border-outline-variant/30 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-on-surface">
          <span className="material-symbols-outlined text-[16px] text-amber-500">science</span>
          <span>Testing Controls</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-on-surface-variant font-medium">Demo Mode</span>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              demoMode
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {demoMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Provider Header & Identity Switcher */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface">Active Profile:</span>
            <select
              value={activeProviderId}
              onChange={(e) => setActiveProviderId(e.target.value)}
              className="text-xs font-bold p-1 rounded-lg border border-outline-variant/40 bg-surface text-primary"
            >
              {providers.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full">
            PROVIDER MODE
          </span>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/20 bg-surface-container">
            <img src={currentProvider.avatar} alt={currentProvider.name} className="w-full h-full object-cover" />
            {providerOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-headline-md text-base font-bold text-on-surface truncate">
              {currentProvider.name}
            </h2>
            <p className="text-xs text-on-surface-variant">
              {currentProvider.roleTitle} • {currentProvider.neighborhood}
            </p>
            <p className="text-[11px] font-mono text-emerald-700 font-semibold mt-0.5">
              {currentProvider.udyamId}
            </p>
          </div>
        </div>

        {/* Online / Offline Duty Switch */}
        <div className="mt-3.5 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="font-bold text-xs text-on-surface block">
              {providerOnline ? '🟢 Available for Duty' : '⚪ Offline (Paused)'}
            </span>
            <span className="text-[11px] text-on-surface-variant">
              {providerOnline ? 'Receiving express dispatches in your radius' : 'Switch ON to accept customer calls'}
            </span>
          </div>
          <button
            onClick={() => setProviderOnline(!providerOnline)}
            className={`w-14 h-8 rounded-full p-1 transition-colors relative flex items-center ${
              providerOnline ? 'bg-emerald-500' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                providerOnline ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Metrics Row (Requirement 11: updated average rating and job count) */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 text-center shadow-sm">
          <span className="text-[10px] text-on-surface-variant font-medium block">Completed Jobs</span>
          <span className="font-outfit font-bold text-base text-primary">
            {currentProvider.completedJobs || currentProvider.completed_jobs || 1420}
          </span>
          <span className="text-[9px] text-emerald-600 block">Verified orders</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 text-center shadow-sm">
          <span className="text-[10px] text-on-surface-variant font-medium block">Rating Score</span>
          <span className="font-outfit font-bold text-base text-amber-500 flex items-center justify-center gap-0.5">
            <span>{currentProvider.rating}</span>
            <span className="material-symbols-outlined text-[14px]">star</span>
          </span>
          <span className="text-[9px] text-on-surface-variant block">
            {currentProvider.reviewsCount || currentProvider.reviews_count || 348} reviews
          </span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 text-center shadow-sm">
          <span className="text-[10px] text-on-surface-variant font-medium block">Acceptance</span>
          <span className="font-outfit font-bold text-base text-emerald-600">98%</span>
          <span className="text-[9px] text-on-surface-variant block">Top Tier</span>
        </div>
      </div>

      {/* Requirement 1: ACTIVE JOB CARD WITH STRICT STEP-BY-STEP PROGRESSION */}
      {ongoingJob ? (
        <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border-2 border-primary mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
              Active Job Lifecycle ({ongoingJob.id})
            </span>
            <span className="text-xs font-bold text-on-surface font-outfit">
              Base Fee: ₹{ongoingJob.fee}
            </span>
          </div>

          <div className="bg-surface-container-low p-3 rounded-2xl space-y-1 text-xs">
            <div className="flex justify-between font-bold text-on-surface">
              <span>Customer: {ongoingJob.customerName}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-fixed text-primary">
                {ongoingJob.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-on-surface-variant"><strong className="text-on-surface">Address:</strong> {ongoingJob.address}</p>
            <p className="text-on-surface-variant"><strong className="text-on-surface">Problem:</strong> {ongoingJob.problem}</p>
          </div>

          {/* Call & Navigation Helpers */}
          <div className="flex gap-2 text-xs">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(ongoingJob.address)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2 rounded-xl bg-surface-container text-on-surface font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">navigation</span>
              <span>Open Maps</span>
            </a>
            <a
              href={`tel:${ongoingJob.customerPhone}`}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span>Call Customer</span>
            </a>
          </div>

          {/* STEP 1: If ACCEPTED -> Single button: Start Driving (On the way) */}
          {ongoingJob.status === 'ACCEPTED' && (
            <div className="pt-2">
              <button
                onClick={handleStartDriving}
                disabled={isUpdating}
                className="w-full h-12 bg-primary text-white rounded-full font-label-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform disabled:opacity-50 hover:bg-blue-700"
              >
                <span className="material-symbols-outlined text-[18px]">directions_car</span>
                <span>Start Driving (On the way)</span>
              </button>
            </div>
          )}

          {/* STEP 2: If ON_THE_WAY -> Single button: Mark Arrived */}
          {ongoingJob.status === 'ON_THE_WAY' && (
            <div className="pt-2">
              <button
                onClick={handleMarkArrived}
                disabled={isUpdating}
                className="w-full h-12 bg-amber-600 text-white rounded-full font-label-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform disabled:opacity-50 hover:bg-amber-700"
              >
                <span className="material-symbols-outlined text-[18px]">pin_drop</span>
                <span>Mark Arrived (At Customer Doorstep)</span>
              </button>
            </div>
          )}

          {/* STEP 3: If ARRIVED -> Requirement 2: Must ask provider to enter customer's 4-digit start-of-service OTP */}
          {ongoingJob.status === 'ARRIVED' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <span className="material-symbols-outlined text-[18px] text-amber-700">lock</span>
                <span>Enter Customer's 4-Digit Start-of-Service OTP:</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Ask the customer for the code displayed on their screen to unlock and begin work.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="4 digits"
                  value={enteredOtp}
                  onChange={(e) => {
                    setEnteredOtp(e.target.value);
                    if (otpError) setOtpError('');
                  }}
                  className="w-28 p-2.5 rounded-xl text-center font-mono font-bold text-lg bg-white border border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={handleVerifyOtpAndStart}
                  disabled={enteredOtp.length !== 4 || isUpdating}
                  className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-xs shadow hover:bg-amber-700 disabled:opacity-50 transition-colors"
                >
                  {isUpdating ? 'Verifying...' : 'Verify OTP & Start Work'}
                </button>
              </div>

              {otpError && (
                <p className="text-xs text-error font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  <span>{otpError}</span>
                </p>
              )}

              {/* Demo Mode Shortcut only if Demo Mode toggle is ON */}
              {demoMode && (
                <div className="pt-1 flex items-center justify-between text-[10px] text-amber-900">
                  <span className="bg-amber-200/60 px-1.5 py-0.5 rounded font-bold">[DEMO MODE] Actual OTP: {ongoingJob.otp}</span>
                  <button
                    onClick={() => setEnteredOtp(ongoingJob.otp)}
                    className="text-primary font-bold hover:underline"
                  >
                    Auto-fill
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: If IN_PROGRESS -> Single button: Complete Job (Requirement 3: Enter final amount) */}
          {ongoingJob.status === 'IN_PROGRESS' && (
            <div className="pt-2">
              <button
                onClick={handleOpenCompletion}
                disabled={isUpdating}
                className="w-full h-12 bg-emerald-600 text-white rounded-full font-label-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform disabled:opacity-50 hover:bg-emerald-700"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Complete Job & Final Bill</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 mb-4 text-center">
          <span className="material-symbols-outlined text-[32px] text-emerald-500 mb-1">
            check_circle
          </span>
          <h3 className="font-bold text-xs text-on-surface">No ongoing active jobs</h3>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            Waiting for incoming dispatch requests in {currentProvider.neighborhood}.
          </p>
        </div>
      )}

      {/* Requirement 3: Final Amount Entry Dialog Modal */}
      {showCompletionDialog && ongoingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-outline-variant/30 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                Job Completion & Invoice
              </span>
              <h3 className="font-headline-md text-base font-bold text-on-surface">
                Enter Final Bill Amount
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Defaulted to standard inspection fee. Adjust if replacement parts or extra wiring work was performed.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30">
              <label className="text-xs font-bold text-on-surface block mb-1">
                Final Amount (INR ₹)
              </label>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-outline-variant">
                <span className="font-outfit font-bold text-lg text-primary">₹</span>
                <input
                  type="number"
                  value={finalBillAmount}
                  onChange={(e) => setFinalBillAmount(Number(e.target.value))}
                  className="w-full text-base font-outfit font-bold text-on-surface focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-on-surface-variant block mt-1">
                Base Fee: ₹{ongoingJob.fee}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCompletionDialog(false)}
                className="flex-1 py-2.5 rounded-full bg-surface-container text-xs font-semibold hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompletion}
                disabled={isUpdating || !finalBillAmount}
                className="flex-1 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700 disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Submit & Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Requests Queue */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-bold text-xs text-on-surface uppercase tracking-wide">
              Live Incoming Requests (WebSocket)
            </h3>
          </div>

          {/* Demo trigger SOS broadcast button only if demoMode is ON */}
          {demoMode && (
            <button
              onClick={() => {
                triggerWebSocketSOS({
                  customerName: "R. Meenakshi",
                  customerPhone: "+91 98409 11223",
                  category: currentProvider.category,
                  problem: `Emergency ${currentProvider.category === 'Plumber' ? 'Ceiling Pipe Burst' : 'Main Power Cut & Sparking'}`,
                  address: `Door 8B, North Usman Road, T. Nagar, Chennai - 600017`,
                  fee: currentProvider.fee
                });
              }}
              className="text-[10px] px-2.5 py-1 rounded-full bg-error/15 text-error font-bold hover:bg-error/25 flex items-center gap-1 transition-colors"
              title="Demo shortcut: Tap to test broadcast & atomic race condition"
            >
              <span className="material-symbols-outlined text-[13px]">bolt</span>
              <span>[Demo] SOS Broadcast</span>
            </button>
          )}
        </div>

        {providerRequests.length === 0 ? (
          <p className="text-xs text-on-surface-variant text-center py-4">
            WebSocket Radar scanning for new requests within 5 km...
          </p>
        ) : (
          <div className="space-y-3">
            {providerRequests.map((req) => {
              const isUrgent = req.isEmergency || req.id.startsWith('SOS-');
              return (
                <div
                  key={req.id}
                  className={`p-3 rounded-2xl border space-y-2 text-xs transition-all ${
                    isUrgent
                      ? 'bg-error/5 border-error/50 shadow-md ring-1 ring-error/20'
                      : 'bg-surface-container-low border-primary/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-on-surface">{req.customerName}</h4>
                        {isUrgent && (
                          <span className="px-1.5 py-0.2 rounded-full bg-error text-white text-[9px] font-extrabold uppercase animate-pulse">
                            SOS PRIORITY
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant">{req.location}</p>
                    </div>
                    <span className="font-bold text-primary font-outfit text-xs bg-white px-2 py-0.5 rounded-lg border border-primary/20">
                      {req.fee}
                    </span>
                  </div>

                  <p className="text-[11px] text-on-surface-variant bg-white p-2 rounded-xl">
                    <strong>Issue:</strong> {req.issue}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleAcceptRequest(req)}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5 ${
                        isUrgent
                          ? 'bg-error text-white hover:bg-red-700 font-extrabold'
                          : 'bg-primary text-white hover:bg-blue-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">touch_app</span>
                      <span>{isUrgent ? 'Accept Now (First to Tap Wins!)' : 'Accept & Dispatch'}</span>
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(req.id)}
                      className="px-3 py-2 bg-surface-container text-on-surface-variant rounded-xl text-xs hover:bg-surface-container-high"
                    >
                      Pass
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official Government Udyam Badge Certificate */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🇮🇳</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
              Ministry of Micro, Small & Medium Enterprises
            </span>
          </div>
          <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
            VERIFIED
          </span>
        </div>

        <h4 className="font-outfit font-bold text-sm text-white">
          Udyam Registration Certificate
        </h4>
        <p className="text-xs font-mono text-blue-200 mt-0.5">
          {currentProvider.udyamId}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/20 text-[11px]">
          <div>
            <span className="text-white/60 block text-[9px]">Enterprise Name</span>
            <span className="font-semibold text-white truncate block">{currentProvider.name} Trade Services</span>
          </div>
          <div>
            <span className="text-white/60 block text-[9px]">Location Registry</span>
            <span className="font-semibold text-white">DIC Chennai North / South</span>
          </div>
        </div>
      </div>
    </div>
  );
};
