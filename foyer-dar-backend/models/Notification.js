const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    destinataire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Etudiant",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["nouveau_message", "nouveau_match", "reponse_annonce"],
      required: true,
    },
    titre: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    lien: {
      type: String,
      default: null,
    },
    // Reference to related object
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    referenceType: {
      type: String,
      enum: ["Message", "Annonce", "Etudiant"],
      default: null,
    },
    lu: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
