// Importer mongoose
const mongoose = require("mongoose");

// Création de la structure du modèle, il sera une collection dans la base de données
const User = mongoose.model("User", {
  email: {
    unique: true,
    type: String,
  },
  account: {
    username: {
      required: true,
      type: String,
    },
    phone: String,
    avatar: Object,
  },
  token: String,
  hash: String,
  salt: String,
});

// L'export rend le model utilisable (importable) ailleurs dans le projet
module.exports = User;
