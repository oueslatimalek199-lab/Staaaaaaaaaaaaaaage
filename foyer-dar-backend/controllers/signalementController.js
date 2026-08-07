const Signalement = require("../models/Signalement");
const Annonce = require("../models/Annonce");

// @route POST /api/signalements (BF-11)
exports.creerSignalement = async (req, res) => {
  try {
    const { annonceId, motif, details } = req.body;

    const annonce = await Annonce.findById(annonceId);
    if (!annonce) return res.status(404).json({ message: "Annonce introuvable" });

    const signalement = await Signalement.create({
      annonce: annonceId,
      signalePar: req.etudiant._id,
      motif,
      details,
    });

    res.status(201).json({ message: "Signalement envoyé, un administrateur va l'examiner", signalement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};