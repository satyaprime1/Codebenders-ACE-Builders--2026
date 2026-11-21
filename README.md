# 🌟 THE LAST-MILE TUTOR (ది లాస్ట్-మైల్ ట్యూటర్)
### *AI-Powered Regional Language Learning Platform for Rural Schools*

> **"ప్రతి గ్రామీణ విద్యార్థికి స్వంత AI గణిత గురువు"**  
> An intelligent educational web application tailored for underprivileged regional-language (Telugu) school students with limited connectivity and basic smartphones.

---

## 📌 1. Project Overview & Architecture

Millions of students in government and regional-language schools face inadequate teacher-to-student ratios, poor internet connectivity, and digital learning tools built exclusively in English. 

**THE LAST-MILE TUTOR** solves this by delivering:
1. **100% Telugu-First Pedagogy**: Lessons, questions, feedback, instructions, and AI tutoring are all in simple, conversational Telugu suited for Class 8 students.
2. **Offline-First & Low-End Smartphone Resilience**: PWA service worker caching, IndexedDB progress tracking, low-bandwidth data saver mode, and automated sync upon reconnection.
3. **Conversational Multi-Modal AI Tutor**:
   - ⌨️ Text queries in Telugu
   - 🎙️ Voice input via Web Speech API (`te-IN`)
   - 📷 Photo question scanner (OCR extraction of textbook & handwritten math problems)
   - 🔊 Text-to-speech audio explanations
   - 💡 Patient teacher persona providing concepts, everyday analogies, hints, step-by-step solutions, and follow-up check questions.
4. **Three User Roles with Dedicated Dashboards**:
   - 🎒 **Student (రాజు - Raju)**: Daily targets, streak counter, syllabus progression, points, and adaptive quizzes.
   - 👩‍👧 **Parent (లక్ష్మి - Lakshmi)**: Non-technical Telugu overview, attendance, topics requiring support, and home encouragement guidance.
   - 👨‍🏫 **Teacher / Volunteer (రమేష్ సార్ - Ramesh Sir)**: Class roster, student analytics, homework assignment creator.

---

## 🗂️ 2. Project Folder Structure

