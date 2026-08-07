const mongoose = require("mongoose");

const annonceSchema = new mongoose.Schema(
  {
    auteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Etudiant",
      required: true,
    },
    type: {
      type: String,
      enum: ["logement", "recherche_colocation"],
      required: true,
    },
    titre: {
      type: String,
      required: true,
      trim: true,
    },
    ville: {
      type: String,
      required: true,
      enum: ["Tunis Centre", "Ghazela", "Sousse", "Sfax", "Monastir"],
    },
    quartier: { type: String },
    proximiteFaculte: { type: String }, // ex: "5 min à pied de la FSEGS"
    prix: {
      type: Number,
      required: true,
      min: 0,
    },
    nombreChambresDisponibles: {
      type: Number,
      min: 0,
      default: null, // pertinent seulement pour type "logement"
    },
    photos: [{ type: String }],
    equipements: [{ type: String }], // ex: ["wifi", "climatisation"]
    reglesColocation: { type: String },
    description: { type: String },
    statut: {
      type: String,
      enum: ["active", "cloturee"],
      default: "active",
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Annonce", annonceSchema);