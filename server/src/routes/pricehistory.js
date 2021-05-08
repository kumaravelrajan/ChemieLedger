import express from 'express'
import { jwtAuthentication } from './middlewares/passport'
import { pricehistoryController } from '../controllers'

const pricehistory = express.Router()

pricehistory.get(
  '/:productId',
  jwtAuthentication,
  pricehistoryController.getAllPriceHistoriesFromProduct
)

pricehistory.get(
  '/:productId/:type',
  jwtAuthentication,
  pricehistoryController.getPricehistoriesFromProductAndType
)

module.exports = pricehistory