```
Healthcare/
├── backend/
│   ├── app.py                 # Flask server & SPA asset router
│   ├── config.py              # App & AI environment configurations
│   ├── models.py              # SQLAlchemy DB models (SQLite/PostgreSQL ready)
│   ├── database.py            # DB initialization & curriculum seeding
│   ├── syllabus_data.py       # Rich Class 8 Mathematics Telugu curriculum
│   ├── ai_service.py          # Multi-LLM (Groq/Gemini/OpenAI) + Intelligent Mock AI
│   ├── ocr_service.py         # EasyOCR & math problem image extractor
│   ├── test_backend.py        # 10 automated unit & integration tests
│   ├── uploads/               # Photo question upload store
│   └── routes/
│       ├── auth_routes.py     # Login, register, 1-click test personas
│       ├── student_routes.py  # Chapters, lessons, progress tracking
│       ├── quiz_routes.py     # Adaptive assessments & mistake diagnosis
│       ├── ai_routes.py       # Conversational chat, voice, & photo upload
│       ├── parent_routes.py   # Parent dashboard analytics & guidance
│       ├── teacher_routes.py  # Teacher roster & assignment dispatch
│       └── sync_routes.py     # Offline queue sync & bundle download
├── frontend/
│   ├── index.html             # Telugu Unicode typography & PWA headers
│   ├── vite.config.js         # Vite configuration with proxy & Tailwind
│   ├── package.json           # Dependencies (React, Lucide, Tailwind, Confetti)
│   ├── public/
│   │   ├── manifest.json      # PWA Web App Manifest
│   │   ├── sw.js              # Service Worker for offline caching
│   │   └── icons/logo.svg     # App branding icon
│   └── src/
│       ├── App.jsx            # Master coordinator for all 14 pages
│       ├── main.jsx           # React DOM root
│       ├── index.css          # Tailwind CSS & Telugu font styling
│       ├── context/
│       │   ├── AuthContext.jsx       # User state & persona switching
│       │   ├── OfflineContext.jsx    # Network detection, queue, auto-sync
│       │   └── LanguageContext.jsx   # Telugu/English localization
│       ├── services/
│       │   ├── api.js                # REST API client
│       │   ├── offlineStorage.js     # IndexedDB cache & queue
│       │   └── speechService.js      # SpeechRecognition & SpeechSynthesis
│       ├── components/
│       │   ├── Navbar.jsx            # Responsive header & mobile bottom tabs
│       │   ├── OfflineBanner.jsx     # Floating offline & sync banner
│       │   ├── TeluguAudioPlayer.jsx # Audio explanation speaker widget
│       │   ├── VoiceInputModal.jsx   # Voice question recording in Telugu
│       │   └── ImageUploadModal.jsx  # Photo question scanner with presets
│       └── pages/
│           ├── LandingPage.jsx       # EdTech presentation & quick start
│           ├── AuthPage.jsx          # Login & registration with personas
│           ├── StudentDashboard.jsx  # Daily target, continue lesson, streak
│           ├── SubjectSelectPage.jsx # Class 8, 9, 10 & Subject selector
│           ├── ChapterListPage.jsx   # 6 Class 8 Math chapters
│           ├── LessonViewPage.jsx    # Concept, solved problems, hints
│           ├── AITutorPage.jsx       # Conversational Telugu AI math tutor
│           ├── QuizPage.jsx          # Adaptive quiz with mistake diagnosis
│           ├── StudentProgressPage.jsx # Analytics & weak areas remediation
│           ├── ParentDashboard.jsx   # Parent portal with Telugu home tips
│           ├── TeacherDashboard.jsx  # Teacher portal with assignments
│           ├── OfflineHubPage.jsx    # 1-Click offline download & sync
│           └── SettingsPage.jsx      # Language, speech rate, privacy
├── run.py                     # One-click full-stack launcher
├── app.py                     # Root Flask runner
├── requirements.txt           # Python dependencies
├── .env.example               # Configuration template
└── README.md                  # This documentation file
```

---

## 🚀 3. Quick Start & Installation

### Prerequisites
- **Python 3.10+** (Tested on Python 3.13)
- **Node.js 18+** & npm (for frontend building/development)

### Installation

1. **Install Python backend dependencies:**
```bash
pip install -r requirements.txt
```

2. **Install frontend dependencies & build assets:**
```bash
cd frontend
npm install
npm run build
cd ..
```

---

## 💻 4. Running the Application

### Option A: Complete Full-Stack via Flask (Recommended)
Flask serves both the REST API and the built React PWA web application on a single port:
```bash
python run.py
```
Open **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your browser!

### Option B: Concurrent Development Mode (Vite Hot-Reloading)
For active UI development with instant hot-reloading:

