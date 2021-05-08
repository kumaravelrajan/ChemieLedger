import { Communication } from '../models'
import mongoose from 'mongoose'

const getCommunication = async id => {
  try {
    const com = await Communication.findById(id)
    if (com) {
      return com
    }
  } catch (e) {
    return null
  }
  return null
}

const getCommunicationsByRequest = async requestId => {
  var communications = await Communication.find({ request: requestId })
  return communications
}

const getCommunicationBySenderAndRequest = async (userId, requestId) => {
  var communications = await Communication.findOne({
    initialSender: userId,
    request: requestId
  })
  return communications
}

const generateCommunicationChannel = async (
  initialSender,
  request,
  message
) => {
  var newCommunication = new Communication({
    initialSender,
    lastModified: initialSender,
    request: request._id,
    requestOwnerId: request.ownerId,
    isNewMessage: true
  })
  var initialMessage = newCommunication.messages.create({
    sender: initialSender,
    text: message
  })
  newCommunication.messages.push(initialMessage)
  await newCommunication.save()
  return newCommunication._id != null
}

const setCommunicationIsMessageNew = async (communication, value) => {
  communication.isNewMessage = value
  try {
    await communication.save()
    return true
  } catch (e) {
    return false
  }
}

const addMessageToCommunication = async (communication, message, sender) => {
  var newMessage = communication.messages.create({
    sender,
    text: message
  })
  communication.messages.push(newMessage)
  communication.lastModified = sender
  communication.isNewMessage = true
  await communication.save()
  return communication
}

const getInitiatedCommunications = async initialSender => {
  return Communication.find({ initialSender }).populate({
    path: 'request',
    populate: {
      path: 'product',
      populate: [
        {
          path: 'title'
        },
        { path: 'unit' }
      ]
    }
  })
}

const getCommunicationsAsRequestOwner = async requestOwnerId => {
  return Communication.find({ requestOwnerId }).populate({
    path: 'request',
    populate: {
      path: 'product',
      populate: [
        {
          path: 'title'
        },
        { path: 'unit' }
      ]
    }
  })
}

const getCommunicationsNewOrUpdated = async userId => {
  var userObjectId = mongoose.Types.ObjectId(userId)
  return Communication.find({
    $and: [
      { isNewMessage: true },
      {
        $or: [
          { initialSender: { $eq: userObjectId } },
          { requestOwnerId: { $eq: userObjectId } }
        ]
      },
      { lastModified: { $ne: userObjectId } }
    ]
  }).populate({
    path: 'request',
    populate: {
      path: 'product',
      populate: [
        {
          path: 'title'
        },
        { path: 'unit' }
      ]
    }
  })
}

module.exports = {
  getCommunicationsByRequest,
  getCommunicationBySenderAndRequest,
  generateCommunicationChannel,
  getCommunication,
  addMessageToCommunication,
  getInitiatedCommunications,
  getCommunicationsAsRequestOwner,
  getCommunicationsNewOrUpdated,
  setCommunicationIsMessageNew
}
