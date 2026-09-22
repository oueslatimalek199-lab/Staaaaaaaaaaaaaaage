import { useEffect, useRef } from "react";
import L from "leaflet";

function MapLocation({ address = "Monastir, Skanes, Tunisie" }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(mapContainerRef.current).setView(
      [35.7643, 10.8113],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    async function loadLocation() {
      if (!mapRef.current || !address) {
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/geocode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Adresse introuvable");
        }

        const latitude = Number(data.latitude);
        const longitude = Number(data.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          throw new Error("Coordonnées invalides");
        }

        const map = mapRef.current;
        map.setView([latitude, longitude], 14);

        if (markerRef.current) {
          markerRef.current.remove();
        }

        markerRef.current = L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup(data.display_name || address)
          .openPopup();
      } catch (error) {
        console.error("Erreur de géocodage :", error);
      }
    }

    loadLocation();
  }, [address]);

  return <div ref={mapContainerRef} className="map-container" />;
}

export default MapLocation;