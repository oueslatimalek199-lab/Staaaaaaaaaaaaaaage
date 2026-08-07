import api from "./api";

export const envoyerMessage = (destinataireId, contenu, token) => {
  return api.post(
    "/messages",
    { destinataireId, contenu },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const obtenirConversations = (token) => {
  return api.get("/messages/conversations", { headers: { Authorization: `Bearer ${token}` } });
};

export const obtenirMessagesAvec = (autreId, token) => {
  return api.get(`/messages/${autreId}`, { headers: { Authorization: `Bearer ${token}` } });
};

export const compterNonLus = (token) => {
  return api.get("/messages/non-lus/compte", { headers: { Authorization: `Bearer ${token}` } });
};