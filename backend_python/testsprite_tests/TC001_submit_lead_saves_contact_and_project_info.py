import requests
import uuid

BASE_URL = "http://localhost:8080"
TIMEOUT = 30


def test_submit_lead_saves_contact_and_project_info():
    """
    Test the API endpoint for submitting lead information to ensure it correctly saves contact details and project info
    and that the data is retrievable.
    """
    endpoint_submit = f"{BASE_URL}/lead/submit"
    endpoint_get = f"{BASE_URL}/lead"

    # Generate unique test data to avoid collision
    unique_id = str(uuid.uuid4())
    lead_data = {
        "contact": {
            "first_name": "Test",
            "last_name": "Lead",
            "email": f"test.lead.{unique_id}@example.com",
            "phone": "+1234567890"
        },
        "project": {
            "project_name": f"Test Project {unique_id}",
            "address": "123 Test St, Testville",
            "details": "Renovation test project details"
        }
    }

    lead_id = None

    try:
        # Submit lead information
        response_submit = requests.post(
            endpoint_submit,
            json=lead_data,
            timeout=TIMEOUT
        )
        assert response_submit.status_code == 201, f"Expected status 201 Created but got {response_submit.status_code}"
        json_submit = response_submit.json()
        assert "lead_id" in json_submit, "Response missing lead_id"
        lead_id = json_submit["lead_id"]
        assert isinstance(lead_id, str) and lead_id, "Invalid lead_id in response"

        # Retrieve the saved lead data
        response_get = requests.get(
            f"{endpoint_get}/{lead_id}",
            timeout=TIMEOUT
        )
        assert response_get.status_code == 200, f"Expected status 200 OK but got {response_get.status_code}"
        json_get = response_get.json()

        # Validate returned data matches submitted data
        assert "contact" in json_get, "Returned data missing contact info"
        assert "project" in json_get, "Returned data missing project info"

        contact = json_get["contact"]
        project = json_get["project"]

        assert contact.get("first_name") == lead_data["contact"]["first_name"], "Mismatch in contact first_name"
        assert contact.get("last_name") == lead_data["contact"]["last_name"], "Mismatch in contact last_name"
        assert contact.get("email") == lead_data["contact"]["email"], "Mismatch in contact email"
        assert contact.get("phone") == lead_data["contact"]["phone"], "Mismatch in contact phone"

        assert project.get("project_name") == lead_data["project"]["project_name"], "Mismatch in project_name"
        assert project.get("address") == lead_data["project"]["address"], "Mismatch in project address"
        assert project.get("details") == lead_data["project"]["details"], "Mismatch in project details"

    finally:
        # Cleanup: Delete the created lead
        if lead_id:
            try:
                response_delete = requests.delete(
                    f"{endpoint_get}/{lead_id}",
                    timeout=TIMEOUT
                )
                # Accept 204 No Content or 200 OK
                assert response_delete.status_code in {200, 204}, f"Failed to delete lead {lead_id}"
            except Exception:
                # Log or ignore, but do not raise to avoid masking test results
                pass


test_submit_lead_saves_contact_and_project_info()