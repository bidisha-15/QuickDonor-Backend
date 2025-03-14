import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const geocode = async (req, res, next) => {
    try {
        const { address } = req.body;
        const response = await axios(`https://maps.gomaps.pro/maps/api/geocode/json`, {
            params: { key: process.env.MAPS_API_KEY, address }
        });
        const location = response.data.results[0].geometry.location;

        req.body.location = {
            type: 'Point',
            coordinates: [location.lng, location.lat]
        };

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};