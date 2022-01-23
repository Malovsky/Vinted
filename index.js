// La ligne suivante ne doit être utilisée qu'une seule fois et au tout début du projet. De préférence dans index.js
// Permet d'activer les variables d'environnement qui se trouvent dans le fichier `.env`
require("dotenv").config();

// Import des packages
const express = require("express");
const cors = require("cors");
const formidable = require("express-formidable");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

const app = express();
app.use(formidable());
app.use(cors());
mongoose.connect(process.env.MONGODB_URI);

// Configuration cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Import des routes
const userRoutes = require("./routes/user_routes");
app.use(userRoutes);
const offerRoutes = require("./routes/offer_routes");
app.use(offerRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server has started ! ✅");
});
