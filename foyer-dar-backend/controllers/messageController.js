const Message = require("../models/Message");
const mongoose = require("mongoose");

// @route POST /api/messages (BF-16)
exports.envoyerMessage = async (req, res) => {
  try {
    const { destinataireId, contenu } = req.body;

    if (destinataireId === req.etudiant._id.toString()) {
      return res.status(400).json({ message: "Impossible de s'envoyer un message à soi-même" });
    }

    const message = await Message.create({
      expediteur: req.etudiant._id,
      destinataire: destinataireId,
      contenu,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/messages/conversations (BF-16) — liste des conversations groupées
exports.obtenirConversations = async (req, res) => {
  try {
    const monId = new mongoose.Types.ObjectId(req.etudiant._id);

    const conversations = await Message.aggregate([
      { $match: { $or: [{ expediteur: monId }, { destinataire: monId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $cond: [{ $eq: ["$expediteur", monId] }, "$destinataire", "$expediteur"] },
          dernierMessage: { $first: "$contenu" },
          dernierMessageDate: { $first: "$createdAt" },
          nonLus: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$destinataire", monId] }, { $eq: ["$lu", false] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { dernierMessageDate: -1 } },
      { $lookup: { from: "etudiants", localField: "_id", foreignField: "_id", as: "autreEtudiant" } },
      { $unwind: "$autreEtudiant" },
      {
        $project: {
          _id: 0,
          etudiant: { _id: "$autreEtudiant._id", nom: "$autreEtudiant.nom" },
          dernierMessage: 1,
          dernierMessageDate: 1,
          nonLus: 1,
        },
      },
    ]);

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/messages/:autreId — historique avec un utilisateur précis
exports.obtenirMessagesAvec = async (req, res) => {
  try {
    const monId = req.etudiant._id;
    const autreId = req.params.autreId;

    const messages = await Message.find({
      $or: [
        { expediteur: monId, destinataire: autreId },
        { expediteur: autreId, destinataire: monId },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { expediteur: autreId, destinataire: monId, lu: false },
      { $set: { lu: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/messages/non-lus/compte (BF-17)
exports.compterNonLus = async (req, res) => {
  try {
    const compte = await Message.countDocuments({ destinataire: req.etudiant._id, lu: false });
    res.json({ compte });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
