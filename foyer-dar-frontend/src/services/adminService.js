import api from "./api";

const headers = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const obtenirSignalements = (token) => api.get("/admin/signalements", headers(token));
export const traiterSignalement = (id, action, token) =>
  api.put(`/admin/signalements/${id}`, { action }, headers(token));

export const obtenirUtilisateurs = (token) => api.get("/admin/utilisateurs", headers(token));
export const basculerBlocage = (id, token) => api.put(`/admin/utilisateurs/${id}/bloquer`, {}, headers(token));
export const supprimerUtilisateur = (id, token) => api.delete(`/admin/utilisateurs/${id}`, headers(token));

export const obtenirVillesAdmin = (token) => api.get("/admin/villes", headers(token));
export const ajouterVille = (nom, token) => api.post("/admin/villes", { nom }, headers(token));
export const basculerVilleActive = (id, token) => api.put(`/admin/villes/${id}`, {}, headers(token));