require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Etudiant = require("./models/Etudiant");
const Annonce = require("./models/Annonce");

const VILLES = ["Tunis Centre", "Ghazela", "Sousse", "Sfax", "Monastir"];

const QUARTIERS = {
  "Tunis Centre": ["Lafayette", "Bab Bhar", "El Menzah", "Le Belvédère", "Mutuelleville"],
  "Ghazela": ["Ariana Centre", "Ennasr", "Cité Ghazela", "El Manar"],
  "Sousse": ["Khezama", "Sahloul", "Corniche", "Ain Ezitoune"],
  "Sfax": ["Sfax Centre", "Route de Tunis", "Cité El Habib"],
  "Monastir": ["Skanes", "Centre Ville", "Zaouiet Sousse"],
};

const EQUIPEMENTS = ["wifi", "climatisation", "chauffage", "meublé", "machine à laver", "cuisine équipée", "parking", "balcon"];
const PHOTOS = {
  salon: [
    "photo-1583847268964-b28dc8f51f92",
    "photo-1616047006789-b7af5afb8c20",
    "photo-1598928506311-c55ded91a20c",
    "photo-1560448204-e02f11c3d0e2",
    "photo-1662454419736-de132ff75638",
  ],
  chambre: [
    "photo-1630699375019-c334927264df",
    "photo-1560448075-57d0285fc59b",
    "photo-1652882860938-f90aa298e644",
    "photo-1652882860902-7c6b0f88ef23",
    "photo-1649068559107-e5d936141e44",
  ],
  cuisine: [
    "photo-1484154218962-a197022b5858",
    "photo-1630699144641-72fa7a6b8aa1",
    "photo-1610527003928-47afd5f470c6",
    "photo-1755624222023-621f7718950b",
    "photo-1630699376167-3870469e7598",
  ],
  sdb: [
    "photo-1584622650111-993a426fbf0a",
    "photo-1631889993959-41b4e9c6e3c5",
    "photo-1695002817411-203c7f19dfa3",
    "photo-1620626011761-996317b8d101",
    "photo-1633104069776-ea7e61258ec9",
  ],
  balcon: [
    "photo-1616593969747-4797dc75033e",
    "photo-1560448205-d82bf18b9bcf",
    "photo-1621045081424-97aa08903f76",
    "photo-1613013441633-785518cf90b3",
  ],
};

