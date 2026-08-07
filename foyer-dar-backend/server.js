const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const etudiantRoutes = require("./routes/etudiantRoutes");
const matchingRoutes = require("./routes/matchingRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json()); 
app.use("/uploads", express.static("uploads"));       // ← DOIT être avant les routes

app.get("/", (req, res) => {
  res.send("API Foyer/Dar opérationnelle");
});

app.use("/api/etudiants", etudiantRoutes);   // ← routes après express.json()

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
const annonceRoutes = require("./routes/annonceRoutes");
app.use("/api/annonces", annonceRoutes);
const signalementRoutes = require("./routes/signalementRoutes");
app.use("/api/signalements", signalementRoutes);

app.use("/api/matching", matchingRoutes);
const messageRoutes = require("./routes/messageRoutes");

app.use("/api/messages", messageRoutes);
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);