const multer = require("multer");
const path = require("path")
const aws = require("aws-sdk")
const multerS3 = require("multer-s3")

const s3 = new aws.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_BUCKET_REGION
})

const storage = multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: function(req, file, cb) {
        cb(null, { fieldName: file.fieldname })
    },
    key: function(req, file, cb) {
        cb(null, path.basename(file.originalname, path.extname(file.originalname)) + "_" + Date.now() + path.extname(file.originalname))
    }
})

const uploadfile = multer({
        storage: storage
    }).single("resume") //resume is the field name in html form




module.exports = uploadfile