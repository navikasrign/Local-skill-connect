import React from 'react';
import { useApp } from '../context/AppContext';

export const ProviderCard = ({ provider }) => {
  const { setSelectedProviderForDetail, setSelectedProviderForBooking } = useApp();

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-4 mb-3.5 shadow-sm border border-outline-variant/30 transition-all hover:shadow-md">
      {/* Top Header: Avatar, Name, Rate */}
      <div 
        className="flex items-start gap-3 mb-2.5 cursor-pointer"
        onClick={() => setSelectedProviderForDetail(provider)}
      >
        <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-surface-container ring-2 ring-primary/10">
          <img
            src={provider.avatar}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
          {provider.isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-title-md text-base font-bold text-on-surface truncate">
              {provider.name}
            </h3>
            <span className="font-currency-md text-base font-bold text-primary flex-shrink-0">
              {provider.currencyFee}
            </span>
          </div>

          <p className="font-body-sm text-xs text-on-surface-variant truncate">
            {provider.roleTitle} • {provider.experience}
          </p>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Udyam Badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200/50">
              <span className="material-symbols-outlined text-[13px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified_user
              </span>
              Udyam Verified
            </span>

            {/* Rating */}
            <span className="inline-flex items-center gap-0.5 font-label-md text-xs text-tertiary">
              <span className="material-symbols-outlined text-[15px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <strong className="font-bold text-on-surface">{provider.rating}</strong>
              <span className="text-on-surface-variant font-normal">({provider.reviewsCount})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Distance and ETA pill */}
      <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-xs bg-surface-container-low px-3 py-1.5 rounded-xl mb-2.5">
        <span className="flex items-center gap-1 truncate text-on-surface">
          <span className="material-symbols-outlined text-[16px] text-secondary">
            distance
          </span>
          {provider.distance}
        </span>
        <span className="flex items-center gap-1 font-bold text-primary flex-shrink-0">
          <span className="material-symbols-outlined text-[16px]">
            timer
          </span>
          Arrives in {provider.eta}
        </span>
      </div>

      {/* Specialties */}
      <p className="font-body-sm text-xs text-on-surface-variant mb-3 line-clamp-1">
        <span className="font-semibold text-on-surface">Specialties:</span>{' '}
        {provider.specialties.join(', ')}
      </p>

      {/* Warranty Pill */}
      <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg mb-3">
        <span className="material-symbols-outlined text-[14px]">verified</span>
        <span className="font-medium truncate">{provider.warranty}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a
          href={`tel:${provider.phone}`}
          aria-label={`Call ${provider.name}`}
          className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-secondary-container transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">call</span>
        </a>

        <button
          onClick={() => setSelectedProviderForDetail(provider)}
          className="h-11 px-3 rounded-full bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors"
        >
          View Profile
        </button>

        <button
          onClick={() => setSelectedProviderForBooking(provider)}
          className="flex-1 h-11 bg-primary text-white rounded-full font-label-lg text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-transform font-bold hover:bg-blue-700"
          type="button"
        >
          <span>Book Visit</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
