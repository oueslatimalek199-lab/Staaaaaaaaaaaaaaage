const mongoose = require("mongoose");

const journalAuditSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "connexion", "connexion_echouee", "inscription",
        "modification_profil", "suppression_profil",
        "blocage_utilisateur", "deblocage_utilisateur", "suppression_utilisateur",
        "signalement_traite",
      ],
    },
    acteur: { type: mongoose.Schema.Types.ObjectId, ref: "Etudiant", default: null },
    cible: { type: mongoose.Schema.Types.ObjectId, default: null },
    details: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JournalAudit", journalAuditSchema);