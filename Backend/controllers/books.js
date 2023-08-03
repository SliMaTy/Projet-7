const Book = require('../models/books');
const fs = require('fs');
const path = require('path');

// Add new book
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.compressedFilename}`,
      averageRating: bookObject.ratings[0].grade
  });
  book.save()
    .then(() => { res.status(201).json({message: 'Livre enregistré !'}) })
    .catch(error => { res.status(400).json({ error }) })
};

// Update a book
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.compressedFilename}`,
  } : { ...req.body };
  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: '403: unauthorized request' });
      } else {
          if (req.file) {
              const imagePath = path.join(__dirname, '..', 'images', path.basename(book.imageUrl));
              fs.unlink(imagePath, (error) => {
                if (error) {
                  console.log(error);
                }
              });
          }
          Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Livre modifié!' }))
            .catch((error) => res.status(401).json({ error }));
        }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// List of all books
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Single book
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

// Delete a book
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            Book.deleteOne({ _id: req.params.id })
              .then(() => { res.status(200).json({ message: 'Livre supprimé !' })})
              .catch(error => res.status(401).json({ error }));
          });
        }
    })
    .catch( error => {
      res.status(500).json({ error });
    });
};

// Rate: the 3 best books
exports.getBestRating = (req, res, next) => {
  Book.find().sort({ averageRating: -1 }).limit(3) // Only 3 books
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Rate a book
exports.postRating = (req, res, next) => {
  const { userId, rating } = req.body;

  const user = req.body.userId;
  
  if (user !== req.auth.userId) {
    return res.status(401).json({ message: 'Non autorisé' });
  }
  
  // Check that the note is between 0 and 5
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: "La note doit être un nombre entre 0 et 5." });
  }
  
  Book.findById(req.params.id)
    .then(book => {
      if (!book) {
        return res.status(404).json({ error: "Livre non trouvé." });
      }
      
      // Verify if the user has already rated the book
      const userRating = book.ratings.find(rating => rating.userId === userId);
      
      if (userRating) {
        return res.status(400).json({ error: "L'utilisateur a déjà noté ce livre." });
      }
      
      // Add the note to the rating list
      book.ratings.push({ userId, grade: rating });

      // Calculate the new average score
      const totalRatings = book.ratings.length;
      const sumRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      const averageRating = sumRatings / totalRatings;
      book.averageRating = averageRating;

      // Save changes
      book.save()
        .then(updatedBook => {
          res.status(200).json(updatedBook);
        })
        .catch(error => {
          res.status(500).json({ error });
        });
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};
