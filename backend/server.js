import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User,Employee,Leave,Attendance,Announcement,Training,Notification, PerformanceReview} from "./models.js";

import { auth, allowRoles } from "./auth.js";
// Feature routes are separated from application startup.
import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";
import workforceRoutes from "./routes/workforce.js";
import communicationsRoutes from "./routes/communications.js";
import notificationRoutes from "./routes/notifications.js";
import dashboardRoutes from "./routes/dashboard.js";
import systemRoutes from "./routes/system.js";


const app = express();
app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(employeeRoutes);
app.use(workforceRoutes);
app.use(communicationsRoutes);
app.use(notificationRoutes);
app.use(dashboardRoutes);
app.use(systemRoutes);

// Employee directory: all authenticated users can view; HR/Admin can modify.

const port = process.env.PORT || 5000;
try {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) throw new Error("Set MONGO_URI and JWT_SECRET in backend/.env");
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(port, () => console.log(`StaffSync API running at http://localhost:${port}`));
} catch (err) {
  console.error("Could not start StaffSync:", err.message);
  process.exit(1);
}
