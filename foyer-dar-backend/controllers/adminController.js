const Signalement = require("../models/Signalement");
const Annonce = require("../models/Annonce");
const Etudiant = require("../models/Etudiant");
const Ville = require("../models/Ville");
const envoyerEmail = require("../utils/envoyerEmail");

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
    const signalement = await Signalement.findById(req.params.id)
      .populate("signalePar", "nom email")
      .populate("annonce", "titre");

    if (!signalement) return res.status(404).json({ message: "Signalement introuvable" });

    if (action === "prendre_en_charge") {
      signalement.statut = "en_cours";
      await signalement.save();
      return res.json({ message: "Signalement pris en charge" });
    }

    let messageEmail = "";

    if (action === "cloturer_annonce") {
      await Annonce.findByIdAndUpdate(signalement.annonce._id, { statut: "cloturee" });
      signalement.actionPrise = "annonce_cloturee";
      messageEmail = `Votre signalement concernant l'annonce "${signalement.annonce.titre}" a été examiné. L'annonce a été clôturée par notre équipe de modération.`;
    } else if (action === "supprimer_annonce") {
      await Annonce.findByIdAndDelete(signalement.annonce._id);
      signalement.actionPrise = "annonce_supprimee";
      messageEmail = `Votre signalement concernant l'annonce "${signalement.annonce.titre}" a été examiné. L'annonce a été supprimée de la plateforme car elle enfreignait nos règles.`;
    } else if (action === "ignorer") {
      signalement.actionPrise = "ignore";
      messageEmail = `Votre signalement concernant l'annonce "${signalement.annonce.titre}" a été examiné par notre équipe. Après vérification, l'annonce respecte nos règles et reste en ligne.`;
    }

    signalement.statut = "traite";
    await signalement.save();

    if (signalement.signalePar?.email) {
      envoyerEmail(
        signalement.signalePar.email,
        "Votre signalement a été traité — Foyer/Dar",
        `Bonjour ${signalement.signalePar.nom},\n\n${messageEmail}\n\nMerci de contribuer à la sécurité de la communauté Foyer/Dar.`
      ).catch((err) => console.error("Erreur envoi email signalement:", err.message));
    }

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
// BF-20 — GET /api/admin/villes
exports.obtenirVilles = async (req, res) => {
  try {
    const villes = await Ville.find().sort({ nom: 1 });
    res.json(villes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// BF-20 — POST /api/admin/villes
exports.ajouterVille = async (req, res) => {
  try {
    const existe = await Ville.findOne({ nom: req.body.nom });
    if (existe) return res.status(400).json({ message: "Cette ville existe déjà" });

    const ville = await Ville.create({ nom: req.body.nom });
    res.status(201).json(ville);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// BF-20 — PUT /api/admin/villes/:id
exports.basculerVilleActive = async (req, res) => {
  try {
    const ville = await Ville.findById(req.params.id);
    if (!ville) return res.status(404).json({ message: "Ville introuvable" });

    ville.active = !ville.active;
    await ville.save();

    res.json(ville);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};