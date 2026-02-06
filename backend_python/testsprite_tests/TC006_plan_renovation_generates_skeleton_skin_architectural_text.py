import requests
import uuid

BASE_URL = "http://localhost:8080"
TIMEOUT = 30


def test_plan_renovation_generates_skeleton_skin_architectural_text():
    # Payload to create a room analysis as prerequisite for plan_renovation
    analyze_room_url = f"{BASE_URL}/analyze_room"
    sample_room_analysis_payload = {
        "room_id": str(uuid.uuid4()),
        "images": [
            "https://example.com/room_image1.jpg",
            "https://example.com/room_image2.jpg"
        ],
        "video": None
    }

    # Create a room analysis resource to generate plan from
    try:
        analyze_response = requests.post(
            analyze_room_url,
            json=sample_room_analysis_payload,
            timeout=TIMEOUT
        )
        analyze_response.raise_for_status()
        analysis_result = analyze_response.json()
        # Assuming the analysis result includes an analysis_id to reference
        analysis_id = analysis_result.get("analysis_id")
        assert analysis_id, "analysis_id must be present in analyze_room response"
        
        # Now request the plan_renovation endpoint with the analysis_id
        plan_renovation_url = f"{BASE_URL}/plan_renovation"
        plan_payload = {
            "analysis_id": analysis_id,
            "methodology": "Skeleton & Skin"
        }
        
        plan_response = requests.post(
            plan_renovation_url,
            json=plan_payload,
            timeout=TIMEOUT
        )
        plan_response.raise_for_status()
        plan_data = plan_response.json()

        # Validate response schema and content
        assert "architectural_plan_text" in plan_data, "Response missing architectural_plan_text"
        architectural_text = plan_data["architectural_plan_text"]
        assert isinstance(architectural_text, str), "architectural_plan_text should be a string"
        assert len(architectural_text.strip()) > 100, "architectural_plan_text is too short; expected a detailed plan"

        # Validate coherence by checking presence of key terms related to Skeleton & Skin methodology
        key_terms = ["Skeleton", "Skin", "structural", "finishes", "framework", "cladding", "support", "architecture"]
        matched_terms = [term for term in key_terms if term.lower() in architectural_text.lower()]
        assert len(matched_terms) >= 3, "architectural_plan_text does not sufficiently reflect Skeleton & Skin methodology"

    finally:
        # Cleanup: if analyze room resource created a persistent entity, delete it
        if 'analysis_id' in locals():
            delete_url = f"{analyze_room_url}/{analysis_id}"
            try:
                requests.delete(delete_url, timeout=TIMEOUT)
            except Exception:
                pass


test_plan_renovation_generates_skeleton_skin_architectural_text()