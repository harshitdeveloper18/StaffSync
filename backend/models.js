import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "HR", "Manager", "Employee"], default: "Employee" },
  department: { type: String, default: "General" },
  jobTitle: { type: String, default: "Employee" }
}, { timestamps: true });

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  department: { type: String, default: "General" },
  managerEmail: {type: String, lowercase: true, trim:true, default:""},
  jobTitle: { type: String, default: "Employee" },
  phone: { type: String, default: "" },
  joiningDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["Active", "On Leave", "Inactive"], default: "Active" }
}, { timestamps: true });

const leaveSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeEmail: { type: String, required: true },
  type: { type: String, enum: ["Casual", "Sick", "Annual", "Other"], default: "Casual" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, default: "" },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeEmail: { type: String, required: true },
  date: { type: String, required: true },
  checkIn: { type: String, default: "" },
  checkOut: { type: String, default: "" },
  status: { type: String, enum: ["Present", "Absent", "Half Day"], default: "Present" }
}, { timestamps: true });

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdBy: { type: String, default: "HR" },
  expiryDate: { type: Date, default: null }
}, { timestamps: true });

const trainingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  date: { type: Date },
  audience: { type: String, default: "All employees" }
}, { timestamps: true });

const performanceReviewSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  managerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: "Rating must be a whole number from 1 to 5."
    }
  },
  feedback: { type: String, required: true, trim: true },
  strengths: { type: String, default: "", trim: true },
  improvementAreas: { type: String, default: "", trim: true },
  reviewDate: { type: Date, default: Date.now }
}, { timestamps: true });

const notificationSchema = new mongoose.Schema(
  {
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["leave", "announcement", "training", "employee"],
      required: true
    },
    read: {
      type: Boolean,
      default: false
    
    }
  },
  { timestamps: true }
);
export const Notification = mongoose.model("Notification",notificationSchema);
export const User = mongoose.model("User", userSchema);
export const Employee = mongoose.model("Employee", employeeSchema);
export const Leave = mongoose.model("Leave", leaveSchema);
export const Attendance = mongoose.model("Attendance", attendanceSchema);
export const Announcement = mongoose.model("Announcement", announcementSchema);
export const Training = mongoose.model("Training", trainingSchema);
export const PerformanceReview = mongoose.model(
  "PerformanceReview",
  performanceReviewSchema
);
