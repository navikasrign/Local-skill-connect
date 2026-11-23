import asyncio
import json
import websockets

async def test_flow():
    uri_base = "ws://localhost:8000/ws"
    
    print("Connecting Customer, Provider 1, and Provider 2...")
    async with websockets.connect(f"{uri_base}/customer/cust_test") as ws_cust, \
               websockets.connect(f"{uri_base}/provider/p1") as ws_p1, \
               websockets.connect(f"{uri_base}/provider/p2") as ws_p2:

        # Receive connection acks
        ack_cust = json.loads(await ws_cust.recv())
        ack_p1 = json.loads(await ws_p1.recv())
        ack_p2 = json.loads(await ws_p2.recv())
        print(f"Acks received: Customer={ack_cust['client_type']}, P1={ack_p1['client_id']}, P2={ack_p2['client_id']}")

        # Step 1: Customer triggers SOS
        print("\nStep 1: Customer sends SOS message...")
        sos_msg = {
            "type": "customer_sos",
            "customer_name": "S. Anand",
            "customer_phone": "+91 98840 99882",
            "category": "Electrician",
            "problem": "Severe electrical spark & main DB fire threat",
            "address": "Door 14/2, Sivaganga Road, T. Nagar, Chennai - 600017",
            "fee": 199
        }
        await ws_cust.send(json.dumps(sos_msg))

        # Customer gets confirmation
        cust_broadcast_confirm = json.loads(await ws_cust.recv())
        job_id = cust_broadcast_confirm["job"]["id"]
        print(f"Customer received broadcasting ack for Job ID: {job_id}")

        # Both providers must receive sos_broadcast
        p1_broadcast = json.loads(await ws_p1.recv())
        p2_broadcast = json.loads(await ws_p2.recv())
        print(f"Provider 1 received alert: {p1_broadcast['type']} for {p1_broadcast['job']['id']}")
        print(f"Provider 2 received alert: {p2_broadcast['type']} for {p2_broadcast['job']['id']}")
        assert p1_broadcast["type"] == "sos_broadcast"
        assert p2_broadcast["type"] == "sos_broadcast"
        assert p1_broadcast["job"]["status"] == "BROADCASTING"

        # Step 2: Provider 1 accepts FIRST
        print(f"\nStep 2: Provider 1 taps ACCEPT on {job_id}...")
        accept_p1 = {
            "type": "provider_accept",
            "job_id": job_id,
            "provider_name": "K. Murugan",
            "provider_phone": "+91 98401 23456",
            "provider_udyam": "UDYAM-TN-02-0048192",
            "provider_role": "Master Electrician",
            "eta": "10 mins"
        }
        await ws_p1.send(json.dumps(accept_p1))

        # Provider 1 should receive job_won
        p1_result = json.loads(await ws_p1.recv())
        print(f"Provider 1 result: {p1_result['type']} -> {p1_result.get('message')}")
        assert p1_result["type"] == "job_won"
        assert p1_result["job"]["status"] == "ACCEPTED"
        assert p1_result["job"]["provider_id"] == "p1"

        # Provider 2 MUST receive STAND DOWN!
        p2_stand_down = json.loads(await ws_p2.recv())
        print(f"Provider 2 received: {p2_stand_down['type']} -> {p2_stand_down.get('message')}")
        assert p2_stand_down["type"] == "stand_down"
        assert p2_stand_down["winner_id"] == "p1"

        # Customer MUST receive job_assigned with provider and ETA!
        cust_assigned = json.loads(await ws_cust.recv())
        print(f"Customer received: {cust_assigned['type']} -> Assigned to: {cust_assigned['provider']['name']}, ETA: {cust_assigned['eta']}")
        assert cust_assigned["type"] == "job_assigned"
        assert cust_assigned["provider"]["name"] == "K. Murugan"
        assert cust_assigned["eta"] == "10 mins"

        # Step 3: Provider 2 tries to accept AFTERWARDS (race condition test)
        print(f"\nStep 3: Provider 2 tries to accept already accepted job {job_id}...")
        accept_p2 = {
            "type": "provider_accept",
            "job_id": job_id,
            "provider_name": "S. Raghuvaran",
            "provider_phone": "+91 98402 34567",
            "provider_udyam": "UDYAM-TN-02-0051283",
            "provider_role": "Industrial Wireman",
            "eta": "15 mins"
        }
        await ws_p2.send(json.dumps(accept_p2))
        p2_loss = json.loads(await ws_p2.recv())
        print(f"Provider 2 attempt result: {p2_loss['type']} -> {p2_loss.get('message')}")
        assert p2_loss["type"] == "job_already_taken"

        print("\n🎉 ALL ATOMIC WEBSOCKET TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(test_flow())
