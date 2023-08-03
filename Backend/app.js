const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// Load environment variables from a .env file
require('dotenv').config();

// Import the two routes files of the application
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/users');

// Creating the express application
const app = express();

// Connection to the MongoDB database
mongoose.connect('mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@'+process.env.DB_CLUSTER+'.mongodb.net/?retryWrites=true&w=majority',
{ useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});
// Middleware used to analyze the body of incoming requests in JSON format
app.use(express.json());

// Securing the application
app.use(mongoSanitize());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// All routes defined in booksRoutes will be accessible under the URL /api/books/
app.use('/api/books', booksRoutes);
// All routes defined in usersRoutes will be accessible under the URL /api/users/
app.use('/api/auth', userRoutes);  
// Configuring an access point to manage requests to the 'image' directory, to access them via the URL/images/example.jpg
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;