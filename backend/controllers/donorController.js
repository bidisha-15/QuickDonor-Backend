import axios from "axios";
import User from "../models/usermodel.js";
import nodemailer from 'nodemailer';

export const bloodCompatibility = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // Universal recipient
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"] // Universal donor
};

export const findNearbyEligibleDonors = async (req, res) => {
    try {
        const { bloodtype, address } = req.body;
        const response = await axios(`https://maps.gomaps.pro/maps/api/geocode/json`, {
            params: { key: process.env.MAPS_API_KEY, address }
        });
        const location = response.data.results[0].geometry.location;
        const latitude = location.lat;
        const longitude = location.lng;

        if (!latitude || !longitude || !bloodtype) {
            return res.status(400).json({ message: "Please provide latitude, longitude, and blood type" });
        }

        const eligibleBloodTypes = bloodCompatibility[bloodtype];

        if (!eligibleBloodTypes) {
            return res.status(400).json({ message: "Invalid blood type provided" });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        console.log(lat, lng);
        console.log("Eligible blood groups: ", eligibleBloodTypes);

        const nearbyDonors = await User.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [lng, lat] },
                    distanceField: "distance", // The calculated distance
                    spherical: true,
                    maxDistance: 100 * 1000, // 10 km in meters
                    query: { bloodtype: { $in: eligibleBloodTypes } }
                }
            },
            {
                $project: {
                    username: 1,
                    name: 1,
                    phone: 1,
                    email: 1,
                    bloodtype: 1,
                    lastDonation: 1,
                    distance: 1
                }
            }
        ]); 

        

        if (!nearbyDonors.length) {
            return res.status(404).json({
                message: "So sorry, no donors found nearby"
            });
        } 
        console.log(nearbyDonors);

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL, 
            pass: process.env.PASSWORD,  
          },
        });

        const notificationMessage = `A recipient is looking for ${bloodtype} blood. Please check the website.`;

        nearbyDonors.forEach((donor) => { 
              console.log(donor);
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
              { _id: { $in: nearbyDonors.map((d) => d._id) } },
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

        return res.status(200).json({
            donors: nearbyDonors
        });
    } catch (error) {
        console.error("Error finding donors:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
