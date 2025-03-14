import User from "../models/usermodel.js";
export const requestBlood = async (req, res) => {
    try {
      const { bloodtype, location } = req.body;
  
      const donors = await User.find({ bloodtype, canDonate: true });
  
      if (!donors.length) return res.status(404).json({ success: false, message: "No donors available" });
          // Simulate Notification (Replace with Twilio, Firebase, etc.)
    res.json({ success: true, message: "Donors notified!", donors });
} catch (error) {
  res.status(500).json({ success: false, message: error.message });
}
};