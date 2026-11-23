import os
import sqlite3
import json
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
import random

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "local_skill_connect.db")

INITIAL_PROVIDERS = [
    {"id": "p1", "name": "K. Murugan", "category": "Electrician", "role_title": "Master Electrician", "rating": 4.9, "reviews_count": 348, "completed_jobs": 1420},
    {"id": "p2", "name": "S. Raghuvaran", "category": "Electrician", "role_title": "Industrial Wireman", "rating": 4.8, "reviews_count": 215, "completed_jobs": 980},
    {"id": "p3", "name": "M. Dinesh Kumar", "category": "Electrician", "role_title": "Smart Lighting Specialist", "rating": 4.7, "reviews_count": 162, "completed_jobs": 640},
    {"id": "p4", "name": "V. Senthil Kumar", "category": "Plumber", "role_title": "Senior Plumbing Specialist", "rating": 4.8, "reviews_count": 280, "completed_jobs": 1120},
    {"id": "p5", "name": "A. Joseph Vijay", "category": "Plumber", "role_title": "Sanitary & Drainage Master", "rating": 4.9, "reviews_count": 310, "completed_jobs": 1380},
    {"id": "p6", "name": "P. Manikandan", "category": "Plumber", "role_title": "Emergency Plumber", "rating": 4.6, "reviews_count": 145, "completed_jobs": 520},
    {"id": "p7", "name": "R. Anbarasan", "category": "Carpenter", "role_title": "Woodcraft & Furniture Master", "rating": 4.9, "reviews_count": 412, "completed_jobs": 1780},
    {"id": "p8", "name": "K. Saravanan", "category": "Carpenter", "role_title": "Modular Craftsman", "rating": 4.8, "reviews_count": 198, "completed_jobs": 890},
    {"id": "p9", "name": "G. Velu", "category": "Carpenter", "role_title": "Security Locksmith", "rating": 4.7, "reviews_count": 230, "completed_jobs": 1530},
    {"id": "p10", "name": "D. Karthik", "category": "Appliance & AC", "role_title": "HVAC Technician", "rating": 4.7, "reviews_count": 195, "completed_jobs": 840},
    {"id": "p11", "name": "E. Syed Ibrahim", "category": "Appliance & AC", "role_title": "Refrigeration Master", "rating": 4.9, "reviews_count": 380, "completed_jobs": 1950},
    {"id": "p12", "name": "N. Balamurugan", "category": "Appliance & AC", "role_title": "Appliance Specialist", "rating": 4.8, "reviews_count": 210, "completed_jobs": 1140}
]

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")

    # 1. Jobs Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            customer_id TEXT,
            customer_name TEXT,
            customer_phone TEXT,
            category TEXT,
            problem TEXT,
            address TEXT,
            status TEXT, -- 'BROADCASTING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
            provider_id TEXT,
            provider_name TEXT,
            provider_phone TEXT,
            provider_udyam TEXT,
            provider_role TEXT,
            eta TEXT,
            fee INTEGER,
            final_amount INTEGER,
            otp TEXT,
            created_at TEXT,
            accepted_at TEXT,
            arrived_at TEXT,
            started_at TEXT,
            completed_at TEXT
        );
    """)

    # Ensure all columns exist in jobs
    cursor.execute("PRAGMA table_info(jobs)")
    existing_cols = [r[1] for r in cursor.fetchall()]
    for col, col_type in [
        ("final_amount", "INTEGER"),
        ("arrived_at", "TEXT"),
        ("started_at", "TEXT"),
        ("completed_at", "TEXT")
    ]:
        if col not in existing_cols:
            cursor.execute(f"ALTER TABLE jobs ADD COLUMN {col} {col_type};")

    # 2. Reviews Table (one review allowed per job)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id TEXT PRIMARY KEY,
            job_id TEXT UNIQUE,
            provider_id TEXT,
            stars INTEGER CHECK(stars BETWEEN 1 AND 5),
            tags TEXT,
            comment TEXT,
            created_at TEXT
        );
    """)

    # 3. Providers Table for dynamic rating recalculation
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS providers (
            id TEXT PRIMARY KEY,
            name TEXT,
            category TEXT,
            role_title TEXT,
            rating REAL,
            reviews_count INTEGER,
            completed_jobs INTEGER,
            base_rating_sum REAL,
            base_rating_count INTEGER
        );
    """)

    # Seed providers if table is empty
    cursor.execute("SELECT COUNT(*) FROM providers")
    if cursor.fetchone()[0] == 0:
        for p in INITIAL_PROVIDERS:
            base_sum = round(p["rating"] * p["reviews_count"], 1)
            cursor.execute("""
                INSERT INTO providers (
                    id, name, category, role_title, rating, reviews_count,
                    completed_jobs, base_rating_sum, base_rating_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["id"], p["name"], p["category"], p["role_title"],
                p["rating"], p["reviews_count"], p["completed_jobs"],
                base_sum, p["reviews_count"]
            ))

    conn.commit()
    conn.close()

