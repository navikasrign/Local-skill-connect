import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CHENNAI_PROVIDERS } from '../data/providersData';
import { CategoryChips } from '../components/CategoryChips';
import { LiveRadarPill } from '../components/LiveRadarPill';
import { EmergencySOSBanner } from '../components/EmergencySOSBanner';
import { TrustGuarantees } from '../components/TrustGuarantees';
import { ProviderCard } from '../components/ProviderCard';
import { ChennaiAssuranceBanner } from '../components/ChennaiAssuranceBanner';

export const CustomerHome = () => {
  const {
    providers,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    userLocation
  } = useApp();

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [maxPrice, setMaxPrice] = useState(350);
  const [minRating, setMinRating] = useState(0);

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    return (providers || CHENNAI_PROVIDERS).filter((provider) => {
      // Category filter
      if (selectedCategory !== 'all' && provider.category !== selectedCategory) {
        return false;
      }
      // Price filter
      if (provider.fee > maxPrice) {
        return false;
      }
      // Rating filter
      if (provider.rating < minRating) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = provider.name.toLowerCase().includes(query);
        const matchesCategory = provider.category.toLowerCase().includes(query);
        const matchesRole = (provider.roleTitle || '').toLowerCase().includes(query);
        const specialties = provider.specialties || provider.trades || [provider.category];
        const matchesSpecialties = specialties.some(s => s.toLowerCase().includes(query));
        const matchesArea = (provider.neighborhood || 'Chennai').toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesRole && !matchesSpecialties && !matchesArea) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 5.0) - (a.rating || 5.0);
      if (sortBy === 'price_low') return (a.fee || 199) - (b.fee || 199);
      const distA = a.numDistance !== undefined ? a.numDistance : 1.5;
      const distB = b.numDistance !== undefined ? b.numDistance : 1.5;
      return distA - distB; // nearest
    });
  }, [providers, selectedCategory, searchQuery, sortBy, maxPrice, minRating]);

  const areaName = userLocation.split(',')[0];

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Search & Location Section */}
      <section className="px-4 pt-2 pb-3">
        <div className="relative flex items-center shadow-sm rounded-full bg-surface-container-lowest border border-outline-variant/30">
          <span className="material-symbols-outlined text-outline ml-4 mr-2 text-[22px] flex-shrink-0">
            search
          </span>
          <input
            className="w-full bg-transparent py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none"
            placeholder="Search 'fan wiring repair', 'pipe leakage'..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mr-2 text-on-surface-variant hover:text-on-surface text-xs font-semibold"
            >
              Clear
            </button>
          )}
          <button
            aria-label="Filter"
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className="m-1.5 w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-secondary-container transition-colors flex-shrink-0"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </div>

        {/* Live Radius Micro-Pill */}
        <LiveRadarPill />
      </section>

      {/* Filter Options Drawer if open */}
      {showFilterDrawer && (
        <section className="px-4 mb-4 animate-in slide-in-from-top duration-200">
          <div className="p-4 rounded-3xl bg-surface-container-lowest border border-primary/20 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-xs text-on-surface uppercase tracking-wider">
                Filter & Sort
              </span>
              <button
                onClick={() => {
                  setMaxPrice(350);
                  setMinRating(0);
                  setSortBy('nearest');
                }}
                className="text-[11px] text-primary font-bold hover:underline"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              {/* Sort By */}
              <div>
                <label className="block text-[11px] text-on-surface-variant font-semibold mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 rounded-xl border border-outline-variant/40 bg-surface text-on-surface text-xs font-medium"
                >
                  <option value="nearest">Nearest Distance</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_low">Lowest Base Fee</option>
                </select>
              </div>

              {/* Min Rating */}
              <div>
                <label className="block text-[11px] text-on-surface-variant font-semibold mb-1">
                  Min Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-outline-variant/40 bg-surface text-on-surface text-xs font-medium"
                >
                  <option value={0}>All Ratings</option>
                  <option value={4.7}>4.7+ Stars</option>
                  <option value={4.8}>4.8+ Stars</option>
                  <option value={4.9}>4.9+ Stars Only</option>
                </select>
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                <span>Max Base Fee:</span>
                <span className="font-bold text-primary">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="149"
                max="349"
                step="20"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </section>
      )}

      {/* Trade Category Chips */}
      <CategoryChips />

      {/* Emergency SOS Banner */}
      <EmergencySOSBanner />

      {/* Trust & Guarantee Micro-Bar */}
      <TrustGuarantees />

      {/* Nearby Verified Technicians Section */}
      <section className="px-4 mb-4">
        {/* Header with Sort & Count */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-headline-md text-base font-bold text-on-surface">
              Nearby Verified Experts
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant">
              {filteredProviders.length} professionals ready around {areaName}
            </p>
          </div>

          <button
            onClick={() => {
              if (sortBy === 'nearest') setSortBy('rating');
              else if (sortBy === 'rating') setSortBy('price_low');
              else setSortBy('nearest');
            }}
            className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-sm border border-outline-variant/30 text-xs text-on-surface font-semibold hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[15px] text-primary">sort</span>
            <span className="capitalize">{sortBy.replace('_', ' ')}</span>
          </button>
        </div>

        {/* List of Provider Cards */}
        {filteredProviders.length > 0 ? (
          <div>
            {filteredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-[36px] text-outline mb-2">
              search_off
            </span>
            <h4 className="font-bold text-sm text-on-surface">No technicians match your filter</h4>
            <p className="text-xs text-on-surface-variant mt-1">
              Try adjusting your price range or clearing the search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setMaxPrice(350);
                setMinRating(0);
              }}
              className="mt-3 px-4 py-2 bg-primary text-white rounded-full text-xs font-bold"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* Chennai Local Assurance Banner */}
      <ChennaiAssuranceBanner />
    </div>
  );
};
