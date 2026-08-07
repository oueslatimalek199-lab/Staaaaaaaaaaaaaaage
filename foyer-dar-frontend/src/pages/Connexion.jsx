import { useState } from "react";
import { connecter } from "../services/etudiantService";
import { Link, useNavigate } from "react-router-dom";

function Connexion() {
  const [formulaire, setFormulaire] = useState({ email: "", motDePasse: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const gererEnvoi = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const reponse = await connecter(formulaire);
      localStorage.setItem("token", reponse.data.token);
      navigate("/profil");
    } catch (err) {
      setMessage(err.response?.data?.message || "Une erreur est survenue");
    }
  };

  return (
    <div className="page">
      <div className="surface-card form-card">
        <h2>Connexion</h2>
        <form onSubmit={gererEnvoi}>
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={formulaire.email} onChange={gererChangement} required />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input name="motDePasse" type="password" value={formulaire.motDePasse} onChange={gererChangement} required />
          </div>
       <p style={{ marginTop: -8, marginBottom: 18 }}>
            <Link to="/mot-de-passe-oublie" className="auth-switch">Mot de passe oublié ?</Link>
          </p>
          <button type="submit" className="btn btn-primary">Se connecter</button>
        </form>
        {message && <p className="message">{message}</p>}
        <p className="auth-switch-line">
          Pas encore de compte ? <Link to="/inscription" className="auth-switch">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

export default Connexion;