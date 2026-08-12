import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenirRecommandations } from "../services/etudiantService";

const libellesCriteres = {
  budget: "Budget",
  fumeur: "Tabac",
  rythmeDeVie: "Rythme de vie",
  rythmeEtude: "Rythme d'étude",
  animaux: "Animaux",
};

// Helper to get color based on score
const getScoreColor = (score) => {
  if (score >= 75) return "#4CAF50"; // Green - Good
  if (score >= 50) return "#FFC107"; // Orange - Medium
  return "#F44336"; // Red - Low
};

// Helper to get emoji based on score
const getScoreEmoji = (score) => {
  if (score >= 75) return "✅";
  if (score >= 50) return "⚠️";
  return "❌";
};

function Recommandations() {
  const [resultats, setResultats] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/connexion");
      return;
    }
    obtenirRecommandations(token)
      .then((reponse) => setResultats(reponse.data))
      .catch(() => setErreur("Impossible de charger les recommandations pour le moment"))
      .finally(() => setChargement(false));
  }, [navigate]);

  if (chargement) return <div className="page"><p>Calcul des recommandations...</p></div>;
  if (erreur) return <div className="page"><p className="message">{erreur}</p></div>;

  return (
    <div className="page-wide">
      <h2>Colocataires recommandés</h2>

      {resultats.length === 0 && (
        <p className="empty-state">Pas encore assez d'étudiants inscrits pour te proposer des recommandations.</p>
      )}

      <div className="annonce-grid">
        {resultats.map((resultat) => (
          <div key={resultat.etudiant._id} className="surface-card match-card">
            {/* Main Score Display */}
            <div className="match-score-main">
              <div className="match-score-circle" style={{ borderColor: getScoreColor(resultat.score) }}>
                <span className="match-score-number">{Math.round(resultat.score)}</span>
                <span className="match-score-percent">%</span>
              </div>
              <span className="match-score-emoji">{getScoreEmoji(resultat.score)}</span>
            </div>

            <h3>{resultat.etudiant.nom}</h3>
            <p className="annonce-meta">
              {resultat.etudiant.ville}
              {resultat.etudiant.faculte ? ` — ${resultat.etudiant.faculte}` : ""}
            </p>

            {/* Criteria with Progress Bars */}
            <div className="match-details">
              {Object.entries(resultat.details).map(([critere, valeur]) => (
                <div key={critere} className="match-detail-row">
                  <span className="criteria-label">{libellesCriteres[critere] || critere}</span>
                  <div className="criteria-bar-container">
                    <div
                      className="criteria-bar"
                      style={{
                        width: `${valeur}%`,
                        backgroundColor: getScoreColor(valeur),
                      }}
                    />
                  </div>
                  <span className="criteria-value">{Math.round(valeur)}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Recommandations;