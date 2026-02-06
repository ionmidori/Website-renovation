import requests
import uuid

BASE_URL = "http://localhost:8080"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json",
    # Add authentication headers here if required, e.g. "Authorization": "Bearer <token>"
}


def create_test_project():
    # Minimal payload to create a project for testing assets listing
    payload = {
        "name": f"Test Project {uuid.uuid4()}",
        "description": "Project created for asset listing test case",
    }
    response = requests.post(f"{BASE_URL}/projects", json=payload, headers=HEADERS, timeout=TIMEOUT)
    response.raise_for_status()
    return response.json()["id"]


def upload_asset(project_id, asset_type, asset_name, asset_content):
    """
    Helper to upload asset to project
    asset_type: "image" | "document" | "video"
    asset_content: bytes to upload
    """
    files = {
        "file": (asset_name, asset_content),
        "asset_type": (None, asset_type)
    }
    url = f"{BASE_URL}/projects/{project_id}/assets"
    response = requests.post(url, headers={}, files=files, timeout=TIMEOUT)
    response.raise_for_status()
    return response.json()["asset_id"]


def delete_project(project_id):
    requests.delete(f"{BASE_URL}/projects/{project_id}", headers=HEADERS, timeout=TIMEOUT)


def test_list_project_files_returns_complete_asset_listing():
    project_id = None
    asset_ids = []
    try:
        # Create a new project to test against
        project_id = create_test_project()

        # Upload multiple asset types
        img_id = upload_asset(project_id, "image", "room_photo.jpg", b"fake-image-content")
        doc_id = upload_asset(project_id, "document", "spec_sheet.pdf", b"%PDF-1.4 fake-pdf-content")
        vid_id = upload_asset(project_id, "video", "walkthrough.mp4", b"fake-video-content")

        asset_ids.extend([img_id, doc_id, vid_id])

        # Get the project files listing
        resp = requests.get(f"{BASE_URL}/projects/{project_id}/assets", headers=HEADERS, timeout=TIMEOUT)
        assert resp.status_code == 200
        data = resp.json()
        # Validate the 'assets' field is present and is a list
        assert "assets" in data and isinstance(data["assets"], list)

        # Collect returned asset ids and types
        returned_assets = {a["id"]: a for a in data["assets"] if "id" in a and "type" in a}

        # Assert all uploaded assets are present
        for asset_id in asset_ids:
            assert asset_id in returned_assets

        # Assert presence of each asset type
        types_found = {returned_assets[aid]["type"] for aid in asset_ids}
        assert "image" in types_found
        assert "document" in types_found
        assert "video" in types_found

    finally:
        # Cleanup: delete the project and all assets with it
        if project_id:
            delete_project(project_id)


test_list_project_files_returns_complete_asset_listing()