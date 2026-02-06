import requests
import uuid

BASE_URL = "http://localhost:8080"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json",
    # Add Authentication header if needed, e.g. "Authorization": "Bearer <token>"
}


def create_project():
    url = f"{BASE_URL}/projects"
    project_data = {
        "name": f"Test Project {uuid.uuid4()}",
        "description": "Temporary project for gallery test"
    }
    response = requests.post(url, json=project_data, headers=HEADERS, timeout=TIMEOUT)
    response.raise_for_status()
    return response.json()["id"]


def generate_render_for_project(project_id):
    url = f"{BASE_URL}/projects/{project_id}/renders"
    render_data = {
        "title": "Test Render",
        "description": "Photorealistic render for gallery test",
        "parameters": {
            "style": "modern",
            "resolution": "1920x1080"
        }
    }
    response = requests.post(url, json=render_data, headers=HEADERS, timeout=TIMEOUT)
    response.raise_for_status()
    return response.json()["render_id"]


def upload_photo_for_project(project_id):
    url = f"{BASE_URL}/projects/{project_id}/photos"
    # For test, we simulate photo upload with minimal valid data (no real file upload if API doesn't support multipart here)
    photo_data = {
        "title": "Test Photo",
        "description": "Sample photo for gallery test",
        "url": "http://example.com/photo.jpg"
    }
    response = requests.post(url, json=photo_data, headers=HEADERS, timeout=TIMEOUT)
    response.raise_for_status()
    return response.json()["photo_id"]


def delete_project(project_id):
    url = f"{BASE_URL}/projects/{project_id}"
    response = requests.delete(url, headers=HEADERS, timeout=TIMEOUT)
    # If project is already deleted by cascade, ignore HTTP 404
    if response.status_code not in (204, 404):
        response.raise_for_status()


def test_show_project_gallery_displays_recent_renders_and_photos():
    project_id = None
    try:
        # Create project needed for gallery
        project_id = create_project()

        # Generate a render and upload a photo for the project to appear in gallery
        render_id = generate_render_for_project(project_id)
        photo_id = upload_photo_for_project(project_id)

        # Call gallery endpoint for project
        gallery_url = f"{BASE_URL}/projects/{project_id}/gallery"
        response = requests.get(gallery_url, headers=HEADERS, timeout=TIMEOUT)

        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        gallery_data = response.json()

        # Validate that recent renders and photos include generated items
        renders = gallery_data.get("renders", [])
        photos = gallery_data.get("photos", [])

        assert any(r.get("id") == render_id for r in renders), "Recent renders missing the generated render"
        assert any(p.get("id") == photo_id for p in photos), "Recent photos missing the uploaded photo"

    finally:
        if project_id:
            delete_project(project_id)


test_show_project_gallery_displays_recent_renders_and_photos()