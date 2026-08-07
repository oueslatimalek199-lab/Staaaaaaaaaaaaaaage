import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenirProfil } from "../services/etudiantService";

function Profil() {
  const [etudiant, setEtudiant] = useState(null);
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/connexion");
      return;
    }
    obtenirProfil(token)
      .then((reponse) => setEtudiant(reponse.data))
      .catch(() => {
        setErreur("Session expirée, reconnecte-toi");
        setTimeout(() => navigate("/connexion"), 1000);
      });
  }, [navigate]);

  const seDeconnecter = () => {
    localStorage.removeItem("token");
    navigate("/connexion");
  };

  const formatBool = (val) => (val ? "Oui" : "Non");
  const formatBudget = (b) => (b == null || b === "" ? "—" : `${b} DT`);

  if (erreur) return <div className="page"><p className="message">{erreur}</p></div>;
  if (!etudiant) return <div className="page"><p>Chargement...</p></div>;

  // initials for avatar
  const initials = etudiant.nom
    ? etudiant.nom.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "E";

  return (
    <div className="page">
      <div className="surface-card form-card profile-card">
        <header className="profile-hero" aria-labelledby="profil-title">
          <div className="avatar" aria-hidden="true">{initials}</div>
          <div className="hero-meta">
            <h2 id="profil-title">{etudiant.nom}</h2>
            <p className="hero-email">{etudiant.email}</p>
          </div>
          <div className="hero-actions">
            <Link to="/modifier-profil" className="btn btn-secondary">Modifier</Link>
            <button className="btn btn-outline" onClick={seDeconnecter}>Se déconnecter</button>
          </div>
        </header>

        <section className="profile-details" aria-labelledby="details-title">
          <h3 id="details-title" className="visually-hidden">Détails du profil</h3>
          <dl className="details-grid">
            <div className="detail-row">
              <dt>Ville</dt>
              <dd>{etudiant.ville || "—"}</dd>
            </div>
            <div className="detail-row">
              <dt>Faculté</dt>
              <dd>{etudiant.faculte || "Non renseignée"}</dd>
            </div>
            <div className="detail-row">
              <dt>Budget</dt>
              <dd>{formatBudget(etudiant.budget)}</dd>
            </div>
            <div className="detail-row">
              <dt>Fumeur</dt>
              <dd>{formatBool(etudiant.fumeur)}</dd>
            </div>
            <div className="detail-row">
              <dt>Rythme de vie</dt>
              <dd>{etudiant.rythmeDeVie || "—"}</dd>
            </div>
            <div className="detail-row">
              <dt>Rythme d'étude</dt>
              <dd>{etudiant.rythmeEtude || "—"}</dd>
            </div>
            <div className="detail-row">
              <dt>Animaux acceptés</dt>
              <dd>{formatBool(etudiant.animaux)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

export default Profil;