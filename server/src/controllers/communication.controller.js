import { getRequest } from '../services/request.service'
import {
  getCommunicationsByRequest,
  getCommunicationBySenderAndRequest,
  generateCommunicationChannel,
  getCommunication,
  addMessageToCommunication,
  getInitiatedCommunications,
  getCommunicationsAsRequestOwner,
  getCommunicationsNewOrUpdated,
  setCommunicationIsMessageNew
} from '../services/communication.service'
import {
  ERROR_NO_PRODUCT_FOUND,
  ERROR_UNEXPECTED,
  ERROR_NO_COMMUNICATION_FOUND
} from '../util/errorMessages'

const getRequestAndUserRelatedCommunications = async (req, res, next) => {
  const request = await getRequest(req.params.id)
  var communications = null
  if (request) {
    if (request.ownerId.equals(req.user._id)) {
      communications = await getCommunicationsByRequest(request._id)
    } else {
      communications = await getCommunicationBySenderAndRequest(
        req.user._id,
        request._id
      )
      if (communications) {
        communications = [communications]
      }
    }
    return res.json({ communications })
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_NO_PRODUCT_FOUND, param: 'id' }]
    })
  }
}

const postNewCommunicationFromUser = async (req, res, next) => {
  const request = await getRequest(req.params.requestId)
  if (request) {
    const communication = await getCommunicationBySenderAndRequest(
      req.user._id,
      request._id
    )
    if (communication) {
      return res.json({ success: false })
    } else if (req.user._id.equals(request.ownerId)) {
      return res.json({ success: false })
    } else {
      const { message } = req.body
      const isGenerated = await generateCommunicationChannel(
        req.user._id,
        request,
        message
      )
      if (isGenerated) {
        return res.json({ success: true })
      } else {
        return res.status(422).json({
          errors: [{ location: 'params', msg: ERROR_UNEXPECTED, param: 'id' }]
        })
      }
    }
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_NO_PRODUCT_FOUND, param: 'id' }]
    })
  }
}

const addNewMessageToCommunication = async (req, res, next) => {
  var communication = await getCommunication(req.params.communicationId)
  if (communication) {
    const { message } = req.body
    const newcommunication = await addMessageToCommunication(
      communication,
      message,
      req.user._id
    )
    if (message) {
      res.json({ communication: newcommunication })
    } else {
      return res.status(422).json({
        errors: [{ location: 'params', msg: ERROR_UNEXPECTED, param: 'id' }]
      })
    }
  } else {
    return res.status(422).json({
      errors: [
        { location: 'params', msg: ERROR_NO_COMMUNICATION_FOUND, param: 'id' }
      ]
    })
  }
}

const mapCommunicationData = val => {
  var obj = {
    _id: val._id,
    product: val.request.product.title.description,
    amount: val.request.amount,
    unit: val.request.product.unit.symbol
      ? val.request.product.unit.symbol
      : val.request.product.unit.description,
    price: val.request.price,
    isOffer: val.request.isOffer,
    requestId: val.request._id,
    initialSender: val.initialSender,
    isNewMessage: val.isNewMessage,
    lastModified: val.lastModified,
    updatedAt: val.updatedAt
  }
  return obj
}

const getInitiatedRequestCommunications = async (req, res, next) => {
  var communications = await getInitiatedCommunications(req.user._id)
  var result = null
  result = communications
    .filter(val => !val.request.isClosed)
    .map(val => mapCommunicationData(val))
  return res.json({ communications: result })
}

const getRequestCommunicationsAsOwner = async (req, res, next) => {
  var communications = await getCommunicationsAsRequestOwner(req.user._id)
  var result = null
  result = communications
    .filter(val => !val.request.isClosed)
    .map(val => mapCommunicationData(val))
  return res.json({ communications: result })
}

const getNewOrUpdatedCommunications = async (req, res, next) => {
  var communications = await getCommunicationsNewOrUpdated(req.user._id)
  var result = null
  result = communications.map(val => mapCommunicationData(val))
  return res.json({ communications: result })
}

const setCommunicationRead = async (req, res, next) => {
  var communication = await getCommunication(req.params.communicationId)
  var success = false
  if (!communication.lastModified.equals(req.user._id)) {
    success = await setCommunicationIsMessageNew(communication, false)
  }
  res.json({ success })
}

module.exports = {
  getRequestAndUserRelatedCommunications,
  postNewCommunicationFromUser,
  addNewMessageToCommunication,
  getInitiatedRequestCommunications,
  getRequestCommunicationsAsOwner,
  getNewOrUpdatedCommunications,
  setCommunicationRead
}
