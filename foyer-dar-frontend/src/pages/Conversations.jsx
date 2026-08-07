import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenirConversations } from "../services/messageService";

function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/connexion");
      return;
    }
    obtenirConversations(token)
      .then((reponse) => setConversations(reponse.data))
      .finally(() => setChargement(false));
  }, [navigate, token]);

  if (chargement) return <div className="page"><p>Chargement...</p></div>;

  return (
    <div className="page">
      <h2>Messages</h2>

      {conversations.length === 0 && <p className="empty-state">Aucune conversation pour le moment.</p>}

      <div className="conv-list">
        {conversations.map((conv) => (
          <Link key={conv.etudiant._id} to={`/messages/${conv.etudiant._id}`} className="conv-item">
            <div className="conv-info">
              <strong>{conv.etudiant.nom}</strong>
              <p className="annonce-meta">{conv.dernierMessage}</p>
            </div>
            {conv.nonLus > 0 && <span className="conv-badge">{conv.nonLus}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Conversations;