init_db()

class ConnectionManager:
    def __init__(self):
        self.providers: Dict[str, List[WebSocket]] = {}
        self.customers: Dict[str, List[WebSocket]] = {}
        self.lock = asyncio.Lock()

    async def connect_provider(self, provider_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            if provider_id not in self.providers:
                self.providers[provider_id] = []
            self.providers[provider_id].append(websocket)
        print(f"🟢 Provider connected: {provider_id} (Total: {len(self.providers)})")

    async def disconnect_provider(self, provider_id: str, websocket: WebSocket):
        async with self.lock:
            if provider_id in self.providers:
                if websocket in self.providers[provider_id]:
                    self.providers[provider_id].remove(websocket)
                if not self.providers[provider_id]:
                    del self.providers[provider_id]
        print(f"🔴 Provider disconnected: {provider_id}")

    async def connect_customer(self, customer_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            if customer_id not in self.customers:
                self.customers[customer_id] = []
            self.customers[customer_id].append(websocket)
        print(f"🔵 Customer connected: {customer_id} (Total: {len(self.customers)})")

    async def disconnect_customer(self, customer_id: str, websocket: WebSocket):
        async with self.lock:
            if customer_id in self.customers:
                if websocket in self.customers[customer_id]:
                    self.customers[customer_id].remove(websocket)
                if not self.customers[customer_id]:
                    del self.customers[customer_id]
        print(f"🔴 Customer disconnected: {customer_id}")

    async def broadcast_to_providers(self, message: dict, exclude_provider_id: Optional[str] = None):
        async with self.lock:
            target_sockets = []
            for pid, sockets in self.providers.items():
                if exclude_provider_id and pid == exclude_provider_id:
                    continue
                target_sockets.extend(sockets)

        for ws in target_sockets:
            try:
                await ws.send_json(message)
            except Exception:
                pass

    async def send_to_provider(self, provider_id: str, message: dict):
        async with self.lock:
            sockets = list(self.providers.get(provider_id, []))
        for ws in sockets:
            try:
                await ws.send_json(message)
            except Exception:
                pass

    async def send_to_customer(self, customer_id: str, message: dict):
        async with self.lock:
            sockets = list(self.customers.get(customer_id, []))
            # Fallback to all customer sockets
            if not sockets:
                for s_list in self.customers.values():
                    sockets.extend(s_list)

        for ws in sockets:
            try:
                await ws.send_json(message)
            except Exception:
                pass

    async def broadcast_to_all(self, message: dict):
        await self.broadcast_to_providers(message)
        async with self.lock:
            customer_sockets = [ws for s_list in self.customers.values() for ws in s_list]
        for ws in customer_sockets:
            try:
                await ws.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

app = FastAPI(title="Local Skill Connect Chennai Dispatch Core", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_job_by_id(job_id: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_provider_by_id(provider_id: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM providers WHERE id = ?", (provider_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_all_providers():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM providers ORDER BY rating DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_active_broadcasting_jobs():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE status = 'BROADCASTING' ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Pydantic Schemas
class SOSRequest(BaseModel):
    customer_id: str = "cust_1"
    customer_name: str = "S. Anand"
    customer_phone: str = "+91 98840 99882"
    category: str = "Electrician"
    problem: str = "Urgent MCB Tripping & Electrical Sparking"
    address: str = "Door 14/2, Sivaganga Road, T. Nagar, Chennai - 600017"
    fee: int = 199

class AcceptRequest(BaseModel):
    provider_id: str
    provider_name: str
    provider_phone: str
    provider_udyam: str
    provider_role: str
    eta: str = "12 mins"

class StatusUpdateRequest(BaseModel):
    status: str # "ON_THE_WAY" | "ARRIVED" | "IN_PROGRESS" | "COMPLETED"
    otp: Optional[str] = None
    final_amount: Optional[int] = None

class ReviewCreate(BaseModel):
    stars: int = Field(..., ge=1, le=5)
    tags: List[str] = []
    comment: str = ""

# Strict Lifecycle State Machine Transitions
VALID_FORWARD_TRANSITIONS = {
    "BROADCASTING": ["ACCEPTED", "CANCELLED"],
    "ACCEPTED": ["ON_THE_WAY", "CANCELLED"],
    "ON_THE_WAY": ["ARRIVED", "CANCELLED"],
    "ARRIVED": ["IN_PROGRESS", "CANCELLED"],
    "IN_PROGRESS": ["COMPLETED", "CANCELLED"],
    "COMPLETED": [],
    "CANCELLED": []
}

async def process_sos_creation(req: SOSRequest):
    job_id = f"SOS-{random.randint(1000, 9999)}"
    otp = str(random.randint(1000, 9999))
    now = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO jobs (
            id, customer_id, customer_name, customer_phone,
            category, problem, address, status, fee, final_amount, otp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'BROADCASTING', ?, ?, ?, ?)
    """, (
        job_id, req.customer_id, req.customer_name, req.customer_phone,
        req.category, req.problem, req.address, req.fee, req.fee, otp, now
    ))
    conn.commit()
    conn.close()

    job_data = get_job_by_id(job_id)

    # 1. Broadcast to ALL connected providers
    broadcast_msg = {
        "type": "sos_broadcast",
        "job": job_data,
        "message": f"🚨 EMERGENCY SOS DISPATCH: {req.problem} in {req.address.split(',')[1].strip()}! First to tap Accept wins!"
    }
    await manager.broadcast_to_providers(broadcast_msg)

    # 2. Confirm to customer
    customer_msg = {
        "type": "sos_broadcasting",
        "job": job_data,
        "message": "Broadcasting to all active verified providers in your Chennai zone..."
    }
    await manager.send_to_customer(req.customer_id, customer_msg)

    return job_data

async def process_job_acceptance(job_id: str, accept_data: AcceptRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")

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
    """, (
        accept_data.provider_id,
        accept_data.provider_name,
        accept_data.provider_phone,
        accept_data.provider_udyam,
        accept_data.provider_role,
        accept_data.eta,
        now,
        job_id
    ))
    conn.commit()
    won = (cursor.rowcount == 1)
    conn.close()

    updated_job = get_job_by_id(job_id)

    if won:
        print(f"🏆 Job {job_id} WON by {accept_data.provider_name} ({accept_data.provider_id})!")

        # 1. Notify Winning Provider
        win_msg = {
            "type": "job_won",
            "job": updated_job,
            "message": f"Dispatch Assigned! You won Job {job_id}. Tap 'Start Driving (On the way)' to proceed."
        }
        await manager.send_to_provider(accept_data.provider_id, win_msg)

        # 2. Stand down all other providers
        stand_down_msg = {
            "type": "stand_down",
            "job_id": job_id,
            "winner_id": accept_data.provider_id,
            "winner_name": accept_data.provider_name,
            "message": f"Job {job_id} accepted by {accept_data.provider_name}. Stand down."
        }
        await manager.broadcast_to_providers(stand_down_msg, exclude_provider_id=accept_data.provider_id)

        # 3. Notify Customer with Assigned Provider & ETA
        customer_msg = {
            "type": "job_assigned",
            "job": updated_job,
            "provider": {
                "id": accept_data.provider_id,
                "name": accept_data.provider_name,
                "phone": accept_data.provider_phone,
                "udyam_id": accept_data.provider_udyam,
                "role": accept_data.provider_role,
                "eta": accept_data.eta
            },
            "eta": accept_data.eta,
            "otp": updated_job["otp"],
            "message": f"Technician En Route! {accept_data.provider_name} accepted your SOS dispatch. Arriving in {accept_data.eta}."
        }
        await manager.send_to_customer(updated_job.get("customer_id", "cust_1"), customer_msg)

        return {"success": True, "won": True, "job": updated_job}
    else:
        print(f"❌ Job {job_id} already accepted! {accept_data.provider_name} lost the race.")
        loss_msg = {
            "type": "job_already_taken",
            "job_id": job_id,
            "winner_name": updated_job.get("provider_name") if updated_job else "Another Provider",
            "message": f"Job {job_id} was already accepted by {updated_job.get('provider_name') if updated_job else 'another technician'}!"
        }
        await manager.send_to_provider(accept_data.provider_id, loss_msg)
        return {"success": False, "won": False, "job": updated_job, "message": "Job already accepted by another technician."}

async def process_status_update(job_id: str, update_req: StatusUpdateRequest):
    job = get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    current_status = job["status"]
    new_status = update_req.status.upper()
    valid_next = VALID_FORWARD_TRANSITIONS.get(current_status, [])

    # Validation: No step can be skipped or reversed
    if new_status not in valid_next:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from '{current_status}' to '{new_status}'. Allowed next step: {valid_next}"
        )

    now = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    status_message = ""

    if new_status == "ON_THE_WAY":
        cursor.execute("UPDATE jobs SET status = 'ON_THE_WAY' WHERE id = ?", (job_id,))
        status_message = f"Technician {job['provider_name']} is on the way! ETA: {job['eta']}."

    elif new_status == "ARRIVED":
        cursor.execute("UPDATE jobs SET status = 'ARRIVED', arrived_at = ? WHERE id = ?", (now, job_id))
        status_message = f"Technician {job['provider_name']} has arrived at your location! Please share your 4-digit OTP ({job['otp']}) with the technician."

    elif new_status == "IN_PROGRESS":
        # Crucial Requirement 2: Must ask provider to enter customer's 4-digit start-of-service OTP.
        # Only accept if it matches OTP shown to customer!
        entered_otp = (update_req.otp or "").strip()
        actual_otp = str(job["otp"]).strip()
        if entered_otp != actual_otp:
            conn.close()
            raise HTTPException(
                status_code=400,
                detail=f"Invalid OTP! Entered '{entered_otp}', but customer's start-of-service code does not match."
            )
        cursor.execute("UPDATE jobs SET status = 'IN_PROGRESS', started_at = ? WHERE id = ?", (now, job_id))
        status_message = "OTP Verified! Service is now actively in progress."

    elif new_status == "COMPLETED":
        # Requirement 3: Lets provider enter final amount (default to base fee)
        final_amt = update_req.final_amount if update_req.final_amount is not None else job["fee"]
        cursor.execute("UPDATE jobs SET status = 'COMPLETED', final_amount = ?, completed_at = ? WHERE id = ?", (final_amt, now, job_id))
        status_message = f"Service Completed! Total bill: ₹{final_amt}. Please rate your technician."

    conn.commit()
    conn.close()

    updated_job = get_job_by_id(job_id)

    # Push status change immediately to customer and provider over WebSocket
    push_msg = {
        "type": "job_status_updated",
        "job_id": job_id,
        "status": new_status,
        "job": updated_job,
        "message": status_message
    }
    await manager.send_to_customer(updated_job.get("customer_id", "cust_1"), push_msg)
    if updated_job.get("provider_id"):
        await manager.send_to_provider(updated_job["provider_id"], push_msg)

    return {"success": True, "status": new_status, "job": updated_job, "message": status_message}

async def process_review_submission(job_id: str, review_data: ReviewCreate):
    job = get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Allowed only after status is COMPLETED
    if job["status"] != "COMPLETED":
        raise HTTPException(
            status_code=400,
            detail=f"Reviews can only be submitted after job is COMPLETED (current status: '{job['status']}')."
        )

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Allowed only once per job
    cursor.execute("SELECT id FROM reviews WHERE job_id = ?", (job_id,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Review already submitted for this job.")

    review_id = f"REV-{random.randint(1000, 9999)}"
    now = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")
    tags_json = json.dumps(review_data.tags)

    cursor.execute("""
        INSERT INTO reviews (id, job_id, provider_id, stars, tags, comment, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        review_id, job_id, job["provider_id"], review_data.stars,
        tags_json, review_data.comment, now
    ))

    # Requirement 7: Recalculate provider average rating and completed jobs count
    provider_id = job["provider_id"]
    cursor.execute("SELECT stars FROM reviews WHERE provider_id = ?", (provider_id,))
    all_provider_reviews = [r[0] for r in cursor.fetchall()]

    cursor.execute("SELECT base_rating_sum, base_rating_count, completed_jobs FROM providers WHERE id = ?", (provider_id,))
    prov_row = cursor.fetchone()

    updated_provider_stats = {}
    if prov_row:
        base_sum, base_count, current_jobs = prov_row
        new_reviews_count = base_count + len(all_provider_reviews)
        new_rating = round((base_sum + sum(all_provider_reviews)) / new_reviews_count, 1)
        new_completed_jobs = current_jobs + 1

        cursor.execute("""
            UPDATE providers
            SET rating = ?, reviews_count = ?, completed_jobs = ?
            WHERE id = ?
        """, (new_rating, new_reviews_count, new_completed_jobs, provider_id))

        updated_provider_stats = {
            "id": provider_id,
            "rating": new_rating,
            "reviews_count": new_reviews_count,
            "completed_jobs": new_completed_jobs
        }

    conn.commit()
    conn.close()

    # Broadcast updated provider rating & review to all clients
    broadcast_msg = {
        "type": "provider_rating_updated",
        "provider_id": provider_id,
        "rating": updated_provider_stats.get("rating"),
        "reviews_count": updated_provider_stats.get("reviews_count"),
        "completed_jobs": updated_provider_stats.get("completed_jobs"),
        "job_id": job_id
    }
    await manager.broadcast_to_all(broadcast_msg)

    return {
        "success": True,
        "review_id": review_id,
        "job_id": job_id,
        "provider": updated_provider_stats,
        "message": "Thank you! Your verified review has been submitted and the technician's rating has been updated."
    }


# REST Endpoints
@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "Local Skill Connect Chennai Dispatch Core",
        "database": "SQLite (WAL mode)",
        "connected_providers": list(manager.providers.keys()),
        "connected_customers": list(manager.customers.keys())
    }

@app.get("/api/providers")
def list_providers():
    return get_all_providers()

@app.get("/api/providers/{provider_id}")
def get_provider(provider_id: str):
    prov = get_provider_by_id(provider_id)
    if not prov:
        raise HTTPException(status_code=404, detail="Provider not found")
    return prov

@app.get("/api/jobs")
def list_jobs():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    job = get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.get("/api/jobs/{job_id}/review")
def get_job_review(job_id: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reviews WHERE job_id = ?", (job_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {"reviewed": False}
    return {"reviewed": True, "review": dict(row)}

@app.post("/api/sos")
async def create_sos_api(req: SOSRequest):
    return await process_sos_creation(req)

@app.post("/api/jobs/{job_id}/accept")
async def accept_job_api(job_id: str, accept_data: AcceptRequest):
    return await process_job_acceptance(job_id, accept_data)

@app.post("/api/jobs/{job_id}/status")
async def update_job_status_api(job_id: str, update_req: StatusUpdateRequest):
    return await process_status_update(job_id, update_req)

@app.post("/api/jobs/{job_id}/review")
async def submit_review_api(job_id: str, review_data: ReviewCreate):
    return await process_review_submission(job_id, review_data)


# WebSocket Endpoint
@app.websocket("/ws/{client_type}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_type: str, client_id: str):
    if client_type == "provider":
        await manager.connect_provider(client_id, websocket)
        active_jobs = get_active_broadcasting_jobs()
        await websocket.send_json({
            "type": "connected",
            "client_type": "provider",
            "client_id": client_id,
            "active_broadcasts": active_jobs,
            "message": f"Connected to Chennai Emergency Dispatch Network as {client_id}"
        })
    elif client_type == "customer":
        await manager.connect_customer(client_id, websocket)
        await websocket.send_json({
            "type": "connected",
            "client_type": "customer",
            "client_id": client_id,
            "message": "Connected to Chennai Emergency Dispatch Network"
        })
    else:
        await websocket.close(code=1003)
        return

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "customer_sos":
                sos_req = SOSRequest(
                    customer_id=client_id,
                    customer_name=data.get("customer_name", "S. Anand"),
                    customer_phone=data.get("customer_phone", "+91 98840 99882"),
                    category=data.get("category", "Electrician"),
                    problem=data.get("problem", "Emergency Spark / Burst"),
                    address=data.get("address", "Door 14/2, Sivaganga Road, T. Nagar, Chennai - 600017"),
                    fee=data.get("fee", 199)
                )
                await process_sos_creation(sos_req)

            elif msg_type == "provider_accept":
                job_id = data.get("job_id")
                accept_data = AcceptRequest(
                    provider_id=client_id,
                    provider_name=data.get("provider_name", "Technician"),
                    provider_phone=data.get("provider_phone", "+91 98400 00000"),
                    provider_udyam=data.get("provider_udyam", "UDYAM-TN-02-0000000"),
                    provider_role=data.get("provider_role", "Master Technician"),
                    eta=data.get("eta", "12 mins")
                )
                await process_job_acceptance(job_id, accept_data)

            elif msg_type == "job_status_update":
                job_id = data.get("job_id")
                status_req = StatusUpdateRequest(
                    status=data.get("status"),
                    otp=data.get("otp"),
                    final_amount=data.get("final_amount")
                )
                await process_status_update(job_id, status_req)

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong", "time": datetime.now().isoformat()})

    except WebSocketDisconnect:
        if client_type == "provider":
            await manager.disconnect_provider(client_id, websocket)
        elif client_type == "customer":
            await manager.disconnect_customer(client_id, websocket)
    except Exception as e:
        print(f"WebSocket error for {client_type}/{client_id}: {e}")
        if client_type == "provider":
            await manager.disconnect_provider(client_id, websocket)
        elif client_type == "customer":
            await manager.disconnect_customer(client_id, websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
