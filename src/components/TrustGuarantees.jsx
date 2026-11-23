import React from 'react';

export const TrustGuarantees = () => {
  return (
    <section className="px-4 mb-4">
      <div className="bg-surface-container-low rounded-2xl p-3 flex items-center justify-around gap-2 text-center text-on-surface-variant shadow-sm border border-outline-variant/30">
        <div className="flex flex-col items-center flex-1">
          <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified
          </span>
          <span className="font-label-md text-xs font-bold text-on-surface mt-0.5">
            Govt. Udyam
          </span>
          <span className="font-body-sm text-[10px] text-on-surface-variant">
            100% Registered
          </span>
        </div>

        <div className="h-7 w-[1px] bg-outline-variant/50"></div>

        <div className="flex flex-col items-center flex-1">
          <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield_person
          </span>
          <span className="font-label-md text-xs font-bold text-on-surface mt-0.5">
            BG Verified
          </span>
          <span className="font-body-sm text-[10px] text-on-surface-variant">
            Police Checked
          </span>
        </div>

        <div className="h-7 w-[1px] bg-outline-variant/50"></div>

        <div className="flex flex-col items-center flex-1">
          <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            handshake
          </span>
          <span className="font-label-md text-xs font-bold text-on-surface mt-0.5">
            ₹0 Guarantee
          </span>
          <span className="font-body-sm text-[10px] text-on-surface-variant">
            If Unresolved
          </span>
        </div>
      </div>
    </section>
  );
};
