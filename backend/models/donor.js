const mongoose = require("mongoose");

const DonorSchema = new mongoose.Schema({
  name: String,
  bloodtype: String,
  phone: String,
  email: String,
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  isAvailable: { type: Boolean, default: true },
});

DonorSchema.index({ location: "2dsphere" }); // Enables GeoLocation Querying

module.exports = mongoose.model("Donor", DonorSchema);
