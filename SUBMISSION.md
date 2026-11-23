# 🏆 Prasunex Innovathon Round 3: Project Submission

# 🛠️ Local Skill Connect
### *Chennai Verified Craft & Trade Marketplace with Real-Time Emergency SOS Dispatch*

---

## 🔗 Project Links

| Resource | Link |
| :--- | :--- |
| **GitHub Repository** | `https://github.com/navikasrign/Local-skill-connect/blob/main/dist/sw.js |
| **Live Demo (Render)** | `https://local-skill-connect.onrender.com` *(Placeholder)* |
| **Video Demonstration** | `https://local-skill-connect.onrender.com/profile|

---

## 👥 Team
- **Gowtham A**
- **Navika Sri G N**

---

## ⚠️ 1. Problem & 💡 Solution

### The Problem
In major Indian metropolitan areas like Chennai, home emergencies (such as sudden water pipe bursts, electrical sparks, or MCB failures) trigger chaotic, fragmented scrambles:
1. **Unreliable Emergency Response**: Finding a skilled, available technician requires frantic phone calls to informal contacts with unpredictable arrival times and no response commitments.
2. **Double-Booking & Dispatch Conflicts**: Standard listing directories lack synchronized dispatching. Multiple technicians often get contacted, leading to wasted travel, scheduling disputes, and abandoned service requests.
3. **Safety & Verification Deficits**: Inviting unvetted workers into homes causes genuine safety concerns, especially without verified government identities or background checks.
4. **Opaque Pricing**: Arbitrary quotes, surprise labor surcharges on arrival, and zero warranty protection leave consumers vulnerable.
5. **No Verification of Service Start**: Disputes frequently occur over arrival times, work duration, and whether the person who showed up was the booked technician.

### The Solution: Local Skill Connect
Local Skill Connect is a hyper-local trade marketplace and emergency dispatch platform engineered specifically for Chennai neighborhoods (T. Nagar, Alwarpet, Mylapore, Adyar, etc.):
- **1-Tap Emergency SOS Dispatch**: Immediately broadcasts urgent repair requests over WebSockets to all active, nearby certified trade specialists.
- **Atomic First-Accept Lock**: Enforces a mathematical concurrency lock at the database level. The first technician to accept wins the job atomically; all competing technicians instantly receive a "Stand Down" notification to avoid wasted trips.
- **Govt. Udyam Registration Badging**: Promotes micro-enterprises by displaying official Udyam registration certificates and credentials on technician profiles.
- **Transparent Base Inspection Pricing**: Clearly defined standard visit fees (₹149–₹199) with explicit 30-day rework guarantees.
- **Customer 4-Digit OTP-Gated Commencement**: Technicians cannot start billing or mark jobs `IN_PROGRESS` without entering the customer's unique on-screen 4-digit OTP.
- **Verified Reviews with Dynamic Recalculation**: Customers submit verified ratings upon completion, immediately updating provider averages across the entire network in real time.

---

## 📱 2. Core Functionality

### 1. 🔍 Search & Multi-Param Filtering
- Filter by trade categories: **Electrician**, **Plumber**, **Carpenter**, and **Appliance & AC**.
- Real-time search across technician names, trade roles (*Master Electrician*, *Sanitary Master*), specific specializations (*Smart Lighting*, *Drainage*), and Chennai localities.
- **Filter & Sort Drawer**:
  - Sort by **Nearest Distance**, **Highest Rated**, or **Lowest Base Fee**.
  - Rating threshold selector (All, 4.7+, 4.8+, 4.9+).
  - Inspection price range slider (₹149 – ₹349).

### 2. ⚖️ Compare & Verify
- Compare technicians side-by-side on ETA, proximity, rating, total completed jobs, and verified review counts.
- **Detailed Provider Modal**: Displays Government Udyam Registration ID (e.g., `UDYAM-TN-02-0048192`), tools equipped, warranty guarantee badges, and verified customer testimonials.

### 3. 📅 Booking & Scheduling
- **Instant Express Dispatch**: Pre-assigned technician arrival target in 12–18 minutes.
- **Scheduled Time Slots**: Book convenient slots (e.g., *Today 6:00 PM – 8:00 PM*).
- Pre-populated Chennai addresses, issue descriptions, and transparent upfront fees.

### 4. 🚨 Real-Time Emergency SOS Broadcast
- High-visibility emergency mode for critical hazards (electrical fires, pipe bursts).
- Automated siren banners pushed across both customer and provider interfaces over active WebSockets.

### 5. 🔄 Strict Job Lifecycle & OTP Verification
Jobs strictly progress through an immutable forward state machine:
```text
BROADCASTING ──> ACCEPTED ──> ON_THE_WAY ──> ARRIVED ──> IN_PROGRESS ──> COMPLETED
     │               │             │            │             │
     └───────────────┴─────────────┴────────────┴─────────────┴──────> CANCELLED
