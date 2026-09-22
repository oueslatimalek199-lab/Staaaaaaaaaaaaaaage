const express = require("express");
const router = express.Router();
const { protege } = require("../middleware/authMiddleware");
const { estAdmin } = require("../middleware/adminMiddleware");
const {
  obtenirSignalements, traiterSignalement,
  obtenirUtilisateurs, basculerBlocage, supprimerUtilisateur,obtenirVilles, ajouterVille, basculerVilleActive,obtenirJournal,
} = require("../controllers/adminController");
const { prixMoyenParVille, offreDemande, criteresRecherche ,exportCsv } = require("../controllers/statistiquesController");

router.get("/signalements", protege, estAdmin, obtenirSignalements);
router.put("/signalements/:id", protege, estAdmin, traiterSignalement);
router.get("/utilisateurs", protege, estAdmin, obtenirUtilisateurs);
router.put("/utilisateurs/:id/bloquer", protege, estAdmin, basculerBlocage);
router.delete("/utilisateurs/:id", protege, estAdmin, supprimerUtilisateur);
router.get("/villes", protege, estAdmin, obtenirVilles);
router.post("/villes", protege, estAdmin, ajouterVille);
router.put("/villes/:id", protege, estAdmin, basculerVilleActive);
router.get("/journal", protege, estAdmin, obtenirJournal);
router.get("/statistiques/prix-moyen-par-ville", protege, estAdmin, prixMoyenParVille);
router.get("/statistiques/offre-demande", protege, estAdmin, offreDemande);
router.get("/statistiques/criteres-recherche", protege, estAdmin, criteresRecherche);
router.get("/statistiques/export-csv", protege, estAdmin, exportCsv);

module.exports = router;