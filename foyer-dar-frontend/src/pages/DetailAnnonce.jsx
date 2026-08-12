import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { obtenirAnnonceParId, ajouterFavori, signalerAnnonce } from "../services/annonceService";
import { useChat } from "../context/ChatContext";
function DetailAnnonce() {
  const { id } = useParams();
  const [annonce, setAnnonce] = useState(null);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { ouvrirChat } = useChat();

  useEffect(() => {
    const PHOTOS = {
      salon: ["photo-1583847268964-b28dc8f51f92", "photo-1616047006789-b7af5afb8c20", "photo-1598928506311-c55ded91a20c"],
      chambre: ["photo-1630699375019-c334927264df", "photo-1560448075-57d0285fc59b", "photo-1652882860938-f90aa298e644"],
      cuisine: ["photo-1484154218962-a197022b5858", "photo-1630699144641-72fa7a6b8aa1", "photo-1755624222023-621f7718950b"],
      sdb: ["photo-1584622650111-993a426fbf0a", "photo-1631889993959-41b4e9c6e3c5", "photo-1633104069776-ea7e61258ec9"],
      balcon: ["photo-1616593969747-4797dc75033e", "photo-1560448205-d82bf18b9bcf"],
    };
    const photoUrl = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=75`;
    const choisir = (piece, seed) => photoUrl(PHOTOS[piece][seed % PHOTOS[piece].length]);

    obtenirAnnonceParId(id).then((reponse) => {
      const a = reponse.data;
      const seed = parseInt(id.slice(-4), 16) || 0;

      if (!a.photos || a.photos.length === 0 || a.photos.every((p) => p === a.photos[0])) {
        a.photos = a.type === "logement"
          ? [choisir("salon", seed), choisir("chambre", seed + 1), choisir("cuisine", seed + 2), choisir("sdb", seed + 3)]
          : [choisir("chambre", seed)];
      }
      setAnnonce(a);
    });
  }, [id]);

  const gererFavori = async () => {
    if (!token) {
      navigate("/connexion");
      return;
    }
    try {
      await ajouterFavori(id, token);
      setMessage("Ajoutée à vos favoris");
    } catch (err) {
      setMessage(err.response?.data?.message || "Une erreur est survenue");
    }
  };

  const gererSignalement = async () => {
    if (!token) {
      navigate("/connexion");
      return;
    }
    try {
      await signalerAnnonce({ annonceId: id, motif: "contenu_inapproprie" }, token);
      setMessage("Signalement envoyé, merci");
    } catch (err) {
      setMessage(err.response?.data?.message || "Une erreur est survenue");
    }
  };

  if (!annonce) return <p style={{ padding: 24 }}>Chargement...</p>;

  return (
    <div className="page-wide listing-page">
      <div className="listing-grid">
        <main className="listing-main">
          <div className="listing-hero">
            <div className="hero-media">
              <div className="hero-badges">
                <span className="badge type">{annonce.type === "logement" ? "Logement" : "Recherche colocataire"}</span>
                <span className="badge status">{annonce.statut === "active" ? "Disponible" : "Clôturée"}</span>
              </div>
              <img src={annonce.photos[selected]} alt={annonce.titre} className="hero-image" />
              <ul className="gallery-thumbs" role="list">
                {annonce.photos.map((p, i) => (
                  <li key={i} className={`thumb-item ${i === selected ? "active" : ""}`}>
                    <button type="button" aria-label={`Voir image ${i + 1}`} onClick={() => setSelected(i)}>
                      <img src={p} alt={`Miniature ${i + 1}`} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hero-meta">
              <div className="title-row">
                <h1>{annonce.titre}</h1>
                <div className="actions-row">
                  <button className="btn btn-ghost" onClick={() => navigator.share?.({ title: annonce.titre, text: annonce.description, url: window.location.href })}>Partager</button>
                  <button className="btn btn-ghost" onClick={gererFavori}>Favori</button>
                </div>
              </div>

              <p className="meta-location">{annonce.ville}{annonce.quartier ? `, ${annonce.quartier}` : ""}</p>
              <div className="price-row">
                <div className="price">{annonce.prix} DT</div>
                <div className="info-chips">
                  {annonce.nombreChambresDisponibles != null && <div className="chip"><strong>{annonce.nombreChambresDisponibles}</strong><span>Chambres</span></div>}
                  <div className="chip"><strong>{annonce.equipements?.length || 0}</strong><span>Équipements</span></div>
                  <div className="chip"><strong>{annonce.prix ? Math.max(1, Math.round((annonce.prix || 0) / 60)) : "—"}</strong><span>Exemple</span></div>
                </div>
              </div>
            </div>
          </div>

          <section className="listing-section">
            <h2>Description</h2>
            <p className="description">{annonce.description || "Aucune description fournie."}</p>
          </section>

          <section className="listing-section">
            <h2>Localisation</h2>
            <div className="map-wrapper">
              {/* si tu utilises une map réelle, remplace l'iframe par le composant map */}
              <iframe
                title="map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=9.85%2C36.8%2C10.1%2C36.9&layer=mapnik`}
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
          </section>
        </main>

        <aside className="listing-aside surface-card contact-panel">
          <div className="contact-top">
            <div className="poster-avatar" aria-hidden="true">{annonce.auteur?.nom ? annonce.auteur.nom.split(" ").map(n => n[0]).slice(0,2).join("") : "A"}</div>
            <div>
              <div className="poster-name">{annonce.auteur?.nom || "Annonceur"}</div>
              <div className="poster-sub">Annonce de particulier</div>
            </div>
          </div>

        <div className="contact-actions">
            {annonce.auteur?._id && (
              <button
                className="btn btn-primary full"
                onClick={() => {
                  if (!localStorage.getItem("token")) { navigate("/connexion"); return; }
                  ouvrirChat(annonce.auteur._id, annonce.auteur.nom);
                }}
              >
                Envoyer un message
              </button>
            )}
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn btn-outline full" onClick={gererSignalement}>Signaler</button>
          </div>


          {message && <p className="message" style={{ marginTop: 12 }}>{message}</p>}
        </aside>
      </div>
    </div>
  );
}

export default DetailAnnonce;