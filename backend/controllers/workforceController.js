import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Employee, Leave, Attendance, Announcement, Training, Notification, PerformanceReview } from "../models.js";

export const get_api_leaves_17 = async (req, res) => {
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
};

export const post_api_leaves_18 = async (req, res) => {
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
};

export const patch_api_leaves_id_19 = async (req, res) => {
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
};

export const get_api_attendance_20 = async (req, res) => {
  try {
    const query = ["Admin", "HR", "Manager"].includes(req.user.role) ? {} : { employeeEmail: req.user.email };
    res.json(await Attendance.find(query).sort({ date: -1, createdAt: -1 }).limit(200));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const post_api_attendance_check_in_21 = async (req, res) => {
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
};

export const post_api_attendance_check_out_22 = async (req, res) => {
  try {
    const date = new Date().toISOString().slice(0, 10);
    const record = await Attendance.findOne({ employeeEmail: req.user.email, date });
    if (!record?.checkIn) return res.status(400).json({ message: "Check in before checking out." });
    if (record.checkOut) return res.status(400).json({ message: "You have already checked out today." });
    record.checkOut = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    await record.save();
    res.json(record);
  } catch (err) { res.status(400).json({ message: err.message }); }
};
