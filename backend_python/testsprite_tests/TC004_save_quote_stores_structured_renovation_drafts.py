import requests
import uuid

BASE_URL = "http://localhost:8080"
HEADERS = {
    "Content-Type": "application/json"
}
TIMEOUT = 30


def test_save_quote_stores_structured_renovation_drafts():
    draft_id = None
    quote_payload = {
        "client_name": "Jane Doe",
        "project_name": "Kitchen Remodel",
        "project_description": "Full kitchen renovation including cabinets, flooring, and lighting",
        "rooms": [
            {
                "name": "Kitchen",
                "area_sqm": 25,
                "renovation_items": [
                    {"item": "cabinets", "description": "Replace cabinets with modern design", "estimated_cost": 15000},
                    {"item": "flooring", "description": "Install hardwood flooring", "estimated_cost": 8000},
                    {"item": "lighting", "description": "Upgrade to LED recessed lights", "estimated_cost": 3000}
                ]
            }
        ],
        "total_estimated_cost": 26000,
        "status": "draft",
        "last_modified": "2026-02-04T12:00:00Z"
    }

    try:
        # Save the structured renovation quote draft
        response = requests.post(
            f"{BASE_URL}/quotes",
            json=quote_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert response.status_code in (200, 201), f"Unexpected status code: {response.status_code}"
        data = response.json()
        assert "id" in data, "Response JSON missing 'id'"
        draft_id = data["id"]
        # Validate that the returned draft data matches what was sent (except possibly server-generated fields)
        for key in quote_payload:
            assert key in data, f"Response missing expected key: {key}"
        # Retrieve the saved draft to verify it can be fetched and matches the saved data
        get_resp = requests.get(
            f"{BASE_URL}/quotes/{draft_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert get_resp.status_code == 200, f"Failed to retrieve saved quote draft; status code: {get_resp.status_code}"
        retrieved_data = get_resp.json()
        for key, value in quote_payload.items():
            assert key in retrieved_data, f"Retrieved data missing key: {key}"
            assert retrieved_data[key] == value, f"Field '{key}' mismatch. Expected: {value}, Got: {retrieved_data[key]}"

    finally:
        # Clean up by deleting the created quote draft if it was created
        if draft_id:
            del_resp = requests.delete(
                f"{BASE_URL}/quotes/{draft_id}",
                headers=HEADERS,
                timeout=TIMEOUT
            )
            assert del_resp.status_code in (200, 204), f"Failed to delete quote draft; status code: {del_resp.status_code}"


test_save_quote_stores_structured_renovation_drafts()
