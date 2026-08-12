const express = require("express");
const router = express.Router();
const Ville = require("../models/Ville");

// Public — utilisé par les formulaires d'inscription/annonces
router.get("/", async (req, res) => {
  try {
    const villes = await Ville.find({ active: true }).sort({ nom: 1 });
    res.json(villes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;