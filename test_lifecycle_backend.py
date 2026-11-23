import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:8000"

def make_request(url, method="GET", data=None):
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    body = json.dumps(data).encode("utf-8") if data else None
    try:
        with urllib.request.urlopen(req, data=body) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

def run_tests():
    print("1. Creating SOS job...")
    sos_data = {
        "customer_id": "cust_test_life",
        "customer_name": "S. Anand",
        "customer_phone": "+91 98840 99882",
        "category": "Electrician",
        "problem": "Main DB sparking emergency test",
        "address": "Door 14/2, Sivaganga Road, T. Nagar, Chennai - 600017",
        "fee": 199
    }
    status, job = make_request(f"{BASE_URL}/api/sos", "POST", sos_data)
    assert status == 200, f"SOS failed: {job}"
    job_id = job["id"]
    otp = job["otp"]
    print(f"Created Job {job_id} with OTP {otp}")

    print("\n2. Accepting job as Provider p1 (K. Murugan)...")
    accept_data = {
        "provider_id": "p1",
        "provider_name": "K. Murugan",
        "provider_phone": "+91 98401 23456",
        "provider_udyam": "UDYAM-TN-02-0048192",
        "provider_role": "Master Electrician",
        "eta": "12 mins"
    }
    status, res = make_request(f"{BASE_URL}/api/jobs/{job_id}/accept", "POST", accept_data)
    assert status == 200 and res["won"] is True
    print(f"Job accepted. Status: {res['job']['status']}")

    print("\n3. Testing invalid skip: ACCEPTED -> COMPLETED (Must fail)...")
    status, res = make_request(f"{BASE_URL}/api/jobs/{job_id}/status", "POST", {"status": "COMPLETED"})
    print(f"Result: HTTP {status} -> {res.get('detail')}")
    assert status == 400

    print("\n4. Transitioning: ACCEPTED -> ON_THE_WAY...")
    status, res = make_request(f"{BASE_URL}/api/jobs/{job_id}/status", "POST", {"status": "ON_THE_WAY"})
    assert status == 200
    print(f"Result: {res['status']} -> {res['message']}")

    print("\n5. Transitioning: ON_THE_WAY -> ARRIVED...")
    status, res = make_request(f"{BASE_URL}/api/jobs/{job_id}/status", "POST", {"status": "ARRIVED"})
    assert status == 200
    print(f"Result: {res['status']} -> {res['message']}")

    print("\n6. Testing invalid OTP on ARRIVED -> IN_PROGRESS (Must fail)...")
    status, res = make_request(f"{BASE_URL}/api/jobs/{job_id}/status", "POST", {"status": "IN_PROGRESS", "otp": "0000"})
    print(f"Result: HTTP {status} -> {res.get('detail')}")
    assert status == 400

    print(f"\n7. Transitioning with correct OTP ({otp}): ARRIVED -> IN_PROGRESS...")
    status, res = make_request(f"{BASE_URL}/api/jobs/{job_id}/status", "POST", {"status": "IN_PROGRESS", "otp": otp})
    assert status == 200
    print(f"Result: {res['status']} -> {res['message']}")

    print("\n8. Transitioning: IN_PROGRESS -> COMPLETED with final_amount=249...")
    status, res = make_request(f"{BASE_URL}/api/jobs/{job_id}/status", "POST", {"status": "COMPLETED", "final_amount": 249})
    assert status == 200
    assert res["job"]["final_amount"] == 249
    print(f"Result: {res['status']} -> {res['message']} (Final: ₹{res['job']['final_amount']})")

    print("\n9. Testing Review submission on COMPLETED job...")
    review_data = {
        "stars": 5,
        "tags": ["Fast Arrival", "Transparent Pricing", "Professional"],
        "comment": "Murugan arrived in 12 mins and fixed the MCB spark quickly with genuine parts. Highly recommended!"
    }
    status, res = make_request(f"{BASE_URL}/api/jobs/{job_id}/review", "POST", review_data)
    assert status == 200
    print(f"Review result: {res['message']}")
    print(f"Updated Provider stats: {res['provider']}")

    print("\n10. Testing duplicate review submission (Must fail)...")
    status, res = make_request(f"{BASE_URL}/api/jobs/{job_id}/review", "POST", review_data)
    print(f"Result: HTTP {status} -> {res.get('detail')}")
    assert status == 400

    print("\n✅ ALL BACKEND LIFECYCLE, VALIDATION, AND REVIEW TESTS PASSED!")

if __name__ == "__main__":
    run_tests()
