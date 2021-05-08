import mongoose from 'mongoose'
import { dbHideTransformation } from '../util/dbHideTransformation'
const Schema = mongoose.Schema

const articleTypes = ['news', 'example']
const imageTypes = ['right', 'left', 'none']

const paragraphSchema = new Schema({
  headline: {
    type: String
  },
  text: {
    type: String
  },
  order: {
    type: Number
  },
  imageType: {
    type: String,
    enum: imageTypes,
    required: true,
    default: 'none'
  },
  imagePath: {
    type: String
  }
})

const articleSchema = new Schema(
  {
    headline: {
      type: String,
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    readingTime: {
      type: Number,
      min: 0
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    articleType: {
      type: String,
      enum: articleTypes,
      default: 'example'
    },
    coverImagePath: {
      type: String
    },
    paragraphs: {
      type: [paragraphSchema]
    }
  },
  { timestamps: true }
)

articleSchema.options.toJSON = {
  transform: dbHideTransformation,
  virtuals: false,
  alwaysHide: '__v',
  hide: 'createdAt updatedAt'
}

// Create the model
const Article = mongoose.model('Article', articleSchema)

// Export the model
module.exports = {
  Article,
  articleTypes,
  imageTypes
}
