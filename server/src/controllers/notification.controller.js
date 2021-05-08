import { ERROR_NO_TYPE_FOUND } from '../util/errorMessages'
import { getCommunicationsNewOrUpdated } from '../services/communication.service'

const checkNewNotification = async (req, res, next) => {
  var type = req.params.type
  if (type === 'NEW_COMMUNICATION') {
    const newCom = await getCommunicationsNewOrUpdated(req.user._id)
    const notification = newCom && newCom.length > 0
    return res.json({ notification })
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_NO_TYPE_FOUND, param: 'type' }]
    })
  }
}

module.exports = {
  checkNewNotification
}
