import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Employee, Leave, Attendance, Announcement, Training, Notification, PerformanceReview } from "../models.js";

export const get_api_users_7 = async (req, res) => {
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
};

export const patch_api_users_id_role_8 = async (req, res) => {
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
};

export const get_api_employees_10 = async (_req, res) => {
  try { res.json(await Employee.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

export const post_api_employees_11 = async (req, res) => {
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
};

export const put_api_employees_id_12 = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ message: "Employee not found." });
    res.json(employee);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

export const put_api_profile_13 = async (req, res) => {
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
};

export const delete_api_employees_id_16 = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found." });
    res.json({ message: "Employee deleted." });
  } catch (err) { res.status(400).json({ message: err.message }); }
};
