const express = require('express');
const router = express.Router();

// Import middleware that will be used in books routes
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer');
const sharp = require('../middlewares/sharp');

// Import the controller books
const booksCtrl = require('../controllers/books');

// Definition of routes associated with books in the application
router.get('/', booksCtrl.getAllBooks);
router.get('/bestrating', booksCtrl.getBestRating);
router.get('/:id', booksCtrl.getOneBook);
router.post('/:id/rating', auth, booksCtrl.postRating);
router.post('/', auth, multer, sharp, booksCtrl.createBook);
router.put('/:id', auth, multer, sharp, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;

