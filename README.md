# 🛠️ Local Skill Connect

> **Chennai Verified Craft & Trade Marketplace with Real-Time Emergency SOS Dispatch**

---

## 👥 Team
- **Gowtham A**
- **Navika Sri G N**

---

## 📖 Project Description

**Local Skill Connect** is a hyper-local marketplace and real-time emergency dispatch platform tailored for Chennai, India. It bridges the gap between urban households and certified, neighborhood-based trade specialists (Electricians, Plumbers, Carpenters, HVAC & Appliance Technicians).

Unlike generic listing directories, Local Skill Connect features a **high-priority emergency SOS dispatch system**. When home emergencies strike—such as sudden water pipe bursts or electrical sparking hazards—the platform broadcasts a high-priority dispatch request over WebSockets to all nearby active technicians. The first technician to accept immediately locks the job with atomic concurrency guarantees, while other technicians are automatically stood down. The complete service lifecycle is protected end-to-end with arrival tracking, 4-digit start-of-service OTP verification, and post-service customer ratings.

---

## ⚠️ Problem & 💡 Solution

### The Problem
1. **Unreliable Emergency Response**: Finding a skilled electrician or plumber during an urgent breakdown (e.g., short circuit, burst pipe) often requires frantic phone calls with unpredictable arrival times and no response guarantees.
2. **Double-Booking & Race Conditions**: On conventional platforms, multiple technicians may be notified or dispatched simultaneously without atomic state locks, causing disputes and wasted travel.
3. **Lack of Verified Credentials & Safety**: Customers worry about safety and competence when inviting unvetted workers into their homes.
4. **Opaque Pricing & Hidden Surcharges**: Informal trades often quote arbitrary prices on-site with no transparent inspection baseline or rework guarantees.
5. **No Verification of Service Commencement**: Misunderstandings happen regarding when work started or whether the assigned technician was the one who arrived.

### The Solution
1. **1-Tap Emergency SOS Dispatch**: Instant broadcast to all active, nearby verified technicians in the user's Chennai zone (T. Nagar, Alwarpet, Mylapore, Adyar, Anna Nagar, etc.).
2. **Atomic First-Accept Concurrency Lock**: Powered by SQLite atomic rowcount checks and WebSocket broadcast channels. The fastest technician to tap "Accept" wins the dispatch; all other technicians instantly receive a "Stand Down" notification.
3. **Govt. Udyam Registration & Micro-Enterprise Badging**: Every provider profile displays official verification badges and micro-enterprise credentials.
4. **Transparent Base Inspection Pricing**: Clear upfront inspection fees (e.g., ₹149 - ₹199) with explicit 30-day rework guarantees.
5. **Customer OTP-Gated Service Commencement**: The technician cannot mark a job `IN_PROGRESS` without entering the customer's unique 4-digit start-of-service OTP code.
6. **Verified Reviews with Dynamic Score Updates**: Ratings and tags can only be submitted on completed jobs, immediately recalculating the provider's overall score across the platform.

---

## 🌟 Key Features

### 1. 🔍 Search & Discovery
- **Trade Category Filters**: Quickly filter by Electrician, Plumber, Carpenter, or Appliance & AC.
- **Multi-parameter Search**: Search by technician name, specialization (e.g., *Smart Lighting*, *Drainage Master*, *Modular Craftsman*), or Chennai neighborhood.
- **Filter & Sort Drawer**:
  - Sort by **Nearest Distance**, **Highest Rated**, or **Lowest Base Fee**.
  - Minimum star rating filters (4.7+, 4.8+, 4.9+).
  - Maximum inspection fee price range slider (₹149 - ₹349).

### 2. ⚖️ Compare & Verify
- **Side-by-Side Credentials**: Compare technicians based on distance, ETA, rating, review count, and completed jobs.
- **Detailed Provider Modal**: Displays verified Udyam registration ID (e.g., `UDYAM-TN-02-0048192`), service warranty badge, tools carried, and customer reviews.

### 3. 📅 Booking & Scheduling
- **Express & Scheduled Visits**: Choose between instant express arrival (12–18 mins) or custom time slots (e.g., *Today 6:00 PM - 8:00 PM*).
- **Service Address & Problem Details**: Pre-populated with localized Chennai addresses and problem descriptions.
- **Fee Transparency**: Clear breakdown of visit charges and payment terms.

