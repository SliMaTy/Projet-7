const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Defining a model scheme for users in the application in using Mongoose
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// The email addresses in the database are unique
// This appropriate Mongoose plugin is used to ensure uniqueness and report errors
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);