import User from "../models/usermodel.js";

export const toggleDonorStatus = async (req, res) => {
    try {
        const {email, password} = req.body;
      const user = await User.findOne({email});
      user.canDonate = !user.canDonate;
      await user.save();
      res.json({ success: true, message: `You are now ${user.canDonate ? "a donor" : "not donating"}` });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };