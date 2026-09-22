from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import os
from dotenv import load_dotenv
import matplotlib
matplotlib.use("Agg")  # pas d'interface graphique, on tourne sur un serveur
import matplotlib.pyplot as plt
import pandas as pd
from pymongo import MongoClient
from fastapi.responses import StreamingResponse, Response
from datetime import datetime
import io
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

# Palette identique au frontend, pour des graphiques cohérents avec le reste du site
COULEUR_INK = "#1E2A44"
COULEUR_RUST = "#BF4E30"
COULEUR_ZELLIGE = "#2E7D8C"
COULEUR_OLIVE = "#6E7A46"

load_dotenv()

app = FastAPI(title="Foyer/Dar - Service de Matching IA")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("MATCHING_API_KEY")
client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_database()
BUDGET_MAX = 1000  # DT, utilisé pour normaliser le budget entre 0 et 1

geolocator = Nominatim(
    user_agent="foyer-dar-ia-service"
)
class AddressRequest(BaseModel):
    address: str

class Profil(BaseModel):
    id: str
    budget: float
    fumeur: bool
    rythmeDeVie: str    # "calme" | "fetard"
    rythmeEtude: str    # "matinal" | "nocturne" | "flexible"
    animaux: bool


class DemandeMatching(BaseModel):
    etudiant: Profil
    candidats: List[Profil]


def vectoriser(profil: Profil):
    return np.array([
        profil.budget / BUDGET_MAX,
        1.0 if profil.fumeur else 0.0,
        1.0 if profil.rythmeDeVie == "calme" else 0.0,
        1.0 if profil.rythmeEtude == "matinal" else 0.0,
        1.0 if profil.rythmeEtude == "nocturne" else 0.0,
        1.0 if profil.rythmeEtude == "flexible" else 0.0,
        1.0 if profil.animaux else 0.0,
    ])


def compatibilite_par_critere(a: Profil, b: Profil):
    ecart_budget = abs(a.budget - b.budget)
    compat_budget = max(0, 100 - (ecart_budget / BUDGET_MAX) * 100)

    return {
        "budget": round(compat_budget, 1),
        "fumeur": 100 if a.fumeur == b.fumeur else 0,
        "rythmeDeVie": 100 if a.rythmeDeVie == b.rythmeDeVie else 0,
        "rythmeEtude": 100 if a.rythmeEtude == b.rythmeEtude else 40,
        "animaux": 100 if a.animaux == b.animaux else 50,
    }

@app.post("/geocode")
def geocode_address(data: AddressRequest):
    address = data.address.strip()

    if not address:
        raise HTTPException(
            status_code=400,
            detail="L'adresse est obligatoire"
        )

    # Ajouter la Tunisie pour améliorer les résultats
    if "tunisie" in address.lower():
        search_address = address
    else:
        search_address = f"{address}, Tunisie"

    try:
        location = geolocator.geocode(
            search_address,
            exactly_one=True,
            timeout=10
        )
    except GeocoderTimedOut:
        raise HTTPException(
            status_code=504,
            detail="Le service de géolocalisation ne répond pas"
        )

    if location is None:
        raise HTTPException(
            status_code=404,
            detail=f"Adresse introuvable : {address}"
        )

    return {
        "address": address,
        "latitude": location.latitude,
        "longitude": location.longitude,
        "display_name": location.address
    }
@app.post("/matching")
def calculer_matching(demande: DemandeMatching, x_api_key: Optional[str] = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Clé API invalide")

    vecteur_etudiant = vectoriser(demande.etudiant)
    resultats = []

    for candidat in demande.candidats:
        if candidat.id == demande.etudiant.id:
            continue

        vecteur_candidat = vectoriser(candidat)
        score = float(cosine_similarity([vecteur_etudiant], [vecteur_candidat])[0][0]) * 100
        details = compatibilite_par_critere(demande.etudiant, candidat)

        resultats.append({
            "id": candidat.id,
            "score": round(score, 1),
            "details": details,
        })

    resultats.sort(key=lambda r: r["score"], reverse=True)
    return resultats


@app.get("/")
def racine():
    return {"message": "Service de matching Foyer/Dar opérationnel"}
def figure_vers_reponse(fig):
    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", bbox_inches="tight", dpi=110)
    plt.close(fig)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="image/png")


def verifier_cle(x_api_key):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Clé API invalide")


