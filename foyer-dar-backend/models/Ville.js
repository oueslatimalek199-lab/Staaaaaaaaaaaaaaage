const mongoose = require("mongoose");

const villeSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, unique: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ville", villeSchema);