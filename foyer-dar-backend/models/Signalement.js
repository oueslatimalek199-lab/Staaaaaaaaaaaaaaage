const mongoose = require("mongoose");

const signalementSchema = new mongoose.Schema(
  {
    annonce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Annonce",
      required: true,
    },
    signalePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Etudiant",
      required: true,
    },
    motif: {
      type: String,
      required: true,
      enum: ["frauduleuse", "contenu_inapproprie", "annonce_expiree", "autre"],
    },
    details: { type: String },
    statut: {
      type: String,
      enum: ["en_attente", "traite"],
      default: "en_attente",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Signalement", signalementSchema);