const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
      console.log(file)
      // cb(null, file.fieldname + '-' + uniqueSuffix)
      cb(null, `${file.fieldname}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

module.exports = upload