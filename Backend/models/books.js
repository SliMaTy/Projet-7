const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Defining a model scheme for books in the application in using Mongoose
const bookSchema = mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [
        {
            userId: { type: String, required: true },
            grade: { type: Number, required: true }
        }
    ],
    averageRating: { type: Number, required: true }
});

// The title of a book in the database are unique
// This appropriate Mongoose plugin is used to ensure uniqueness and report errors
bookSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Book', bookSchema);