import cv2
import numpy as np
import os

os.makedirs("test_assets", exist_ok=True)

# 1. Generate Sharp Fundus Image
img_sharp = np.zeros((400, 400, 3), dtype=np.uint8)
img_sharp[:, :, 0], img_sharp[:, :, 1], img_sharp[:, :, 2] = 25, 60, 175
cv2.circle(img_sharp, (130, 200), 38, (80, 210, 240), -1)
cv2.circle(img_sharp, (260, 200), 25, (15, 35, 110), -1)
for i in range(12):
    cv2.line(img_sharp, (130, 200), (220 + i*12, 140 - i*8), (15, 20, 90), 3)
    cv2.line(img_sharp, (130, 200), (210 + i*12, 260 + i*8), (15, 20, 90), 3)
noise = np.random.randint(-15, 15, img_sharp.shape, dtype=np.int16)
img_sharp = np.clip(img_sharp.astype(np.int16) + noise, 0, 255).astype(np.uint8)
cv2.imwrite("test_assets/sharp.jpg", img_sharp)

# 2. Generate Blurry Image
img_blur = np.full((300, 300, 3), 110, dtype=np.uint8)
img_blur = cv2.GaussianBlur(img_blur, (31, 31), 0)
cv2.imwrite("test_assets/blur.jpg", img_blur)

print("Test images generated in test_assets/")
