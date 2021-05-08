import {
  ERROR_NO_PRODUCT_FOUND,
  ERROR_NO_HISTORY_TYPE_FOUND
} from '../util/errorMessages'
import {
  getPricehistories,
  availablePricehistoryTypes,
  getPricehistoriesFromType
} from '../services/pricehistory.service'
import { getProduct } from '../services/product.service'

const getAllPriceHistoriesFromProduct = async (req, res, next) => {
  var product = await getProduct(req.params.productId)
  if (product) {
    const pricehistories = await getPricehistories(product._id)
    return res.json({ pricehistories })
  } else {
    return res.status(422).json({
      errors: [
        { location: 'params', msg: ERROR_NO_PRODUCT_FOUND, param: 'productId' }
      ]
    })
  }
}

const getPricehistoriesFromProductAndType = async (req, res, next) => {
  var product = await getProduct(req.params.productId)
  if (product) {
    var type = req.params.type
    if (availablePricehistoryTypes.includes(type)) {
      const pricehistories = await getPricehistoriesFromType(product._id, type)
      return res.json({ pricehistories })
    } else {
      return res.status(422).json({
        errors: [
          {
            location: 'params',
            msg: ERROR_NO_HISTORY_TYPE_FOUND,
            param: 'type'
          }
        ]
      })
    }
  } else {
    return res.status(422).json({
      errors: [
        { location: 'params', msg: ERROR_NO_PRODUCT_FOUND, param: 'productId' }
      ]
    })
  }
}

module.exports = {
  getAllPriceHistoriesFromProduct,
  getPricehistoriesFromProductAndType
}
