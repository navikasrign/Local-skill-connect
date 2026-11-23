import React from 'react';
import { useApp } from '../context/AppContext';

export const LiveRadarPill = () => {
  const { userLocation } = useApp();
  const area = userLocation.split(',')[0];

  return (
    <div className="mt-2 flex items-center justify-between px-1">
      <div className="flex items-center gap-1.5 text-on-surface-variant">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-label-md text-xs text-on-surface-variant">
          Within 5 km of {area} • <strong className="text-on-surface font-semibold">Express Available</strong>
        </span>
      </div>
      <div className="flex items-center gap-1 text-primary text-xs font-semibold">
        <span>Live radar</span>
        <span className="material-symbols-outlined text-[14px] animate-pulse">sensors</span>
      </div>
    </div>
  );
};
