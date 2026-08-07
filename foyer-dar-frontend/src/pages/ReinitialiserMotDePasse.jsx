import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reinitialiserMotDePasse } from "../services/etudiantService";

function ReinitialiserMotDePasse() {
  const { token } = useParams();
  const [motDePasse, setMotDePasse] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const gererEnvoi = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await reinitialiserMotDePasse(token, motDePasse);
      setMessage("Mot de passe réinitialisé avec succès, redirection...");
      setTimeout(() => navigate("/connexion"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Une erreur est survenue");
    }
  };

  return (
    <div className="page">
      <div className="surface-card form-card">
        <h2>Nouveau mot de passe</h2>
        <form onSubmit={gererEnvoi}>
          <div className="field">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary">Réinitialiser</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default ReinitialiserMotDePasse;