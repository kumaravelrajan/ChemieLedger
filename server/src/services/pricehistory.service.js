import { Pricehistory, availablePricehistoryTypes } from '../models'

const createPricehistoryEntry = async (
  productId,
  originalPrice,
  volume,
  type
) => {
  const pricePerVolume = originalPrice / volume
  const newPricehistory = new Pricehistory({
    product: productId,
    price: pricePerVolume,
    volume,
    priceType: type
  })
  await newPricehistory.save()
  return newPricehistory
}

const getPricehistories = async (productId) => {
  const histories = await Pricehistory.find({
    product: productId
  })
  return histories
}

const getPricehistoriesFromType = async (productId, type) => {
  const histories = await Pricehistory.find({
    product: productId,
    priceType: type
  })
  return histories
}

module.exports = {
  availablePricehistoryTypes,
  getPricehistories,
  createPricehistoryEntry,
  getPricehistoriesFromType
}
