import User from "../models/usermodel.js";

const bloodCompatibility = {
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
        const { bloodtype } = req.body;
        const longitude = req.body.location.coordinates[0];
        const latitude = req.body.location.coordinates[1];

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
                    maxDistance: 10 * 1000, // 10 km in meters
                    query: { bloodtype: { $in: eligibleBloodTypes } }
                }
            },
            {
                $project: {
                    password: 0,
                    email: 0
                }
            }
        ]);

        if (!nearbyDonors.length) {
            return res.status(404).json({
                message: "So sorry, no donors found nearby"
            });
        }

        return res.status(200).json({
            donors: nearbyDonors
        });
    } catch (error) {
        console.error("Error finding donors:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
