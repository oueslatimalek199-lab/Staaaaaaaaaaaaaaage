const Etudiant = require("../models/Etudiant");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const envoyerEmail = require("../utils/envoyerEmail");

// Génère un token JWT pour un étudiant donné
const genererToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route POST /api/etudiants/inscription
exports.inscrire = async (req, res) => {
  try {
    const { nom, email, motDePasse, ville, budget } = req.body;

    const existe = await Etudiant.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: "Un compte existe déjà avec cet email" });
    }

    const salt = await bcrypt.genSalt(10);
    const motDePasseHache = await bcrypt.hash(motDePasse, salt);

    const etudiant = await Etudiant.create({
      nom,
      email,
      motDePasse: motDePasseHache,
      ville,
      budget,
    });

    res.status(201).json({
      _id: etudiant._id,
      nom: etudiant.nom,
      email: etudiant.email,
      token: genererToken(etudiant._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/etudiants/connexion
exports.connecter = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const etudiant = await Etudiant.findOne({ email });
    if (!etudiant) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, etudiant.motDePasse);
    if (!motDePasseValide) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

    if (etudiant.bloque) {
      return res.status(403).json({ message: "Ce compte a été bloqué par un administrateur" });
    }

    res.json({
      _id: etudiant._id,
      nom: etudiant.nom,
      email: etudiant.email,
      token: genererToken(etudiant._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @route GET /api/etudiants/profil (BF-02)
exports.obtenirProfil = async (req, res) => {
  res.json(req.etudiant);
};

// @route PUT /api/etudiants/profil (BF-03)
exports.modifierProfil = async (req, res) => {
  try {
    const champsAutorises = ["nom", "ville", "faculte", "budget", "fumeur", "rythmeDeVie", "rythmeEtude", "animaux"];
    const misesAJour = {};

    champsAutorises.forEach((champ) => {
      if (req.body[champ] !== undefined) {
        misesAJour[champ] = req.body[champ];
      }
    });

    const etudiant = await Etudiant.findByIdAndUpdate(req.etudiant._id, misesAJour, {
      new: true,
      runValidators: true,
    }).select("-motDePasse");

    res.json(etudiant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/etudiants/profil (BF-03)
exports.supprimerProfil = async (req, res) => {
  try {
    await Etudiant.findByIdAndDelete(req.etudiant._id);
    res.json({ message: "Compte supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @route POST /api/etudiants/verification (BF-05)
exports.uploaderCarteEtudiant = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier envoyé" });
    }

    const etudiant = await Etudiant.findByIdAndUpdate(
      req.etudiant._id,
      { carteEtudiantURL: req.file.path },
      { new: true }
    ).select("-motDePasse");

    res.json({
      message: "Carte d'étudiant reçue, en attente de validation par un administrateur",
      etudiant,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @route POST /api/etudiants/favoris/:annonceId (BF-10)
exports.ajouterFavori = async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.etudiant._id);

    if (etudiant.favoris.includes(req.params.annonceId)) {
      return res.status(400).json({ message: "Annonce déjà en favoris" });
    }

    etudiant.favoris.push(req.params.annonceId);
    await etudiant.save();

    res.json({ message: "Ajoutée aux favoris", favoris: etudiant.favoris });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/etudiants/favoris/:annonceId (BF-10)
exports.retirerFavori = async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.etudiant._id);
    etudiant.favoris = etudiant.favoris.filter(
      (id) => id.toString() !== req.params.annonceId
    );
    await etudiant.save();

    res.json({ message: "Retirée des favoris", favoris: etudiant.favoris });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/etudiants/favoris (BF-10)
exports.obtenirFavoris = async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.etudiant._id).populate("favoris");
    res.json(etudiant.favoris);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @route POST /api/etudiants/mot-de-passe-oublie
exports.motDePasseOublie = async (req, res) => {
  try {
    const etudiant = await Etudiant.findOne({ email: req.body.email });

    // On répond pareil que l'email existe ou non (évite de révéler quels emails sont inscrits)
    if (!etudiant) {
      return res.json({ message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." });
    }

    const tokenBrut = crypto.randomBytes(32).toString("hex");
    const tokenHache = crypto.createHash("sha256").update(tokenBrut).digest("hex");

    etudiant.resetPasswordToken = tokenHache;
    etudiant.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await etudiant.save();

    const lienReinitialisation = `${process.env.FRONTEND_URL}/reinitialiser-mot-de-passe/${tokenBrut}`;

    await envoyerEmail(
      etudiant.email,
      "Réinitialisation de votre mot de passe — Foyer/Dar",
      `Bonjour ${etudiant.nom},\n\nCliquez sur ce lien pour réinitialiser votre mot de passe (valable 10 minutes) :\n${lienReinitialisation}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`
    );

    res.json({ message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/etudiants/reinitialiser-mot-de-passe/:token
exports.reinitialiserMotDePasse = async (req, res) => {
  try {
    const tokenHache = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const etudiant = await Etudiant.findOne({
      resetPasswordToken: tokenHache,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!etudiant) {
      return res.status(400).json({ message: "Lien invalide ou expiré" });
    }

    const salt = await bcrypt.genSalt(10);
    etudiant.motDePasse = await bcrypt.hash(req.body.motDePasse, salt);
    etudiant.resetPasswordToken = null;
    etudiant.resetPasswordExpire = null;
    await etudiant.save();

    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};