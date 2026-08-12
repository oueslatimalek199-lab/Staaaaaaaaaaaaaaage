const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Load ALL routes FIRST
const etudiantRoutes = require("./routes/etudiantRoutes");
const matchingRoutes = require("./routes/matchingRoutes");
const annonceRoutes = require("./routes/annonceRoutes");
const signalementRoutes = require("./routes/signalementRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const villeRoutes = require("./routes/villeRoutes");

const app = express();

connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("API Foyer/Dar opérationnelle");
});

// All routes BEFORE listening
app.use("/api/etudiants", etudiantRoutes);
app.use("/api/annonces", annonceRoutes);
app.use("/api/signalements", signalementRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/villes", villeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));