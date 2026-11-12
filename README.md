# AgriAdviser Pro 🌾
### AI-Powered Agriculture Crop Advisory & Multimodal Diagnostic Assistant

**AgriAdviser Pro** is a production-grade, full-stack precision agriculture advisory platform that bridges the gap between complex phytopathological science and actionable farm-level decisions. Powered by Google Gemini 2.5 Flash multimodal AI, PostgreSQL via Supabase with Row Level Security (RLS), and a responsive Tailwind CSS interface.

---

## 🚀 Key Features

1. **Multimodal Crop Diagnostic Wizard**:
   - 3-step structured wizard for inputting crop variety, vegetative growth stage, soil classification, and irrigation dynamics.
   - Plant foliage photo upload (JPEG, PNG, WEBP, max 5MB) with drag-and-drop, camera trigger, and 1-click test presets (Tomato Early Blight, Wheat Chlorosis, Apple Scab).
2. **AI-Powered Phytopathology Engine**:
   - Server-side execution using the official `@google/genai` SDK with Google Gemini 2.5 Flash (`gemini-2.5-flash`).
   - Structured JSON output schema enforcing scientific diagnosis title, confidence score (0-100), severity rating (Low, Moderate, Severe, Critical), etiology/primary pathogen cause, immediate containment actions, organic/biological treatments, targeted chemical controls with dosage & PPE alerts, and long-term preventative measures.
   - Built-in expert agronomic knowledge engine fallback for offline/sandbox testing without API disruption.
3. **Interactive Advisory Report Viewer & Actionable Task Checklist**:
   - Printable & PDF-exportable high-resolution pathology reports.
   - Side-by-side or tabbed Organic vs Chemical treatment protocols.
   - Interactive farm task checklist with automatic local state persistence and celebration confetti on completion.
4. **Persistent Historical Archive & Analytics**:
   - Real-time farm health summary cards: total advisories, urgent interventions, managed cases, and mean AI diagnostic certainty.
   - Live microclimate & soil moisture alert bar.
   - Filterable archive by crop domain (Cereals, Vegetables, Fruits, Legumes), severity level, and instant keyword search.
5. **Robust Security & RLS**:
   - Supabase Auth integration with secure token verification.
   - PostgreSQL Row Level Security (RLS) guaranteeing strict data isolation per user.
   - Strict Zod validation on both backend endpoints and frontend forms.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, React Router v6, Zod, Canvas Confetti |
| **Backend** | Node.js, Express.js (ESM), `@google/genai` SDK, Multer, Zod, Cors, Dotenv |
| **Database & Auth** | Supabase PostgreSQL, Row Level Security (RLS), Supabase Auth |
| **AI Model** | Google Gemini 2.5 Flash (`gemini-2.5-flash`) |

---

## 📂 Project Structure

```
agriadviser-pro/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── supabase.js         # Supabase client & connection validator
│   │   │   └── schema.sql          # PostgreSQL schema with RLS policies
│   │   ├── controllers/
│   │   │   └── advisoryController.js# Handlers for CRUD & multimodal diagnosis
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # Supabase JWT token verification
│   │   │   └── uploadMiddleware.js # Multer memory buffer upload validator
│   │   ├── routes/
│   │   │   └── advisoryRoutes.js   # Express API endpoints
│   │   ├── schemas/
│   │   │   └── advisorySchema.js   # Zod input validation & Gemini JSON schema
│   │   ├── services/
│   │   │   ├── geminiService.js    # Gemini 2.5 Flash integration & fallback
│   │   │   └── advisoryStore.js    # Persistent repository (Supabase + memory)
│   │   └── server.js               # Express application entrypoint
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Responsive navigation & auth status
│   │   │   ├── DashboardStats.jsx  # Farm telemetry & summary cards
│   │   │   ├── AdvisoryForm.jsx    # 3-step diagnostic wizard
│   │   │   ├── ReportViewer.jsx    # Diagnostic viewer & interactive checklist
│   │   │   ├── AdvisoryCard.jsx    # Summary card with severity badges
│   │   │   └── LoadingSpinner.jsx  # Animated dynamic AI analysis progress
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Supabase Auth provider & demo session
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Marketing overview & feature showcase
│   │   │   ├── AuthPage.jsx        # Login & Signup screens
│   │   │   ├── DashboardPage.jsx   # Farm dashboard & recent reports
│   │   │   ├── NewAdvisoryPage.jsx # Diagnostic wizard container & tips
│   │   │   ├── AdvisoryDetailPage.jsx# Detailed report route
│   │   │   └── HistoryPage.jsx     # Filterable archive with search & view toggles
│   │   ├── schemas/
│   │   │   └── clientAdvisorySchema.js
│   │   ├── services/
│   │   │   ├── api.js              # Fetch client with auth headers
│   │   │   └── supabaseClient.js   # Supabase JS client
│   │   ├── App.jsx                 # Routes & protected route wrapper
│   │   ├── index.css               # Tailwind CSS & print media styles
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── supabase/
    └── schema.sql                  # Production SQL schema & RLS triggers
```

---

## ⚡ Quick Start

### 1. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your GEMINI_API_KEY and SUPABASE credentials (optional for demo mode)

npm run dev
# Backend runs at http://localhost:5001
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Configure environment variables
cp .env.example .env

npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🗄 Database Setup (Supabase)

Execute the script in `supabase/schema.sql` in your Supabase SQL Editor:
```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  farm_location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Advisories table
create table public.advisories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  crop_name text not null,
  growth_stage text not null,
  soil_type text not null,
  irrigation_type text not null,
  symptoms_description text not null,
  image_url text,
  ai_diagnosis jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.advisories enable row level security;

-- RLS Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can view own advisories" on public.advisories for select using (auth.uid() = user_id);
create policy "Users can insert own advisories" on public.advisories for insert with check (auth.uid() = user_id);
create policy "Users can delete own advisories" on public.advisories for delete using (auth.uid() = user_id);
```

---

## 📡 API Reference

- `GET /api/health`: Health status & configuration diagnostics.
- `POST /api/advisory`: Generates new structured multimodal diagnosis (Multipart Form: `cropName`, `growthStage`, `soilType`, `irrigationType`, `symptomsDescription`, `imageFile`).
- `GET /api/advisories`: Retrieves user's advisory list sorted by `created_at desc`.
- `GET /api/advisory/:id`: Retrieves single detailed advisory by ID.
- `DELETE /api/advisory/:id`: Removes an advisory record.