@app.get("/statistiques/prix-moyen-par-ville")
def prix_moyen_par_ville(x_api_key: Optional[str] = Header(None), ville: Optional[str] = None):
    verifier_cle(x_api_key)

    filtre = {"statut": "active"}
    if ville:
        filtre["ville"] = ville

    annonces = list(db.annonces.find(filtre, {"ville": 1, "prix": 1}))
    if not annonces:
        fig, ax = plt.subplots(figsize=(7, 4))
        ax.text(0.5, 0.5, "Aucune donnée disponible", ha="center", va="center")
        ax.axis("off")
        return figure_vers_reponse(fig)

    df = pd.DataFrame(annonces)
    moyennes = df.groupby("ville")["prix"].mean().sort_values(ascending=False)

    fig, ax = plt.subplots(figsize=(7, 4.5))
    ax.bar(moyennes.index, moyennes.values, color=COULEUR_RUST)
    ax.set_title("Prix moyen du loyer par ville universitaire", color=COULEUR_INK, fontsize=13, fontweight="bold")
    ax.set_ylabel("Prix moyen (DT)")
    ax.tick_params(axis="x", rotation=20)
    for i, v in enumerate(moyennes.values):
        ax.text(i, v + 5, f"{v:.0f} DT", ha="center", fontsize=9, color=COULEUR_INK)
    fig.tight_layout()

    return figure_vers_reponse(fig)
@app.get("/statistiques/offre-demande")
@app.get("/statistiques/offre-demande")
def offre_demande(x_api_key: Optional[str] = Header(None), ville: Optional[str] = None):
    verifier_cle(x_api_key)

    filtre = {"statut": "active"}
    if ville:
        filtre["ville"] = ville

    annonces = list(db.annonces.find(filtre, {"ville": 1, "type": 1}))
    if not annonces:
        fig, ax = plt.subplots(figsize=(7, 4))
        ax.text(0.5, 0.5, "Aucune donnée disponible", ha="center", va="center")
        ax.axis("off")
        return figure_vers_reponse(fig)

    df = pd.DataFrame(annonces)
    pivot = df.groupby(["ville", "type"]).size().unstack(fill_value=0)
    pivot = pivot.rename(columns={"logement": "Logements disponibles", "recherche_colocation": "Étudiants en recherche"})

    fig, ax = plt.subplots(figsize=(7, 4.5))
    pivot.plot(kind="bar", ax=ax, color=[COULEUR_ZELLIGE, COULEUR_OLIVE])
    ax.set_title("Offre vs demande par ville", color=COULEUR_INK, fontsize=13, fontweight="bold")
    ax.set_ylabel("Nombre d'annonces")
    ax.tick_params(axis="x", rotation=20)
    ax.legend(title="")
    fig.tight_layout()

    return figure_vers_reponse(fig)
@app.get("/statistiques/criteres-recherche")
@app.get("/statistiques/criteres-recherche")
def criteres_recherche(x_api_key: Optional[str] = Header(None), ville: Optional[str] = None):
    verifier_cle(x_api_key)

    filtre = {}
    if ville:
        filtre["ville"] = ville

    etudiants = list(db.etudiants.find(filtre, {"fumeur": 1, "rythmeDeVie": 1, "budget": 1}))
    if not etudiants:
        fig, ax = plt.subplots(figsize=(6, 4))
        ax.text(0.5, 0.5, "Aucune donnée disponible", ha="center", va="center")
        ax.axis("off")
        return figure_vers_reponse(fig)

    df = pd.DataFrame(etudiants)
    counts = df["fumeur"].map({False: "Non-fumeur", True: "Fumeur"}).value_counts()
    budget_moyen = df["budget"].dropna().mean()

    fig, ax = plt.subplots(figsize=(6, 5))
    ax.pie(counts.values, labels=counts.index, autopct="%1.0f%%",
           colors=[COULEUR_ZELLIGE, COULEUR_RUST], startangle=90,
           textprops={"color": COULEUR_INK})
    titre = "Préférence fumeur / non-fumeur"
    if pd.notna(budget_moyen):
        titre += f"\nBudget moyen national : {budget_moyen:.0f} DT"
    ax.set_title(titre, color=COULEUR_INK, fontsize=12, fontweight="bold")
    fig.tight_layout()

    return figure_vers_reponse(fig)

@app.get("/statistiques/export-csv")
def export_csv(x_api_key: Optional[str] = Header(None), ville: Optional[str] = None):
    verifier_cle(x_api_key)

    filtre = {"statut": "active"}
    if ville:
        filtre["ville"] = ville

    annonces = list(db.annonces.find(
        filtre,
        {"_id": 0, "ville": 1, "quartier": 1, "type": 1, "prix": 1, "nombreChambresDisponibles": 1, "createdAt": 1}
    ))

    colonnes = ["ville", "quartier", "type", "prix", "nombreChambresDisponibles", "createdAt"]
    df = pd.DataFrame(annonces) if annonces else pd.DataFrame(columns=colonnes)

    csv_texte = df.to_csv(index=False)
    return Response(
        content=csv_texte,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=foyer_dar_annonces.csv"},
    )

    return figure_vers_reponse(fig)