const rateLimit = require('express-rate-limit');

// This middleware will limit the number of requests a customer can send to the application (when they register or log in), within a given time frame
module.exports = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    handler: function (req, res, next) {
        return res.status(429).json({ error: 'Vous avez envoyé trop de requêtes, attendez une minute' })
    }
});