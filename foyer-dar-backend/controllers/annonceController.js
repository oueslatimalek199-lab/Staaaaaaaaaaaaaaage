const Annonce = require("../models/Annonce");

// @route POST /api/annonces (BF-06 / BF-07)
exports.creerAnnonce = async (req, res) => {
  try {
    const {
      type, titre, ville, quartier, proximiteFaculte, prix,
      nombreChambresDisponibles, photos, equipements, reglesColocation, description,
    } = req.body;

    const annonce = await Annonce.create({
      auteur: req.etudiant._id,
      type, titre, ville, quartier, proximiteFaculte, prix,
      nombreChambresDisponibles, photos, equipements, reglesColocation, description,
    });

    res.status(201).json(annonce);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/annonces (liste publique, filtres simples pour l'instant)
// @route GET /api/annonces (BF-09 — avec filtres avancés)
exports.obtenirAnnonces = async (req, res) => {
  try {
    const filtre = { statut: "active" };

    if (req.query.type) filtre.type = req.query.type;
    if (req.query.ville) filtre.ville = req.query.ville;

    if (req.query.prixMin || req.query.prixMax) {
      filtre.prix = {};
      if (req.query.prixMin) filtre.prix.$gte = Number(req.query.prixMin);
      if (req.query.prixMax) filtre.prix.$lte = Number(req.query.prixMax);
    }

    if (req.query.nombreChambresMin) {
      filtre.nombreChambresDisponibles = { $gte: Number(req.query.nombreChambresMin) };
    }

    const annonces = await Annonce.find(filtre)
      .populate("auteur", "nom ville")
      .sort({ createdAt: -1 });

    res.json(annonces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/annonces/mes-annonces
exports.obtenirMesAnnonces = async (req, res) => {
  try {
    const annonces = await Annonce.find({ auteur: req.etudiant._id }).sort({ createdAt: -1 });
    res.json(annonces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/annonces/:id
exports.obtenirAnnonceParId = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id).populate("auteur", "nom ville");
    if (!annonce) return res.status(404).json({ message: "Annonce introuvable" });
    res.json(annonce);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/annonces/:id (BF-08)
exports.modifierAnnonce = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) return res.status(404).json({ message: "Annonce introuvable" });

    if (annonce.auteur.toString() !== req.etudiant._id.toString()) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette annonce" });
    }

    const champsAutorises = [
      "titre", "ville", "quartier", "proximiteFaculte", "prix",
      "nombreChambresDisponibles", "photos", "equipements",
      "reglesColocation", "description", "statut",
    ];
    champsAutorises.forEach((champ) => {
      if (req.body[champ] !== undefined) annonce[champ] = req.body[champ];
    });

    await annonce.save();
    res.json(annonce);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/annonces/:id (BF-08)
exports.supprimerAnnonce = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) return res.status(404).json({ message: "Annonce introuvable" });

    if (annonce.auteur.toString() !== req.etudiant._id.toString()) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette annonce" });
    }

    await annonce.deleteOne();
    res.json({ message: "Annonce supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};