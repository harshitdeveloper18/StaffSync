import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Employee, Leave, Attendance, Announcement, Training, Notification, PerformanceReview } from "../models.js";

export const get_api_announcements_23 = async (_req, res) => {
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
};

export const post_api_announcements_24 = async (req, res) => {
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
};

export const delete_api_announcements_id_25 = async (req, res) => {
  try { await Announcement.findByIdAndDelete(req.params.id); res.json({ message: "Announcement deleted." }); }
  catch (err) { res.status(400).json({ message: err.message }); }
};

export const get_api_trainings_26 = async (_req, res) => {
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
};

export const post_api_trainings_27 = async (req, res) => {
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
};
