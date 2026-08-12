import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenirProfil, modifierProfil } from "../services/etudiantService";
import { obtenirVilles } from "../services/villeService";

function ModifierProfil() {
  const [formulaire, setFormulaire] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [villes, setVilles] = useState([]);

useEffect(() => {
  obtenirVilles().then((r) => setVilles(r.data));
}, []);

  useEffect(() => {
    if (!token) {
      navigate("/connexion");
      return;
    }
    obtenirProfil(token)
      .then((reponse) => setFormulaire(reponse.data))
      .catch(() => navigate("/connexion"));
  }, [navigate, token]);

  const gererChangement = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulaire({ ...formulaire, [name]: type === "checkbox" ? checked : value });
  };

  const gererEnvoi = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await modifierProfil(
        {
          nom: formulaire.nom,
          ville: formulaire.ville,
          faculte: formulaire.faculte,
          budget: formulaire.budget,
          fumeur: formulaire.fumeur,
          rythmeDeVie: formulaire.rythmeDeVie,
          rythmeEtude: formulaire.rythmeEtude,
          animaux: formulaire.animaux,
        },
        token
      );
      setMessage("Profil mis à jour avec succès");
      setTimeout(() => navigate("/profil"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Une erreur est survenue");
    }
  };

  if (!formulaire) return <div className="page"><p>Chargement...</p></div>;

  return (
    <div className="page">
      <div className="surface-card form-card">
        <h2>Modifier mon profil</h2>
        <form onSubmit={gererEnvoi}>
          <div className="field">
            <label>Nom</label>
            <input name="nom" value={formulaire.nom} onChange={gererChangement} required />
          </div>
          <div className="field">
            <label>Faculté</label>
            <input name="faculte" value={formulaire.faculte || ""} onChange={gererChangement} />
          </div>
          <div className="field">
            <label>Ville</label>
            <select name="ville" value={formulaire.ville} onChange={gererChangement} required>
  <option value="">Choisir une ville</option>
  {villes.map((v) => (
    <option key={v._id} value={v.nom}>{v.nom}</option>
  ))}
</select>
          </div>
          <div className="field">
            <label>Budget (DT)</label>
            <input name="budget" type="number" value={formulaire.budget} onChange={gererChangement} required />
          </div>
          <label className="checkbox-field">
            <input name="fumeur" type="checkbox" checked={formulaire.fumeur} onChange={gererChangement} />
            Fumeur
          </label>
          <div className="field">
            <label>Rythme de vie</label>
            <select name="rythmeDeVie" value={formulaire.rythmeDeVie} onChange={gererChangement}>
              <option value="calme">Calme</option>
              <option value="fetard">Fêtard</option>
            </select>
          </div>
          <div className="field">
            <label>Rythme d'étude</label>
            <select name="rythmeEtude" value={formulaire.rythmeEtude} onChange={gererChangement}>
              <option value="matinal">Matinal</option>
              <option value="nocturne">Nocturne</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
          <label className="checkbox-field">
            <input name="animaux" type="checkbox" checked={formulaire.animaux} onChange={gererChangement} />
            Animaux acceptés
          </label>
          <button type="submit" className="btn btn-primary">Enregistrer</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default ModifierProfil;
