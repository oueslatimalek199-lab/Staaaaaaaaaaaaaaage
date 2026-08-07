import { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chatOuvert, setChatOuvert] = useState(null); // { id, nom } ou null
  const [reduit, setReduit] = useState(false);

  const ouvrirChat = (id, nom) => {
    setChatOuvert({ id, nom });
    setReduit(false);
  };
  const fermerChat = () => setChatOuvert(null);
  const toggleReduit = () => setReduit((r) => !r);

  return (
    <ChatContext.Provider value={{ chatOuvert, reduit, ouvrirChat, fermerChat, toggleReduit }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}