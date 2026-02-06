import requests

BASE_URL = "http://localhost:8080"
MARKET_PRICES_ENDPOINT = "/api/market/prices"
TIMEOUT = 30

def test_get_market_prices_returns_current_data():
    headers = {
        "Accept": "application/json",
    }
    try:
        response = requests.get(f"{BASE_URL}{MARKET_PRICES_ENDPOINT}", headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to market prices endpoint failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate data structure and content for renovation materials and services prices
    assert isinstance(data, dict), "Response JSON should be a dictionary"

    # Expect at least keys for materials and services
    expected_keys = {"materials", "services"}
    missing_keys = expected_keys - data.keys()
    assert not missing_keys, f"Missing expected keys from response JSON: {missing_keys}"

    # Check materials data
    materials = data.get("materials")
    assert isinstance(materials, list), "Field 'materials' should be a list"
    for item in materials:
        assert isinstance(item, dict), "Each material item should be a dictionary"
        assert "name" in item and isinstance(item["name"], str) and item["name"], "Material 'name' missing or invalid"
        assert "price" in item and (isinstance(item["price"], float) or isinstance(item["price"], int)), "Material 'price' missing or invalid"
        assert item["price"] >= 0, "Material 'price' should be non-negative"

    # Check services data
    services = data.get("services")
    assert isinstance(services, list), "Field 'services' should be a list"
    for item in services:
        assert isinstance(item, dict), "Each service item should be a dictionary"
        assert "name" in item and isinstance(item["name"], str) and item["name"], "Service 'name' missing or invalid"
        assert "price" in item and (isinstance(item["price"], float) or isinstance(item["price"], int)), "Service 'price' missing or invalid"
        assert item["price"] >= 0, "Service 'price' should be non-negative"


test_get_market_prices_returns_current_data()