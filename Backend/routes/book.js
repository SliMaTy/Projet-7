const express = require("express");
const auth = require("../middlewares/auth");
const validateFile = require("../middlewares/validate-file");
const router = express.Router();
const ctrlBook = require("../controllers/book");
const resizePicture = require("../middlewares/resize-picture");

router.use(express.json());
router.get("/", ctrlBook.getBooks);
router.get("/bestrating", ctrlBook.getBestBooks);
router.get("/:id", ctrlBook.getOneBook);
router.post("/", auth, validateFile, resizePicture, ctrlBook.createBook);
router.put("/:id", auth, validateFile, resizePicture, ctrlBook.modifyBook);
router.delete("/:id", auth, ctrlBook.deleteBook);
router.post("/:id/rating", auth, ctrlBook.rateBook);

module.exports = router;