### 4. 🚨 SOS Real-Time Dispatch & First-Accept Lock
- **One-Tap Emergency Siren**: Triggers immediate SOS requests for electrical fires/sparks or main water bursts.
- **WebSocket Broadcasting**: Sent simultaneously to all connected providers within milliseconds.
- **Atomic First-Accept Guarantee**:
  - The first provider to accept wins the job atomically via database-level conditional update (`WHERE id = ? AND status = 'BROADCASTING'`).
  - Winning provider gets immediate route navigation details.
  - Competing providers get a real-time **Stand Down** toast with the winner's name.
  - The customer receives assigned technician details and live ETA.

### 5. 🔄 Strict Job Lifecycle State Machine
Jobs follow an immutable forward progression. Steps cannot be skipped or reversed:
```text
BROADCASTING ──> ACCEPTED ──> ON_THE_WAY ──> ARRIVED ──> IN_PROGRESS ──> COMPLETED
     │               │             │            │             │
     └───────────────┴─────────────┴────────────┴─────────────┴──────> CANCELLED
```
- **OTP Verification**: At the `ARRIVED` stage, the customer's app displays a private 4-digit OTP. The technician must enter this exact code on their dashboard to transition the job to `IN_PROGRESS`.
- **Final Settlement**: Upon completion, the provider enters the finalized bill amount (defaulting to the agreed inspection fee).

### 6. ⭐ Verified Ratings & Provider Analytics
- **Single-Review Enforcement**: Only customers with a `COMPLETED` job can submit a review.
- **Review Attributes**: 1 to 5-star ratings, quick-select badges (*Fast Arrival*, *Transparent Pricing*, *Clean Work*), and detailed feedback.
- **Dynamic Recalculation**: Provider's average rating and total review count are recalculated and broadcasted to all active clients via WebSockets in real time.

---

## 🏗️ System Architecture

### Component Architecture
```
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite PWA                  │
│  (Customer Home, Provider Dashboard, Bookings, SOS)    │
└───────────────────────────┬────────────────────────────┘
                            │
       HTTP REST API (JSON) │ WebSocket (Bidirectional Events)
       Port 8000            │ ws://localhost:8000/ws/{role}/{id}
                            │
┌───────────────────────────▼────────────────────────────┐
│                    FastAPI Backend                     │
│  ├── ConnectionManager (Async Provider & Customer WS) │
│  ├── Lifecycle Engine (Strict State Transitions)      │
│  ├── Atomic First-Accept Lock (Row-level checks)       │
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

### Real-Time WebSocket Event Flow
1. **Customer triggers SOS** ➔ `customer_sos` event sent to `/ws/customer/cust_1`.
2. **Server broadcasts** ➔ `sos_broadcast` sent to all `/ws/provider/{id}` connections.
3. **Provider 1 accepts** ➔ `provider_accept` received:
   - Server executes atomic update. `cursor.rowcount == 1` confirms the winner.
   - Provider 1 receives `job_won`.
   - Provider 2 receives `stand_down`.
   - Customer receives `job_assigned` with technician details and 4-digit OTP.
4. **Lifecycle updates** ➔ `job_status_update` pushes status changes (`ON_THE_WAY`, `ARRIVED`, `IN_PROGRESS`, `COMPLETED`) to both parties.
5. **Review submitted** ➔ `provider_rating_updated` broadcasts updated stats globally.

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS 3.4, React Router DOM 6, Lucide React, Material Symbols |
| **Backend** | Python 3.10+, FastAPI 0.115+, Uvicorn, WebSockets, Pydantic v2 |
| **Database** | SQLite 3 with Write-Ahead Logging (`PRAGMA journal_mode=WAL`) |
| **Testing** | Python `asyncio` + `websockets` (Race condition suite), `urllib` (Lifecycle test suite) |
| **PWA Support**| Web App Manifest, Service Worker offline shell, mobile-responsive layout (390px baseline) |

---

## 🚀 Setup & Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Package Managers**: `npm` and `pip`

---

### 1. Backend Setup

1. Open a terminal and navigate to the project directory:
   ```bash
   cd "C:\Local skill connect"
   ```

2. (Optional) Create and activate a Python virtual environment:
   ```bash
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Install required Python packages:
   ```bash
   pip install fastapi uvicorn websockets pydantic
   ```

