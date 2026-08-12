const express = require("express");
const router = express.Router();
const { protege } = require("../middleware/authMiddleware");
const { estAdmin } = require("../middleware/adminMiddleware");
const {
  obtenirSignalements, traiterSignalement,
  obtenirUtilisateurs, basculerBlocage, supprimerUtilisateur,obtenirVilles, ajouterVille, basculerVilleActive,
} = require("../controllers/adminController");

router.get("/signalements", protege, estAdmin, obtenirSignalements);
router.put("/signalements/:id", protege, estAdmin, traiterSignalement);
router.get("/utilisateurs", protege, estAdmin, obtenirUtilisateurs);
router.put("/utilisateurs/:id/bloquer", protege, estAdmin, basculerBlocage);
router.delete("/utilisateurs/:id", protege, estAdmin, supprimerUtilisateur);
router.get("/villes", protege, estAdmin, obtenirVilles);
router.post("/villes", protege, estAdmin, ajouterVille);
router.put("/villes/:id", protege, estAdmin, basculerVilleActive);

module.exports = router;