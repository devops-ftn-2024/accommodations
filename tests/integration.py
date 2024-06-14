import requests

BASE_URL = "http://localhost:3003"


def test_health():
    response = requests.get(f"{BASE_URL}/accommodation/health")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, World!"}
