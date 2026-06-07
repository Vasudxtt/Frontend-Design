# PrepRoute – Test Management Platform

A full-stack admin panel for creating, managing, and tracking tests. Built with React + TypeScript on the frontend and Node.js + Express on the backend.

---

## Features

- **Authentication** – JWT-based login with protected routes
- **Test Management** – Create, edit, delete, and publish tests (Chapterwise, PYQ, Mock Test)
- **Question Creation** – Rich text editor (TipTap) with MCQ options, difficulty levels, topics, and sub-topics
- **CSV Bulk Import** – Upload questions in bulk via CSV
- **Test Tracking** – View performance stats (attempts, avg score, pass rate, avg time) per published test
- **Offline Fallback** – Mock data is shown when the backend is unavailable

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 19 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router v7 | Routing |
| TanStack Query | Server state & caching |
| React Hook Form + Zod | Forms & validation |
| TipTap | Rich text editor |
| Zustand | Client state management |
| Axios | HTTP client |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| JSON Web Tokens | Authentication |
| Multer | File uploads (CSV import) |
| UUID | ID generation |
| In-memory store | Data persistence (swap for a DB in production) |

---

## Project Structure

```
├── src/
│   ├── api/           # Axios instance + API calls
│   ├── components/    # Reusable UI components (Layout, Header, Sidebar, etc.)
│   ├── pages/         # Route-level pages
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── CreateTest.tsx
│   │   ├── QuestionCreation.tsx
│   │   ├── Confirmation.tsx
│   │   └── TestTracking.tsx
│   ├── store/         # Zustand stores (auth, test)
│   ├── types/         # TypeScript interfaces
│   └── utils/         # Helpers
├── backend/
│   ├── server.js      # Express server + all API routes
│   └── package.json
└── public/
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone the repo

```bash
git clone https://github.com/Vasudxtt/Frontend-Design.git
cd Frontend-Design
```

### 2. Run the frontend

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`

### 3. Run the backend

```bash
cd backend
npm install
npm start
```

Runs at `http://localhost:5000`

### 4. Connect frontend to backend

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## API Endpoints

All endpoints except `/api/auth/login` require a `Bearer` token in the `Authorization` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT token |
| GET | `/api/tests` | List all tests |
| POST | `/api/tests` | Create a test |
| GET | `/api/tests/:id` | Get a single test |
| PUT | `/api/tests/:id` | Update a test |
| DELETE | `/api/tests/:id` | Delete a test |
| POST | `/api/tests/:id/publish` | Publish or schedule a test |
| GET | `/api/tests/:id/questions` | List questions for a test |
| POST | `/api/tests/:id/questions` | Add a question |
| PUT | `/api/tests/:id/questions/:qid` | Update a question |
| DELETE | `/api/tests/:id/questions/:qid` | Delete a question |
| POST | `/api/tests/:id/questions/bulk` | Bulk import via CSV |
| GET | `/api/subjects` | List subjects |
| GET | `/api/topics?subjectId=` | List topics by subject |
| GET | `/api/subtopics?topicId=` | List sub-topics by topic |

---

## Demo Credentials

```
Username: vedant-admin
Password: vedant123
```

---

## Deployment (Render)

### Frontend (Web Service)
- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Environment variable:** `VITE_API_URL=https://your-backend.onrender.com/api`

### Backend (Web Service)
- **Root directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Environment variables:**
  - `JWT_SECRET` – a long random string
  - `FRONTEND_URL` – your frontend Render URL (for CORS)

---

## CSV Import Format

For bulk question import, use a CSV with these columns:

```
content,optionA,optionB,optionC,optionD,correctOption,solution,difficulty
```

Example:
```csv
content,optionA,optionB,optionC,optionD,correctOption,solution,difficulty
What is 2+2?,3,4,5,6,B,The answer is 4,EASY
```

---

## License

MIT
