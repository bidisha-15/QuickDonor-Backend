import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routers/userRouter.js'
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

app.use("/auth", userRouter)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is up & running on port ${PORT}`);
});