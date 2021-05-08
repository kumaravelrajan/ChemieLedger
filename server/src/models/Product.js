import mongoose from 'mongoose'
import { dbHideTransformation } from '../util/dbHideTransformation'
const Schema = mongoose.Schema

const producttitleSchema = new Schema(
  {
    description: {
      type: String,
      unique: true,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: false }
)

const unitSchema = new Schema(
  {
    description: {
      type: String,
      required: true
    },
    symbol: {
      type: String,
      required: false
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: false }
)

const productSchema = new Schema(
  {
    title: {
      type: Schema.Types.ObjectId,
      ref: 'ProductTitle'
    },
    unit: {
      type: Schema.Types.ObjectId,
      ref: 'Unit'
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

productSchema.options.toJSON = {
  transform: dbHideTransformation,
  virtuals: false,
  alwaysHide: '__v',
  hide: 'createdAt updatedAt'
}

producttitleSchema.options.toJSON = {
  transform: dbHideTransformation,
  virtuals: false,
  alwaysHide: '__v',
  hide: 'createdAt updatedAt'
}

unitSchema.options.toJSON = {
  transform: dbHideTransformation,
  virtuals: false,
  alwaysHide: '__v',
  hide: 'createdAt updatedAt'
}

const ProductTitle = mongoose.model('ProductTitle', producttitleSchema)
const Unit = mongoose.model('Unit', unitSchema)
const Product = mongoose.model('Product', productSchema)

module.exports = {
  Product,
  ProductTitle,
  Unit
}
