const jwt = require("jsonwebtoken");
const Etudiant = require("../models/Etudiant");

exports.protege = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.etudiant = await Etudiant.findById(decode.id).select("-motDePasse");
      next();
    } catch (err) {
      res.status(401).json({ message: "Token invalide, accès refusé" });
    }
  } else {
    res.status(401).json({ message: "Aucun token fourni, accès refusé" });
  }
};

