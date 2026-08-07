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
            <div className="match-score">{Math.round(resultat.score)}%</div>
            <h3>{resultat.etudiant.nom}</h3>
            <p className="annonce-meta">
              {resultat.etudiant.ville}
              {resultat.etudiant.faculte ? ` — ${resultat.etudiant.faculte}` : ""}
            </p>

            <div className="match-details">
              {Object.entries(resultat.details).map(([critere, valeur]) => (
                <div key={critere} className="match-detail-row">
                  <span>{libellesCriteres[critere] || critere}</span>
                  <span>{Math.round(valeur)}%</span>
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