import mongoose from 'mongoose'
import { dbHideTransformation } from '../util/dbHideTransformation'
const Schema = mongoose.Schema

const messageSchema = new Schema(
  {
    isNewMessage: {
      type: Boolean,
      default: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    text: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

const communicationSchema = new Schema(
  {
    initialSender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    requestOwnerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    lastModified: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    request: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
      default: null
    },
    isNewMessage: {
      type: Boolean,
      default: true
    },
    messages: [messageSchema]
  },
  { timestamps: true }
)

communicationSchema.options.toJSON = {
  transform: dbHideTransformation,
  virtuals: false,
  alwaysHide: '__v',
  hide: 'createdAt'
}

const Communication = mongoose.model('Communication', communicationSchema)

module.exports = {
  Communication
}
