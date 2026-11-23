import React from 'react';

export const ChennaiAssuranceBanner = () => {
  return (
    <section className="px-4 mb-6">
      <div className="bg-surface-container p-4 rounded-3xl flex items-center gap-3 border border-outline-variant/30">
        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
          <span className="material-symbols-outlined text-[22px]">location_city</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-label-lg text-xs font-bold text-on-surface">
            Chennai Neighborhood Network
          </h4>
          <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 leading-snug">
            Serving T. Nagar, Kodambakkam, Alwarpet, Mylapore, Adyar & Anna Nagar with verified local trade professionals.
          </p>
        </div>
      </div>
    </section>
  );
};
