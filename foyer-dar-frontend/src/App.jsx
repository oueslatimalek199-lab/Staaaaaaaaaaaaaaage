import { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext";
import ChatPopup from "./components/ChatPopup";
import Inscription from "./pages/Inscription";
import Connexion from "./pages/Connexion";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import ReinitialiserMotDePasse from "./pages/ReinitialiserMotDePasse";
import Profil from "./pages/Profil";
import ModifierProfil from "./pages/ModifierProfil";
import ListeAnnonces from "./pages/ListeAnnonces";
import CreerAnnonce from "./pages/CreerAnnonce";
import DetailAnnonce from "./pages/DetailAnnonce";
import MesFavoris from "./pages/MesFavoris";
import Recommandations from "./pages/Recommandations";
import Conversations from "./pages/Conversations";
import Conversation from "./pages/Conversation";
import { compterNonLus } from "./services/messageService";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [nonLus, setNonLus] = useState(0);
  const [estConnecte, setEstConnecte] = useState(!!localStorage.getItem("token"));

  // Recalcule à chaque changement de page — donc juste après une connexion/déconnexion
  useEffect(() => {
    setEstConnecte(!!localStorage.getItem("token"));
  }, [location]);

  useEffect(() => {
    if (!estConnecte) {
      setNonLus(0);
      return;
    }
    const token = localStorage.getItem("token");
    const verifier = () => {
      compterNonLus(token)
        .then((r) => {
          console.log("Nombre de non-lus reçu :", r.data.compte);
          setNonLus(r.data.compte);
        })
        .catch((err) => {
          console.error("Erreur récupération non-lus :", err.response?.data || err.message);
        });
    };
    verifier();
    const intervalle = setInterval(verifier, 5000);
    return () => clearInterval(intervalle);
  }, [estConnecte]);

  const seDeconnecter = () => {
    localStorage.removeItem("token");
    setMenuOuvert(false);
    navigate("/annonces");
  };

  return (
    <ChatProvider>
      <div>
        <nav className="nav">
          <div className="nav-brand">Foyer<span>/Dar</span></div>
          <div className="nav-links">
            <Link to="/annonces">Annonces</Link>
            {estConnecte && <Link to="/creer-annonce">Publier une annonce</Link>}
            {estConnecte && <Link to="/recommandations">Colocataires</Link>}
            {estConnecte && (
              <Link to="/messages" className="nav-link-badge">
                Messages
                {nonLus > 0 && <span className="nav-badge">{nonLus}</span>}
              </Link>
            )}

            <div className="nav-account">
              <button className="nav-account-btn" onClick={() => setMenuOuvert(!menuOuvert)}>
                Mon compte ▾
              </button>
              {menuOuvert && (
                <div className="nav-account-menu">
                  {estConnecte ? (
                    <>
                      <Link to="/profil" onClick={() => setMenuOuvert(false)}>Mon profil</Link>
                      <Link to="/mes-favoris" onClick={() => setMenuOuvert(false)}>Mes favoris</Link>
                      <button onClick={seDeconnecter}>Se déconnecter</button>
                    </>
                  ) : (
                    <>
                      <Link to="/connexion" onClick={() => setMenuOuvert(false)}>Se connecter</Link>
                      <Link to="/inscription" onClick={() => setMenuOuvert(false)}>S'inscrire</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/annonces" replace />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          <Route path="/reinitialiser-mot-de-passe/:token" element={<ReinitialiserMotDePasse />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/modifier-profil" element={<ModifierProfil />} />
          <Route path="/annonces" element={<ListeAnnonces />} />
          <Route path="/creer-annonce" element={<CreerAnnonce />} />
          <Route path="/annonces/:id" element={<DetailAnnonce />} />
          <Route path="/mes-favoris" element={<MesFavoris />} />
          <Route path="/recommandations" element={<Recommandations />} />
          <Route path="/messages" element={<Conversations />} />
          <Route path="/messages/:autreId" element={<Conversation />} />
        </Routes>

        <ChatPopup />
      </div>
    </ChatProvider>
  );
}

export default App;