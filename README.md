# LearnFlow GenAI - Intelligent Study Planning with Google Gemini

<div align="center">

![LearnFlow Banner](https://img.shields.io/badge/Google_Gemini-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white)
![React](https://img.shields.io/badge/React_19-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth_%26_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**An AI-native learning companion that transforms complex syllabi into personalized, actionable learning roadmaps using the official Google GenAI SDK.**

</div>

---

## 🌟 Overview

**LearnFlow GenAI** leverages Google's state-of-the-art Gemini multimodal models to intelligently parse study materials, calculate schedule intensities, and generate dynamic week-by-week study plans with interactive AI tutoring assistance.

### Key Capabilities

* 🧠 **Multimodal & Fast Syllabus Parsing:** Powered by `@google/genai` for structured study plan generation.
* 📅 **Dynamic Study Schedules:** Tailor study plans by total weeks, hours per week, intensity levels, and available days.
* 💬 **Context-Aware AI Tutor:** Embedded interactive assistant answering questions scoped directly to the user's active syllabus and tasks.
* 🎯 **Progress Tracking & PoC Notes:** Real-time completion metrics, task verification, and proof-of-concept note-taking.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS, Vite
* **AI Engine:** Google GenAI SDK (`@google/genai`)
* **State & Data:** Firebase (Authentication & Cloud Firestore)
* **Routing:** React Router DOM v7

---

## 🚀 Quickstart

### Prerequisites

* Node.js 18+
* Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VivekJangam126/learnflow-genai.git
   cd learnflow-genai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env.local` and add your Gemini API key:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```

4. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Project Structure

```
├── components/          # Reusable UI components
│   ├── AIAssistant.tsx  # Interactive Gemini tutor modal & chat
│   ├── Layout.tsx       # Application shell & navigation
│   └── PlanList.tsx     # Roadmap dashboard card grid
├── pages/               # Application view controllers
│   ├── CreatePlan.tsx   # AI plan generator interface
│   └── PlanDetail.tsx   # Task breakdown & progress viewer
├── services/            # Gemini AI & Firebase service layers
├── types.ts             # TypeScript domain definitions
├── App.tsx              # Application root and state router
└── vite.config.ts       # Vite build configuration
```

---

## 📄 License

MIT License. Created by [Vivek Jangam](https://github.com/VivekJangam126).
