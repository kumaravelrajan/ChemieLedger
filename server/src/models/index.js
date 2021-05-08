import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Pricehistory, availablePricehistoryTypes } from './Pricehistory'
import { User, availableUserRoles } from './User'
import { Article, articleTypes, imageTypes } from './Article'
import { Product, ProductTitle, Unit } from './Product'
import { Request, Origin } from './Request'
import { Communication } from './Communication'
import { Whatchlist } from './Whatchlist'

dotenv.config()
const mongodbUri =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/yourDB'
const mongooseOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  user: process.env.MONGODB_USER || 'yourUser',
  pass: process.env.MONGODB_PASS || 'yourPW',
  useUnifiedTopology: true
}

// ----------------------
// Connect Database
// ----------------------
const connectDB = () => {
  // mongoose.connection.once('open')
  return mongoose.connect(mongodbUri, mongooseOptions)
}

module.exports = {
  User,
  availableUserRoles,
  connectDB,
  Article,
  articleTypes,
  imageTypes,
  Product,
  ProductTitle,
  Unit,
  Request,
  Origin,
  Communication,
  Whatchlist,
  Pricehistory,
  availablePricehistoryTypes
}
