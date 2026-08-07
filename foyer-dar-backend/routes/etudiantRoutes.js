const express = require("express");
const router = express.Router();
const { protege } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  inscrire,
  connecter,
  obtenirProfil,
  modifierProfil,
  supprimerProfil,
  uploaderCarteEtudiant,
  ajouterFavori,
  retirerFavori,
  obtenirFavoris,
  motDePasseOublie, 
  reinitialiserMotDePasse,
} = require("../controllers/etudiantController");

router.post("/inscription", inscrire);
router.post("/connexion", connecter);
router.get("/profil", protege, obtenirProfil);
router.put("/profil", protege, modifierProfil);
router.delete("/profil", protege, supprimerProfil);
router.post("/verification", protege, upload.single("carteEtudiant"), uploaderCarteEtudiant);
router.post("/favoris/:annonceId", protege, ajouterFavori);
router.delete("/favoris/:annonceId", protege, retirerFavori);
router.get("/favoris", protege, obtenirFavoris);
router.post("/mot-de-passe-oublie", motDePasseOublie);
router.put("/reinitialiser-mot-de-passe/:token", reinitialiserMotDePasse);
module.exports = router;