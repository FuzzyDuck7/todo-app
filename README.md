# TaskFlow — Production Task Management & Productivity System

TaskFlow is a modern, production-grade Todo List and Task Management web application designed for high productivity, seamless scheduling, and deep analytical insight into personal performance.

It merges the speed of **Todoist**, the visual structure of **Microsoft To Do**, the flexibility of **Trello**, and the rich project hierarchy of **Notion** into a clean, responsive, full-stack application.

---

## 🌟 Key Features

- **Authentication & Security**: Secure registration and login using **bcrypt** password hashing and **JWT** (JSON Web Tokens). Strict data isolation ensures users can never access or modify another user's data.
- **Projects & Workspaces**: Organize tasks into color-coded projects with dedicated milestone progress tracking.
- **Task Management**: Full CRUD support with Title, Description, Priority (Low, Medium, High, Urgent with visual badges), Due Date, Due Time, Estimated Duration, and Recurrence (daily, weekly, monthly).
- **Subtasks & Progress Tracking**: Step-by-step subtask checklists with live percentage calculation.
- **Smart Task Views**: Filter instantly by Inbox, Today, Upcoming, Overdue, High Priority, and Completed.
- **Search & Filtering**: Real-time debounced search across titles, notes, projects, and labels. Filter by status, priority, and project with multi-column sorting.
- **Dual View Modes**: Switch seamlessly between a clean **List View** and a drag-and-drop **Kanban Board** (To Do, In Progress, Completed).
- **Interactive Calendar**: Monthly schedule grid displaying tasks on due dates with priority indicators and date-cell task creation.
- **Productivity Analytics & Charts**:
  - Tasks Completed Over Time (Line Chart)
  - Tasks by Priority (Bar Chart)
  - Tasks by Project (Bar Chart)
  - Status Distribution (Donut Chart)
- **Data-Grounded Insights & Suggestions**: Automated, data-backed insights (e.g. rising velocity, weekday patterns) and a rule-based recommendation engine for workload balance.
- **Task Completion Score**: Transparent 0–100 score measuring completion rate, on-time delivery, backlog reduction, and daily streak.
- **Daily Streak System**: Tracks consecutive days with task completions (e.g., 🔥 5-day streak).
- **Dark Mode**: High-contrast theme toggle with persistence in `localStorage`.
- **Responsive Layout**: Designed for mobile (drawer & bottom navigation bar) up to ultra-wide desktop monitors.
- **Data Export**: One-click JSON backup export in Settings.

---

## 🧱 Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM (v7)
- **Styling**: Tailwind CSS + Custom CSS Design Tokens
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **HTTP Client**: Axios with centralized request/response interceptors
- **Micro-interactions**: Canvas Confetti for celebratory task completions

### Backend
- **Runtime**: Node.js (ES Modules)
- **Server Framework**: Express.js
- **Architecture**: Strict MVC (Model-View-Controller) with Service & Validator layers
- **Authentication**: JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **Security & Headers**: Helmet, CORS, Rate Limiting (`express-rate-limit`)
- **Input Validation**: `express-validator`
- **Testing**: Built-in `node:test` + `supertest`

### Database
- **Primary Engine**: Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Security**: PostgreSQL Row Level Security (RLS) policies and cascade foreign keys
- **Local Fallback Mode**: Integrated persistent relational store that allows the app to start and run immediately even before remote Supabase credentials are configured.

---

## 📂 Project Architecture & Directory Structure

```
workshop/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI (TaskCard, PriorityBadge, ProgressBar, Modals...)
│   │   ├── context/          # AuthContext, TaskContext, ThemeContext, ToastContext
│   │   ├── layouts/          # MainLayout, AuthLayout
│   │   ├── pages/            # Dashboard, Tasks, Calendar, Projects, Analytics, Profile, Settings...
│   │   ├── services/         # Axios API services (taskService, authService, projectService...)
│   │   ├── App.jsx           # Master route configuration & route guards
│   │   ├── index.css         # Tailwind directives & CSS design tokens
│   │   └── main.jsx          # Entry point
│   ├── public/               # Static assets & SVG icons
│   ├── .env                  # Frontend environment variables
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/           # Database configuration & Supabase client initialization
│   │   ├── controllers/      # HTTP request & response handlers
│   │   ├── middleware/       # JWT authMiddleware, centralized errorHandler, rateLimiter
│   │   ├── models/           # Database models (User, Project, Task, Subtask, Label, Reminder)
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # Business logic, analytics calculations, streak computation
│   │   ├── utils/            # JWT helpers, response formatters, dev seed script
│   │   ├── validators/       # Request body & query schemas (express-validator)
│   │   ├── app.js            # Express app configuration
│   │   └── server.js         # HTTP server entry point
│   ├── tests/                # Automated integration tests (api.test.js)
│   ├── .env                  # Backend environment variables
│   ├── .env.example
│   └── package.json
│
├── schema.sql                # Production PostgreSQL / Supabase schema with RLS & indexes
├── package.json              # Root workspace convenience scripts
└── README.md
```

### Backend Request Lifecycle (Strict MVC)
```
Client Request
      ↓
[ Route ]
      ↓
[ Middleware ] (Auth JWT Verification, Rate Limiting, Validation)
      ↓
[ Controller ] (Parses HTTP params, delegates to Service)
      ↓
[ Service ] (Enforces business logic, calculates statistics, recurrence)
      ↓
[ Model / Database ] (Executes parameterized query against Supabase / PostgreSQL)
      ↓
[ Service ] (Calculates metrics and prepares response)
      ↓
[ Controller ] (Formats standard response payload)
      ↓
Client Response
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Installation
Run npm install in both directories:

```bash
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

