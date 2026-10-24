import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User,Employee,Leave,Attendance,Announcement,Training,Notification, PerformanceReview} from "./models.js";

import { auth, allowRoles } from "./auth.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ message: "StaffSync API is running" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/notifications", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientEmail: req.user.email
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load notifications."
    });
  }
});
app.patch("/api/notifications/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientEmail: req.user.email
      },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found."
      });
    }

    res.json(notification);
  } catch (err) {
    console.error("Mark notification as read error:", err);
    res.status(400).json({
      message: "Could not mark notification as read."
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (err) { res.status(500).json({ message: "Login failed.", error: err.message }); }
});
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "Employee",
      department: department?.trim() || "General",
      jobTitle: "Employee"
    });
    await Employee.create({
      name: user.name,
      email: user.email,
      department: user.department,
      managerEmail: "",
      jobTitle: "Employee",
      phone: "",
      joiningDate: new Date(),
      status: "Active"
    });
    // Notify Admin and HR about the new employee registration.
    const reviewers = await User.find({
      role: { $in: ["Admin", "HR"] }
    }).select("email");

    if (reviewers.length > 0) {
      await Notification.insertMany(
        reviewers.map(reviewer => ({
          recipientEmail: reviewer.email,
          title: "New employee registered",
          message: `${user.name} (${user.email}) has registered as a new employee.`,
          type: "employee"
        }))
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    res.status(500).json({
      message: "Registration failed."
    });
  }
});
app.get("/api/auth/me", auth, (req, res) => res.json({ user: req.user }));
app.get("/api/users", auth, allowRoles("Admin"), async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ name: 1 });

    res.json(users);
  } catch (err) {
    console.error("Load users error:", err);
    res.status(500).json({
      message: "Failed to load users."
    });
  }
});
app.patch("/api/users/:id/role", auth, allowRoles("Admin"), async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["Employee", "Manager", "HR"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Choose a valid role: Employee, Manager, or HR."
      });
    }

    // Prevent changing the currently logged-in Admin's own role.
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        message: "You cannot change your own role."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.json({
      message: "User role updated successfully.",
      user
    });
  } catch (err) {
    console.error("Update user role error:", err);
    res.status(400).json({
      message: "Failed to update user role."
    });
  }
});

