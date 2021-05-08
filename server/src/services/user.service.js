import { User, availableUserRoles } from '../models'

const createUser = async (nickname, name, surname, email, password) => {
  const newUser = new User({
    nickname,
    email,
    name,
    surname,
    password
  })
  await newUser.save()
  return newUser
}

const isUserRegistered = async email => {
  try {
    const user = await User.findOne({ email })
    if (user) {
      return true
    }
  } catch (e) {
    return false
  }
  return false
}

const getUserByEmail = async email => {
  try {
    const user = await User.findOne({ email })
    if (user) {
      return user.toJSON({ hide: '' })
    }
  } catch (e) {
    return false
  }
  return false
}

const getUserJSON = async (user, reqUser = null) => {
  if (!reqUser || user.id === reqUser.id) {
    return user.toJSON()
  }
  return {}
}

const getAllUsers = async () => {
  var users = await User.find().populate('origin')
  var resultUser = await users.map(function (user) {
    return user.toJSON({ hide: '' })
  })
  return resultUser
}

const getUser = async id => {
  try {
    const user = await User.findById(id).populate('origin')
    if (user) {
      return user
    }
  } catch (e) {
    return null
  }
  return null
}

const updateUser = async user => {
  try {
    await user.save()
    return user
  } catch (e) {
    console.log(e)
    return null
  }
}

const deleteSpecificUser = async userId => {
  return User.deleteOne({ _id: userId })
}

module.exports = {
  createUser,
  isUserRegistered,
  getUserJSON,
  getAllUsers,
  getUser,
  updateUser,
  availableUserRoles,
  deleteSpecificUser,
  getUserByEmail
}
