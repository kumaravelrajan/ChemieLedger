import validationMiddleware from './paramValidation'
import { localAuthentication } from './passport'
import {
  singleImageUploadCover,
  singleImageUploadParagraph
} from './imageUpload'

module.exports = {
  validationMiddleware,
  localAuthentication,
  singleImageUploadCover,
  singleImageUploadParagraph
}
