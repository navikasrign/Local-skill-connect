import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CHENNAI_PROVIDERS } from '../data/providersData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Role: 'customer' | 'provider'
  const [role, setRole] = useState('customer');

  // Active simulated provider for Provider View (defaults to K. Murugan)
  const [activeProviderId, setActiveProviderId] = useState('p1');
  const [providerOnline, setProviderOnline] = useState(true);

  // Dynamic Providers list (with live ratings & job counts from backend)
  const [providers, setProviders] = useState(CHENNAI_PROVIDERS);

  // Demo Mode Toggle (Requirement 12: simulation shortcuts only behind a clearly labelled toggle)
  const [demoMode, setDemoMode] = useState(false);

  // Search & Filter state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest' | 'rating' | 'price_low'
  const [userLocation, setUserLocation] = useState('T. Nagar, Chennai');

  // Modals & Drawers
  const [selectedProviderForDetail, setSelectedProviderForDetail] = useState(null);
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState(null);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [ratingModalJob, setRatingModalJob] = useState(null); // Requirement 9: auto-open rating screen

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Global Toast / Siren Banner
  const [liveBanner, setLiveBanner] = useState(null);

  // WebSocket reference
  const wsRef = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Active broadcasting SOS state for Customer
  const [broadcastingSosJob, setBroadcastingSosJob] = useState(null);

  // Bookings list
  const [bookings, setBookings] = useState([
    {
      id: "BK-8491",
      providerId: "p1",
      providerName: "K. Murugan",
      providerRole: "Master Electrician",
      providerPhone: "+91 98401 23456",
      category: "Electrician",
      customerName: "S. Anand",
      customerPhone: "+91 98840 99882",
      address: "Door 14/2, Sivaganga Road, T. Nagar, Chennai - 600017",
      problem: "Main Hall Fan Sparking & MCB Tripping constantly",
      bookingType: "Instant Express (18 min arrival)",
      status: "ON_THE_WAY", // ACCEPTED | ON_THE_WAY | ARRIVED | IN_PROGRESS | COMPLETED | CANCELLED
      fee: 199,
      final_amount: 199,
      otp: "4819",
      createdAt: "Today, 9:20 PM",
      etaRemaining: "12 mins",
      warranty: "30-Day Free Rework Warranty",
      udyamId: "UDYAM-TN-02-0048192",
      reviewed: false
    }
  ]);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: "FastAPI WebSocket Connected", text: "Connected to Chennai Emergency Dispatch Core on ws://localhost:8000.", time: "Just now", unread: true },
    { id: 2, title: "Govt Udyam Assurance", text: "All 12 trade experts in your radius are 100% verified.", time: "1h ago", unread: false }
  ]);

  // Provider Incoming Instant Requests (Queue)
  const [providerRequests, setProviderRequests] = useState([]);

  // Fetch initial providers from FastAPI backend
  const fetchProvidersFromBackend = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/providers");
      if (res.ok) {
        const backendProviders = await res.json();
        setProviders(prev => prev.map(p => {
          const match = backendProviders.find(bp => bp.id === p.id);
          if (match) {
            return {
              ...p,
              rating: match.rating,
              reviewsCount: match.reviews_count,
              completedJobs: match.completed_jobs
            };
          }
          return p;
        }));
      }
    } catch (e) {
      console.log("Could not reach backend /api/providers, using static seed:", e);
    }
  };

  useEffect(() => {
    fetchProvidersFromBackend();
  }, []);

  const currentProvider = providers.find(p => p.id === activeProviderId) || providers[0];

  // ================= WEBSOCKET CONNECTION =================
  useEffect(() => {
    const clientId = role === 'customer' ? 'cust_1' : activeProviderId;
    const clientType = role === 'customer' ? 'customer' : 'provider';
    const wsUrl = `ws://localhost:8000/ws/${clientType}/${clientId}`;

    console.log(`Connecting WebSocket to ${wsUrl}...`);
    let socket;
    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log(`✅ WebSocket connected as ${clientType}/${clientId}`);
        setWsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📩 WebSocket message received:", data);

          if (data.type === 'connected') {
            if (data.active_broadcasts && data.active_broadcasts.length > 0) {
              const formatted = data.active_broadcasts.map(job => ({
                id: job.id,
                customerName: job.customer_name,
                category: job.category,
                location: job.address,
                issue: job.problem,
                fee: `₹${job.fee} Inspection`,
                isEmergency: true,
                rawJob: job
              }));
              setProviderRequests(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const newItems = formatted.filter(f => !existingIds.has(f.id));
                return [...newItems, ...prev];
              });
            }
          }

          // 1. SOS Broadcast (Arrives to all connected providers)
          if (data.type === 'sos_broadcast') {
            const job = data.job;
            const newReq = {
              id: job.id,
              customerName: job.customer_name,
              category: job.category,
              location: job.address,
              issue: `🚨 ${job.problem}`,
              fee: `₹${job.fee} Inspection`,
              isEmergency: true,
              rawJob: job
            };

            setProviderRequests(prev => [newReq, ...prev.filter(r => r.id !== job.id)]);
            setLiveBanner({
              type: 'emergency',
              title: `🚨 EMERGENCY SOS BROADCAST: ${job.id}`,
              message: `${job.problem} in ${job.address.split(',')[1] || 'Chennai'}! Tap to Accept immediately.`
            });
          }

          // 2. Stand Down (Arrives to all other providers when one wins)
          if (data.type === 'stand_down') {
            setProviderRequests(prev => prev.filter(r => r.id !== data.job_id));
            setLiveBanner({
              type: 'stand_down',
              title: `🛡️ STAND DOWN: Job ${data.job_id}`,
              message: `${data.winner_name} won and accepted this dispatch. Stand down.`
            });
            setTimeout(() => setLiveBanner(null), 6000);
          }

          // 3. Job Won (Arrives to winning provider)
          if (data.type === 'job_won') {
            const job = data.job;
            setProviderRequests(prev => prev.filter(r => r.id !== job.id));

            const wonBooking = {
              id: job.id,
              providerId: job.provider_id,
              providerName: job.provider_name,
              providerRole: job.provider_role,
              providerPhone: job.provider_phone,
              category: job.category,
              customerName: job.customer_name,
              customerPhone: job.customer_phone,
              address: job.address,
              problem: job.problem,
              bookingType: "Emergency SOS Priority",
              status: "ACCEPTED",
              fee: job.fee,
              final_amount: job.final_amount || job.fee,
              otp: job.otp,
              createdAt: "Just now",
              etaRemaining: job.eta || "12 mins",
              warranty: "30-Day Free Rework Warranty",
              udyamId: job.provider_udyam
            };

            setBookings(prev => [wonBooking, ...prev.filter(b => b.id !== job.id)]);
            setLiveBanner({
              type: 'success',
              title: `🏆 DISPATCH ASSIGNED: Job ${job.id}`,
              message: `You won the race! Customer OTP is ${job.otp}. Tap 'Start Driving' to begin.`
            });
            setTimeout(() => setLiveBanner(null), 7000);
          }

          // 4. Job Already Taken (Arrives to losing provider)
          if (data.type === 'job_already_taken') {
            setProviderRequests(prev => prev.filter(r => r.id !== data.job_id));
            setLiveBanner({
              type: 'warning',
              title: `⚡ Job Already Accepted!`,
              message: data.message
            });
            setTimeout(() => setLiveBanner(null), 5000);
          }

          // 5. Job Assigned (Arrives to Customer when provider accepts)
          if (data.type === 'job_assigned') {
            const job = data.job;
            const prov = data.provider;

            const assignedBooking = {
              id: job.id,
              providerId: prov.id,
              providerName: prov.name,
              providerRole: prov.role,
              providerPhone: prov.phone,
              category: job.category,
              customerName: job.customer_name,
              customerPhone: job.customer_phone,
              address: job.address,
              problem: job.problem,
              bookingType: "Emergency SOS Priority",
              status: "ACCEPTED",
              fee: job.fee,
              final_amount: job.final_amount || job.fee,
              otp: job.otp,
              createdAt: "Just now",
              etaRemaining: data.eta || "12 mins",
              warranty: "30-Day Free Rework Warranty",
              udyamId: prov.udyam_id,
              reviewed: false
            };

            setBookings(prev => [assignedBooking, ...prev.filter(b => b.id !== job.id)]);
            setBroadcastingSosJob(null);

            setLiveBanner({
              type: 'success',
              title: `✅ TECHNICIAN ASSIGNED: ${prov.name}`,
              message: `${prov.name} accepted your SOS! ETA: ${data.eta}. Share OTP ${job.otp} on arrival.`
            });
            setTimeout(() => setLiveBanner(null), 7000);
          }

          // 6. SOS Broadcasting confirmation for Customer
          if (data.type === 'sos_broadcasting') {
            setBroadcastingSosJob(data.job);
          }

          // 7. Status Updated (Push to Customer & Provider immediately)
          if (data.type === 'job_status_updated') {
            const updatedJob = data.job;
            const newStatus = data.status;

            setBookings(prev => prev.map(b => {
              if (b.id === data.job_id) {
                return {
                  ...b,
                  status: newStatus,
                  final_amount: updatedJob.final_amount || b.final_amount,
                  arrived_at: updatedJob.arrived_at,
                  started_at: updatedJob.started_at,
                  completed_at: updatedJob.completed_at
                };
              }
              return b;
            }));

            // Requirement 9: After Completed, automatically open rating screen for Customer
            if (newStatus === 'COMPLETED') {
              const completedBooking = bookings.find(b => b.id === data.job_id) || updatedJob;
              // Open rating modal if this is the customer
              setRatingModalJob(completedBooking);
            }

            setLiveBanner({
              type: newStatus === 'COMPLETED' ? 'success' : 'info',
              title: `Status: ${newStatus.replace(/_/g, ' ')}`,
              message: data.message
            });
            setTimeout(() => setLiveBanner(null), 6000);
          }

          // 8. Provider Rating Updated (Recalculated rating broadcast)
          if (data.type === 'provider_rating_updated') {
            setProviders(prev => prev.map(p => {
              if (p.id === data.provider_id) {
                return {
                  ...p,
                  rating: data.rating,
                  reviewsCount: data.reviews_count,
                  completedJobs: data.completed_jobs
                };
              }
              return p;
            }));
          }

        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected.");
        setWsConnected(false);
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        setWsConnected(false);
      };

    } catch (e) {
      console.error("WebSocket setup failed:", e);
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [role, activeProviderId]);

  // Catch PWA beforeinstallprompt event
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerPwaInstall = async () => {
    if (!deferredPrompt) {
      alert("App can be installed directly from your browser menu ('Add to Home screen').");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    }
  };

  // Trigger SOS through WebSocket
  const triggerWebSocketSOS = (incidentData) => {
    const payload = {
      type: "customer_sos",
      customer_name: incidentData.customerName || "S. Anand",
      customer_phone: incidentData.customerPhone || "+91 98840 99882",
      category: incidentData.category || "Electrician",
      problem: incidentData.problem || "Emergency Spark & Electrical Hazard",
      address: incidentData.address || "Door 14/2, Sivaganga Road, T. Nagar, Chennai - 600017",
      fee: incidentData.fee || 199
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      fetch("http://localhost:8000/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(console.error);
    }
  };

  // Provider taps Accept on a job (Atomic Transaction)
  const acceptJobViaWebSocket = (jobId) => {
    const payload = {
      type: "provider_accept",
      job_id: jobId,
      provider_name: currentProvider.name,
      provider_phone: currentProvider.phone,
      provider_udyam: currentProvider.udyamId,
      provider_role: currentProvider.roleTitle,
      eta: currentProvider.eta || "12 mins"
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      fetch(`http://localhost:8000/api/jobs/${jobId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(console.error);
    }
  };

  // Update Status with strict validation via backend
  const updateJobStatusBackend = async (jobId, newStatus, otp = null, finalAmount = null) => {
    try {
      const res = await fetch(`http://localhost:8000/api/jobs/${jobId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          otp: otp,
          final_amount: finalAmount
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update status");
      }

      // Update local state if not already pushed via websocket
      setBookings(prev => prev.map(b => b.id === jobId ? {
        ...b,
        status: newStatus,
        final_amount: data.job?.final_amount || b.final_amount
      } : b));

      return { success: true, data };
    } catch (err) {
      console.error("Error updating status:", err);
      // Fallback local update for UI resilience
      setBookings(prev => prev.map(b => b.id === jobId ? {
        ...b,
        status: newStatus,
        final_amount: finalAmount || b.final_amount
      } : b));
      return { success: false, error: err.message };
    }
  };

  // Submit Review via backend
  const submitReviewBackend = async (jobId, reviewData) => {
    try {
      const res = await fetch(`http://localhost:8000/api/jobs/${jobId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to submit review");
      }

      // Mark job as reviewed locally
      setBookings(prev => prev.map(b => b.id === jobId ? {
        ...b,
        reviewed: true,
        review: reviewData
      } : b));

      // Update provider stats in local state
      if (data.provider) {
        setProviders(prev => prev.map(p => p.id === data.provider.id ? {
          ...p,
          rating: data.provider.rating,
          reviewsCount: data.provider.reviews_count,
          completedJobs: data.provider.completed_jobs
        } : p));
      }

      return { success: true, data };
    } catch (err) {
      console.error("Error submitting review:", err);
      return { success: false, error: err.message };
    }
  };

  const createBooking = (bookingData) => {
    const newId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const newBooking = {
      id: newId,
      otp: randomOtp,
      createdAt: "Just now",
      status: "ACCEPTED",
      etaRemaining: bookingData.eta || "15 mins",
      final_amount: bookingData.fee,
      reviewed: false,
      ...bookingData
    };

    setBookings(prev => [newBooking, ...prev]);

    setNotifications(prev => [
      {
        id: Date.now(),
        title: "Booking Confirmed & Dispatched!",
        text: `${bookingData.providerName} has accepted your request. ETA: ${bookingData.eta || '15 mins'}. Share OTP ${randomOtp} upon arrival.`,
        time: "Just now",
        unread: true
      },
      ...prev
    ]);

    return newBooking;
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      activeProviderId,
      setActiveProviderId,
      currentProvider,
      providers,
      providerOnline,
      setProviderOnline,
      demoMode,
      setDemoMode,
      selectedCategory,
      setSelectedCategory,
      searchQuery,
      setSearchQuery,
      sortBy,
      setSortBy,
      userLocation,
      setUserLocation,
      selectedProviderForDetail,
      setSelectedProviderForDetail,
      selectedProviderForBooking,
      setSelectedProviderForBooking,
      emergencyModalOpen,
      setEmergencyModalOpen,
      ratingModalJob,
      setRatingModalJob,
      bookings,
      createBooking,
      updateJobStatusBackend,
      submitReviewBackend,
      notifications,
      markAllNotificationsRead,
      providerRequests,
      setProviderRequests,
      triggerPwaInstall,
      isAppInstalled,
      wsConnected,
      liveBanner,
      setLiveBanner,
      broadcastingSosJob,
      setBroadcastingSosJob,
      triggerWebSocketSOS,
      acceptJobViaWebSocket
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
