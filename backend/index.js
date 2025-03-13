import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routers/userRouter.js'
import donorRouter from './routers/donorRouter.js'
import User from './models/usermodel.js';
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
  origin: '*', 
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