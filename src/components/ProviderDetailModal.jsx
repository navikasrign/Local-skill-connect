import React from 'react';
import { useApp } from '../context/AppContext';

export const ProviderDetailModal = () => {
  const {
    selectedProviderForDetail,
    setSelectedProviderForDetail,
    setSelectedProviderForBooking
  } = useApp();

  if (!selectedProviderForDetail) return null;

  const provider = selectedProviderForDetail;
  const feeDisplay = provider.currencyFee || `₹${provider.fee || provider.base_fee || 199}`;
  const specialties = provider.specialties || provider.trades || [provider.category];
  const tools = provider.toolsCarried || ['Diagnostic Kit', 'Safety Gear', 'Standard Field Toolset'];
  const bio = provider.bio || `${provider.name} is a certified trade specialist in Chennai, providing transparent diagnostic visits and guaranteed workmanship.`;
  const neighborhood = provider.neighborhood || 'Chennai';
  const distance = provider.distance || '1.2 km';
  const eta = provider.eta || '15 mins';
  const experience = provider.experience || `${provider.experience_years || 5}+ yrs exp`;
  const warranty = provider.warranty || '30-Day Free Rework Warranty';
  const warrantyDetails = provider.warrantyDetails || 'Free rework on the same diagnostic issue within 30 days of service.';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl p-5 border border-outline-variant/30 animate-in slide-in-from-bottom">
        {/* Top close bar */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>Govt. Udyam Registered Micro-Enterprise</span>
          </div>
          <button
            onClick={() => setSelectedProviderForDetail(null)}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Hero Info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-surface-container ring-2 ring-primary/20 shadow-md">
            <img
              src={provider.avatar || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80"}
              alt={provider.name}
              className="w-full h-full object-cover"
            />
            {provider.isOnline !== false && (
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-headline-md text-lg font-bold text-on-surface leading-tight">
              {provider.name}
            </h3>
            <p className="text-xs text-on-surface-variant font-medium">
              {provider.roleTitle} • {experience}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center text-amber-500 font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="ml-0.5 text-on-surface">{provider.rating || 5.0}</span>
                <span className="text-on-surface-variant font-normal ml-0.5">({provider.reviewsCount || 0} reviews)</span>
              </span>
              <span className="text-xs text-on-surface-variant">• {provider.completedJobs || 0}+ jobs</span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-outfit font-bold text-primary text-lg block">{feeDisplay}</span>
            <span className="text-[10px] text-on-surface-variant">Inspection</span>
          </div>
        </div>

        {/* Location & ETA */}
        <div className="flex items-center justify-between text-xs bg-surface-container-low p-2.5 rounded-2xl mb-4 border border-outline-variant/20">
          <span className="flex items-center gap-1 font-medium text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
            {neighborhood} ({distance})
          </span>
          <span className="flex items-center gap-1 text-primary font-bold">
            <span className="material-symbols-outlined text-[16px]">timer</span>
            Arrival ~ {eta}
          </span>
        </div>

        {/* Government Udyam Official Credential Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200/70 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-blue-700 flex items-center justify-center text-white text-[10px] font-bold">
                🇮🇳
              </div>
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">
                Ministry of MSME, Govt. of India
              </span>
            </div>
            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
              ACTIVE
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-on-surface-variant block">Udyam Registration No.</span>
              <span className="font-mono font-bold text-blue-950 text-xs">{provider.udyamId || 'UDYAM-TN-02-0048192'}</span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant block">Police Clearance</span>
              <span className="font-bold text-emerald-700 flex items-center gap-0.5 text-xs">
                <span className="material-symbols-outlined text-[14px]">security</span>
                Verified Clean
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <h4 className="font-bold text-xs text-on-surface mb-1">About the Artisan</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-3 rounded-2xl">
            {bio}
          </p>
        </div>

        {/* Specialties */}
        <div className="mb-4">
          <h4 className="font-bold text-xs text-on-surface mb-1.5">Specialized Services</h4>
          <div className="flex flex-wrap gap-1.5">
            {specialties.map((spec, i) => (
              <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface-container text-on-surface border border-outline-variant/30">
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Tools Carried */}
        <div className="mb-4">
          <h4 className="font-bold text-xs text-on-surface mb-1.5">Certified Field Equipment</h4>
          <div className="flex flex-wrap gap-1.5">
            {tools.map((tool, i) => (
              <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-primary">handyman</span>
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Warranty Guarantee */}
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 mb-5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-0.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
            <span>{warranty}</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-snug">
            {warrantyDetails}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`tel:${provider.phone || '+91 98401 23456'}`}
            className="h-12 px-4 rounded-full bg-surface-container flex items-center justify-center gap-1.5 text-on-surface font-bold text-xs hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Call</span>
          </a>

          <button
            onClick={() => {
              setSelectedProviderForDetail(null);
              setSelectedProviderForBooking(provider);
            }}
            className="flex-1 h-12 bg-primary text-white rounded-full font-label-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-transform hover:bg-blue-700"
          >
            <span>Book Visit ({feeDisplay})</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