4. Start the FastAPI backend server:
   ```bash
   python server.py
   ```
   *The backend will start at:* **`http://localhost:8000`**  
   *API documentation (Swagger UI) is available at:* **`http://localhost:8000/docs`**

---

### 2. Frontend Setup

1. Open a second terminal window in the project directory:
   ```bash
   cd "C:\Local skill connect"
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be live at:* **`http://localhost:3000`**

---

### 3. Single-Service Deployment (Render / Production)

The project is pre-configured to run as a single unified service (FastAPI serving both the API, WebSockets, and the compiled React SPA from `dist/`):

1. **Build Command**:
   ```bash
   pip install -r requirements.txt
   ```
   *(Note: The pre-compiled production `dist/` folder is committed to the repo, so Node.js is not strictly required on the Render Python runtime).*

2. **Start Command**:
   ```bash
   uvicorn server:app --host 0.0.0.0 --port $PORT
   ```

3. **Environment**:
   - Python 3.10+
   - Render automatically assigns the `$PORT` environment variable.


---

## 🧪 How to Run the SOS Demo

You can experience the emergency SOS broadcast and atomic first-accept lock in two ways:

### Option A: Automated Backend Test Suites (Recommended for Instant Verification)

#### 1. Test Concurrent WebSocket Race Conditions & Stand-Down
Run the automated WebSocket race test script while `server.py` is running:
```bash
python test_websocket_race.py
```
**What this verifies:**
- Connects three simultaneous WebSockets: Customer, Provider 1, and Provider 2.
- Customer issues an emergency SOS alert.
- Both providers receive the incoming alert simultaneously.
- Provider 1 accepts first ➔ Receives `job_won`.
- Provider 2 immediately receives `stand_down` with winner details.
- Provider 2 attempts to accept after the fact ➔ Rejected with `job_already_taken`.

#### 2. Test End-to-End Lifecycle & OTP Validation
Run the lifecycle integration test script:
```bash
python test_lifecycle_backend.py
```
**What this verifies:**
- Creates SOS job and validates status.
- Prevents skipping stages (`ACCEPTED` ➔ `COMPLETED` is rejected with HTTP 400).
- Advances sequentially: `ACCEPTED` ➔ `ON_THE_WAY` ➔ `ARRIVED`.
- Rejects incorrect OTP (e.g., `0000`) when attempting `IN_PROGRESS`.
- Accepts correct OTP and transitions to `IN_PROGRESS`.
- Completes job with custom final amount settlement.
- Submits verified review, updates provider score, and blocks duplicate review submissions.

---

### Option B: Interactive UI Demo

1. Open `http://localhost:3000` in **two separate browser windows** side-by-side (or one regular window and one incognito window).
2. **Window 1 (Customer View)**:
   - Ensure role is set to **Customer** (top header).
   - Navigate to the **SOS** page or tap the crimson **SOS Emergency** card on the home screen.
   - Tap **"🚨 Spark / MCB Tripping"** or **"🌊 Pipe Burst"**.
   - The customer screen will switch to broadcasting radar mode.
3. **Window 2 (Provider View)**:
   - In the top header, click the toggle to switch to **Provider View**.
   - Select provider **K. Murugan (Electrician)**.
   - An emergency audio-visual alert banner will appear with an **"Accept Job"** button.
   - Tap **"Accept Job"**.
4. **Live Race Lock & Lifecycle Updates**:
   - In Window 2, Provider Murugan wins the job and gets action controls:
     1. Click **"Start Driving (On the way)"** ➔ Customer Window 1 updates to *En Route*.
     2. Click **"Mark Arrived"** ➔ Customer Window 1 reveals the secret 4-digit OTP.
     3. Provider enters the 4-digit OTP shown on Customer's screen ➔ Job status changes to *In Progress*.
     4. Click **"Complete Service"** and confirm final amount.
   - In Window 1 (Customer), the completed service triggers the **Verified Review Modal**:
     - Give 5 stars, select tags, write a comment, and submit.
     - The provider's rating and completed jobs count update instantly across both windows.

---

## 🔬 What is Simulated

To make this project easily runnable for evaluation, hackathons, and offline testing without external dependencies or cloud charges, specific components are intentionally simulated:

