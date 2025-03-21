import axios from 'axios';
import User from '../models/usermodel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import { errorHandler } from "../utils/error.js";

export const signUP = async (req, res) => {
    try {
        const { username, email, gender, bloodtype, password, address } = req.body;
        const response = await axios(`https://maps.gomaps.pro/maps/api/geocode/json`, {
            params: { key: process.env.MAPS_API_KEY, address }
        });
        const location = response.data.results[0].geometry.location;
        const latitude = location.lat;
        const longitude = location.lng;

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({
            username, email, gender, bloodtype, password: hashedPassword, location: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            }
        });
        await newUser.save();
        console.log(newUser);
        return res.status(201).json({ message: "New User Created Successfully!" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error creating User" })
    }
}

export const signIN = async (req, res) => {
    const { username, password } = req.body;
    try {
        const validUser = await User.findOne({ username });
        if (!validUser) {
            return res.status(401).json({ message: "Invalid credentials" })
            // return next(errorHandler(401, 'Invalid Username / Password'));
        }

        const validPassword = bcrypt.compareSync(password, validUser.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Password does not match", error: error.message })
            // return next(errorHandler(401, 'Invalid Username / Password'));
        }
        const token = jwt.sign({ _id: validUser.id }, process.env.JWT, { expiresIn: '1h' });
        const { password: pass, ...remaining } = validUser._doc;
        console.log(remaining);

        return res.cookie('access_token', token,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            })
            .status(200).json(remaining);

    } catch (error) {
        return res.status(500).json({ message: "Error signing in" });
    }
}

export const signOut = async (req, res) => {
    try {
        res.clearCookie("access_token");
        return res.status(200).json("User has been logged out");
    } catch (error) {
        return res.status(500).json({ message: "Error signing out" });
    }
}


export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Error getting profile infromation: ${error.message}` });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            $set: req.body
        }, {
            new: true, runValidators: true
        });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(updatedUser);

    } catch (error) {
        return res.status(500).json({ message: `Error updating profile: ${error.message}` });
    }
}

export const Verify = async (req, res) => {
    const token = req.cookies.access_token; // Retrieve token from HTTP-only cookie
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }
  
    jwt.verify(token, process.env.JWT, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      }
      res.json({ message: "Token Valid", user });
    });
  }
