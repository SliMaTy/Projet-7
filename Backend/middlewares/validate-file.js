const validateFile = require("multer");

const MIME_TYPES = {
     "image/jpg": "jpg",
     "image/jpeg": "jpg",
     "image/png": "png",
     "image/webp": "webp",
};

const storage = validateFile.memoryStorage();
const fileFilter = (req, file, cb) => {
     const extension = MIME_TYPES[file.mimetype];
     if (!extension) {
          return cb(new Error("Ce type de fichier n'est pas accepté"), false);
     } else {
          return cb(null, true);
     }
};
const limits = { fileSize: 4000000 };

module.exports = validateFile({ storage, fileFilter, limits }).single("image");
