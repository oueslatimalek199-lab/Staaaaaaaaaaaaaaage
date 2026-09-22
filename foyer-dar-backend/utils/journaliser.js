const JournalAudit = require("../models/JournalAudit");

const journaliser = async (action, acteur, cible = null, details = "", req = null) => {
  try {
    await JournalAudit.create({
      action,
      acteur,
      cible,
      details,
      ip: req?.ip || null,
    });
  } catch (err) {
    console.error("Erreur journalisation:", err.message);
  }
};

module.exports = journaliser;
