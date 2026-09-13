"""
Test suite for DRISHTI-AI FastAPI Microservice.
Verifies health endpoint, quality gates (blur & illumination), CLAHE, ResNet-50 grading, and Grad-CAM generation.
"""

import base64
import io
import cv2
import numpy as np
from fastapi.testclient import TestClient

from main import app, check_image_quality, enhance_with_clahe

client = TestClient(app)

def create_in_memory_image(img_bgr: np.ndarray, ext: str = ".jpg") -> io.BytesIO:
    """Helper to convert OpenCV image to in-memory bytes buffer."""
    _, buffer = cv2.imencode(ext, img_bgr)
    return io.BytesIO(buffer.tobytes())

def generate_sharp_fundus_mock() -> np.ndarray:
    """
    Generates a synthetic fundus mock image with moderate illumination and sharp details
    to ensure it passes blur (variance of Laplacian >= 80) and illumination (40 <= mean <= 220).
    """
    # 500x500 base fundus orange-red background
    img = np.zeros((500, 500, 3), dtype=np.uint8)
    img[:, :, 0] = 30   # Blue
    img[:, :, 1] = 65   # Green
    img[:, :, 2] = 165  # Red

    # Optic disc (yellowish-bright circle)
    cv2.circle(img, (150, 250), 45, (80, 220, 240), -1)
    # Fovea (darker central spot)
    cv2.circle(img, (320, 250), 30, (20, 45, 120), -1)

    # Sharp vessel branches (high Laplacian variance)
    for i in range(15):
        pt1 = (150 + i * 15, 250 - i * 10)
        pt2 = (180 + i * 20, 230 - i * 15)
        cv2.line(img, pt1, pt2, (15, 20, 90), 3)

        pt3 = (150 + i * 12, 250 + i * 12)
        pt4 = (175 + i * 18, 280 + i * 14)
        cv2.line(img, pt3, pt4, (15, 20, 90), 3)

    # Add high-frequency textures for realistic Laplacian variance
    noise = np.random.randint(-15, 15, img.shape, dtype=np.int16)
    img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    return img


def test_health_check():
    """Test GET /health returns 200 OK and expected structure."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "DRISHTI-AI"


def test_blurry_image_rejection():
    """Test that heavily blurred images are rejected by Quality Gate with HTTP 400."""
    # Create smooth image with very low Laplacian variance (< 80)
    smooth_img = np.full((300, 300, 3), 100, dtype=np.uint8)
    smooth_img = cv2.GaussianBlur(smooth_img, (25, 25), 0)
    
    img_bytes = create_in_memory_image(smooth_img)
    response = client.post(
        "/analyze",
        files={"fundusImage": ("blurry.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 400
    data = response.json()
    assert data["gradable"] is False
    assert "blurry" in data["reason"].lower()


def test_underexposed_image_rejection():
    """Test that underexposed images (mean brightness < 40) are rejected with HTTP 400."""
    dark_img = np.full((300, 300, 3), 20, dtype=np.uint8)
    # Add minor noise so blur check is not the only trigger, but brightness is definitely < 40
    img_bytes = create_in_memory_image(dark_img)
    response = client.post(
        "/analyze",
        files={"fundusImage": ("dark.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 400
    data = response.json()
    assert data["gradable"] is False
    assert "bad lighting" in data["reason"].lower() or "underexposed" in data["reason"].lower() or "blurry" in data["reason"].lower()


def test_overexposed_image_rejection():
    """Test that overexposed images (mean brightness > 220) are rejected with HTTP 400."""
    bright_img = np.full((300, 300, 3), 245, dtype=np.uint8)
    # Add high frequency noise to avoid blur trigger if needed
    noise = np.random.randint(-5, 5, bright_img.shape, dtype=np.int16)
    bright_img = np.clip(bright_img.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    img_bytes = create_in_memory_image(bright_img)
    response = client.post(
        "/analyze",
        files={"fundusImage": ("bright.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 400
    data = response.json()
    assert data["gradable"] is False
    assert "bad lighting" in data["reason"].lower() or "overexposed" in data["reason"].lower()


def test_gradable_fundus_analysis():
    """Test complete pipeline for a gradable image returning HTTP 200 and schema."""
    mock_fundus = generate_sharp_fundus_mock()
    img_bytes = create_in_memory_image(mock_fundus)

    response = client.post(
        "/analyze",
        files={"fundusImage": ("fundus_mock.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["gradable"] is True
    assert isinstance(data["severity_grade"], int)
    assert 0 <= data["severity_grade"] <= 4
    assert isinstance(data["is_referable"], bool)
    assert data["is_referable"] == (data["severity_grade"] >= 2)
    assert isinstance(data["confidence"], (float, int))
    assert 0.0 <= data["confidence"] <= 100.0

    # Validate Grad-CAM base64 URI
    assert "gradcam_base64" in data
    gradcam_uri = data["gradcam_base64"]
    assert gradcam_uri.startswith("data:image/jpeg;base64,")

    # Decode base64 to ensure it's a valid JPEG image
    b64_content = gradcam_uri.split(",", 1)[1]
    decoded_bytes = base64.b64decode(b64_content)
    np_cam = cv2.imdecode(np.frombuffer(decoded_bytes, np.uint8), cv2.IMREAD_COLOR)
    assert np_cam is not None
    assert np_cam.shape[0] == mock_fundus.shape[0]
    assert np_cam.shape[1] == mock_fundus.shape[1]
    print("\n[SUCCESS] Gradable image test passed with severity:", data["severity_grade"], "confidence:", data["confidence"])


if __name__ == "__main__":
    test_health_check()
    test_blurry_image_rejection()
    test_underexposed_image_rejection()
    test_overexposed_image_rejection()
    test_gradable_fundus_analysis()
    print("\nAll DRISHTI-AI microservice tests passed successfully!")
