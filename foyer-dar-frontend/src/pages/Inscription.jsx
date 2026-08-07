import { useState } from "react";
import { Link } from "react-router-dom";
import { inscrire } from "../services/etudiantService";

function Inscription() {
  const [formulaire, setFormulaire] = useState({ nom: "", email: "", motDePasse: "" });
  const [message, setMessage] = useState("");

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const gererEnvoi = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const reponse = await inscrire(formulaire);
      setMessage(`Bienvenue ${reponse.data.nom} ! Compte créé avec succès.`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Une erreur est survenue");
    }
  };

  return (
    <div className="page">
      <div className="surface-card form-card">
        <h2>Inscription</h2>
        <form onSubmit={gererEnvoi}>
          <div className="field">
            <label>Nom complet</label>
            <input name="nom" value={formulaire.nom} onChange={gererChangement} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={formulaire.email} onChange={gererChangement} required />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input name="motDePasse" type="password" value={formulaire.motDePasse} onChange={gererChangement} required />
          </div>
          <button type="submit" className="btn btn-primary">S'inscrire</button>
        </form>
        {message && <p className="message">{message}</p>}
        <p className="auth-switch-line">
          Déjà un compte ? <Link to="/connexion" className="auth-switch">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export default Inscription;