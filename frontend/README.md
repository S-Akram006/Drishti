# DRISHTI-AI: National Rural Tele-Ophthalmology Portal (Frontend)

React + Vite + Tailwind CSS v4 clinical tele-ophthalmology screening portal built to National Health Portal & Ayushman Bharat Digital Mission (ABDM) design standards.

---

## Features

- **Top Navigation Bar**:
  - Government tele-ophthalmology branding & Ayushman Bharat badge.
  - Active facility badge: **Medipally PHC** (Tier-3).
  - Operator ID: **ASHA-HYD-1092**.
  - Real-time Gateway & AI microservice heartbeat status pill.
- **Screener Intake Form**:
  - Demographics: ABHA ID, Patient Full Name, Age, Gender, Random Blood Sugar (mg/dL).
  - Drag-and-drop fundus image upload box with thumbnail preview.
  - Fast evaluation presets: *Normal Retinal*, *Moderate DR*, *Blurry Scan (400 Bad)*, *Low Light (400 Bad)*.
  - "Run AI Screening Pipeline" action button with animated loading spinner.
- **Dual Fundus & Explainability Viewer**:
  - Side-by-Side or Alpha-blend overlay of the raw fundus capture and PyTorch `layer4` Grad-CAM activation heatmap.
  - Opacity blend slider.
  - Clinical explainability callout.
- **Clinical Disposition & Referral Card**:
  - Quality Gate status badges: Laplacian Blur ($\ge 80.0$) and Illumination ($[40, 220]$).
  - High-visibility "REFERRAL REQUIRED" alert badge for severity grades $\ge 2$.
  - 5-class DR severity gauge (Level 0: No DR to Level 4: Proliferative DR).
  - Model confidence indicator.
  - "Download Government Telemedicine Referral Slip (PDF/Print)" action button.
- **Ungradable Quality Gate Modal**:
  - Automatically pops up on HTTP 400 rejection from the OpenCV Quality Gate.
  - Guides screeners on patient chin rest positioning, room lighting, pupil dilation, and lens cleaning.
- **District Hospital Telemedicine Queue Drawer**:
  - Bottom expandable drawer displaying all cases marked `pending_specialist`.
  - Displays ABHA ID, Origin PHC, Severity, Confidence, and timestamp.
  - "Approve Referral" button calling `PATCH /api/telemedicine/review/:id`.
- **Printable Government Referral Slip**:
  - Clean, print-formatted MoHFW referral document with demographic data, AI diagnostic grade, Grad-CAM evidence, and signature blocks.

---

## Getting Started

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build for production
npm run build
```

The portal runs at **`http://localhost:3000`** and proxies API requests to **`http://localhost:5000`** via `VITE_API_BASE_URL`.