| Feature | Production Implementation | Current Simulation |
| :--- | :--- | :--- |
| **Govt. Udyam Verification** | Ministry of MSME API integration / DigiLocker verification gateway | Mock verified registration numbers (e.g., `UDYAM-TN-02-0048192`) and certificate badges embedded in technician profiles. |
| **Live Geolocation Tracking** | Continuous GPS telemetry, Google Maps Roads API / Mapbox SDK | Calculated static ETA estimates (10–18 minutes) based on Chennai neighborhoods (T. Nagar, Alwarpet, Mylapore, Adyar). |
| **Database Engine** | Hosted PostgreSQL cluster with distributed row-level locks | Embedded SQLite database configured with Write-Ahead Logging (`WAL` mode) and connection locks to run locally without external database server configuration. |
| **SMS Gateway / Push Notifications** | Twilio, MSG91, or Firebase Cloud Messaging (FCM) | In-app WebSocket banner notifications, live siren alerts, and on-screen OTP display. |

---

## 📁 Project Directory Structure

```text
Local skill connect/
├── .gitignore                   # Excludes node_modules, venv, .env, __pycache__, *.db
├── DESIGN.md                    # Stitch design system tokens, typography, and palette
├── README.md                    # Complete project documentation
├── index.html                   # HTML5 entry point with PWA meta tags & fonts
├── local_skill_connect.db       # SQLite local database (created automatically)
├── package.json                 # Node.js dependencies & build scripts
├── postcss.config.js            # PostCSS configuration
├── server.py                    # FastAPI backend with WebSockets & SQLite lifecycle
├── tailwind.config.js           # Custom Tailwind theme matching Chennai brand palette
├── test_lifecycle_backend.py    # Automated test suite for strict state machine & OTP
├── test_websocket_race.py       # Automated test suite for atomic first-accept lock
├── vite.config.js               # Vite bundler configuration
│
├── public/                      # Static assets & PWA files
│   ├── icon.svg                 # Application favicon and launcher icon
│   ├── manifest.webmanifest     # PWA manifest
│   └── sw.js                    # Service worker for offline shell caching
│
└── src/                         # React frontend source code
    ├── App.jsx                  # Root component with routing and global modals
    ├── main.jsx                 # React DOM mount point
    ├── index.css                # Tailwind directives and utility classes
    ├── context/
    │   └── AppContext.jsx       # State management, WebSocket bridge, and demo toggle
    ├── data/
    │   └── providersData.js     # Seed provider catalog with Udyam IDs and trade specs
    ├── components/
    │   ├── BookingModal.jsx          # Service visit scheduling dialog
    │   ├── BottomNav.jsx             # Mobile bottom navigation bar
    │   ├── CategoryChips.jsx         # Trade filter chips
    │   ├── ChennaiAssuranceBanner.jsx# Local warranty and pricing assurance
    │   ├── EmergencySOSBanner.jsx    # Home screen emergency trigger card
    │   ├── Header.jsx                # Header with role toggle and location selector
    │   ├── LiveRadarPill.jsx         # Real-time search radar indicator
    │   ├── ProviderCard.jsx          # Provider card with Udyam badge & fees
    │   ├── ProviderDetailModal.jsx   # Detailed profile and credentials view
    │   ├── RatingModal.jsx           # Post-completion 5-star review modal
    │   ├── SOSModal.jsx              # Emergency triage dialog
    │   └── TrustGuarantees.jsx       # Security, police verification, and warranty pills
    └── pages/
        ├── CustomerHome.jsx          # Customer search, filter, and comparison catalog
        ├── BookingsPage.jsx          # Active and past job tracker
        ├── SOSPage.jsx               # Dedicated high-priority emergency dispatch screen
        ├── ProfilePage.jsx           # Customer profile and saved preferences
        ├── ProviderDashboard.jsx     # Technician lifecycle controller & incoming requests
        ├── ProviderJobsPage.jsx      # Provider active and completed job history
        └── ProviderEarningsPage.jsx  # Technician payouts and completed job revenue
```

---

## 📄 License & Notes
Developed for the **Local Skill Connect** initiative.  
All brand colors, trade categories, and neighborhood coordinates are configured for Chennai urban sectors.
