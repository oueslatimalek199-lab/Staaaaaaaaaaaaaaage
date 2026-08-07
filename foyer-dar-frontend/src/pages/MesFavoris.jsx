import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenirFavoris } from "../services/annonceService";

function MesFavoris() {
  const [favoris, setFavoris] = useState([]);
  const [chargement, setChargement] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/connexion");
      return;
    }
    obtenirFavoris(token)
      .then((reponse) => setFavoris(reponse.data))
      .finally(() => setChargement(false));
  }, [navigate, token]);

  if (chargement) return <div className="page"><p>Chargement...</p></div>;

  return (
    <div className="page-wide">
      <h2>Mes favoris</h2>

      {favoris.length === 0 && <p className="empty-state">Aucune annonce en favoris pour le moment.</p>}

      <div className="annonce-grid">
        {favoris.map((annonce) => (
          <div key={annonce._id} className={`annonce-card tape-card type-${annonce.type}`}>
            <span className={`type-pill ${annonce.type}`}>
              {annonce.type === "logement" ? "Logement" : "Recherche colocataire"}
            </span>
            <h3>{annonce.titre}</h3>
            <p className="annonce-meta">{annonce.ville}{annonce.quartier ? `, ${annonce.quartier}` : ""}</p>
            <div><span className="price-tag">{annonce.prix} DT</span></div>
            <Link to={`/annonces/${annonce._id}`} className="detail-link">Voir le détail →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MesFavoris;