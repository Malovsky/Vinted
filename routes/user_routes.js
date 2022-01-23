// Import des packages
const express = require("express");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBased64 = require("crypto-js/enc-base64");

// Imports des modèles
const User = require("../models/User");

// Déclaration du router
const router = express.Router();

// Export des routes
module.exports = router;

const salt = uid2(16);

router.post("/user/signup", async (req, res) => {
  try {
    const isUserExisting = await User.findOne({ email: req.fields.email });
    if (isUserExisting !== null) {
      res.status(400).json({
        error: {
          message: "Un compte existant utilise déjà cette adresse email.",
        },
      });
    } else if (req.fields.username === null) {
      res.status(400).json({
        error: {
          message: "Vous n'avez pas renseigné votre nom d'utilisateur.",
        },
      });
    } else {
      const newToken = uid2(16);
      const hash = SHA256(req.fields.password + salt).toString(encBased64);
      const newUser = new User({
        email: req.fields.email,
        account: {
          username: req.fields.username,
          phone: req.fields.phone,
          avatar: undefined,
        },
        token: newToken,
        hash: hash,
        salt: salt,
      });
      await newUser.save();
      res.json({
        _id: newUser._id,
        token: newUser.token,
        account: {
          username: newUser.account.username,
          phone: newUser.account.phone,
        },
      });
    }
  } catch (error) {
    res.status(400).json({
      error: {
        error: error.message,
      },
    });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const userToLogIn = await User.findOne({ email: req.fields.email });
    console.log(userToLogIn);
    console.log(
      "PASSWORD HASHED : " +
        SHA256(req.fields.password + salt).toString(encBased64)
    );
    if (userToLogIn === null) {
      res.status(400).json({
        error: {
          message: "Aucun compte existant avec cette adresse email.",
        },
      });
    } else if (
      userToLogIn !== null &&
      SHA256(req.fields.password + userToLogIn.salt).toString(encBased64) ===
        userToLogIn.hash
    ) {
      res.json({
        _id: userToLogIn._id,
        token: userToLogIn.token,
        account: {
          username: userToLogIn.account.username,
          phone: userToLogIn.account.phone,
        },
      });
    } else if (
      userToLogIn !== null &&
      SHA256(req.fields.password + userToLogIn.salt).toString(encBased64) !==
        userToLogIn.hash
    ) {
      res.status(400).json({
        error: {
          message: "Votre mot de passe n'est pas le bon.",
        },
      });
    }
  } catch (error) {
    res.status(400).json({
      error: {
        error: error.message,
      },
    });
  }
});
