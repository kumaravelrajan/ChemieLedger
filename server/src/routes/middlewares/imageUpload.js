import path from 'path'
import multer from 'multer'
import dotenv from 'dotenv'
import { ERROR_JUST_IMAGES_ALLOWED } from '../../util/errorMessages'

dotenv.config()

const storage = multer.diskStorage({
  destination: '.' + process.env.IMAGE_PATH,
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname).toLowerCase())
  }
})

const requestStorage = multer.diskStorage({
  destination: '.' + process.env.IMAGE_PATH + '/request',
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname).toLowerCase())
  }
})

function checkFileType (file, cb) {
  // Check file extention
  const fileTypes = /jpeg|jpg|png|gif/
  const extentionName = fileTypes.test(
    path.extname(file.originalname).toLowerCase()
  )

  // check mimetype
  const mimeType = fileTypes.test(file.mimetype)

  if (mimeType && extentionName) {
    return cb(null, true)
  } else {
    cb(ERROR_JUST_IMAGES_ALLOWED)
  }
}

const singleImageUploadCover = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  }
}).single('file')

const singleImageUploadParagraph = multer({
  storage: storage,
  limits: { fileSize: 2000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  }
}).single('file')

const singleImageUploadRequest = multer({
  storage: requestStorage,
  limits: { fileSize: 2000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  }
}).single('file')

module.exports = {
  singleImageUploadCover,
  singleImageUploadParagraph,
  singleImageUploadRequest
}
