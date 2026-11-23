import os
import sys
import time
import json
import subprocess
import urllib.request
import urllib.error

def make_req(url, method='GET', data=None, headers=None):
    if headers is None:
        headers = {}
    body = None
    if data is not None:
        body = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            return resp.status, content
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 0, str(e)

def main():
    print("=== STARTING END-TO-END AUTH & SERVER VERIFICATION ===")
    server_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "server:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=r"c:\Local skill connect",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    try:
        # Wait for server to become responsive
        started = False
        for i in range(15):
            time.sleep(0.5)
            status, body = make_req("http://127.0.0.1:8000/api/health")
            if status == 200:
                started = True
                print("Server online on http://127.0.0.1:8000/api/health")
                break

        if not started:
            print("Failed to start server!")
            out, err = server_proc.communicate(timeout=2)
            print("STDOUT:", out.decode('utf-8', errors='ignore'))
            print("STDERR:", err.decode('utf-8', errors='ignore'))
            sys.exit(1)

        # 1. Test Static Frontend Serving
        status, body = make_req("http://127.0.0.1:8000/")
        assert status == 200, f"Expected 200 for /, got {status}"
        assert "<title>SkillConnect" in body or "html" in body.lower(), "Frontend HTML not served on /"
        print("✓ Test 1: Frontend index.html served on root /")

        status, body = make_req("http://127.0.0.1:8000/provider")
        assert status == 200, f"Expected 200 for /provider, got {status}"
        assert "html" in body.lower(), "SPA fallback failed on /provider"
        print("✓ Test 2: SPA client routing fallback works on /provider")

        # 2. Test Seeded Customer Login
        status, body = make_req(
            "http://127.0.0.1:8000/api/auth/login",
            method='POST',
            data={"identifier": "9000000001", "password": "demo123", "role": "customer"}
        )
        assert status == 200, f"Seeded customer login failed: {status} {body}"
        cust_data = json.loads(body)
        cust_token = cust_data["token"]
        assert cust_data["user"]["name"] == "S. Anand"
        assert cust_data["user"]["role"] == "customer"
        print("✓ Test 3: Seeded Customer (S. Anand, 9000000001) logged in with JWT token")

        # 3. Test Seeded Provider Login
        status, body = make_req(
            "http://127.0.0.1:8000/api/auth/login",
            method='POST',
            data={"identifier": "9000000002", "password": "demo123", "role": "provider"}
        )
        assert status == 200, f"Seeded provider login failed: {status} {body}"
        prov_data = json.loads(body)
        prov_token = prov_data["token"]
        assert prov_data["user"]["name"] == "K. Murugan"
        assert prov_data["user"]["role"] == "provider"
        assert "Electrician" in prov_data["profile"]["trades"]
        assert prov_data["profile"]["base_fee"] == 199
        print("✓ Test 4: Seeded Provider (K. Murugan, 9000000002) logged in with trades & profile")

        # 4. Test Customer Register
        test_mob = f"98765{int(time.time()) % 100000:05d}"
        status, body = make_req(
            "http://127.0.0.1:8000/api/auth/register/customer",
            method='POST',
            data={
                "name": "Priya Raman",
                "mobile": test_mob,
                "email": f"priya_{test_mob}@test.in",
                "password": "mypassword123",
                "confirm_password": "mypassword123"
            }
        )
        assert status == 200, f"Customer register failed: {status} {body}"
        new_cust = json.loads(body)
        new_cust_token = new_cust["token"]
        print(f"✓ Test 5: New Customer registered successfully ({test_mob})")

        # 5. Test Provider Register & Explore Catalog Inclusion
        prov_mob = f"91234{int(time.time()) % 100000:05d}"
        status, body = make_req(
            "http://127.0.0.1:8000/api/auth/register/provider",
            method='POST',
            data={
                "name": "S. Vetrivel",
                "mobile": prov_mob,
                "password": "provpassword123",
                "confirm_password": "provpassword123",
                "trades": ["Plumber"],
                "specializations": "Drainage & Motor Overhaul",
                "experience_years": 8,
                "work_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                "work_start": "08:00",
                "work_end": "20:00",
                "emergency_available": True,
                "base_fee": 175,
                "hourly_rate": 220,
                "udyam_id": "UDYAM-TN-02-0099881"
            }
        )
        assert status == 200, f"Provider register failed: {status} {body}"
        new_prov = json.loads(body)
        new_prov_token = new_prov["token"]
        new_prov_id = new_prov["user"]["id"]
        print(f"✓ Test 6: New Provider registered successfully ({new_prov_id}, Base fee: ₹175)")

        # Verify new provider appears in GET /api/providers
        status, body = make_req("http://127.0.0.1:8000/api/providers")
        assert status == 200
        all_provs = json.loads(body)
        found_prov = next((p for p in all_provs if p["id"] == new_prov_id), None)
        assert found_prov is not None, "New provider not found in /api/providers list!"
        assert found_prov["name"] == "S. Vetrivel"
        assert found_prov["category"] == "Plumber"
        assert found_prov["fee"] == 175
        print(f"✓ Test 7: New Provider verified in Explore list with expected base fee ₹{found_prov['fee']}")

        # 6. Test Role Protection: Customer endpoint rejects provider
        status, body = make_req(
            "http://127.0.0.1:8000/api/sos",
            method='POST',
            data={
                "customer_name": "S. Anand",
                "customer_phone": "+91 9000000001",
                "category": "Electrician",
                "problem": "Test Spark Hazard",
                "address": "Door 14/2, T. Nagar, Chennai",
                "fee": 199
            },
            headers={"Authorization": f"Bearer {prov_token}"}
        )
        assert status == 403, f"Expected 403 for provider token calling /api/sos, got {status}"
        print("✓ Test 8: Role Protection: Provider token correctly rejected (403) from SOS dispatch")

        # 7. Customer token dispatches SOS successfully
        status, body = make_req(
            "http://127.0.0.1:8000/api/sos",
            method='POST',
            data={
                "customer_name": "Priya Raman",
                "customer_phone": f"+91 {test_mob}",
                "category": "Electrician",
                "problem": "Live MCB Spark Tripping",
                "address": "Door 22, Mylapore, Chennai",
                "fee": 199
            },
            headers={"Authorization": f"Bearer {new_cust_token}"}
        )
        assert status == 200, f"SOS dispatch failed: {status} {body}"
        sos_res = json.loads(body)
        sos_job = sos_res.get("job", sos_res)
        job_id = sos_job["id"]
        job_otp = sos_job["otp"]
        print(f"✓ Test 9: Customer token successfully dispatched SOS ({job_id}, OTP: {job_otp})")

        # 8. Role Protection: Customer token rejects job acceptance
        status, body = make_req(
            f"http://127.0.0.1:8000/api/jobs/{job_id}/accept",
            method='POST',
            data={
                "provider_id": "p1",
                "provider_name": "K. Murugan",
                "provider_phone": "+91 9000000002",
                "provider_udyam": "UDYAM-TN-02-0048192",
                "provider_role": "Master Electrician",
                "eta": "10 mins"
            },
            headers={"Authorization": f"Bearer {new_cust_token}"}
        )
        assert status == 403, f"Expected 403 for customer token accepting job, got {status}"
        print("✓ Test 10: Role Protection: Customer token correctly rejected (403) from accepting job")

        # 9. Provider token accepts job
        status, body = make_req(
            f"http://127.0.0.1:8000/api/jobs/{job_id}/accept",
            method='POST',
            data={
                "provider_id": "p1",
                "provider_name": "K. Murugan",
                "provider_phone": "+91 9000000002",
                "provider_udyam": "UDYAM-TN-02-0048192",
                "provider_role": "Master Electrician",
                "eta": "10 mins"
            },
            headers={"Authorization": f"Bearer {prov_token}"}
        )
        assert status == 200, f"Job accept failed: {status} {body}"
        print(f"✓ Test 11: Provider token successfully accepted job ({job_id})")

        # 10. Complete lifecycle through OTP and Final Bill
        # Status -> ON_THE_WAY
        status, body = make_req(
            f"http://127.0.0.1:8000/api/jobs/{job_id}/status",
            method='POST',
            data={"status": "ON_THE_WAY"},
            headers={"Authorization": f"Bearer {prov_token}"}
        )
        assert status == 200

        # Status -> ARRIVED
        status, body = make_req(
            f"http://127.0.0.1:8000/api/jobs/{job_id}/status",
            method='POST',
            data={"status": "ARRIVED"},
            headers={"Authorization": f"Bearer {prov_token}"}
        )
        assert status == 200

        # Status -> IN_PROGRESS with OTP
        status, body = make_req(
            f"http://127.0.0.1:8000/api/jobs/{job_id}/status",
            method='POST',
            data={"status": "IN_PROGRESS", "otp": job_otp},
            headers={"Authorization": f"Bearer {prov_token}"}
        )
        assert status == 200

        # Status -> COMPLETED with final amount
        status, body = make_req(
            f"http://127.0.0.1:8000/api/jobs/{job_id}/status",
            method='POST',
            data={"status": "COMPLETED", "final_amount": 249},
            headers={"Authorization": f"Bearer {prov_token}"}
        )
        assert status == 200
        completed_job = json.loads(body)["job"]
        assert completed_job["status"] == "COMPLETED"
        assert completed_job["final_amount"] == 249
        print(f"✓ Test 12: Lifecycle (ON_THE_WAY -> ARRIVED -> IN_PROGRESS (OTP: {job_otp}) -> COMPLETED (₹249)) completed")

        print("\nALL 12 END-TO-END AUTH & LIFECYCLE TESTS PASSED PERFECTLY!")

    finally:
        server_proc.terminate()
        server_proc.wait(timeout=3)
        print("Test server shutdown.")

if __name__ == "__main__":
    main()
