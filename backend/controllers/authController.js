import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Employee, Leave, Attendance, Announcement, Training, Notification, PerformanceReview } from "../models.js";

export const post_api_auth_login_4 = async (req, res) => {
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
};

export const post_api_auth_register_5 = async (req, res) => {
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
};

export const get_api_auth_me_6 = (req, res) => res.json({ user: req.user });
