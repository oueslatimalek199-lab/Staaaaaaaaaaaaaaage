import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenirMessagesAvec, envoyerMessage } from "../services/messageService";

function Conversation() {
  const { autreId } = useParams();
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");
  const [chargement, setChargement] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const monId = JSON.parse(atob(token.split(".")[1])).id;
  const finDeListe = useRef(null);

  const charger = () => {
    obtenirMessagesAvec(autreId, token)
      .then((reponse) => setMessages(reponse.data))
      .finally(() => setChargement(false));
  };

  useEffect(() => {
    if (!token) {
      navigate("/connexion");
      return;
    }
    charger();
  }, [autreId]);

  useEffect(() => {
    finDeListe.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const gererEnvoi = async (e) => {
    e.preventDefault();
    if (!contenu.trim()) return;
    await envoyerMessage(autreId, contenu, token);
    setContenu("");
    charger();
  };

  if (chargement) return <div className="page"><p>Chargement...</p></div>;

  return (
    <div className="page">
      <div className="surface-card conv-window">
        <h2>Conversation</h2>

        <div className="conv-messages">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`bubble ${msg.expediteur === monId ? "bubble-moi" : "bubble-autre"}`}
            >
              {msg.contenu}
            </div>
          ))}
          <div ref={finDeListe} />
        </div>

        <form onSubmit={gererEnvoi} className="conv-form">
          <input
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Écris un message..."
          />
          <button type="submit" className="btn btn-primary">Envoyer</button>
        </form>
      </div>
    </div>
  );
}

export default Conversation;