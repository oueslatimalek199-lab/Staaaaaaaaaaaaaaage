const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/cartes-etudiant/");
  },
  filename: (req, file, cb) => {
    const nomUnique = `${req.etudiant._id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, nomUnique);
  },
});

const filtreFichier = (req, file, cb) => {
  const typesAutorises = /jpeg|jpg|png|pdf/;
  const extensionValide = typesAutorises.test(path.extname(file.originalname).toLowerCase());
  if (extensionValide) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers JPG, PNG ou PDF sont acceptés"));
  }
};

const upload = multer({
  storage,
  fileFilter: filtreFichier,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
});

module.exports = upload;