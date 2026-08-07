const mongoose = require("mongoose");

const etudiantSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    motDePasse: {
      type: String,
      required: true,
    },
    ville: {
      type: String,
      enum: ["Tunis Centre", "Ghazela", "Sousse", "Sfax", "Monastir"],
      default: null,
    },
    faculte: { type: String },
    budget: { type: Number, min: 0, default: null },
    fumeur: {
      type: Boolean,
      default: false,
    },
    rythmeDeVie: {
      type: String,
      enum: ["calme", "fetard"],
      default: "calme",
    },
    rythmeEtude: {
      type: String,
      enum: ["matinal", "nocturne", "flexible"],
      default: "flexible",
    },
    animaux: {
      type: Boolean,
      default: false,
    },
    profilVerifie: {
      type: Boolean,
      default: false,
    },
    carteEtudiantURL: {
      type: String,
      default: null,
    },
     role: {
      type: String,
      enum: ["etudiant", "annonceur", "administrateur"],
      default: "etudiant",
    },
    bloque: {
      type: Boolean,
      default: false,
    },
    favoris: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Annonce",
    }],
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpire: { type: Date, default: null },
  },
  
  {
    timestamps: true, // ajoute createdAt / updatedAt automatiquement
  }

);


module.exports = mongoose.model("Etudiant", etudiantSchema);