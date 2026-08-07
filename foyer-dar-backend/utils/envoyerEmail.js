const nodemailer = require("nodemailer");

const envoyerEmail = async (destinataire, sujet, texte) => {
  const transporteur = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporteur.sendMail({
    from: `"Foyer/Dar" <${process.env.EMAIL_USER}>`,
    to: destinataire,
    subject: sujet,
    text: texte,
  });
};

module.exports = envoyerEmail;