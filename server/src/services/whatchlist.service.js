import { Whatchlist } from '../models'

const getUserWhatchlistIds = async userId => {
  const ids = await Whatchlist.find({ userId }).distinct('requestId')
  return ids
}

const createWhatchlistItem = async (userId, requestId) => {
  try {
    var whatchlistitem = new Whatchlist({
      userId,
      requestId
    })
    await whatchlistitem.save()
    return whatchlistitem
  } catch (e) {
    return null
  }
}

const deleteSpecificWhatchlistItem = async id => {
  return Whatchlist.deleteOne({ _id: id })
}

const getWhatchlistitemFromIds = async (userId, requestId) => {
  const whatchlistitem = await Whatchlist.findOne({ userId, requestId })
  if (whatchlistitem) {
    return whatchlistitem
  } else {
    return null
  }
}

const deleteWhatchlistItemsFromRequestId = async requestId => {
  await Whatchlist.deleteMany({ requestId })
}

module.exports = {
  getUserWhatchlistIds,
  createWhatchlistItem,
  deleteSpecificWhatchlistItem,
  getWhatchlistitemFromIds,
  deleteWhatchlistItemsFromRequestId
}
