import { getProduct } from '../services/product.service'
import {
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
  getUserOffersAndRequests
} from '../services/request.service'
import { createPricehistoryEntry } from '../services/pricehistory.service'
import { deleteWhatchlistItemsFromRequestId } from '../services/whatchlist.service'
import {
  getCommunicationsByRequest,
  addMessageToCommunication
} from '../services/communication.service'
import { deleteFile } from '../services/file.service'
import {
  ERROR_NO_REQUEST_FOUND,
  ERROR_NOT_AUTHENTICATED,
  ERROR_UNEXPECTED,
  ERROR_FILE_UPLOAD
} from '../util/errorMessages'

const getSpecificRequest = async (req, res, next) => {
  var request = await getRequest(req.params.id)
  if (request) {
    res.json({ request })
  } else {
    return res.status(422).json({
      errors: [
        { location: 'params', msg: ERROR_NO_REQUEST_FOUND, param: 'id' }
      ]
    })
  }
}

const generateRequest = async (req, res, next) => {
  var { isOffer, productId } = req.body
  var user = req.user
  var product = null
  if (productId) {
    product = await getProduct(productId)
  }
  var request = null
  if (product) {
    request = await createRequestWithProduct(product._id, isOffer, user._id)
  } else {
    request = await createRequest(isOffer, user._id)
  }
  return res.json({ request })
}

const deleteRequest = async (req, res, next) => {
  var request = await getRequest(req.params.id)
  if (!request) {
    return res.status(422).json({
      errors: [
        { location: 'params', msg: ERROR_NO_REQUEST_FOUND, param: 'id' }
      ]
    })
  } else {
    if (request.ownerId.equals(req.user._id)) {
      if (request.imgPaths.length > 0) {
        await request.imgPaths.forEach(async (imgPath) => {
          await deleteFile('.' + imgPath)
        })
      }

      await deleteWhatchlistItemsFromRequestId(request._id)

      const isDeleted = await deleteSpecificRequest(request._id)

      if (isDeleted.deletedCount > 0) {
        return res.json({ success: true })
      } else {
        return res.status(422).json({
          errors: [{ location: 'params', msg: ERROR_UNEXPECTED, param: 'id' }]
        })
      }
    } else {
      return res.status(422).json({
        errors: [
          { location: 'params', msg: ERROR_NOT_AUTHENTICATED, param: 'id' }
        ]
      })
    }
  }
}

const patchSpecificRequest = async (req, res, next) => {
  var request = await getRequest(req.params.id)
  if (request) {
    if (request.ownerId.equals(req.user._id)) {
      // Check for change in product, price, amount to history
      var { amount, price, product } = req.body
      if (
        request.product === undefined ||
        !request.product.equals(product) ||
        request.amount !== amount ||
        request.price !== price
      ) {
        await createPricehistoryEntry(
          product,
          price,
          amount,
          request.isOffer ? 'bid' : 'ask'
        )
      }

      for (var changeParam in req.body) {
        if (changeParam !== '_id') {
          request[changeParam] = req.body[changeParam]
        }
      }
      const requestUpdated = await updateRequest(request)

      if (requestUpdated) {
        return res.json({ success: true })
      } else {
        return res.json({ success: false })
      }
    } else {
      return res.status(422).json({
        errors: [
          { location: 'params', msg: ERROR_NOT_AUTHENTICATED, param: 'id' }
        ]
      })
    }
  } else {
    return res.status(422).json({
      errors: [
        { location: 'params', msg: ERROR_NO_REQUEST_FOUND, param: 'id' }
      ]
    })
  }
}

const uploadImageToRequest = async (req, res, next) => {
  if (req.file) {
    const filePath = req.file.destination.slice(1) + '/' + req.file.filename
    var request = await getRequest(req.params.id)
    if (request) {
      if (request.ownerId.equals(req.user._id)) {
        request.imgPaths.push(filePath)
        await updateRequest(request)
        return res.json({ imgPaths: request.imgPaths })
      } else {
        await deleteFile('.' + filePath)
        return res.status(422).json({
          errors: [
            { location: 'params', msg: ERROR_NOT_AUTHENTICATED, param: 'id' }
          ]
        })
      }
    } else {
      await deleteFile('.' + filePath)
      return res.status(422).json({
        errors: [
          { location: 'params', msg: ERROR_NO_REQUEST_FOUND, param: 'id' }
        ]
      })
    }
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_FILE_UPLOAD, param: 'id' }]
    })
  }
}

const deleteImageFromRequest = async (req, res, next) => {
  var request = await getRequest(req.params.id)
  if (request) {
    if (request.ownerId.equals(req.user._id)) {
      const pathToDelete = req.body.path

      const index = request.imgPaths.findIndex((path) => path === pathToDelete)

      await deleteFile('.' + request.imgPaths[index])
      request.imgPaths.splice(index, 1)

      await updateRequest(request)
      return res.json({ imgPaths: request.imgPaths })
    } else {
      return res.status(422).json({
        errors: [
          { location: 'params', msg: ERROR_NOT_AUTHENTICATED, param: 'id' }
        ]
      })
    }
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_FILE_UPLOAD, param: 'id' }]
    })
  }
}

