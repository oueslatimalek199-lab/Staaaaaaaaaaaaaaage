const axios = require("axios");
const Etudiant = require("../models/Etudiant");

const versProfilMatching = (etudiant) => ({
  id: etudiant._id.toString(),
  budget: etudiant.budget || 0,
  fumeur: etudiant.fumeur,
  rythmeDeVie: etudiant.rythmeDeVie,
  rythmeEtude: etudiant.rythmeEtude,
  animaux: etudiant.animaux,
});

// @route GET /api/matching (BF-12/BF-13)
exports.obtenirRecommandations = async (req, res) => {
  try {
    const moi = await Etudiant.findById(req.etudiant._id);
    const autres = await Etudiant.find({ _id: { $ne: req.etudiant._id } });

    if (autres.length === 0) {
      return res.json([]);
    }

    const reponseIA = await axios.post(
      `${process.env.MATCHING_SERVICE_URL}/matching`,
      {
        etudiant: versProfilMatching(moi),
        candidats: autres.map(versProfilMatching),
      },
      {
        headers: { "x-api-key": process.env.MATCHING_API_KEY },
      }
    );

    // On enrichit les résultats du microservice avec les infos complètes des étudiants
    const resultatsEnrichis = reponseIA.data.map((resultat) => {
      const etudiantCorrespondant = autres.find((e) => e._id.toString() === resultat.id);
      return {
        etudiant: {
          _id: etudiantCorrespondant._id,
          nom: etudiantCorrespondant.nom,
          ville: etudiantCorrespondant.ville,
          faculte: etudiantCorrespondant.faculte,
        },
        score: resultat.score,
        details: resultat.details,
      };
    });

    res.json(resultatsEnrichis);
  } catch (err) {
    console.error("Erreur matching:", err.message);
    res.status(500).json({ message: "Impossible de calculer les recommandations pour le moment" });
  }
};


