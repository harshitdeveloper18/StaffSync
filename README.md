# StaffSync

StaffSync is an HR management application with a React/Vite frontend and an Express/MongoDB backend.

## Project structure

```text
StaffSync/
├── backend/
│   ├── controllers/       # Existing route handlers
│   ├── routes/            # API routes grouped by feature
│   ├── models.js          # Mongoose models
│   ├── auth.js            # Authentication and role middleware
│   ├── server.js          # Express app setup and database startup
│   ├── seed.js
│   ├── package.json
│   └── .env.example       # Safe local-development placeholders
└── frontend/
    ├── src/
    │   ├── components/    # Auth pages and reusable DataTable
    │   ├── pages/         # Dashboard page
    │   ├── api.js
    │   ├── App.jsx        # Main application shell and feature views
    │   └── styles.css
    ├── package.json
    └── index.html
```

## Local setup

1. Install dependencies in both `backend` and `frontend` with `npm install`.
2. Create `backend/.env` using `backend/.env.example` as a template. Set a real `MONGO_URI` and a strong, private `JWT_SECRET` locally. Never commit `.env`.
3. Start the backend from `backend` with `npm run dev`.
4. Start the frontend from `frontend` with `npm run dev`.

## Refactoring note

This version organizes existing backend handlers into controller and route modules and extracts the existing login/signup, dashboard, and table components from `App.jsx`. Existing handler bodies and UI markup were moved rather than intentionally rewritten. The frontend production build could not be run in this environment because dependencies are not installed here; run `npm install` and `npm run build` in `frontend`, then test the workflows before replacing your original project.
