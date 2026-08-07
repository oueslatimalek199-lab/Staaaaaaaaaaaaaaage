import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { creerAnnonce } from "../services/annonceService";

function CreerAnnonce() {
  const [formulaire, setFormulaire] = useState({
    type: "logement",
    titre: "",
    ville: "Tunis Centre",
    quartier: "",
    proximiteFaculte: "",
    prix: "",
    nombreChambresDisponibles: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const gererEnvoi = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!token) {
      navigate("/connexion");
      return;
    }
    try {
      await creerAnnonce(formulaire, token);
      setMessage("Annonce publiée avec succès !");
      setTimeout(() => navigate("/annonces"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Une erreur est survenue");
    }
  };

  return (
    <div className="page">
      <div className="surface-card form-card">
        <h2>Publier une annonce</h2>
        <form onSubmit={gererEnvoi}>
          <div className="field">
            <label>Type d'annonce</label>
            <select name="type" value={formulaire.type} onChange={gererChangement}>
              <option value="logement">Je propose un logement</option>
              <option value="recherche_colocation">Je cherche une colocation</option>
            </select>
          </div>
          <div className="field">
            <label>Titre</label>
            <input name="titre" value={formulaire.titre} onChange={gererChangement} required />
          </div>
          <div className="field">
            <label>Ville</label>
            <select name="ville" value={formulaire.ville} onChange={gererChangement}>
              <option value="Tunis Centre">Tunis Centre</option>
              <option value="Ghazela">Ghazela</option>
              <option value="Sousse">Sousse</option>
              <option value="Sfax">Sfax</option>
              <option value="Monastir">Monastir</option>
            </select>
          </div>
          <div className="field">
            <label>Quartier</label>
            <input name="quartier" value={formulaire.quartier} onChange={gererChangement} />
          </div>
          <div className="field">
            <label>Proximité de la faculté</label>
            <input name="proximiteFaculte" placeholder="ex : 10 min à pied" value={formulaire.proximiteFaculte} onChange={gererChangement} />
          </div>
          <div className="field">
            <label>Prix (DT)</label>
            <input name="prix" type="number" value={formulaire.prix} onChange={gererChangement} required />
          </div>
          {formulaire.type === "logement" && (
            <div className="field">
              <label>Chambres disponibles</label>
              <input name="nombreChambresDisponibles" type="number" value={formulaire.nombreChambresDisponibles} onChange={gererChangement} />
            </div>
          )}
          <div className="field">
            <label>Description</label>
            <textarea name="description" rows={4} value={formulaire.description} onChange={gererChangement} />
          </div>
          <button type="submit" className="btn btn-primary">Publier</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default CreerAnnonce;