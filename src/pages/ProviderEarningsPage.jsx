import React from 'react';
import { useApp } from '../context/AppContext';

export const ProviderEarningsPage = () => {
  const { currentProvider } = useApp();

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24">
      <div className="mb-4">
        <h1 className="font-headline-md text-xl font-bold text-on-surface">Earnings & Payouts</h1>
        <p className="font-body-sm text-xs text-on-surface-variant">
          Direct UPI settlement to bank account
        </p>
      </div>

      {/* Payout Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-primary to-blue-800 text-white shadow-lg mb-4">
        <span className="text-[11px] text-blue-100 uppercase tracking-wide block">
          Available Balance for Immediate Payout
        </span>
        <div className="flex items-baseline gap-1 my-1">
          <span className="font-outfit font-bold text-3xl">₹1,840.00</span>
          <span className="text-xs text-blue-200">INR</span>
        </div>
        <p className="text-[11px] text-blue-100 mb-3">
          Auto-transfers daily at 11:30 PM to HDFC Bank A/c (*** 9012)
        </p>
        <button
          onClick={() => alert("Payout request of ₹1,840.00 initiated via IMPS to linked UPI ID!")}
          className="w-full py-2.5 rounded-full bg-white text-primary font-bold text-xs shadow hover:bg-neutral-50 transition-colors"
        >
          Instant Withdraw to UPI (₹0 Transfer Fee)
        </button>
      </div>

      {/* Breakdown */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 space-y-3 text-xs mb-4">
        <h3 className="font-bold text-on-surface">Weekly Summary</h3>
        <div className="flex justify-between py-1 border-b border-outline-variant/20">
          <span className="text-on-surface-variant">Completed Work Orders</span>
          <span className="font-bold text-on-surface">18 Jobs</span>
        </div>
        <div className="flex justify-between py-1 border-b border-outline-variant/20">
          <span className="text-on-surface-variant">Gross Service Value</span>
          <span className="font-bold text-on-surface">₹4,260.00</span>
        </div>
        <div className="flex justify-between py-1 border-b border-outline-variant/20">
          <span className="text-on-surface-variant">Platform Commission (0% Promo)</span>
          <span className="font-bold text-emerald-600">₹0.00</span>
        </div>
        <div className="flex justify-between py-1 font-bold text-sm text-on-surface">
          <span>Net Take-Home Pay</span>
          <span className="text-primary font-outfit">₹4,260.00</span>
        </div>
      </div>
    </div>
  );
};
