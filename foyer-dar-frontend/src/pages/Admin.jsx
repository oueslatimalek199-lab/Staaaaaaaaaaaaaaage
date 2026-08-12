import { useEffect, useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import {
  obtenirSignalements, traiterSignalement,
  obtenirUtilisateurs, basculerBlocage, supprimerUtilisateur,
  obtenirVillesAdmin, ajouterVille, basculerVilleActive,
} from "../services/adminService";

function decoderRole(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function Admin() {
  const [onglet, setOnglet] = useState("signalements");
  const [signalements, setSignalements] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [villes, setVilles] = useState([]);
  const [nouvelleVille, setNouvelleVille] = useState("");
  const [message, setMessage] = useState("");
  const [filtreSignalement, setFiltreSignalement] = useState("en_attente");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const charger = () => {
    if (onglet === "signalements") obtenirSignalements(token).then((r) => setSignalements(r.data));
    if (onglet === "utilisateurs") obtenirUtilisateurs(token).then((r) => setUtilisateurs(r.data));
    if (onglet === "villes") obtenirVillesAdmin(token).then((r) => setVilles(r.data));
  };

  useEffect(() => {
    if (!token) {
      navigate("/connexion");
      return;
    }
    charger();
  }, [onglet]);

  const gererTraiter = async (id, action) => {
    try {
      await traiterSignalement(id, action, token);
      charger();
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur");
    }
  };

  const gererBlocage = async (id) => {
    try {
      await basculerBlocage(id, token);
      charger();
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur");
    }
  };

  const gererSuppression = async (id) => {
    if (!window.confirm("Supprimer définitivement cet utilisateur ?")) return;
    try {
      await supprimerUtilisateur(id, token);
      charger();
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur");
    }
  };

  const gererAjoutVille = async (e) => {
    e.preventDefault();
    if (!nouvelleVille.trim()) return;
    try {
      await ajouterVille(nouvelleVille, token);
      setNouvelleVille("");
      charger();
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur");
    }
  };

  const gererToggleVille = async (id) => {
    await basculerVilleActive(id, token);
    charger();
  };
  const gererSupprimerAnnonceSignalee = async (id) => {
  if (!window.confirm("Supprimer définitivement cette annonce ? Cette action est irréversible.")) return;
  await gererTraiter(id, "supprimer_annonce");
};

  return (
    <div className="page-wide">
      <h2>Administration</h2>

      <div className="filters-bar">
        <button className={`btn ${onglet === "signalements" ? "btn-primary" : "btn-outline"}`} onClick={() => setOnglet("signalements")}>Signalements</button>
        <button className={`btn ${onglet === "utilisateurs" ? "btn-primary" : "btn-outline"}`} onClick={() => setOnglet("utilisateurs")}>Utilisateurs</button>
        <button className={`btn ${onglet === "villes" ? "btn-primary" : "btn-outline"}`} onClick={() => setOnglet("villes")}>Villes</button>
      </div>

      {message && <p className="message">{message}</p>}

      {onglet === "signalements" && (
        <div>
          <div className="filters-bar" style={{ marginBottom: 20 }}>
            {["en_attente", "en_cours", "traite"].map((s) => (
              <button
                key={s}
                className={`btn ${filtreSignalement === s ? "btn-primary" : "btn-outline"}`}
                onClick={() => setFiltreSignalement(s)}
              >
                {s === "en_attente" ? "En attente" : s === "en_cours" ? "En cours" : "Traités"}{" "}
                ({signalements.filter((sig) => sig.statut === s).length})
              </button>
            ))}
          </div>

          <div className="conv-list">
            {signalements.filter((s) => s.statut === filtreSignalement).length === 0 && (
              <p className="empty-state">Aucun signalement dans cette catégorie.</p>
            )}
            {signalements.filter((s) => s.statut === filtreSignalement).map((s) => (
              <div key={s._id} className="surface-card" style={{ padding: 18 }}>
                <p>
                  <strong>Annonce :</strong>{" "}
                  {s.annonce ? (
                    <Link to={`/annonces/${s.annonce._id}`} className="detail-link">{s.annonce.titre}</Link>
                  ) : "supprimée"}
                </p>
                <p><strong>Motif :</strong> {s.motif}</p>
                {s.details && <p><strong>Détails :</strong> {s.details}</p>}
                <p><strong>Signalé par :</strong> {s.signalePar?.nom}</p>

                {s.statut === "en_attente" && (
                  <div className="detail-actions">
                    <button className="btn btn-primary" onClick={() => gererTraiter(s._id, "prendre_en_charge")}>Prendre en charge</button>
                  </div>
                )}
                {s.statut === "en_cours" && (
                  <div className="detail-actions">
                    <button className="btn btn-primary" onClick={() => gererTraiter(s._id, "cloturer_annonce")}>Clôturer l'annonce</button>
                    <button className="btn btn-danger" onClick={() => gererSupprimerAnnonceSignalee(s._id)}>Supprimer l'annonce</button>
                    <button className="btn btn-outline" onClick={() => gererTraiter(s._id, "ignorer")}>Ignorer (annonce correcte)</button>
                  </div>
                )}
                {s.statut === "traite" && (
                  <p className="annonce-meta">
                    ✅ {s.actionPrise === "annonce_cloturee" ? "Annonce clôturée" : s.actionPrise === "annonce_supprimee" ? "Annonce supprimée" : "Signalement ignoré"} — email envoyé au signaleur
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {onglet === "utilisateurs" && (
        <div className="conv-list">
          {utilisateurs.map((u) => (
            <div key={u._id} className="conv-item" style={{ alignItems: "center" }}>
              <div className="conv-info">
                <strong>{u.nom}</strong>
                <p className="annonce-meta">{u.email} — {u.role}{u.bloque ? " — 🚫 bloqué" : ""}</p>
              </div>
              {u.role !== "administrateur" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-outline" onClick={() => gererBlocage(u._id)}>
                    {u.bloque ? "Débloquer" : "Bloquer"}
                  </button>
                  <button className="btn btn-outline" onClick={() => gererSuppression(u._id)}>Supprimer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {onglet === "villes" && (
        <div>
          <p className="annonce-meta" style={{ marginBottom: 16 }}>
            Une ville désactivée disparaît des listes déroulantes (inscription, annonces, filtres) mais les étudiants
            et annonces déjà associés à cette ville ne sont pas affectés.
          </p>
          <form onSubmit={gererAjoutVille} className="filters-bar">
            <input value={nouvelleVille} onChange={(e) => setNouvelleVille(e.target.value)} placeholder="Nom de la ville" />
            <button type="submit" className="btn btn-primary">Ajouter</button>
          </form>
          <div className="conv-list">
            {villes.map((v) => (
              <div key={v._id} className="conv-item">
                <div>
                  <strong>{v.nom}</strong>
                  <p className="annonce-meta" style={{ margin: 0 }}>
                    {v.active ? "Visible dans les formulaires" : "Masquée des formulaires"}
                  </p>
                </div>
                <button className="btn btn-outline" onClick={() => gererToggleVille(v._id)}>
                  {v.active ? "Masquer" : "Rendre visible"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;