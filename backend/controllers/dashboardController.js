import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Employee, Leave, Attendance, Announcement, Training, Notification, PerformanceReview } from "../models.js";

export const get_api_dashboard_9 = async (req, res) => {
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
};