```
- **Doorstep OTP Handshake**: When the technician marks `ARRIVED`, the customer UI displays a private 4-digit OTP. The technician must enter this exact code on their dashboard to transition the job to `IN_PROGRESS`.
- **Final Bill Settlement**: The technician enters the finalized bill amount (defaulting to the base fee) upon completion.

### 6. ⭐ Verified Ratings & Provider Analytics
- Single-review enforcement: Only completed jobs can be reviewed.
- Multi-dimensional feedback: 1 to 5 stars, quick-select service tags (*Fast Arrival*, *Clean Work*, *Transparent Pricing*), and written remarks.
- Instant score recalculation and global WebSocket broadcast.

---

## ⚙️ 3. Technical Execution

### Architecture Overview
```
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite PWA                  │
│       (Customer Home, Provider Dashboard, Bookings)    │
└───────────────────────────┬────────────────────────────┘
                            │
       HTTP REST API (JSON) │ WebSocket (Bidirectional Events)
       Port 8000            │ ws://localhost:8000/ws/{role}/{id}
                            │
┌───────────────────────────▼────────────────────────────┐
│                    FastAPI Backend                     │
│  ├── ConnectionManager (Thread-safe Async WS Hub)      │
│  ├── Lifecycle Engine (Strict State Transitions)      │
│  ├── Atomic First-Accept Lock (Row-level SQL checks)  │
│  └── Dynamic Rating Recalculation Engine               │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  SQLite 3 (WAL Mode)                   │
│  ├── jobs (Status, Customer, Provider, Timestamps, OTP)│
│  ├── providers (Rating, Reviews Count, Completed Jobs) │
│  └── reviews (Job ID Unique, Stars, Tags, Feedback)   │
└────────────────────────────────────────────────────────┘
```

### The Atomic First-Accept Lock
To prevent double-booking and eliminate race conditions when multiple technicians tap "Accept" at the exact same millisecond, the backend executes an atomic conditional SQL update:

```python
# Server-side atomic lock inside process_job_acceptance()
cursor.execute("""
    UPDATE jobs
    SET status = 'ACCEPTED',
        provider_id = ?,
        provider_name = ?,
        provider_phone = ?,
        provider_udyam = ?,
        provider_role = ?,
        eta = ?,
        accepted_at = ?
    WHERE id = ? AND status = 'BROADCASTING'
""", (accept_data.provider_id, accept_data.provider_name, ..., job_id))

conn.commit()
won = (cursor.rowcount == 1)
```

**How It Works**:
1. Because of `WHERE id = ? AND status = 'BROADCASTING'`, exactly one database worker can update the row from `BROADCASTING` to `ACCEPTED`.
2. If `cursor.rowcount == 1`, the technician is declared the winner:
   - Winner receives a `job_won` event with navigation controls.
   - All other connected technicians receive a `stand_down` event with the winner's name.
   - The customer receives a `job_assigned` event with live ETA and technician credentials.
3. If `cursor.rowcount == 0`, another technician already won the race. The losing technician receives a `job_already_taken` notification, and their UI safely resets.

### Concurrency Race Test (`test_websocket_race.py`)
The system includes an automated test that simulates a real-time race condition between multiple providers:
- Opens three concurrent WebSocket connections (`Customer`, `Provider 1 - K. Murugan`, and `Provider 2 - S. Raghuvaran`).
- Customer triggers an SOS alert ➔ Both providers receive `sos_broadcast` simultaneously.
- Provider 1 sends `provider_accept` ➔ Wins the job (`job_won`).
- Provider 2 instantly receives `stand_down`.
- Provider 2 attempts to accept milliseconds later ➔ Server rejects with `job_already_taken`.
- Validates that state corruption and double-assignment are mathematically impossible.

### End-to-End Lifecycle & Validation Test (`test_lifecycle_backend.py`)
- Verifies strict forward-only progression (skipping stages like `ACCEPTED` ➔ `COMPLETED` returns HTTP 400).
- Verifies OTP validation (entering incorrect OTP `0000` at `ARRIVED` is rejected; entering the customer's true OTP successfully transitions the job to `IN_PROGRESS`).
- Verifies final amount settlement, single-review enforcement, and duplicate review rejection.

### Single-Service Render Architecture
- FastAPI serves both the REST endpoints, WebSockets, and the production React SPA from `dist/`.
- Dynamic SPA fallback handles client-side routing on page refresh while preserving API and WebSocket endpoints.
- Database auto-initializes and auto-seeds all 12 Chennai demo trade specialists if empty on boot.

---

## 🎨 4. Usability & Design Excellence

- **Chennai Trade Palette**: Designed with an Electric Royal Blue (`#2563EB`) primary conversion tone, Deep Slate (`#0F172A`) headings, Marigold Amber (`#F59E0B`) ratings, Emerald Trust (`#10B981`) badges, and High-Visibility Crimson (`#EF4444`) emergency indicators.
- **Typography Scale**: Clean pairing of **Outfit** (bold geometric display headers and currency metrics) with **Manrope** (legible body copy, specifications, and metadata).
- **Mobile-First Experience**: Optimized for 390px mobile viewports with fluid responsive scaling for desktop and tablet screens.
- **PWA Ready**: Equipped with a Web App Manifest (`manifest.webmanifest`), offline Service Worker caching shell (`sw.js`), and launcher icon (`icon.svg`).
- **Seamless Role Switching**: Easily toggle between **Customer View** and **Provider View** from the top header to evaluate both perspectives on a single device or browser.
- **Audiovisual Feedback**: Dynamic banners notify technicians of incoming broadcasts and customers of technician status changes.

