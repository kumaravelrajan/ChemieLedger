import { Request, Origin } from '../models'

const createRequestWithProduct = async (productId, isOffer, ownerId) => {
  var request = new Request({
    title: '',
    product: productId,
    isOffer,
    ownerId
  })
  await request.save()
  return request
}

const closeRequest = async (request, price, amount) => {
  try {
    request.price = price
    request.amount = amount
    request.isClosed = true
    await request.save()
    return true
  } catch (e) {
    return false
  }
}

const closeRequestWithoutPriceAmount = async request => {
  try {
    request.isClosed = true
    await request.save()
    return true
  } catch (e) {
    return false
  }
}

const createRequest = async (isOffer, ownerId) => {
  var request = new Request({
    title: '',
    isOffer,
    ownerId
  })
  await request.save()
  return request
}

const getRequest = async id => {
  var request = null
  try {
    request = await Request.findById(id)
      .populate({
        path: 'product',
        populate: [
          { path: 'title', model: 'ProductTitle' },
          { path: 'unit', model: 'Unit' }
        ]
      })
      .populate('origin')
      .populate('subOrigin')
    return request
  } catch (e) {
    return null
  }
}

const updateRequest = async request => {
  try {
    await request.save()
    return request
  } catch (e) {
    console.log(e)
    return null
  }
}

const deleteSpecificRequest = async id => {
  return Request.deleteOne({ _id: id })
}

const getOrigins = async parentId => {
  var origins = await Origin.find({ parentOrigin: parentId })
  return origins
}

const getRequestsAndOffersFromIds = async ids => {
  var data = await Request.find({
    _id: {
      $in: ids
    }
  })
    .populate({
      path: 'product',
      populate: [
        { path: 'title', model: 'ProductTitle' },
        { path: 'unit', model: 'Unit' }
      ]
    })
    .populate('origin')
    .populate('subOrigin')
  return data
}

const getPublicRequestsAndOffers = async () => {
  var options = {
    isDraft: false,
    isClosed: false
  }
  var data = await Request.find(options)
    .populate({
      path: 'product',
      populate: [
        { path: 'title', model: 'ProductTitle' },
        { path: 'unit', model: 'Unit' }
      ]
    })
    .populate('origin')
    .populate('subOrigin')

  return data
}

const getPublicRequests = async (
  isOffer,
  productId = null,
  isClosed = false
) => {
  var options = {
    isDraft: false,
    isOffer,
    isClosed
  }
  if (productId) {
    options = Object.assign(options, { product: productId })
  }
  var requests = await Request.find(options)
    .populate({
      path: 'product',
      populate: [
        { path: 'title', model: 'ProductTitle' },
        { path: 'unit', model: 'Unit' }
      ]
    })
    .populate('origin')
    .populate('subOrigin')

  return requests
}

const getUserOffersAndRequests = async (
  userId,
  isDraft = false,
  isClosed = false
) => {
  var requests = await Request.find({
    ownerId: userId,
    isDraft,
    isClosed
  })
    .populate({
      path: 'product',
      populate: [
        { path: 'title', model: 'ProductTitle' },
        { path: 'unit', model: 'Unit' }
      ]
    })
    .populate('origin')
    .populate('subOrigin')

  return requests
}

const getUserRequests = async (userId, isOffer, isDraft, isClosed = false) => {
  var requests = await Request.find({
    ownerId: userId,
    isOffer,
    isDraft,
    isClosed
  })
    .populate({
      path: 'product',
      populate: [
        { path: 'title', model: 'ProductTitle' },
        { path: 'unit', model: 'Unit' }
      ]
    })
    .populate('origin')
    .populate('subOrigin')

  return requests
}

module.exports = {
  createRequestWithProduct,
  createRequest,
  getRequest,
  deleteSpecificRequest,
  updateRequest,
  getOrigins,
  getPublicRequests,
  getUserRequests,
  closeRequest,
  closeRequestWithoutPriceAmount,
  getPublicRequestsAndOffers,
  getUserOffersAndRequests,
  getRequestsAndOffersFromIds
}
