# StaffSync — MERN HR Management Starter

A beginner-friendly capstone starter using React + Vite, Express, MongoDB, JWT, and Bootstrap.

## Requirements
- Node.js 18+ (prefer current LTS)
- MongoDB Atlas account, or local MongoDB
- VS Code

## 1. Start the backend
Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.

Create a demo administrator:

```bash
npm run seed
npm run dev
```

Backend runs at `http://localhost:5000`.

Demo login:
- Email: `admin@staffsync.demo`
- Password: `StaffSync123!`

## 2. Start the frontend
Open a second terminal in `frontend`:

```bash
npm install
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`).

## Features included
- JWT login and password hashing
- Role-aware dashboard (Admin/HR, Manager, Employee)
- Employee CRUD API and basic UI
- Leave requests and approval/rejection
- Attendance check-in / check-out records
- Announcements API and display
- Training API and display
- Responsive Bootstrap layout

## Important
This is a learning starter, not a production HR system. Before submitting:
1. Test each workflow.
2. Never commit `.env` or real employee information.
3. Replace demo credentials and JWT secret.
4. Add screenshots and setup instructions to this README.
5. Deploy backend and frontend, then add the real URLs to SkillWallet.
6. Confirm the SkillWallet rubric and required features against your final implementation.

The starter keeps UI intentionally simple so you can understand and extend it.