---

## 💡 5. Innovation & Value Proposition

| Dimension | Traditional Platforms (Urban Company, Justdial) | Local Skill Connect |
| :--- | :--- | :--- |
| **Emergency Dispatch** | Centralized manual assignment; slow scheduling delays | Decentralized instant WebSocket broadcast with sub-second response |
| **Concurrency & Double-Booking**| Opaque queueing; frequent cancellations or double visits | Atomic first-accept database lock with automatic stand-down alerts |
| **Service Start Verification** | Informal arrival reporting by the technician | Customer 4-digit OTP handshake required to start work |
| **Pricing Model** | High commission markups (25–35%) and opaque bundles | Fixed, low inspection fee (₹149–₹199) directly supporting micro-enterprises |
| **Government Recognition** | Corporate contractor branding | Direct showcase of Govt. Udyam Micro-Enterprise Registration IDs |
| **Architectural Footprint** | Complex multi-server microservice requirements | Ultra-lean, single-service FastAPI + React deployment with zero external runtime dependencies |

---

## 🧪 6. How to Run and Test

### Prerequisites
- **Node.js**: v18+
- **Python**: v3.10+

### Step 1: Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/local-skill-connect.git
cd local-skill-connect

# Install Python backend dependencies
pip install -r requirements.txt

# (Optional) Install Node.js frontend dependencies if rebuilding
npm install
```

### Step 2: Run the Single Unified Service
Start the FastAPI server (serves the pre-compiled React frontend, API, and WebSockets together):
```bash
uvicorn server:app --host 0.0.0.0 --port 8000
```
- **Web Application**: Open `http://localhost:8000` in your browser.
- **Swagger API Docs**: Open `http://localhost:8000/docs`.

---

### Step 3: Run the Automated Concurrency & Lifecycle Tests

#### A. Concurrency Race Test
In a separate terminal, test the atomic first-accept lock and stand-down broadcast:
```bash
python test_websocket_race.py
```
*Expected Result:*
```text
Acks received: Customer=customer, P1=p1, P2=p2
Customer received broadcasting ack for Job ID: SOS-XXXX
Provider 1 result: job_won -> Dispatch Assigned!
Provider 2 received: stand_down -> Job SOS-XXXX accepted by K. Murugan. Stand down.
Provider 2 attempt result: job_already_taken
🎉 ALL ATOMIC WEBSOCKET TESTS PASSED PERFECTLY!
```