const photoUrl = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=75`;

const genererPhotosLogement = () => {
  const photos = [
    photoUrl(alea(PHOTOS.salon)),
    photoUrl(alea(PHOTOS.chambre)),
    photoUrl(alea(PHOTOS.cuisine)),
    photoUrl(alea(PHOTOS.sdb)),
  ];
  if (Math.random() > 0.4) photos.push(photoUrl(alea(PHOTOS.balcon)));
  return photos;
};

const genererPhotosColoc = () => [photoUrl(alea(PHOTOS.chambre))];
const ETUDIANTS_DEMO = [
  { nom: "Sarra Jendoubi", ville: "Tunis Centre", budget: 320, fumeur: false, rythmeDeVie: "calme", rythmeEtude: "matinal", animaux: false },
  { nom: "Yassine Trabelsi", ville: "Ghazela", budget: 280, fumeur: false, rythmeDeVie: "fetard", rythmeEtude: "nocturne", animaux: false },
  { nom: "Ines Chaabane", ville: "Sousse", budget: 350, fumeur: false, rythmeDeVie: "calme", rythmeEtude: "flexible", animaux: true },
  { nom: "Mehdi Gharbi", ville: "Sfax", budget: 300, fumeur: true, rythmeDeVie: "fetard", rythmeEtude: "nocturne", animaux: false },
  { nom: "Amira Bouazizi", ville: "Monastir", budget: 260, fumeur: false, rythmeDeVie: "calme", rythmeEtude: "matinal", animaux: false },
  { nom: "Karim Sassi", ville: "Tunis Centre", budget: 400, fumeur: false, rythmeDeVie: "calme", rythmeEtude: "flexible", animaux: false },
  { nom: "Rania Haddad", ville: "Ghazela", budget: 290, fumeur: true, rythmeDeVie: "fetard", rythmeEtude: "flexible", animaux: false },
  { nom: "Wassim Cherif", ville: "Sousse", budget: 330, fumeur: false, rythmeDeVie: "calme", rythmeEtude: "matinal", animaux: true },
  { nom: "Nour Mabrouk", ville: "Sfax", budget: 270, fumeur: false, rythmeDeVie: "fetard", rythmeEtude: "nocturne", animaux: false },
  { nom: "Bilel Ayari", ville: "Monastir", budget: 310, fumeur: false, rythmeDeVie: "calme", rythmeEtude: "flexible", animaux: false },
];

const TITRES_LOGEMENT = [
  "Chambre lumineuse proche fac", "Appartement S+1 meublé", "Colocation conviviale disponible",
  "Studio calme idéal étudiant", "Chambre dans appart 3 pièces", "Logement neuf proche transports",
];

const TITRES_COLOC = [
  "Cherche coloc calme et sérieux(se)", "Recherche colocation proche fac", "Étudiant(e) cherche coloc pour la rentrée",
  "Cherche appart à partager", "Recherche chambre en colocation",
];

const DESCRIPTIONS_LOGEMENT = [
  "Bel espace bien entretenu, proche des arrêts de transport et des commerces. Ambiance calme, idéal pour étudier.",
  "Logement rénové récemment, lumineux, dans un quartier sûr et animé. Colocataires actuels sympas et respectueux.",
  "Chambre spacieuse avec accès à une cuisine équipée et un salon commun. Quartier bien desservi.",
];

const DESCRIPTIONS_COLOC = [
  "Étudiant(e) sérieux(se), non-fumeur, cherche colocataire avec un rythme de vie compatible pour la rentrée universitaire.",
  "Recherche colocation proche de la fac, budget raisonnable, ambiance studieuse mais conviviale.",
  "À la recherche d'un logement à partager, ouvert(e) à toute proposition correspondant à mon budget.",
];


const alea = (tab) => tab[Math.floor(Math.random() * tab.length)];
const aleaN = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const melange = (tab) => [...tab].sort(() => Math.random() - 0.5);

const FOURCHETTE_PRIX = {
  "Tunis Centre": [250, 480],
  "Ghazela": [220, 400],
  "Sousse": [180, 350],
  "Sfax": [150, 300],
  "Monastir": [180, 320],
};

const prixRealiste = (ville) => {
  const [min, max] = FOURCHETTE_PRIX[ville];
  return Math.round(aleaN(min, max) / 10) * 10;
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connecté ✅ — début du peuplement");

  // 1. Comptes étudiants de démo (upsert — pas de doublons si on relance)
  const idsEtudiants = [];
  for (let i = 0; i < ETUDIANTS_DEMO.length; i++) {
    const data = ETUDIANTS_DEMO[i];
    const email = `demo.${i + 1}@foyerdar.tn`;
    const motDePasseHache = await bcrypt.hash("Demo1234!", 10);

    const etudiant = await Etudiant.findOneAndUpdate(
      { email },
      { ...data, email, motDePasse: motDePasseHache, faculte: `Faculté de ${data.ville}` },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    idsEtudiants.push(etudiant._id);
  }
  console.log(`${idsEtudiants.length} comptes étudiants de démo prêts (mot de passe : Demo1234!)`);

  // 2. Nettoyage des anciennes annonces de démo uniquement (jamais celles des vrais comptes)
  const { deletedCount } = await Annonce.deleteMany({ auteur: { $in: idsEtudiants } });
  console.log(`${deletedCount} anciennes annonces de démo supprimées`);

  // 3. Génération de nouvelles annonces
  const annonces = [];
  let compteur = 0;

  for (const ville of VILLES) {
    const nbAnnonces = aleaN(6, 8);
    for (let i = 0; i < nbAnnonces; i++) {
      compteur++;
      const type = Math.random() > 0.45 ? "logement" : "recherche_colocation";
      const auteur = alea(idsEtudiants);
      const nbPhotos = type === "logement" ? aleaN(3, 5) : 1;

      annonces.push({
        auteur,
        type,
        titre: type === "logement" ? alea(TITRES_LOGEMENT) : alea(TITRES_COLOC),
        ville,
        quartier: alea(QUARTIERS[ville]),
        proximiteFaculte: `${aleaN(3, 20)} min à pied de la fac`,
        prix: prixRealiste(ville),
        nombreChambresDisponibles: type === "logement" ? aleaN(1, 3) : null,
        photos: type === "logement" ? genererPhotosLogement() : genererPhotosColoc(),
        equipements: melange(EQUIPEMENTS).slice(0, aleaN(2, 5)),
        description: type === "logement" ? alea(DESCRIPTIONS_LOGEMENT) : alea(DESCRIPTIONS_COLOC),
        statut: "active",
      });
    }
  }

  await Annonce.insertMany(annonces);
  console.log(`${annonces.length} nouvelles annonces créées ✅`);

  await mongoose.disconnect();
  console.log("Peuplement terminé, connexion fermée.");
}

seed().catch((err) => {
  console.error("Erreur pendant le peuplement :", err);
  process.exit(1);
});