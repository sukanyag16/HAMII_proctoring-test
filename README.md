# HAMII – Hyper Adaptive Modal Interview Intelligence

HAMII is an AI-powered interview and technical assessment platform designed to simulate real interview environments while maintaining exam integrity through intelligent monitoring.

This system combines computer vision–based proctoring, behavioral monitoring, and real-time session tracking to ensure fair and structured assessments.


---

##  Features

### AI-Proctored Technical Assessment
- Real-time camera monitoring
- Face detection with bounding box
- Single candidate verification
- Tab-switch detection
- Integrity scoring system

### Interview Practice Mode
- Simulated interview environment
- Camera monitoring during practice
- Structured interview flow

### Exam Integrity Monitoring
The system continuously monitors candidate behavior to maintain exam integrity.

Signals monitored include:

- Face visibility
- Multiple people detection
- Tab switching
- Candidate leaving the frame
- Device usage (phone detection planned)

---

## Integrity Scoring System

Integrity score represents how compliant the candidate is during the exam.

The score starts at **100** and gradually decreases when suspicious actions are detected.

Example penalties:

| Event | Penalty |
|------|------|
| Face not detected | -20 |
| Multiple faces detected | -40 |
| Looking away frequently | -20 |
| Tab switching | -25 |


Integrity decreases gradually instead of dropping instantly.  
If suspicious behavior continues for the entire duration, the score may reach **0**.

---

##  AI Technologies Used

### Computer Vision
MediaPipe Vision Tasks

Used for:
- Face detection
- Bounding box tracking
- Real-time candidate verification

### Proctoring Signals
Browser monitoring is used to detect:

- Tab switching
- Page focus loss
- Session interruptions

### Monitoring Pipeline

Camera Feed  
→ Face Detection  
→ Behavioral Signals  
→ Integrity Score Calculation

---

##  Pre-Exam Verification

Before the exam begins, the system verifies:

- Camera access
- Face detection
- Bounding box stability
- Single candidate presence

The **exam timer starts only after the bounding box detects a face successfully**.

---

##  Technology Stack

Frontend
- React
- TypeScript
- Vite

AI / Computer Vision
- MediaPipe Vision Tasks
- TensorFlow.js (for future extensions)

Backend
- Supabase

Deployment
- Vercel

---

##  Project Structure

```
src
 ├── components
 ├── pages
 │    ├── Index.tsx
 │    ├── Practice.tsx
 │    └── Results.tsx
 ├── lib
 │    ├── visionAnalysis.ts
 │    ├── audioAnalysis.ts
 │    └── fusionAlgorithm.ts
 └── integrations
      └── supabase
```

---

##  Running the Project Locally

Install dependencies

```
npm install
```

Start development server

```
npm run dev
```

Open the application in browser

```
http://localhost:5173
```

---

## Deployment

The project is deployed using **Vercel**.

Redeploy using Vercel CLI:

```
vercel --prod
```

---

##  Future Improvements

Planned enhancements include:

- Phone detection using object detection models
- Gaze tracking
- Emotion recognition
- Gesture analysis
- Behavioral anomaly detection
- Deep learning–based proctoring models

---




