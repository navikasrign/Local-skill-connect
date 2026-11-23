import React from 'react';
import { useApp } from '../context/AppContext';

export const ProviderJobsPage = () => {
  const { bookings, activeProviderId, currentProvider } = useApp();

  const providerBookings = bookings.filter(b => b.providerId === activeProviderId);

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24">
      <div className="mb-4">
        <h1 className="font-headline-md text-xl font-bold text-on-surface">Jobs Log</h1>
        <p className="font-body-sm text-xs text-on-surface-variant">
          Duty history for {currentProvider.name}
        </p>
      </div>

      <div className="space-y-3">
        {providerBookings.length === 0 ? (
          <div className="p-8 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-[36px] text-outline mb-2">assignment_late</span>
            <p className="text-xs text-on-surface-variant">No jobs on record yet for this provider.</p>
          </div>
        ) : (
          providerBookings.map((b) => (
            <div key={b.id} className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-on-surface">{b.customerName}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {b.status.toUpperCase()}
                </span>
              </div>
              <p className="text-on-surface-variant"><strong>Location:</strong> {b.address}</p>
              <p className="text-on-surface-variant"><strong>Task:</strong> {b.problem}</p>
              <div className="flex justify-between items-center pt-1 border-t border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant">{b.createdAt}</span>
                <span className="font-bold text-primary text-sm font-outfit">₹{b.fee} Paid</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
