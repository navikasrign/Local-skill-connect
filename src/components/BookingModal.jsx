import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const BookingModal = () => {
  const {
    authUser,
    selectedProviderForBooking,
    setSelectedProviderForBooking,
    createBooking,
    userLocation
  } = useApp();

  const navigate = useNavigate();

  const [bookingType, setBookingType] = useState('express');
  const [scheduledTime, setScheduledTime] = useState('Today (6:00 PM - 8:00 PM)');
  const [problemDescription, setProblemDescription] = useState('');
  const [customerAddress, setCustomerAddress] = useState('Door 14/2, Sivaganga Road, T. Nagar, Chennai - 600017');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedProviderForBooking) return null;

  const provider = selectedProviderForBooking;

  const handleConfirm = () => {
    setIsSubmitting(true);
    const custName = authUser?.name || "S. Anand";
    const custPhone = authUser?.mobile ? `+91 ${authUser.mobile}` : "+91 98840 99882";
    setTimeout(() => {
      createBooking({
        providerId: provider.id,
        providerName: provider.name,
        providerRole: provider.roleTitle,
        providerPhone: provider.phone,
        category: provider.category,
        customerName: custName,
        customerPhone: custPhone,
        customerEmail: authUser?.email,
        address: customerAddress,
        problem: problemDescription || `General ${provider.category} troubleshooting`,
        bookingType: bookingType === 'express' ? `Instant Express (${provider.eta})` : scheduledTime,
        fee: provider.fee,
        eta: provider.eta,
        warranty: provider.warranty,
        udyamId: provider.udyamId
      });
      setIsSubmitting(false);
      setSelectedProviderForBooking(null);
      navigate('/bookings');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl p-5 border border-outline-variant/30 animate-in slide-in-from-bottom"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div>
            <h3 className="font-headline-md text-lg font-bold text-on-surface">Confirm Service Visit</h3>
            <p className="font-body-sm text-xs text-on-surface-variant">Govt. Udyam Verified Dispatch</p>
          </div>
          <button
            onClick={() => setSelectedProviderForBooking(null)}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Provider Snapshot */}
        <div className="flex items-center gap-3 my-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30">
          <img src={provider.avatar} alt={provider.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-on-surface">{provider.name}</h4>
            <p className="text-xs text-on-surface-variant">{provider.roleTitle} • {provider.udyamId}</p>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">shield_check</span>
              {provider.warranty}
            </span>
          </div>
          <div className="text-right">
            <span className="font-bold text-primary text-base">{provider.currencyFee}</span>
            <span className="block text-[10px] text-on-surface-variant">Visit fee</span>
          </div>
        </div>

        {/* Arrival Option */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-on-surface mb-1.5">Select Arrival Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBookingType('express')}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                bookingType === 'express'
                  ? 'border-primary bg-primary-fixed/20 text-on-surface shadow-sm'
                  : 'border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant'
              }`}
            >
              <div className="flex items-center gap-1 font-bold text-xs text-primary">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Express Dispatch</span>
              </div>
              <p className="text-[11px] text-on-surface font-semibold mt-1">Arrives in {provider.eta}</p>
              <span className="text-[10px] text-emerald-600">Free fast track</span>
            </button>

            <button
              type="button"
              onClick={() => setBookingType('scheduled')}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                bookingType === 'scheduled'
                  ? 'border-primary bg-primary-fixed/20 text-on-surface shadow-sm'
                  : 'border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant'
              }`}
            >
              <div className="flex items-center gap-1 font-bold text-xs text-secondary">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span>Later Slot</span>
              </div>
              <p className="text-[11px] text-on-surface font-semibold mt-1">Pick a convenient time</p>
              <span className="text-[10px] text-on-surface-variant">Today / Tomorrow</span>
            </button>
          </div>

          {bookingType === 'scheduled' && (
            <div className="mt-2">
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Today (6:00 PM - 8:00 PM)">Today (6:00 PM - 8:00 PM)</option>
                <option value="Tomorrow Morning (9:00 AM - 11:00 AM)">Tomorrow Morning (9:00 AM - 11:00 AM)</option>
                <option value="Tomorrow Afternoon (2:00 PM - 4:00 PM)">Tomorrow Afternoon (2:00 PM - 4:00 PM)</option>
              </select>
            </div>
          )}
        </div>

        {/* Issue Description */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-on-surface mb-1">Issue Details (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Inverter tripping MCB, bathroom tap leaking..."
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Customer Information (Pre-filled from Account) */}
        <div className="mb-4 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-on-surface">Booked For:</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
              Verified Account
            </span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant text-[11px]">
            <span className="font-semibold text-on-surface">{authUser?.name || "S. Anand"}</span>
            <span>{authUser?.mobile ? `+91 ${authUser.mobile}` : "+91 98840 99882"}</span>
          </div>
        </div>

        {/* Location / Address */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-on-surface">Service Address</label>
            <span className="text-[10px] text-primary font-semibold">T. Nagar Hub</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">home</span>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="flex-1 bg-transparent text-xs text-on-surface focus:outline-none"
            />
          </div>
        </div>

        {/* Upfront Price Breakdown & Guarantee */}
        <div className="mb-4 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1.5 text-xs">
          <div className="flex justify-between text-on-surface-variant">
            <span>Inspection & Diagnosis Fee</span>
            <span className="font-semibold text-on-surface">{provider.currencyFee}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Platform & Safety Fee</span>
            <span className="text-emerald-600 font-semibold">FREE (Launch Offer)</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Govt. Udyam Guarantee</span>
            <span className="text-emerald-600 font-semibold">Included</span>
          </div>
          <div className="pt-1.5 border-t border-outline-variant/30 flex justify-between font-bold text-sm text-on-surface">
            <span>Pay on Arrival / Work Done</span>
            <span className="text-primary">{provider.currencyFee}</span>
          </div>
          <p className="text-[10px] text-emerald-800 bg-emerald-50 p-1.5 rounded-lg flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
            <span>₹0 Inspection Guarantee if technician cannot diagnose the issue.</span>
          </p>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full h-12 bg-primary text-white rounded-full font-label-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-transform disabled:opacity-60 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <span className="animate-pulse">Connecting to Technician...</span>
          ) : (
            <>
              <span>Confirm & Dispatch Now</span>
              <span className="material-symbols-outlined text-[18px]">send</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
