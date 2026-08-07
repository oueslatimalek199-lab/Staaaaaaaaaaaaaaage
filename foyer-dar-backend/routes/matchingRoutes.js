const express = require("express");
const router = express.Router();
const { protege } = require("../middleware/authMiddleware");
const { obtenirRecommandations } = require("../controllers/matchingController");

router.get("/", protege, obtenirRecommandations);

module.exports = router;