import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models.js";

const demoUsers = [
  {
    name: "StaffSync Admin",
    email: "admin@staffsync.demo",
    password: "StaffSync123!",
    role: "Admin",
    department: "Human Resources",
    jobTitle: "HR Administrator"
  },
  {
    name: "StaffSync HR",
    email: "hr@staffsync.demo",
    password: "StaffSync123!",
    role: "HR",
    department: "Human Resources",
    jobTitle: "HR Executive"
  },
  {
    name: "StaffSync Manager",
    email: "manager@staffsync.demo",
    password: "StaffSync123!",
    role: "Manager",
    department: "Engineering",
    jobTitle: "Team Manager"
  },
  {
    name: "StaffSync Employee",
    email: "employee@staffsync.demo",
    password: "StaffSync123!",
    role: "Employee",
    department: "Engineering",
    jobTitle: "Software Developer"
  }
];

try {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    throw new Error("Set MONGO_URI and JWT_SECRET in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  for (const demoUser of demoUsers) {
    const { email, password, ...profile } = demoUser;
    const existing = await User.findOne({ email });

    if (existing) {
      console.log(`Already exists: ${email}`);
      continue;
    }

    await User.create({
      ...profile,
      email,
      password: await bcrypt.hash(password, 12)
    });

    console.log(`Created: ${email}`);
  }

  console.log("\nDemo accounts use the same password: StaffSync123!");
} catch (error) {
  console.error("Seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}