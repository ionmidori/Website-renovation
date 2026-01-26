
from fastapi.testclient import TestClient
from main import app
from src.auth.jwt_handler import get_current_user_id

# 1. Mock Authentication
def mock_get_current_user_id():
    return "test_user_manual_verification"

# 2. Override Dependency
app.dependency_overrides[get_current_user_id] = mock_get_current_user_id

client = TestClient(app)

def test_passkey_flow():
    print("🚀 Starting Passkey Flow Verification...")
    
    # A. Register Options
    print("\n[1] Testing /register/options...")
    try:
        reg_payload = {"user_id": "test_user_manual_verification"}
        resp = client.post("/api/passkey/register/options", json=reg_payload)
        
        if resp.status_code == 200:
            data = resp.json()
            print("✅ Register Options Success!")
            print(f"   Challenge: {data['challenge'][:10]}...")
            print(f"   RP Name: {data['rp']['name']}")
            print(f"   User ID: {data['user']['name']}")
        else:
            print(f"❌ Register Options Failed: {resp.status_code} - {resp.text}")
            return
            
    except Exception as e:
        print(f"❌ Exception in Register Options: {e}")
        return

    # B. Auth Options
    print("\n[2] Testing /authenticate/options...")
    try:
        auth_payload = {"user_id": "test_user_manual_verification"}
        resp = client.post("/api/passkey/authenticate/options", json=auth_payload)
        
        if resp.status_code == 200:
            data = resp.json()
            print("✅ Auth Options Success!")
            print(f"   Challenge: {data['challenge'][:10]}...")
            print(f"   RP ID: {data['rpId']}")
        # Note: Might return 404 if no passkeys registered yet, which is expected behavior for a fresh user
        elif resp.status_code == 404:
             print("✅ Auth Options Correctly returned 404 (No credentials yet)")
        else:
             print(f"❌ Auth Options Failed: {resp.status_code} - {resp.text}")

    except Exception as e:
        print(f"❌ Exception in Auth Options: {e}")

if __name__ == "__main__":
    test_passkey_flow()
