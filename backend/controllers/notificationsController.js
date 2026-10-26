import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Employee, Leave, Attendance, Announcement, Training, Notification, PerformanceReview } from "../models.js";

export const get_api_notifications_2 = async (req, res) => {
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
};

export const patch_api_notifications_id_read_3 = async (req, res) => {
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
};
