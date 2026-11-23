import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const BookingsPage = () => {
  const {
    bookings,
    updateJobStatusBackend,
    broadcastingSosJob,
    setRatingModalJob,
    demoMode,
    setDemoMode
  } = useApp();

  const [activeTab, setActiveTab] = useState('active');

  const activeBookings = bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  const pastBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24">
      {/* Page Title & Demo Toggle */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h1 className="font-headline-md text-xl font-bold text-on-surface">Bookings & Live Radar</h1>
          <p className="font-body-sm text-xs text-on-surface-variant">
            Live lifecycle updates from Chennai trade specialists
          </p>
        </div>

        {/* Requirement 12: Clearly labelled Demo Mode toggle */}
        <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-full border border-outline-variant/30 text-xs">
          <span className="text-[10px] text-on-surface-variant font-medium">Demo Mode</span>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              demoMode ? 'bg-amber-500 text-white shadow-sm' : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {demoMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-container rounded-full p-1 mb-4 border border-outline-variant/30">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'active'
              ? 'bg-primary-container text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Active Bookings</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface'
          }`}>
            {activeBookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'past'
              ? 'bg-primary-container text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>History & Receipts</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'past' ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface'
          }`}>
            {pastBookings.length}
          </span>
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {/* Live Broadcasting SOS Card if waiting for provider */}
          {broadcastingSosJob && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-xl border border-white/30 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Siren Broadcasting Live</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-white/90">
                  {broadcastingSosJob.id}
                </span>
              </div>
              <h3 className="font-bold text-sm text-white mb-0.5">
                {broadcastingSosJob.problem}
              </h3>
              <p className="text-[11px] text-white/90 mb-3">
                Broadcasting to all verified {broadcastingSosJob.category}s across Chennai. First technician to tap Accept will be locked in!
              </p>
              <div className="p-2.5 rounded-xl bg-white/10 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">sensors</span>
                  <span>Live Dispatch Radar Active</span>
                </span>
                <span className="font-bold">Awaiting Provider Accept...</span>
              </div>
            </div>
          )}

          {activeBookings.length === 0 && !broadcastingSosJob ? (
            <div className="p-8 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
              <span className="material-symbols-outlined text-[40px] text-outline mb-2">
                calendar_today
              </span>
              <h3 className="font-bold text-sm text-on-surface">No Active Bookings</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Explore local Chennai experts and book an express visit in minutes.
              </p>
            </div>
          ) : (
            activeBookings.map((b) => {
              const currentStatus = (b.status || 'ACCEPTED').toUpperCase();
              return (
                <div
                  key={b.id}
                  className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 space-y-3.5"
                >
                  {/* Status Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="font-bold text-xs text-primary uppercase tracking-wide">
                        {currentStatus === 'ACCEPTED' ? 'Technician Assigned' :
                         currentStatus === 'ON_THE_WAY' ? 'En Route to Location' :
                         currentStatus === 'ARRIVED' ? 'Technician Arrived' :
                         currentStatus === 'IN_PROGRESS' ? 'Service In Progress' : currentStatus}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-on-surface-variant">
                      {b.id}
                    </span>
                  </div>

                  {/* Realtime Status Banner */}
                  <div className={`p-3 rounded-2xl flex items-center justify-between ${
                    currentStatus === 'ARRIVED'
                      ? 'bg-amber-100 border border-amber-300 text-amber-950'
                      : currentStatus === 'IN_PROGRESS'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                      : 'bg-primary-fixed/25 border border-primary/20 text-on-surface'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                        currentStatus === 'ARRIVED' ? 'bg-amber-600' :
                        currentStatus === 'IN_PROGRESS' ? 'bg-emerald-600' : 'bg-primary'
                      }`}>
                        <span className="material-symbols-outlined text-[20px] animate-pulse">
                          {currentStatus === 'ARRIVED' ? 'doorbell' :
                           currentStatus === 'IN_PROGRESS' ? 'handyman' : 'navigation'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase block opacity-80">
                          {currentStatus === 'ARRIVED' ? 'Doorstep Alert' :
                           currentStatus === 'IN_PROGRESS' ? 'Active Work' : 'Live Status'}
                        </span>
                        <span className="font-outfit font-bold text-sm">
                          {currentStatus === 'ARRIVED' ? 'Technician is at your doorstep!' :
                           currentStatus === 'IN_PROGRESS' ? 'Repair underway by technician' :
                           currentStatus === 'ON_THE_WAY' ? `Driving to you (${b.etaRemaining || '12 mins'})` : 'Dispatched'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-on-surface-variant block">Bill Amount</span>
                      <span className="font-bold text-primary text-sm font-outfit">
                        ₹{b.final_amount || b.fee}
                      </span>
                    </div>
                  </div>

                  {/* Requirement 8: 4-Step Visual Stepper */}
                  <div className="py-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-on-surface-variant px-1">
                      {/* Step 1: Assigned */}
                      <div className="flex flex-col items-center">
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] mb-1">✓</span>
                        <span>Assigned</span>
                      </div>
                      <div className={`flex-1 h-[2px] mx-1 ${currentStatus !== 'ACCEPTED' ? 'bg-primary' : 'bg-outline-variant/40'}`}></div>

                      {/* Step 2: On The Way */}
                      <div className="flex flex-col items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mb-1 ${
                          currentStatus === 'ON_THE_WAY' ? 'bg-primary text-white animate-pulse' :
                          currentStatus === 'ARRIVED' || currentStatus === 'IN_PROGRESS' ? 'bg-primary text-white' : 'bg-surface-container'
                        }`}>
                          {currentStatus === 'ARRIVED' || currentStatus === 'IN_PROGRESS' ? '✓' : '2'}
                        </span>
                        <span>On Way</span>
                      </div>
                      <div className={`flex-1 h-[2px] mx-1 ${currentStatus === 'ARRIVED' || currentStatus === 'IN_PROGRESS' ? 'bg-primary' : 'bg-outline-variant/40'}`}></div>

                      {/* Step 3: Arrived */}
                      <div className="flex flex-col items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mb-1 ${
                          currentStatus === 'ARRIVED' ? 'bg-amber-600 text-white animate-pulse' :
                          currentStatus === 'IN_PROGRESS' ? 'bg-primary text-white' : 'bg-surface-container'
                        }`}>
                          {currentStatus === 'IN_PROGRESS' ? '✓' : '3'}
                        </span>
                        <span>Arrived</span>
                      </div>
                      <div className={`flex-1 h-[2px] mx-1 ${currentStatus === 'IN_PROGRESS' ? 'bg-primary' : 'bg-outline-variant/40'}`}></div>

                      {/* Step 4: In Progress */}
                      <div className="flex flex-col items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mb-1 ${
                          currentStatus === 'IN_PROGRESS' ? 'bg-emerald-600 text-white animate-pulse' : 'bg-surface-container'
                        }`}>
                          4
                        </span>
                        <span>Working</span>
                      </div>
                    </div>
                  </div>

                  {/* Start-of-Service OTP Banner */}
                  <div className={`p-3 rounded-2xl flex items-center justify-between border ${
                    currentStatus === 'ARRIVED'
                      ? 'bg-amber-50 border-2 border-amber-400 shadow-md ring-2 ring-amber-200 animate-pulse'
                      : 'bg-amber-50/70 border-amber-200'
                  }`}>
                    <div>
                      <span className="text-[10px] font-bold text-amber-900 uppercase block">
                        {currentStatus === 'ARRIVED' ? '👉 Share with Technician Now' : 'Start-of-Service OTP'}
                      </span>
                      <span className="text-xs text-amber-800">
                        {currentStatus === 'IN_PROGRESS' ? 'Verified on arrival' : 'Technician will ask for this code:'}
                      </span>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-xl border border-amber-300 shadow-sm">
                      <span className="font-mono font-bold text-lg text-amber-950 tracking-widest">{b.otp}</span>
                    </div>
                  </div>

                  {/* Technician Snapshot */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container">
                        <span className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary-fixed/40">
                          {b.providerName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-on-surface">{b.providerName}</h4>
                        <p className="text-[10px] text-on-surface-variant font-mono">{b.udyamId}</p>
                      </div>
                    </div>

                    <a
                      href={`tel:${b.providerPhone}`}
                      className="h-9 px-3 rounded-full bg-primary-container text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      <span>Call</span>
                    </a>
                  </div>

                  {/* Issue & Address Details */}
                  <div className="text-xs space-y-1 text-on-surface-variant bg-surface-container-low p-3 rounded-2xl">
                    <p><strong className="text-on-surface">Issue:</strong> {b.problem}</p>
                    <p><strong className="text-on-surface">Address:</strong> {b.address}</p>
                    <p><strong className="text-on-surface">Warranty:</strong> {b.warranty}</p>
                  </div>

                  {/* Requirement 12: Shortcut ONLY visible when Demo Mode is ON */}
                  {demoMode && (
                    <div className="pt-2 border-t border-outline-variant/20 bg-amber-50/50 p-2.5 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-900">
                        <span>[DEMO MODE SHORTCUTS]</span>
                        <span>State: {currentStatus}</span>
                      </div>
                      <div className="flex gap-2">
                        {currentStatus === 'ON_THE_WAY' && (
                          <button
                            onClick={() => updateJobStatusBackend(b.id, 'ARRIVED')}
                            className="flex-1 py-1.5 rounded-xl bg-amber-500 text-white text-[11px] font-bold shadow-sm"
                          >
                            Simulate: Tech Arrived
                          </button>
                        )}
                        {currentStatus === 'ARRIVED' && (
                          <button
                            onClick={() => updateJobStatusBackend(b.id, 'IN_PROGRESS', b.otp)}
                            className="flex-1 py-1.5 rounded-xl bg-amber-600 text-white text-[11px] font-bold shadow-sm"
                          >
                            Simulate: Verify OTP
                          </button>
                        )}
                        {currentStatus === 'IN_PROGRESS' && (
                          <button
                            onClick={() => updateJobStatusBackend(b.id, 'COMPLETED', null, b.final_amount || b.fee)}
                            className="flex-1 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold shadow-sm"
                          >
                            Simulate: Job Completed
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Past Tab Content (Requirements 9 & 10: History with Review button or Submitted Rating) */}
      {activeTab === 'past' && (
        <div className="space-y-3">
          {pastBookings.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
              <span className="material-symbols-outlined text-[36px] text-outline mb-2">history</span>
              <p className="text-xs text-on-surface-variant">No completed bookings yet.</p>
            </div>
          ) : (
            pastBookings.map((b) => (
              <div
                key={b.id}
                className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-on-surface">{b.problem || b.service}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>{b.providerName} • {b.category}</span>
                  <span className="font-bold text-on-surface font-outfit text-sm">
                    ₹{b.final_amount || b.fee} Paid
                  </span>
                </div>

                {/* Rating Card or Rate CTA */}
                {b.status === 'COMPLETED' && (
                  <div className="pt-1">
                    {b.reviewed ? (
                      <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              className={`material-symbols-outlined text-[16px] ${
                                s <= (b.review?.stars || 5) ? 'text-amber-500' : 'text-outline/30'
                              }`}
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                          ))}
                          <span className="font-bold text-amber-900 ml-1">
                            {b.review?.stars || 5}.0 Verified Review
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                          SUBMITTED
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRatingModalJob(b)}
                        className="w-full py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">rate_review</span>
                        <span>Rate Your Experience (1-5 Stars)</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200/50">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    {b.warranty || '30-Day Free Rework Warranty'}
                  </span>
                  <span className="font-bold text-[10px]">COVERED</span>
                </div>

                <div className="text-[10px] text-on-surface-variant flex justify-between pt-1">
                  <span>Completed on {b.completed_at || b.createdAt}</span>
                  <span className="text-primary font-semibold cursor-pointer hover:underline">
                    Download Tax Invoice (PDF)
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