- **Terminal 1 (Backend Flask API):**
  ```bash
  python app.py
  ```
  *(Runs on http://127.0.0.1:5000)*

- **Terminal 2 (Frontend Vite Dev Server):**
  ```bash
  cd frontend
  npm run dev
  ```
  *(Runs on http://127.0.0.1:5173 with automated proxy to backend)*

---

## 👥 5. Test Personas & Credentials

The application includes built-in one-click test personas on the login page and persona switcher dropdown in the navbar:

| Role | Username | Full Name | Grade / School | Focus |
|---|---|---|---|---|
| **Student** | `raju` | రాజు వర్మ (Raju) | 8th Class • ZPHS | Lessons, AI Tutor, Adaptive Quizzes, Streak |
| **Parent** | `lakshmi` | లక్ష్మి దేవి (Lakshmi) | Parent of Raju | Child's progress, Telugu home tips, weak topics |
| **Teacher** | `ramesh_sir` | రమేష్ బాబు (Ramesh Sir) | Maths Teacher • ZPHS | Class roster, homework assignments, student marks |

*New students, parents, and teachers can also be registered instantly with minimal data requirements.*

---

## ⚙️ 6. Environment Configuration (`.env`)

Copy `.env.example` to `.env`:
```env
PORT=5000
SECRET_KEY=lastmile-tutor-secret-key-2026-telugu-edtech
DATABASE_URL=sqlite:///backend/lastmile_tutor.db

# AI Provider: 'mock' (default), 'groq', 'gemini', or 'openai'
AI_PROVIDER=mock

# Optional API Keys (Leave blank to use intelligent offline Telugu AI engine)
GROQ_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
```

> **Note on AI Mode**:
> If no external API keys are configured, the system automatically runs the **Intelligent Offline Telugu AI Engine**. It accurately parses equations (e.g. $2x + 5 = 15$), square roots (e.g. $\sqrt{144}$), rational numbers, quadrilaterals, data handling, and geometry questions, outputting step-by-step pedagogical explanations in Telugu.

---

## 🧠 7. Explanation of Major Modules

### 1. Telugu AI Tutor Module (`backend/ai_service.py` & `AITutorPage.jsx`)
- Behavers as a patient personal tutor for rural students.
- Follows structured pedagogical progression:
  1. 💡 **నిర్వచనం (Definition)** in simple Telugu
  2. 🌾 **నిత్య జీవిత ఉదాహరణ (Everyday Real-Life Example)**
  3. 📝 **దశలవారీ సాధన (Step-by-Step Breakdown)**
  4. ⚠️ **సాధారణ పొరపాట్లు (Common Mistakes to Avoid)**
  5. 🎯 **అభ్యాస ప్రశ్న (Follow-up Check Question)**
- Supports typed Telugu questions, microphone voice input via Web Speech API (`te-IN`), and textbook problem photo scans.

### 2. Syllabus-Based Learning Module (`backend/syllabus_data.py` & `LessonViewPage.jsx`)
- Implements 6 full Class 8 Mathematics chapters:
  1. అకరణీయ సంఖ్యలు (Rational Numbers)
  2. ఒక చరరాశిలో రేఖీయ సమీకరణాలు (Linear Equations in One Variable)
  3. చతుర్భుజాల అవగాహన (Understanding Quadrilaterals)
  4. దత్తాంశ నిర్వహణ (Data Handling)
  5. వర్గాలు మరియు వర్గమూలాలు (Squares and Square Roots)
  6. ఘనాలు మరియు ఘనమూలాలు (Cubes and Cube Roots)
- Each lesson includes learning objectives, concepts, solved problems, interactive practice questions with toggleable hints, and text-to-speech audio narration.

### 3. Smart Adaptive Assessment (`backend/routes/quiz_routes.py` & `QuizPage.jsx`)
- Supports MCQs and fill-in-the-blank questions across Easy, Medium, and Hard tiers.
- **Mistake Identification**: When a student answers incorrectly, the AI tutor diagnoses the conceptual misconception (e.g., confusing additive inverse with multiplicative inverse, or forgetting sign reversal during transposition) rather than merely showing the answer.

### 4. Offline Resilience Engine (`backend/routes/sync_routes.py` & `OfflineHubPage.jsx`)
- PWA manifest and service worker (`sw.js`).
- 1-Click offline download storing curriculum packages in browser IndexedDB.
- Offline sync queue: Lesson completions and quiz submissions recorded offline automatically synchronize with the server upon reconnection.
- Includes an interactive offline simulation toggle to test disconnected functionality.

### 5. Parent & Teacher Dashboards (`ParentDashboard.jsx` & `TeacherDashboard.jsx`)
- **Parent Portal**: Presented in accessible Telugu with zero educational jargon. Displays child attendance, completed lessons, quiz scores, and actionable home tips.
- **Teacher Portal**: Class-wide roster, average scores, student status alerts, and an assignment creation modal.

---

## 🧪 8. Verification & Automated Testing

Run the automated test suite covering all 10 major backend modules:
```bash
python -m unittest backend.test_backend
```

All 10 tests verify:
- Health check & API schemas
- Sample test personas
- Chapters & lessons retrieval
- Lesson completion & point rewards
- Adaptive quiz evaluation & mistake diagnosis in Telugu
- Conversational AI tutor question answering
- Photo question OCR extraction
- Parent dashboard overview
- Teacher assignment dispatch
- Offline synchronization & bundle downloading
