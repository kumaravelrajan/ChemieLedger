import mongoose from 'mongoose'
import { dbHideTransformation } from '../util/dbHideTransformation'
const Schema = mongoose.Schema

const whatchlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'Request'
    }
  },
  { timestamps: true }
)

whatchlistSchema.options.toJSON = {
  transform: dbHideTransformation,
  virtuals: false,
  alwaysHide: '__v',
  hide: 'createdAt'
}

const Whatchlist = mongoose.model('Whatchlist', whatchlistSchema)

module.exports = {
  Whatchlist
}
