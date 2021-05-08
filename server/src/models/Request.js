import mongoose from 'mongoose'
import { dbHideTransformation } from '../util/dbHideTransformation'
const Schema = mongoose.Schema

const originSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  parentOrigin: {
    type: Schema.Types.ObjectId,
    ref: 'Origin',
    default: null
  }
})

const requestSchema = new Schema(
  {
    title: String,
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    amount: Number,
    plz: {
      type: Number,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    },
    availableTo: Date,
    usage: String,
    features: String,
    description: String,
    price: Number,
    negotiation: Boolean,
    delivery: Boolean,
    isOffer: Boolean,
    isClosed: {
      type: Boolean,
      default: false
    },
    origin: {
      type: Schema.Types.ObjectId,
      ref: 'Origin'
    },
    subOrigin: {
      type: Schema.Types.ObjectId,
      ref: 'Origin'
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    isDraft: {
      type: Boolean,
      default: true
    },
    imgPaths: {
      type: [String]
    }
  },
  { timestamps: true }
)

requestSchema.options.toJSON = {
  transform: dbHideTransformation,
  virtuals: false,
  alwaysHide: '__v',
  hide: 'createdAt'
}

const Request = mongoose.model('Request', requestSchema)
const Origin = mongoose.model('Origin', originSchema)

module.exports = {
  Request,
  Origin
}