app.get("/api/dashboard", auth, async (req, res) => {
  try {
    const role = req.user.role;
    const email = req.user.email;

    let employees;
    let pendingLeaves;
    let todayAttendance;
    let announcements;
    let trainings;

    if (role === "Admin" || role === "HR") {
      [employees, pendingLeaves, todayAttendance, announcements, trainings] =
        await Promise.all([
          Employee.countDocuments({ status: { $ne: "Inactive" } }),
          Leave.countDocuments({ status: "Pending" }),
          Attendance.countDocuments({
            date: new Date().toISOString().slice(0, 10)
          }),
          Announcement.countDocuments(),
          Training.countDocuments()
        ]);
    } else if (role === "Manager") {
      const teamMembers = await Employee.find({
        managerEmail: email
      }).select("email -_id");

      const teamEmails = teamMembers.map(member => member.email);

      [employees, pendingLeaves, todayAttendance, announcements, trainings] =
        await Promise.all([
          Employee.countDocuments({
            managerEmail: email,
            status: { $ne: "Inactive" }
          }),
          Leave.countDocuments({
            employeeEmail: { $in: teamEmails },
            status: "Pending"
          }),
          Attendance.countDocuments({
            employeeEmail: { $in: teamEmails },
            date: new Date().toISOString().slice(0, 10)
          }),
          Announcement.countDocuments(),
          Training.countDocuments()
        ]);
    } else {
      const [myPendingLeaves, myTodayAttendance, announcementCount, trainingCount] =
        await Promise.all([
          Leave.countDocuments({
            employeeEmail: email,
            status: "Pending"
          }),
          Attendance.countDocuments({
            employeeEmail: email,
            date: new Date().toISOString().slice(0, 10)
          }),
          Announcement.countDocuments(),
          Training.countDocuments()
        ]);

      employees = 1;
      pendingLeaves = myPendingLeaves;
      todayAttendance = myTodayAttendance;
      announcements = announcementCount;
      trainings = trainingCount;
    }

    res.json({
      employees,
      pendingLeaves,
      todayAttendance,
      announcements,
      trainings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Employee directory: all authenticated users can view; HR/Admin can modify.
app.get("/api/employees", auth, async (_req, res) => {
  try { res.json(await Employee.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
app.post("/api/employees", auth, allowRoles("Admin", "HR"), async (req, res) => {
  try {
    const {
      name,
      email,
      department,
      managerEmail,
      jobTitle,
      phone,
      joiningDate,
      status
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required."
      });
    }

    const employee = await Employee.create({
      name,
      email,
      department,
      managerEmail,
      jobTitle,
      phone,
      joiningDate,
      status
    });

    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({
      message: err.code === 11000
        ? "Duplicate employee record."
        : err.message
    });
  }
});
app.put("/api/employees/:id", auth, allowRoles("Admin", "HR"), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ message: "Employee not found." });
    res.json(employee);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
app.put("/api/profile", auth, async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required."
      });
    }

    const employee = await Employee.findOneAndUpdate(
      { email: req.user.email },
      {
        $set: {
          name: name.trim(),
          phone: typeof phone === "string" ? phone.trim() : ""
        }
      },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee profile not found."
      });
    }

    res.json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get(
  "/api/performance-reviews",
  auth,
  allowRoles("Manager", "HR", "Admin"),
  async (req, res) => {
    try {
      let filter = {};

      if (req.user.role === "Manager") {
        const team = await Employee.find({
          managerEmail: req.user.email
        }).select("email");

        const teamEmails = team.map(emp => emp.email.toLowerCase());

        filter = {
          employeeEmail: { $in: teamEmails },
          managerEmail: req.user.email.toLowerCase()
        };
      }

      const reviews = await PerformanceReview.find(filter)
        .sort({ reviewDate: -1 });

      res.json(reviews);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

app.post(
  "/api/performance-reviews",
  auth,
  allowRoles("Manager"),
  async (req, res) => {
    try {
      const {
        employeeEmail,
        rating,
        feedback,
        strengths,
        improvementAreas
      } = req.body;

      if (
        !employeeEmail ||
        !Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5 ||
        !feedback?.trim()
      ) {
        return res.status(400).json({
          message: "Employee, rating (1–5), and feedback are required."
        });
      }

      const managerEmail = req.user.email.toLowerCase();
      const normalizedEmployeeEmail = employeeEmail.toLowerCase().trim();

      const employee = await Employee.findOne({
        email: normalizedEmployeeEmail,
        managerEmail
      });

      if (!employee) {
        return res.status(403).json({
          message: "You can only review employees assigned to you."
        });
      }

      const review = await PerformanceReview.create({
        employeeName: employee.name,
        employeeEmail: employee.email,
        managerEmail,
        rating: Number(rating),
        feedback: feedback.trim(),
        strengths: strengths?.trim() || "",
        improvementAreas: improvementAreas?.trim() || ""
      });

      res.status(201).json(review);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

app.delete("/api/employees/:id", auth, allowRoles("Admin", "HR"), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found." });
    res.json({ message: "Employee deleted." });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

app.get("/api/leaves", auth, async (req, res) => {
  try {
    let query;

    if (["Admin", "HR"].includes(req.user.role)) {
      query = {};
    } else if (req.user.role === "Manager") {
      const teamMembers = await Employee.find({
        managerEmail: req.user.email
      }).select("email -_id");
      console.log("Manager email:", req.user.email);
      console.log("Team members found:", teamMembers);

      const teamEmails = teamMembers.map(member => member.email);

      query = {
        employeeEmail: { $in: teamEmails }
      };
    } else {
      query = { employeeEmail: req.user.email };
    }

    res.json(await Leave.find(query).sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/leaves", auth, async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      !startDate ||
      !endDate ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start < today ||
      end < start
    ) {
      return res.status(400).json({
        message: "Enter valid leave dates."
      });
    }

    const leave = await Leave.create({
      employeeName: req.user.name,
      employeeEmail: req.user.email,
      type,
      startDate,
      endDate,
      reason
    });

    // Find Admin and HR users who should receive the request.
    const reviewers = await User.find({
      role: { $in: ["Admin", "HR"] }
    }).select("email");

    const recipientEmails = new Set(
      reviewers.map(user => user.email.toLowerCase())
    );

    // Find the employee's assigned Manager, if one exists.
    const employee = await Employee.findOne({
      email: req.user.email
    });

    if (employee?.managerEmail) {
      recipientEmails.add(employee.managerEmail.toLowerCase());
    }

    // Notify Admin, HR, and the assigned Manager.
    if (recipientEmails.size > 0) {
      await Notification.insertMany(
        [...recipientEmails].map(email => ({
          recipientEmail: email,
          title: "New leave request",
          message: `${req.user.name} submitted a ${type} leave request from ${startDate} to ${endDate}.`,
          type: "leave"
        }))
      );
    }

    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch("/api/leaves/:id", auth, allowRoles("Admin", "HR", "Manager"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected."
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave request not found."
      });
    }

    if (req.user.role === "Manager") {
      const isTeamMember = await Employee.exists({
        email: leave.employeeEmail,
        managerEmail: req.user.email
      });

      if (!isTeamMember) {
        return res.status(403).json({
          message: "You can only manage leave requests from your assigned team."
        });
      }
    }

    const previousStatus = leave.status;

    leave.status = status;
    await leave.save();

    if (previousStatus !== status) {
      await Notification.create({
        recipientEmail: leave.employeeEmail,
        title: `Leave request ${status.toLowerCase()}`,
        message: `Your ${leave.type} leave request from ${String(leave.startDate).slice(0, 10)} to ${String(leave.endDate).slice(0, 10)} has been ${status.toLowerCase()}.`,
        type: "leave"
      });
    }

    res.json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.get("/api/attendance", auth, async (req, res) => {
  try {
    const query = ["Admin", "HR", "Manager"].includes(req.user.role) ? {} : { employeeEmail: req.user.email };
    res.json(await Attendance.find(query).sort({ date: -1, createdAt: -1 }).limit(200));
  } catch (err) { res.status(500).json({ message: err.message }); }
});
app.post("/api/attendance/check-in", auth, async (req, res) => {
  try {
    const date = new Date().toISOString().slice(0, 10);
    let record = await Attendance.findOne({ employeeEmail: req.user.email, date });
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    if (record?.checkIn) return res.status(400).json({ message: "You have already checked in today." });
    if (!record) record = new Attendance({ employeeName: req.user.name, employeeEmail: req.user.email, date });
    record.checkIn = now;
    record.status = "Present";
    await record.save();
    res.status(201).json(record);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
app.post("/api/attendance/check-out", auth, async (req, res) => {
  try {
    const date = new Date().toISOString().slice(0, 10);
    const record = await Attendance.findOne({ employeeEmail: req.user.email, date });
    if (!record?.checkIn) return res.status(400).json({ message: "Check in before checking out." });
    if (record.checkOut) return res.status(400).json({ message: "You have already checked out today." });
    record.checkOut = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    await record.save();
    res.json(record);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

app.get("/api/announcements", auth, async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const announcements = await Announcement.find({
      $or: [
        { expiryDate: null },
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: tomorrow } },
        {
          expiryDate: {
            $gte: today,
            $lt: tomorrow
          }
        }
      ]
    }).sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post("/api/announcements", auth, allowRoles("Admin", "HR"), async (req, res) => {
  try {
    const { title, message, expiryDate } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        message: "Title and message are required."
      });
    }

    // Create the announcement.
    const announcement = await Announcement.create({
      title,
      message,
      createdBy: req.user.name,
      expiryDate: expiryDate || null
    });

    // Find all registered users except the person who posted it.
    const users = await User.find({
      email: { $ne: req.user.email }
    }).select("email");

    // Create a notification for each recipient.
    if (users.length > 0) {
      await Notification.insertMany(
        users.map(user => ({
          recipientEmail: user.email,
          title: `New announcement: ${title}`,
          message,
          type: "announcement"
        }))
      );
    }

    res.status(201).json(announcement);
  } catch (err) {
    console.error("Create announcement error:", err);
    res.status(400).json({ message: err.message });
  }
});
app.delete("/api/announcements/:id", auth, allowRoles("Admin", "HR"), async (req, res) => {
  try { await Announcement.findByIdAndDelete(req.params.id); res.json({ message: "Announcement deleted." }); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

app.get("/api/trainings", auth, async (_req, res) => {
  try {
    const now = new Date();

    // Keep today's trainings visible until the day ends.
    now.setHours(0, 0, 0, 0);

    const trainings = await Training.find({
      $or: [
        { date: { $gte: new Date(now.getTime() + 24 * 60 * 60 * 1000) } },
        {
          date: {
            $gte: now,
            $lt: new Date(now.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        { date: null },
        { date: { $exists: false } }
      ]
    }).sort({ date: 1 });

    res.json(trainings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post("/api/trainings", auth, allowRoles("Admin", "HR"), async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({
        message: "Training title is required."
      });
    }

    // Create the training session.
    const training = await Training.create(req.body);

    // Find all users except the person who created the training.
    const users = await User.find({
      email: { $ne: req.user.email }
    }).select("email");

    // Notify each user about the new training.
    if (users.length > 0) {
      await Notification.insertMany(
        users.map(user => ({
          recipientEmail: user.email,
          title: `New training: ${training.title}`,
          message: `A new training session, "${training.title}", is now available.`,
          type: "training"
        }))
      );
    }

    res.status(201).json(training);
  } catch (err) {
    console.error("Create training error:", err);
    res.status(400).json({ message: err.message });
  }
});

const port = process.env.PORT || 5000;
try {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) throw new Error("Set MONGO_URI and JWT_SECRET in backend/.env");
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(port, () => console.log(`StaffSync API running at http://localhost:${port}`));
} catch (err) {
  console.error("Could not start StaffSync:", err.message);
  process.exit(1);
}
