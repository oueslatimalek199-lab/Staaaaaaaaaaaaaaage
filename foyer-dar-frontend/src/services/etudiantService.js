import api from "./api";

export const inscrire = (donnees) => {
  return api.post("/etudiants/inscription", donnees);
};

export const connecter = (donnees) => {
  return api.post("/etudiants/connexion", donnees);
};

export const obtenirProfil = (token) => {
  return api.get("/etudiants/profil", {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const modifierProfil = (donnees, token) => {
  return api.put("/etudiants/profil", donnees, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const motDePasseOublie = (email) => {
  return api.post("/etudiants/mot-de-passe-oublie", { email });
};

export const reinitialiserMotDePasse = (token, motDePasse) => {
  return api.put(`/etudiants/reinitialiser-mot-de-passe/${token}`, { motDePasse });
};
export const obtenirRecommandations = (token) => {
  return api.get("/matching", { headers: { Authorization: `Bearer ${token}` } });
};