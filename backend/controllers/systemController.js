import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Employee, Leave, Attendance, Announcement, Training, Notification, PerformanceReview } from "../models.js";

export const get_root_0 = (_req, res) => res.json({ message: "StaffSync API is running" });

export const get_api_health_1 = (_req, res) => res.json({ status: "ok" });

export const get_api_performance_reviews_14 = async (req, res) => {
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
  };

export const post_api_performance_reviews_15 = async (req, res) => {
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
  };