### 2. Environment Configuration
Both `backend/.env` and `frontend/.env` come pre-configured with default values for local development.

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=taskflow_super_secret_jwt_key_for_development_purposes_only_change_in_prod_12345
JWT_EXPIRES_IN=7d

# Supabase Credentials (optional for local integrated mode, required for remote cloud)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Sample Development Data
To populate realistic demo projects, tasks, subtasks, overdue deadlines, and completion streaks:

```bash
cd backend
npm run seed
```

**Default Demo Credentials:**
- **Email**: `demo@taskflow.dev`
- **Password**: `Password123!`

*(The Login page also includes a 1-click **"Click to Auto-fill Demo Account"** button for instant testing)*.

### 4. Running the Application
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Application starts at http://localhost:5173
```

---

## 🗄️ Supabase / PostgreSQL Setup Guide

If you wish to connect TaskFlow directly to a live Supabase cloud database:

1. Create a free project at [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Open [`schema.sql`](file:///c:/Users/HP/OneDrive/Desktop/workshop/schema.sql) from the root of this project and execute the script.
4. Copy your **Project URL** and **Service Role Secret Key** from **Project Settings → API**.
5. Paste them into `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJh...
   ```
6. Restart the backend server. The server will detect the credentials and log:
   `✅ Supabase client initialized successfully with remote PostgreSQL database.`

---

## 🧪 Automated Testing

The backend includes a comprehensive automated test suite verifying authentication, bcrypt hashing, JWT issuance, task CRUD, subtask management, analytics calculations, and **strict user isolation**.

To run the test suite:
```bash
cd backend
npm test
```

### Verified Test Cases:
- Registration, login, and rejection of duplicate emails
- Rejecting incorrect passwords with 401
- JWT authentication and token verification
- Protecting private routes from unauthenticated access
- **Critical Isolation Test**: Ensuring User B receives `404 Not Found` when attempting to read, update, complete, or delete User A's tasks or projects.
- Subtask creation and toggle completion
- Real-time productivity analytics summary and insights calculation

---

## 📡 REST API Reference

All responses follow a uniform JSON schema:

**Success Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Task created successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Task title is required"
  }
}
```

### Authentication
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`)
- `POST /api/auth/login` — Sign in and receive JWT token (`email`, `password`)
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `PUT /api/auth/profile` — Update user name and avatar URL
- `PUT /api/auth/change-password` — Change password (`currentPassword`, `newPassword`)
- `POST /api/auth/logout` — End session

### Tasks
- `GET /api/tasks` — List tasks with query params (`status`, `priority`, `projectId`, `search`, `dueFilter`, `sortBy`, `sortOrder`, `page`, `limit`)
- `POST /api/tasks` — Create task (`title`, `description`, `priority`, `projectId`, `dueDate`, `dueTime`, `estimatedMinutes`, `recurrence`, `labelIds`)
- `GET /api/tasks/:id` — Get task details with attached project, subtasks, labels, and reminders
- `PUT /api/tasks/:id` — Update task fields
- `DELETE /api/tasks/:id` — Delete task (cascades to subtasks)
- `PATCH /api/tasks/:id/complete` — Mark task as completed (auto-generates next recurring task if recurrence is set)
- `PATCH /api/tasks/:id/reopen` — Reopen completed task
- `PATCH /api/tasks/:id/archive` — Move task to archive

### Subtasks
- `GET /api/tasks/:taskId/subtasks` — Get subtasks for a task
- `POST /api/tasks/:taskId/subtasks` — Add subtask to task (`title`)
- `PUT /api/subtasks/:id` — Update subtask title
- `PATCH /api/subtasks/:id/complete` — Toggle subtask completion status
- `DELETE /api/subtasks/:id` — Delete subtask

### Projects
- `GET /api/projects` — List user's projects with task counts and completion percentage
- `POST /api/projects` — Create project (`name`, `description`, `color`)
- `GET /api/projects/:id` — Get project details with child tasks
- `PUT /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project (unlinks tasks safely)

### Analytics
- `GET /api/analytics/summary` — Overview metrics (total, active, overdue, streak, productivity score)
- `GET /api/analytics/completion?days=14` — Daily completion trend data for Recharts line chart
- `GET /api/analytics/priorities` — Priority breakdown for Recharts bar chart
- `GET /api/analytics/projects` — Tasks by project breakdown for Recharts bar chart
- `GET /api/analytics/status` — Status breakdown for Recharts donut chart
- `GET /api/analytics/insights` — Calculated insights and rule-based suggestions

---

## 🔒 Security Best Practices

1. **Passwords**: Salted and hashed using `bcrypt` (10 rounds). Plaintext passwords and password hashes are never exposed in responses.
2. **JWT Ownership Isolation**: Database queries never trust a `userId` in `req.body` or query string. All queries extract `req.user.id` from the cryptographically verified JWT.
3. **Database Security**: Supabase Row Level Security (RLS) policies enforce that users can only select and mutate their own rows.
4. **Input Sanitization**: Request bodies and parameters are validated and normalized using `express-validator`.
5. **Rate Limiting**: Authentication endpoints are rate-limited to mitigate brute-force attacks.
6. **HTTP Security Headers**: Powered by Helmet to prevent clickjacking and MIME-type sniffing.

---

## 🔮 Future Roadmap & AI Extensions

TaskFlow is architected with modular service layers to facilitate future AI-powered capabilities:
- **AI Task Decomposition**: Automatically break down large goals or tasks into actionable subtasks.
- **Smart Day Planner**: Proactive scheduling recommendations based on estimated durations and approaching deadlines.
- **Push & Email Reminders**: Web Push notifications via Service Workers.
- **Offline PWA Support**: Local IndexedDB sync for full offline functionality.
