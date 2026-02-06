import requests

BASE_URL = "http://localhost:8080"
TIMEOUT = 30

def test_plan_renovation_generates_skeleton_skin_architectural_plan():
    url = f"{BASE_URL}/plan-renovation"

    # Example payload simulating room analysis data input expected by the plan_renovation endpoint
    payload = {
        "room_analysis": {
            "structure": "Open-plan living room with load-bearing wall on east side",
            "style": "Modern minimalist with neutral colors and natural lighting",
            "condition": "Fair condition, minor wear on flooring, good window integrity"
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to plan renovation endpoint failed: {e}"

    assert response.status_code == 200, f"Unexpected status code: {response.status_code}"

    try:
        res_json = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate expected keys and types in response
    # Assuming response contains 'architectural_plan' with textual content following Skeleton & Skin methodology
    assert "architectural_plan" in res_json, "'architectural_plan' key missing in response"
    architectural_plan = res_json["architectural_plan"]
    assert isinstance(architectural_plan, str), "'architectural_plan' should be a string"
    assert len(architectural_plan) > 0, "'architectural_plan' should not be empty"

    # Additional heuristic checks for Skeleton & Skin methodology keywords typical in architectural plans
    skeleton_keywords = ["load-bearing", "structure", "foundation", "framework", "walls"]
    skin_keywords = ["finishes", "surface", "paint", "flooring", "lighting"]

    skeleton_present = any(word in architectural_plan.lower() for word in skeleton_keywords)
    skin_present = any(word in architectural_plan.lower() for word in skin_keywords)

    assert skeleton_present, "Architectural plan missing Skeleton methodology elements"
    assert skin_present, "Architectural plan missing Skin methodology elements"


test_plan_renovation_generates_skeleton_skin_architectural_plan()