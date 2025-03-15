import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routers/userRouter.js'
import donorRouter from './routers/donorRouter.js'
import User from './models/usermodel.js';
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