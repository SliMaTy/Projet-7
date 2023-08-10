const sharp = require("sharp");

const resizePicture = (req, res, next) => {
     if (req.file) {
          const extension = "webp";
          const name =
               req.file.originalname.split(" ").join("_") +
               Date.now() +
               "." +
               extension;
          req.file.filename = name;
          sharp(req.file.buffer)
               .resize(500, 500, { fit: "inside" })
               .rotate()
               .toFormat(extension)
               .toFile("images/" + name);
     }
     next();
};

module.exports = resizePicture;
