const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
     try {
          const hash = await bcrypt.hash(req.body.password, 10);
          const user = new User({ email: req.body.email, password: hash });
          await user.save();
          res.status(201).json({ message: "Utilisateur créé avec succès" });
     } catch (error) {
          res.status(400).json({ error });
     }
};

exports.login = async (req, res, next) => {
     try {
          const user = await User.findOne({ email: req.body.email });
          if (user === null) {
               res.status(401).json({
                    message: "Couple identifiant/mot de passe incorrect",
               });
          } else {
               const valid = await bcrypt.compare(
                    req.body.password,
                    user.password
               );
               if (!valid) {
                    res.status(401).json({
                         message: "Couple identifiant/mot de passe incorrect",
                    });
               } else {
                    res.status(200).json({
                         userId: user._id,
                         token: jwt.sign(
                              { userId: user._id },
                              process.env.JSON_WEB_TOKEN_SECRET,
                              {
                                   expiresIn:
                                        process.env.JSON_WEB_TOKEN_EXPIRATION,
                              }
                         ),
                    });
               }
          }
     } catch (error) {
          res.status(500).json({ error });
     }
};
