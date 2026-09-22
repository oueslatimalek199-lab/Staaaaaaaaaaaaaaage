const map = L.map("map").setView([35.7643, 10.8113], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const redIcon = L.divIcon({
  className: "red-marker",
  html: '<div class="red-marker-dot"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

async function showAnnouncementLocation(address) {
  try {
    console.log("Adresse envoyée :", address);

    const response = await fetch("http://127.0.0.1:8000/geocode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        address: address
      })
    });

    const data = await response.json();

    console.log("Réponse du backend :", data);

    if (!response.ok) {
      throw new Error(data.detail || "Adresse introuvable");
    }

    const latitude = Number(data.latitude);
    const longitude = Number(data.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error("Coordonnées invalides");
    }

    map.setView([latitude, longitude], 14);

    L.marker([latitude, longitude], { icon: redIcon })
      .addTo(map)
      .bindPopup(data.display_name || address)
      .openPopup();

  } catch (error) {
    console.error("Erreur de géocodage :", error);
    alert("Impossible de trouver cette adresse.");
  }
}

showAnnouncementLocation("Monastir, Skanes, Tunisie");