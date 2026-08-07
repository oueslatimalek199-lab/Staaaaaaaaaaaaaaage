import { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { obtenirMessagesAvec, envoyerMessage } from "../services/messageService";

function ChatPopup() {
  const { chatOuvert, reduit, fermerChat, toggleReduit } = useChat();
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");
  const token = localStorage.getItem("token");
  const finDeListe = useRef(null);

  let monId = null;
  if (token) {
    try {
      monId = JSON.parse(atob(token.split(".")[1])).id;
    } catch {
      monId = null;
    }
  }

  const charger = () => {
    if (!chatOuvert || !token) return;
    obtenirMessagesAvec(chatOuvert.id, token).then((r) => setMessages(r.data));
  };

  useEffect(() => {
    charger();
    const intervalle = setInterval(charger, 4000);
    return () => clearInterval(intervalle);
  }, [chatOuvert?.id]);

  useEffect(() => {
    if (!reduit) finDeListe.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, reduit]);

  if (!chatOuvert || !token) return null;

  const gererEnvoi = async (e) => {
    e.preventDefault();
    if (!contenu.trim()) return;
    try {
      await envoyerMessage(chatOuvert.id, contenu, token);
      setContenu("");
      charger();
    } catch (err) {
      console.error("Erreur envoi message:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Erreur lors de l'envoi");
    }
  };

  return (
    <div className={`chat-popup ${reduit ? "chat-popup-reduit" : ""}`}>
      <div className="chat-popup-header" onClick={toggleReduit}>
        <span>{chatOuvert.nom}</span>
        <div className="chat-popup-actions">
          <button onClick={(e) => { e.stopPropagation(); toggleReduit(); }}>{reduit ? "▲" : "▼"}</button>
          <button onClick={(e) => { e.stopPropagation(); fermerChat(); }}>✕</button>
        </div>
      </div>

      {!reduit && (
        <>
          <div className="chat-popup-messages">
            {messages.map((msg) => (
              <div key={msg._id} className={`bubble ${msg.expediteur === monId ? "bubble-moi" : "bubble-autre"}`}>
                {msg.contenu}
              </div>
            ))}
            <div ref={finDeListe} />
          </div>
          <form onSubmit={gererEnvoi} className="chat-popup-form">
            <input value={contenu} onChange={(e) => setContenu(e.target.value)} placeholder="Écris un message..." />
            <button type="submit" className="btn btn-primary">➤</button>
          </form>
        </>
      )}
    </div>
  );
}

export default ChatPopup;