const getAvailableParentOrigins = async (req, res, next) => {
  const availableParentOrigins = await getOrigins(null)
  return res.json({ origins: availableParentOrigins })
}

const getAvailableOriginsWithParent = async (req, res, next) => {
  const availableParentOrigins = await getOrigins(req.params.parentId)
  return res.json({ origins: availableParentOrigins })
}

const getAvailableOffers = async (req, res, next) => {
  const offers = await getPublicRequests(true)
  return res.json({ offers })
}

const getAllAvailableData = async (req, res, next) => {
  const data = await getPublicRequestsAndOffers()
  return res.json({ data })
}

const getAvailableRequests = async (req, res, next) => {
  const requests = await getPublicRequests(false)
  return res.json({ requests })
}

const getAvailableProductOffers = async (req, res, next) => {
  const offers = await getPublicRequests(true, req.params.id)
  return res.json({ offers })
}

const getAvailableProductRequests = async (req, res, next) => {
  const requests = await getPublicRequests(false, req.params.id)
  return res.json({ requests })
}

const getOwnOffersAndRequests = async (req, res, next) => {
  const offers = await getUserOffersAndRequests(req.user._id)
  return res.json({ offers })
}

const getOwnDraftOffersAndRequests = async (req, res, next) => {
  const offers = await getUserOffersAndRequests(req.user._id, true)
  return res.json({ offers })
}

const getOwnArchiveOffersAndRequests = async (req, res, next) => {
  const offers = await getUserOffersAndRequests(req.user._id, false, true)
  return res.json({ offers })
}

const getOwnOffers = async (req, res, next) => {
  const offers = await getUserRequests(req.user._id, true, false)
  return res.json({ offers })
}

const getOwnRequests = async (req, res, next) => {
  const requests = await getUserRequests(req.user._id, false, false)
  return res.json({ requests })
}

const getOwnDraftOffers = async (req, res, next) => {
  const offers = await getUserRequests(req.user._id, true, true)
  return res.json({ offers })
}

const getOwnDraftRequests = async (req, res, next) => {
  const requests = await getUserRequests(req.user._id, false, true)
  return res.json({ requests })
}

const getOwnArchiveOffers = async (req, res, next) => {
  const offers = await getUserRequests(req.user._id, true, false, true)
  return res.json({ offers })
}

const getOwnArchiveRequests = async (req, res, next) => {
  const requests = await getUserRequests(req.user._id, false, false, true)
  return res.json({ requests })
}

const closeRequestWithoutDeal = async (req, res, next) => {
  const request = await getRequest(req.params.requestId)
  if (request.ownerId.equals(req.user._id)) {
    var communications = await getCommunicationsByRequest(request._id)
    if (communications && communications.length > 0) {
      await communications.forEach(async function (communication) {
        var message = null
        if (request.isOffer) {
          message = 'Dieses Angebot wurde durch den Ersteller geschlossen'
        } else {
          message = 'Dieses Gesuch wurde durch den Ersteller geschlossen'
        }
        await addMessageToCommunication(communication, message, req.user._id)
      })
    }
    await deleteWhatchlistItemsFromRequestId(request._id)
    var success = await closeRequestWithoutPriceAmount(request)
    res.json({ success })
  } else {
    return res.status(422).json({
      errors: [
        { location: 'params', msg: ERROR_NOT_AUTHENTICATED, param: 'id' }
      ]
    })
  }
}

const closeRequestWithLastPrice = async (req, res, next) => {
  const request = await getRequest(req.params.requestId)
  if (request.ownerId.equals(req.user._id)) {
    var { price, amount } = req.body
    var communications = await getCommunicationsByRequest(request._id)
    if (communications && communications.length > 0) {
      await communications.forEach(async function (communication) {
        var message = null
        if (request.isOffer) {
          message = 'Dieses Angebot wurde durch den Ersteller geschlossen'
        } else {
          message = 'Dieses Gesuch wurde durch den Ersteller geschlossen'
        }
        await addMessageToCommunication(communication, message, req.user._id)
      })
    }

    await createPricehistoryEntry(request.product._id, price, amount, 'close')

    await deleteWhatchlistItemsFromRequestId(request._id)

    var success = await closeRequest(request, price, amount)
    res.json({ success })
  } else {
    return res.status(422).json({
      errors: [
        { location: 'params', msg: ERROR_NOT_AUTHENTICATED, param: 'id' }
      ]
    })
  }
}

module.exports = {
  generateRequest,
  deleteRequest,
  getSpecificRequest,
  patchSpecificRequest,
  uploadImageToRequest,
  deleteImageFromRequest,
  getAvailableParentOrigins,
  getAvailableOriginsWithParent,
  getAvailableOffers,
  getAvailableRequests,
  getAvailableProductOffers,
  getAvailableProductRequests,
  getOwnOffers,
  getOwnRequests,
  getOwnDraftOffers,
  getOwnDraftRequests,
  closeRequestWithLastPrice,
  getOwnArchiveOffers,
  getOwnArchiveRequests,
  closeRequestWithoutDeal,
  getAllAvailableData,
  getOwnOffersAndRequests,
  getOwnDraftOffersAndRequests,
  getOwnArchiveOffersAndRequests
}
