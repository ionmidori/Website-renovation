import requests
import io

BASE_URL = "http://localhost:8080"
TIMEOUT = 30
ANALYZE_ENDPOINT = f"{BASE_URL}/analyze_room"

def test_analyze_room_outputs_structural_style_condition_insights():
    # Prepare sample image and video binary content for upload
    # Here we create dummy binary files representing an image and a video
    sample_image_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00"
    sample_video_content = b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42mp41"
    
    headers = {}
    
    def analyze_media(file_fieldname, file_content, filename, content_type):
        files = {
            file_fieldname: (filename, io.BytesIO(file_content), content_type)
        }
        response = None
        try:
            response = requests.post(
                ANALYZE_ENDPOINT,
                files=files,
                timeout=TIMEOUT,
                headers=headers
            )
            response.raise_for_status()
            json_data = response.json()
            # Validate presence and types of keys structural, style, condition insights
            assert isinstance(json_data, dict), "Response is not a JSON object"
            assert "structural" in json_data, "'structural' key missing in response"
            assert "style" in json_data, "'style' key missing in response"
            assert "condition" in json_data, "'condition' key missing in response"
            # Basic type checks (assuming insights are dict or list)
            structural = json_data["structural"]
            style = json_data["style"]
            condition = json_data["condition"]
            assert isinstance(structural, (dict, list)), "'structural' insight is not a dict or list"
            assert isinstance(style, (dict, list)), "'style' insight is not a dict or list"
            assert isinstance(condition, (dict, list)), "'condition' insight is not a dict or list"
            # Optionally check non-empty insights
            assert structural, "'structural' insight is empty"
            assert style, "'style' insight is empty"
            assert condition, "'condition' insight is empty"
        except requests.HTTPError as he:
            assert False, f"HTTP error occurred: {he}"
        except requests.RequestException as re:
            assert False, f"Request error occurred: {re}"
        except ValueError:
            assert False, "Response content is not valid JSON"
        return json_data
    
    # Analyze image file input
    analyze_media("file", sample_image_content, "test_room.png", "image/png")
    # Analyze video file input
    analyze_media("file", sample_video_content, "test_room.mp4", "video/mp4")

test_analyze_room_outputs_structural_style_condition_insights()