// Import des packages
const express = require("express");
const cloudinary = require("cloudinary").v2;

// Import des modèles
const User = require("../models/User");
const Offer = require("../models/Offer");

// Déclaration du router
const router = express.Router();

// Export des routes
module.exports = router;

// Middleware function, 3 paramètres -> req, res, next
const isAuthenticated = async (req, res, next) => {
  const usersToken = await User.findOne({
    token: req.headers.authorization.replace("Bearer ", ""),
  });
  if (usersToken) {
    req.user = { usersToken };
    next();
  } else {
    res.status(401).json({
      error: {
        message: "Unautorhized",
      },
    });
  }
};

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    console.log("Pass dans /offer/publish");
    const userPublisher = await User.findOne({ id: req.user._id });
    console.log("USER OFFER : " + userPublisher);
    const pictureToUpload = req.files.picture.path;
    console.log(pictureToUpload);
    const pictureUploaded = await cloudinary.uploader.upload(pictureToUpload);
    console.log(pictureUploaded.secure_url);

    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.descritpion,
      product_price: req.fields.price,
      product_details: [
        { MARQUE: req.fields.brand },
        { TAILLE: req.fields.size },
        { ÉTAT: req.fields.condition },
        { COULEUR: req.fields.color },
        { EMPLACEMENT: req.fields.city },
      ],
      product_image: pictureUploaded,
      owner: userPublisher,
    });
    console.log(newOffer);
    await newOffer.save();
    res.json({
      newOffer,
    });
  } catch (error) {
    res.status(400).json({
      error: {
        error: error.message,
      },
    });
  }
});

router.get("/offers", async (req, res) => {
  const title = req.query.title ? req.query.title : "";
  const priceMin = req.query.priceMin ? Number(req.query.priceMin) : 0;
  const priceMax = req.query.priceMax ? Number(req.query.priceMax) : 100000; // Mon max par défaut est en référence au bonus de l'exercice précédent, en théorie un utilisateur ne peut pas poster un article plus cher que 100000
  const sort = req.query.sort ? req.query.sort.replace("price-", "") : "";
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = 3;
  const skip = limit * (page - 1);

  const offers = await Offer.find({
    product_name: new RegExp(title, "i"),
    product_price: { $gte: priceMin, $lte: priceMax },
  })
    .sort({ product_price: sort })
    .limit(limit)
    .skip(skip);
  //.select("product_name product_price"); // Pour y voir clair

  res.json(offers);

  try {
  } catch (error) {
    res.status(400).json({
      error: {
        message: error.message,
      },
    });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offerToReturn = await Offer.findById(req.params.id);
    res.json(offerToReturn);
  } catch (error) {
    res.status(400).json({
      error: {
        error: error.message,
      },
    });
  }
});
