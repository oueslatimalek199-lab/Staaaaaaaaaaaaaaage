import { useState } from "react";
import { motDePasseOublie } from "../services/etudiantService";

function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [message, setMessage] = useState("");

  const gererEnvoi = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await motDePasseOublie(email);
      setEnvoye(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Une erreur est survenue");
    }
  };

  return (
    <div className="page">
      <div className="surface-card form-card">
        <h2>Mot de passe oublié</h2>
        {!envoye ? (
          <form onSubmit={gererEnvoi}>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary">Envoyer le lien de réinitialisation</button>
            {message && <p className="message">{message}</p>}
          </form>
        ) : (
          <p className="message">Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.</p>
        )}
      </div>
    </div>
  );
}

export default MotDePasseOublie;