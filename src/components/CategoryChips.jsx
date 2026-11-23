import React from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/providersData';

export const CategoryChips = () => {
  const { selectedCategory, setSelectedCategory } = useApp();

  return (
    <section className="mb-4">
      <div className="flex items-center justify-between px-4 mb-2">
        <h2 className="font-title-md text-base font-bold text-on-surface">Categories</h2>
        <button 
          onClick={() => setSelectedCategory('all')}
          className="font-label-md text-xs text-primary font-semibold hover:underline"
        >
          View All ({CATEGORIES.length - 1} Trades)
        </button>
      </div>

      <div className="flex gap-2.5 overflow-x-auto px-4 no-scrollbar py-1">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-center justify-center min-w-[86px] p-2.5 rounded-2xl shadow-sm flex-shrink-0 transition-all active:scale-95 text-center border ${
                isActive
                  ? 'bg-primary-container text-white border-transparent shadow-md'
                  : 'bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:border-primary/40'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'bg-surface-container text-primary'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {cat.icon}
                </span>
              </div>
              <span className="font-label-lg text-xs font-bold truncate max-w-[76px]">
                {cat.name}
              </span>
              <span
                className={`font-body-sm text-[10px] mt-0.5 truncate ${
                  isActive ? 'text-white/80' : 'text-on-surface-variant'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
