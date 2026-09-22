const axios = require("axios");

const relayerImage = async (req, res, endpoint) => {
  try {
    const params = req.query.ville ? { ville: req.query.ville } : {};

    const reponse = await axios.get(`${process.env.MATCHING_SERVICE_URL}/${endpoint}`, {
      headers: { "x-api-key": process.env.MATCHING_API_KEY },
      params,
      responseType: "arraybuffer",
    });

    res.set("Content-Type", "image/png");
    res.send(reponse.data);
  } catch (err) {
    console.error(`Erreur statistiques (${endpoint}):`, err.message);
    res.status(500).json({ message: "Impossible de générer le graphique pour le moment" });
  }
};

exports.prixMoyenParVille = (req, res) => relayerImage(req, res, "statistiques/prix-moyen-par-ville");
exports.offreDemande = (req, res) => relayerImage(req, res, "statistiques/offre-demande");
exports.criteresRecherche = (req, res) => relayerImage(req, res, "statistiques/criteres-recherche");
exports.exportCsv = async (req, res) => {
  try {
    const params = req.query.ville ? { ville: req.query.ville } : {};

    const reponse = await axios.get(`${process.env.MATCHING_SERVICE_URL}/statistiques/export-csv`, {
      headers: { "x-api-key": process.env.MATCHING_API_KEY },
      params,
      responseType: "arraybuffer",
    });

    res.set("Content-Type", "text/csv");
    res.set("Content-Disposition", "attachment; filename=foyer_dar_annonces.csv");
    res.send(reponse.data);
  } catch (err) {
    console.error("Erreur export CSV:", err.message);
    res.status(500).json({ message: "Impossible d'exporter les données pour le moment" });
  }
};