import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenirAnnonces } from "../services/annonceService";

function ListeAnnonces() {
  const [annonces, setAnnonces] = useState([]);
  const [filtres, setFiltres] = useState({ ville: "", type: "", prixMin: "", prixMax: "" });

  const chargerAnnonces = async () => {
    const filtresNettoyes = Object.fromEntries(Object.entries(filtres).filter(([, valeur]) => valeur !== ""));
    const reponse = await obtenirAnnonces(filtresNettoyes);
    setAnnonces(reponse.data);
  };

  useEffect(() => {
    chargerAnnonces();
  }, []);

  const gererChangementFiltre = (e) => {
    setFiltres({ ...filtres, [e.target.name]: e.target.value });
  };

  const gererRecherche = (e) => {
    e.preventDefault();
    chargerAnnonces();
  };

  const formatPrice = (p) => (p == null || p === "" ? "—" : `${p} DT`);

  return (
    <div className="page-wide">
      <h2 className="page-title">Annonces</h2>

      <form className="filters-bar fancy-filters" onSubmit={gererRecherche}>
        <select name="type" value={filtres.type} onChange={gererChangementFiltre}>
          <option value="">Tous les types</option>
          <option value="logement">Logement</option>
          <option value="recherche_colocation">Recherche de colocataire</option>
        </select>

        <select name="ville" value={filtres.ville} onChange={gererChangementFiltre}>
          <option value="">Toutes les villes</option>
          <option value="Tunis Centre">Tunis Centre</option>
          <option value="Ghazela">Ghazela</option>
          <option value="Sousse">Sousse</option>
          <option value="Sfax">Sfax</option>
          <option value="Monastir">Monastir</option>
        </select>

        <input name="prixMin" value={filtres.prixMin} onChange={gererChangementFiltre} placeholder="Prix min" />
        <input name="prixMax" value={filtres.prixMax} onChange={gererChangementFiltre} placeholder="Prix max" />
        <button className="btn btn-primary">Filtrer</button>
      </form>

      {annonces.length === 0 && <p className="empty-state">Aucune annonce trouvée pour ces critères.</p>}

      <div className="annonce-grid fancy-grid">
        {annonces.map((annonce) => {
          // photo : prend la première photo si présente, sinon placeholder unique avec seed basé sur l'id
          const imageUrl =
            annonce.photos && annonce.photos.length > 0 && annonce.photos[0]
              ? annonce.photos[0]
              : `https://picsum.photos/seed/${annonce._id || annonce.titre}/800/520`;

          return (
            <article key={annonce._id} className="annonce-card fancy-card" aria-labelledby={`a-${annonce._id}-title`}>
              <div className="card-media" style={{ backgroundImage: `url(${imageUrl})` }} role="img" aria-label={annonce.titre} />
              <div className="card-body">
                <div className="card-top">
                  <span className={`type-pill ${annonce.type === "logement" ? "logement" : "recherche_colocation"}`}>
                    {annonce.type === "logement" ? "Logement" : "Recherche colocataire"}
                  </span>
                  <div className="price-bubble">{formatPrice(annonce.prix)}</div>
                </div>

                <h3 id={`a-${annonce._id}-title`} className="card-title">{annonce.titre}</h3>

                <p className="card-location">{annonce.ville}{annonce.quartier ? `, ${annonce.quartier}` : ""}</p>

                <div className="card-actions">
                  <Link to={`/annonces/${annonce._id}`} className="detail-link">Voir le détail →</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default ListeAnnonces;