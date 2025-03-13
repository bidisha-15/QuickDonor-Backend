import User from "../models/usermodel.js";

export const findNearbyDonors = async (req, res) => {
    try {
        const {latitude, longitude, bloodtype} = req.body;
        if (!latitude || !longitude || !bloodtype) {
            return res.status(400).json({ message: "Please provide latitude, longitude and blood type" });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        console.log(lat, lng)

        const nearbyDonors = await User.find({
            bloodtype,
            location: {
                $geoWithin: {
                    $centerSphere: [[lng, lat], 10 / 6378.1]
                }
            }

        }).select('-password -email');

        if (!nearbyDonors) {
            res.status(404).json({
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
}