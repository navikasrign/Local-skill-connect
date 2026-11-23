import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const RatingModal = () => {
  const { ratingModalJob, setRatingModalJob, submitReviewBackend, setLiveBanner, role } = useApp();

  const [stars, setStars] = useState(5);
  const [selectedTags, setSelectedTags] = useState(["Fast Arrival", "Professional"]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Only render rating modal in Customer role
  if (!ratingModalJob || role !== 'customer') return null;

  const providerName = ratingModalJob.providerName || ratingModalJob.provider_name || 'Technician';
  const providerRole = ratingModalJob.providerRole || ratingModalJob.provider_role || ratingModalJob.category || 'Trade Specialist';
  const udyamId = ratingModalJob.udyamId || ratingModalJob.provider_udyam || 'Govt. Udyam Verified';
  const finalAmount = ratingModalJob.final_amount || ratingModalJob.fee || 199;

  const availableTags = [
    "Fast Arrival",
    "Transparent Pricing",
    "Professional",
    "Clean Work"
  ];

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const reviewData = {
      stars,
      tags: selectedTags,
      comment: comment || "Excellent work and prompt resolution."
    };

    const res = await submitReviewBackend(ratingModalJob.id, reviewData);
    setIsSubmitting(false);

    if (res.success) {
      setShowThankYou(true);
      setLiveBanner({
        type: 'success',
        title: '⭐ Rating Submitted!',
        message: `Thank you! Your verified review has updated ${providerName}'s rating.`
      });
      setTimeout(() => {
        setShowThankYou(false);
        setRatingModalJob(null);
      }, 2000);
    } else {
      alert(res.error || "Failed to submit review");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl p-5 border border-outline-variant/30 animate-in slide-in-from-bottom">
        {showThankYou ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>
            <h3 className="font-headline-md text-lg font-bold text-on-surface">
              Thank You for Your Feedback!
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
              Your verified review helps maintain accountability and quality across Chennai's Udyam trade network.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-full inline-block">
              Job moved to History & Receipts
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">
                  Service Completed • Bill: ₹{finalAmount}
                </span>
                <h3 className="font-headline-md text-base font-bold text-on-surface">
                  Rate {providerName}
                </h3>
              </div>
              <button
                onClick={() => setRatingModalJob(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Provider Snapshot */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low mb-4 border border-outline-variant/20">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-primary text-base">
                {providerName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-on-surface">{providerName}</h4>
                <p className="text-[11px] text-on-surface-variant">{providerRole}</p>
                <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                  {udyamId}
                </span>
              </div>
            </div>

            {/* Star Selector */}
            <div className="text-center py-2 mb-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
              <span className="text-xs font-bold text-on-surface block mb-1">
                How was your service experience?
              </span>
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStars(s)}
                    className="p-1 transition-transform active:scale-125 focus:outline-none"
                  >
                    <span
                      className={`material-symbols-outlined text-[32px] ${
                        s <= stars ? 'text-amber-400' : 'text-outline/40'
                      }`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-600 block mt-0.5">
                {stars === 5 ? '5.0 - Exceptional Service!' : stars === 4 ? '4.0 - Very Good' : stars === 3 ? '3.0 - Satisfactory' : 'Needs Improvement'}
              </span>
            </div>

            {/* Tag Badges */}
            <div className="mb-4">
              <span className="text-xs font-bold text-on-surface block mb-2">
                What went well? (Select all that apply)
              </span>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-primary-container text-white border-primary shadow-sm'
                          : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:border-primary/40'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comments Box */}
            <div className="mb-4">
              <label className="text-xs font-bold text-on-surface block mb-1">
                Feedback & Comments (Optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share feedback on speed, electrical/plumbing diagnostic clarity..."
                className="w-full text-xs p-3 rounded-2xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-12 bg-primary text-white rounded-full font-label-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-transform disabled:opacity-60 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Submitting Review...</span>
              ) : (
                <>
                  <span>Submit Verified Review</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
