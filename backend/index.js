import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routers/userRouter.js'
import donorRouter from './routers/donorRouter.js'
import User from './models/usermodel.js';
import nodemailer from "nodemailer";
import { WebSocket, WebSocketServer } from 'ws';
dotenv.config();
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to the Database...');
  })
  .catch((e) => {
    console.log(e);
  });
const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', async (req, res) => {
  const users = await User.find();
  console.log(users);
  return res.status(200).json(users);
})
app.use("/auth", userRouter);
app.use('/find-donor', donorRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is up & running on port ${PORT}`);
});


const wss = new WebSocketServer({ port: 3001 });
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (msg) => {
    console.log(`Message received: ${msg}`);
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg.toString());
      }
    });
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // Your Gmail
    pass: process.env.PASSWORD, // Your App Password
  },
});

// Search Donors & Notify API
app.post("/mail-donors", async (req, res) => {
  const { bloodtype } = req.body;

  try {
    const donors = await User.find({ bloodtype, canDonate: true });

    if (donors.length === 0) {
      return res.status(404).json({ message: "No donors found" });
    }

    const notificationMessage = `A recipient is looking for ${bloodtype} blood in your area. Please check the website.`;

    // Send email notifications
    donors.forEach((donor) => {
      transporter.sendMail(
        {
          from: process.env.EMAIL,
          to: donor.email,
          subject: "Urgent: Blood Donation Needed",
          text: notificationMessage,
        },
        (error, info) => {
          if (error) {
            console.log(`Error sending email to ${donor.email}:` , error);
          } else {
            console.log(`Email sent to ${donor.email}:` , info.response);
          }
        }
      );
    });
    // Store notification in DB
    await User.updateMany(
      { _id: { $in: donors.map((d) => d._id) } },
      {
        $push: {
          notifications: {
            message: notificationMessage,
            timestamp: new Date(),
            read: false,
          },
        },
      }
    );

    // Send WebSocket Notification to Online Users
    donors.forEach((donor) => {
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(
            JSON.stringify({ email: donor.email, message: notificationMessage })
          );
        }
      });
    });

    res.json({ message: "Donors notified successfully!" });
  } catch (error) {
    console.error("Error in search-donors API: ", error);
    res.status(500).json({ message: "Server error" });
  }
});

// API to Fetch User Notifications
app.get("/notifications/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.notifications);
  } catch (error) {
    console.error("Error fetching notifications: ", error);
    res.status(500).json({ message: "Server error" });
  }
});

// API to Mark Notifications as Read
app.post("/mark-notifications-read/:userId", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, {
      $set: { "notifications.$[].read": true },
    });
    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read: ", error);
    res.status(500).json({ message: "Server error" });
  }
});