#### B. Strict Lifecycle & OTP Test
Test sequential stage progression, invalid transitions, OTP checks, and verified reviews:
```bash
python test_lifecycle_backend.py
```
*Expected Result:*
```text
1. Creating SOS job...
2. Accepting job as Provider p1...
3. Testing invalid skip: ACCEPTED -> COMPLETED (Must fail)... -> HTTP 400
4. Transitioning: ACCEPTED -> ON_THE_WAY... -> Success
5. Transitioning: ON_THE_WAY -> ARRIVED... -> Success
6. Testing invalid OTP on ARRIVED -> IN_PROGRESS (Must fail)... -> HTTP 400
7. Transitioning with correct OTP: ARRIVED -> IN_PROGRESS... -> Success
8. Transitioning: IN_PROGRESS -> COMPLETED with final_amount=249... -> Success
9. Testing Review submission on COMPLETED job... -> Success
10. Testing duplicate review submission (Must fail)... -> HTTP 400
✅ ALL BACKEND LIFECYCLE, VALIDATION, AND REVIEW TESTS PASSED!
```

---

### Step 4: Interactive Dual-Window Demonstration

1. Open `http://localhost:8000` in **Window 1** (Customer).
2. Open `http://localhost:8000` in **Window 2** (Provider):
   - In the header, toggle role to **Provider View**.
   - Select **K. Murugan (Electrician)**.
3. In **Window 1 (Customer)**:
   - Navigate to **SOS** and tap **"🚨 Spark / MCB Tripping"**.
   - Window 1 enters active radar broadcast mode.
4. In **Window 2 (Provider)**:
   - An emergency audio-visual alert banner triggers immediately.
   - Tap **"Accept Job"**.
   - Provider Murugan wins the lock; Customer Window 1 updates to show assigned technician details.
5. In **Window 2 (Provider)**:
   - Click **"Start Driving"** ➔ Customer Window 1 updates to *Technician En Route*.
   - Click **"Mark Arrived"** ➔ Customer Window 1 displays the private 4-digit OTP.
   - Enter Customer's 4-digit OTP in Window 2 ➔ Status transitions to *In Progress*.
   - Click **"Complete Service"** and confirm bill amount.
6. In **Window 1 (Customer)**:
   - The completed job automatically presents the **Verified Review Modal**.
   - Submit a 5-star rating with tags ➔ Provider's live rating recalculates instantly in both windows.

---

## 🔬 7. Simulated vs. Real Components

To ensure the prototype is 100% self-contained, reproducible, and runnable locally or on free cloud tiers without paid external API keys, specific elements are simulated:

| Capability | Current Hackathon Implementation | Production Implementation |
| :--- | :--- | :--- |
| **Udyam Verification** | Embedded official MSME Udyam IDs (`UDYAM-TN-02-0048192`) and verifiable badge cards | Direct integration with Ministry of MSME / DigiLocker Verification API |
| **Geolocation & Tracking** | Calculated ETAs and neighborhood radiuses based on Chennai urban sectors (T. Nagar, Alwarpet, Mylapore) | Continuous GPS telemetry using Mapbox GL / Google Maps Roads API |
| **Database Engine** | Embedded SQLite with Write-Ahead Logging (`WAL` mode) and atomic row locks | Managed PostgreSQL cluster with connection pooling (PgBouncer) |
| **Notification Gateway** | Bi-directional WebSocket events with in-app audible siren alerts | Push notifications via Firebase Cloud Messaging (FCM) + SMS via Twilio / MSG91 |
| **Payment Gateway** | In-app final bill confirmation and cash/UPI settlement ledger | Razorpay / Cashfree UPI Escrow with automated technician split-payouts |

---

## 🗺️ 8. Scalability & Production Roadmap

```text
Phase 1: Hackathon Prototype (Current)
├── Single-service FastAPI + React on Render
├── SQLite in WAL mode with atomic row locks
└── Local WebSocket dispatch engine
       │
       ▼
Phase 2: Regional Cloud Deployment (Months 1–3)
├── PostgreSQL + PostGIS (Spatial indexing for sub-meter radius queries)
├── Redis Pub/Sub (Distributed multi-node WebSocket broadcasting)
└── DigiLocker API integration for instant technician onboarding
       │
       ▼
Phase 3: Hyper-Local Marketplace Scale (Months 4–6)
├── UPI Escrow Payments (Funds held securely until customer OTP verification)
├── Turn-by-turn routing with Mapbox Navigation SDK
├── Tamil voice interface & WhatsApp bot integration for trade workers
└── Expansion to Coimbatore, Madurai, and Bangalore urban clusters
```

---

## 👥 9. Team Members

### **Gowtham A**
- **Focus**: Real-time WebSocket architecture, atomic concurrency locks, backend lifecycle validation, and test automation.

### **Navika Sri G N**
- **Focus**: Mobile-first UI/UX engineering, Chennai design system implementation, PWA capabilities, and interactive state management.

---
*Developed with pride for the Prasunex Innovathon Round 3.*
