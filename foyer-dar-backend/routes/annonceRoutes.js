const express = require("express");
const router = express.Router();
const { protege } = require("../middleware/authMiddleware");
const {
  creerAnnonce,
  obtenirAnnonces,
  obtenirMesAnnonces,
  obtenirAnnonceParId,
  modifierAnnonce,
  supprimerAnnonce,
} = require("../controllers/annonceController");

router.get("/", obtenirAnnonces);                      // public
router.get("/mes-annonces", protege, obtenirMesAnnonces);
router.get("/:id", obtenirAnnonceParId);                // public
router.post("/", protege, creerAnnonce);
router.put("/:id", protege, modifierAnnonce);
router.delete("/:id", protege, supprimerAnnonce);

module.exports = router;