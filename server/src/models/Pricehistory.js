import mongoose from 'mongoose'
import { dbHideTransformation } from '../util/dbHideTransformation'
const Schema = mongoose.Schema

const availablePricehistoryTypes = ['ask', 'bid', 'close', 'index']

const pricehistorySchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    volume: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    priceType: {
      type: String,
      enum: availablePricehistoryTypes,
      required: true
    }
  },
  { timestamps: true }
)

pricehistorySchema.options.toJSON = {
  transform: dbHideTransformation,
  virtuals: false,
  alwaysHide: '__v',
  hide: ''
}

const Pricehistory = mongoose.model('Pricehistory', pricehistorySchema)

// Export the model
module.exports = {
  Pricehistory,
  availablePricehistoryTypes
}
