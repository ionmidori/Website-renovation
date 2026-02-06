import requests
import io

BASE_URL = "http://localhost:8080"
GENERATE_CAD_ENDPOINT = f"{BASE_URL}/generate_cad"
TIMEOUT = 30

def test_generate_cad_creates_downloadable_dxf_files():
    # Prepare a sample room image to upload for CAD generation
    # For the purpose of this test, we use a small dummy PNG image binary content.
    # In a real scenario, this should be replaced by a valid image file content.
    dummy_image_content = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        b"\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
        b"\x00\x00\x00\nIDATx\x9cc`\x00\x00\x00\x02\x00\x01"
        b"\xe2!\xbc\x33\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    files = {
        'room_image': ('test_room.png', io.BytesIO(dummy_image_content), 'image/png')
    }

    try:
        response = requests.post(
            GENERATE_CAD_ENDPOINT,
            files=files,
            timeout=TIMEOUT
        )
        # Validate response status
        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"
        
        # Validate content type is a DXF file
        content_type = response.headers.get("Content-Type", "")
        assert content_type in ["application/dxf", "application/octet-stream"], (
            f"Expected content type 'application/dxf' or 'application/octet-stream', got {content_type}"
        )
        
        # Validate content disposition header suggests a downloadable DXF file
        content_disposition = response.headers.get("Content-Disposition", "")
        assert "attachment" in content_disposition and ".dxf" in content_disposition, (
            "Response does not contain a downloadable DXF attachment"
        )
        
        # Basic validation on response content - not empty and begins with typical DXF header lines
        content = response.content
        assert content and len(content) > 50, "DXF content is unexpectedly empty or too small"
        
        # DXF files typically start with "0\nSECTION\n2\nHEADER"
        # Decode first 100 bytes for checking (safe fallback if bytes are ascii-compatible)
        snippet = content[:100].decode(errors='ignore').lower()
        assert "section" in snippet and "dxf" not in snippet, (
            "Downloaded file content does not look like a DXF file"
        )
    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"

test_generate_cad_creates_downloadable_dxf_files()