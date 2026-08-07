const Signalement = require("../models/Signalement");
const Annonce = require("../models/Annonce");
const Etudiant = require("../models/Etudiant");

// BF-18 — GET /api/admin/signalements
exports.obtenirSignalements = async (req, res) => {
  try {
    const signalements = await Signalement.find()
      .populate("annonce", "titre statut")
      .populate("signalePar", "nom email")
      .sort({ createdAt: -1 });

    res.json(signalements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// BF-18 — PUT /api/admin/signalements/:id
// action: "ignorer" | "cloturer_annonce"
exports.traiterSignalement = async (req, res) => {
  try {
    const { action } = req.body;
    const signalement = await Signalement.findById(req.params.id);
    if (!signalement) return res.status(404).json({ message: "Signalement introuvable" });

    if (action === "cloturer_annonce") {
      await Annonce.findByIdAndUpdate(signalement.annonce, { statut: "cloturee" });
    }

    signalement.statut = "traite";
    await signalement.save();

    res.json({ message: "Signalement traité" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// BF-19 — GET /api/admin/utilisateurs
exports.obtenirUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await Etudiant.find().select("-motDePasse").sort({ createdAt: -1 });
    res.json(utilisateurs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// BF-19 — PUT /api/admin/utilisateurs/:id/bloquer
exports.basculerBlocage = async (req, res) => {
  try {
    const utilisateur = await Etudiant.findById(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur introuvable" });

    if (utilisateur.role === "administrateur") {
      return res.status(400).json({ message: "Impossible de bloquer un administrateur" });
    }

    utilisateur.bloque = !utilisateur.bloque;
    await utilisateur.save();

    res.json({ message: utilisateur.bloque ? "Utilisateur bloqué" : "Utilisateur débloqué", bloque: utilisateur.bloque });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// BF-19 — DELETE /api/admin/utilisateurs/:id
exports.supprimerUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Etudiant.findById(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur introuvable" });

    if (utilisateur.role === "administrateur") {
      return res.status(400).json({ message: "Impossible de supprimer un administrateur" });
    }

    await utilisateur.deleteOne();
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};