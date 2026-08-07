import api from "./api";

export const obtenirAnnonces = (filtres = {}) => {
  const params = new URLSearchParams(filtres).toString();
  return api.get(`/annonces?${params}`);
};

export const obtenirAnnonceParId = (id) => {
  return api.get(`/annonces/${id}`);
};

export const creerAnnonce = (donnees, token) => {
  return api.post("/annonces", donnees, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const obtenirMesAnnonces = (token) => {
  return api.get("/annonces/mes-annonces", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const modifierAnnonce = (id, donnees, token) => {
  return api.put(`/annonces/${id}`, donnees, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const supprimerAnnonce = (id, token) => {
  return api.delete(`/annonces/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const ajouterFavori = (annonceId, token) => {
  return api.post(`/etudiants/favoris/${annonceId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const retirerFavori = (annonceId, token) => {
  return api.delete(`/etudiants/favoris/${annonceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const obtenirFavoris = (token) => {
  return api.get("/etudiants/favoris", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const signalerAnnonce = (donnees, token) => {
  return api.post("/signalements", donnees, {
    headers: { Authorization: `Bearer ${token}` },
  });
};