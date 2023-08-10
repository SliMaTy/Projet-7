const Book = require("../models/Book");
const fs = require("fs");

exports.getBooks = async (req, res, next) => {
     try {
          const books = await Book.find();
          res.status(200).json(books);
     } catch (error) {
          res.status(400).json({ error });
     }
};

exports.getOneBook = async (req, res, next) => {
     try {
          const id = req.params.id;
          const book = await Book.findOne({ _id: id });
          res.status(200).json(book);
     } catch (error) {
          res.status(400).json({ error });
     }
};

exports.getBestBooks = async (req, res, next) => {
     try {
          const bestBooks = await Book.aggregate([
               { $addFields: { ratingsLength: "$ratings.length" } },
               { $sort: { averageRating: -1, ratingsLength: -1 } },
               { $limit: 3 },
          ]);
          res.status(200).json(bestBooks);
     } catch (error) {
          res.status(400).json({ error });
     }
};

exports.createBook = async (req, res, next) => {
     try {
          const bookObject = JSON.parse(req.body.book);
          const bookRatings =
               bookObject.ratings[0].grade > 0
                    ? [
                           {
                                userId: req.auth.userId,
                                grade: bookObject.ratings[0].grade,
                           },
                      ]
                    : [];
          const book = new Book({
               ...bookObject,
               userId: req.auth.userId,
               ratings: bookRatings,
               imageUrl: `${req.protocol}://${req.get("host")}/images/${
                    req.file.filename
               }`,
               averageRating: bookRatings[0] ? bookRatings[0].grade : 0,
          });
          await book.save();
          res.status(201).json({ message: "Livre ajouté avec succès" });
     } catch (error) {
          res.status(400).json({ error });
     }
};

exports.modifyBook = async (req, res, next) => {
     try {
          const userId = req.auth.userId;
          const bookId = req.params.id;
          const book = await Book.findById(bookId);
          if (book.userId != userId) {
               res.status(401).json({
                    message: "Vous n'êtes pas autorisé à modifier ce livre",
               });
          } else {
               const body = req.file ? JSON.parse(req.body.book) : req.body;
               const { userId, ratings, averageRating, imageUrl, ...update } =
                    body;
               if (req.file) {
                    update.imageUrl = `${req.protocol}://${req.get(
                         "host"
                    )}/images/${req.file.filename}`;
                    await fs.unlink(
                         "images" + book.imageUrl.split("images")[1],
                         () => {}
                    );
               }
               await Book.findByIdAndUpdate(bookId, update);
               res.status(200).json({
                    message: "Livre mis à jour avec succès",
               });
          }
     } catch (error) {
          res.status(400).json({ error });
     }
};

exports.deleteBook = async (req, res, next) => {
     try {
          const userId = req.auth.userId;
          const bookId = req.params.id;
          const book = await Book.findOne({ _id: bookId });
          if (book.userId !== userId) {
               res.status(401).json({
                    message: "Non autorisé à supprimer ce livre",
               });
          } else {
               fs.unlink(
                    "images" + book.imageUrl.split("images")[1],
                    (error) => {
                         if (error) {
                              console.log(error);
                         }
                    }
               );
               await Book.findOneAndDelete({ _id: bookId });
               res.status(200).json({
                    message: `Le livre "${book.title}" a bien été supprimé`,
               });
          }
     } catch (error) {
          res.status(500).json({ error });
     }
};

exports.rateBook = async (req, res, next) => {
     try {
          const userId = req.auth.userId;
          const rating = { userId: userId, grade: req.body.rating };
          const book = await Book.findById(req.params.id);
          if (book.ratings.find((ratings) => ratings.userId === userId)) {
               res.status(401).json({
                    message: "Vous n'avez pas l'autorisation pour noter ce livre",
               });
          } else {
               if (
                    rating.grade < 0 ||
                    rating.grade > 5 ||
                    !Number.isInteger(rating.grade)
               ) {
                    res.status(400).json({ message: "Mauvaise requête" });
               } else {
                    const newRatings = [...book.ratings, rating];

                    const newAverageRating =
                         newRatings.reduce((sum, rating) => {
                              return sum + rating.grade;
                         }, 0) / newRatings.length;
                    const newBook = await Book.findOneAndUpdate(
                         { _id: req.params.id },
                         {
                              ratings: newRatings,
                              averageRating: newAverageRating,
                         },
                         {
                              new: true,
                         }
                    );
                    res.status(200).json(newBook);
               }
          }
     } catch (error) {
          res.status(400).json({ error });
     }
};
