exports.estAdmin = (req, res, next) => {
  if (req.etudiant.role !== "administrateur") {
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }
  next();
};