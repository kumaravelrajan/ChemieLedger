import {
  getAllUsers,
  getUser,
  updateUser,
  getUserJSON,
  availableUserRoles,
  deleteSpecificUser
} from '../services/user.service'
import {
  getUserWhatchlistIds,
  createWhatchlistItem,
  deleteSpecificWhatchlistItem,
  getWhatchlistitemFromIds
} from '../services/whatchlist.service'
import {
  getRequest,
  getRequestsAndOffersFromIds
} from '../services/request.service'
import {
  ERROR_USER_NOT_FOUND,
  ERROR_USER_NOT_UPDATED,
  ERROR_USER_ADMIN_DELETE_HISSELF,
  ERROR_UNEXPECTED,
  ERROR_NO_REQUEST_FOUND,
  ERROR_NO_WHATCHLISTITEM_FOUND
} from '../util/errorMessages'

const getUsers = async (req, res, next) => {
  const users = await getAllUsers()
  res.json({
    users
  })
}

const patchUser = async (req, res, next) => {
  var user = await getUser(req.params.id)
  if (user) {
    for (var changeParam in req.body) {
      if (changeParam !== '_id') {
        user[changeParam] = req.body[changeParam]
      }
    }
    const updatedUser = await updateUser(user)
    if (!updateUser) {
      return res.status(422).json({
        errors: [{ location: 'params', msg: ERROR_USER_NOT_UPDATED, param: '' }]
      })
    } else {
      const userJson = await getUserJSON(updatedUser)
      return res.json({ user: userJson })
    }
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_USER_NOT_FOUND, param: 'id' }]
    })
  }
}

const deleteUser = async (req, res, next) => {
  var userToDelete = await getUser(req.params.id)
  if (userToDelete) {
    const userToDeleteId = userToDelete._id
    if (req.user._id.equals(userToDeleteId)) {
      return res.status(422).json({
        errors: [
          {
            location: 'params',
            msg: ERROR_USER_ADMIN_DELETE_HISSELF,
            param: 'id'
          }
        ]
      })
    } else {
      const isDeleted = await deleteSpecificUser(userToDeleteId)
      if (isDeleted.deletedCount > 0) {
        return res.json({ success: true })
      } else {
        return res.status(422).json({
          errors: [{ location: 'params', msg: ERROR_UNEXPECTED, param: 'id' }]
        })
      }
    }
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_USER_NOT_FOUND, param: 'id' }]
    })
  }
}

const getNickname = async (req, res, next) => {
  var nickUser = await getUser(req.params.id)
  if (nickUser) {
    return res.json({ nickname: nickUser.nickname })
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_USER_NOT_FOUND, param: 'id' }]
    })
  }
}

const getWhatchlistIds = async (req, res, next) => {
  const ids = await getUserWhatchlistIds(req.user._id)
  return res.json({ ids })
}

const getWhatchlistRequests = async (req, res, next) => {
  var data = null
  const ids = await getUserWhatchlistIds(req.user._id)
  if (ids && ids.length > 0) {
    data = await getRequestsAndOffersFromIds(ids)
  }
  return res.json({ data })
}

const addItemToWhatchlist = async (req, res, next) => {
  const { requestId } = req.body
  const request = await getRequest(requestId)
  if (request) {
    const whatchlistItem = createWhatchlistItem(req.user.id, request._id)
    if (whatchlistItem) {
      return res.json({ success: true })
    } else {
      return res.json({ success: false })
    }
  } else {
    return res.status(422).json({
      errors: [
        { location: 'params', msg: ERROR_NO_REQUEST_FOUND, param: 'requestId' }
      ]
    })
  }
}

const removeItemFromWhatchlist = async (req, res, next) => {
  const { requestId } = req.body
  const whatchlistitem = await getWhatchlistitemFromIds(
    req.user._id,
    requestId
  )
  if (whatchlistitem) {
    const isDeleted = await deleteSpecificWhatchlistItem(whatchlistitem._id)
    if (isDeleted) {
      return res.json({ success: true })
    } else {
      return res.json({ success: false })
    }
  } else {
    return res.status(422).json({
      errors: [
        {
          location: 'params',
          msg: ERROR_NO_WHATCHLISTITEM_FOUND,
          param: 'requestId'
        }
      ]
    })
  }
}

module.exports = {
  getUsers,
  patchUser,
  availableUserRoles,
  deleteUser,
  getNickname,
  getWhatchlistIds,
  addItemToWhatchlist,
  removeItemFromWhatchlist,
  getWhatchlistRequests
}
