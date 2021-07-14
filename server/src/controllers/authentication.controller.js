import { ERROR_USER_REGISTERED, ERROR_UNEXPECTED, ERROR_USER_NOT_FOUND } from '../util/errorMessages'
import {
  isUserRegistered,
  createUser,
  updateUser,
  getUserJSON,
  getUserByEmail
} from '../services/user.service'
import {
  generateToken,
  generateTokenValidForMinutes
} from '../services/token.service'
import { sendResetEmail, sendVerifactionEmail } from '../services/email.service'
import { enrollUser } from '../fabric/fabric.service'

const login = async (req, res) => {
  const userJson = await getUserJSON(req.user)
  try {
    if (userJson) {
      userJson['access_token'] = generateToken(req.user.id)
      res.json(userJson)
    } else {
      throw new Error(ERROR_UNEXPECTED)
    }
  } catch (e) {
    res.status(422).json({
      errors: [{ location: 'body', msg: e.message, param: '' }]
    })
  }
}

const requestNewPassword = async (req, res) => {
  const userRegistered = await isUserRegistered(req.body.email)
  try {
    if (userRegistered) {
      const user = await getUserByEmail(req.body.email)
      const resetJwtExpirationTime = process.env.RESET_JWT_EXPIRATION_MINUTES || 10
      const token = generateTokenValidForMinutes(user['_id'], resetJwtExpirationTime)
      await sendResetEmail(token, user)
      res.json({ success: true })
    } else {
      throw new Error(ERROR_USER_NOT_FOUND)
    }
  } catch (e) {
    res.status(422).json({
      errors: [{ location: 'body', msg: e.message, param: '' }]
    })
  }
}

const changeProfile = async (req, res, next) => {
  const { nickname, name, surname, origin } = req.body
  var user = req.user
  user.nickname = nickname
  user.name = name
  user.surname = surname
  user.origin = origin
  await updateUser(user)
  const updatedUser = await getUserJSON(user)
  res.json(updatedUser)
}

const register = async (req, res, next) => {
  // Extract validated parameters
  const { nickname, name, surname, email, password } = req.body

  // Check if user already exists
  const userRegistered = await isUserRegistered(email)
  if (userRegistered) {
    res.status(422).json({
      errors: [{ location: 'body', msg: ERROR_USER_REGISTERED, param: 'email' }]
    })
  } else {
    // Create the new user, if the email is not in DB
    try {
      const newUser = await createUser(
        nickname,
        name,
        surname,
        email,
        password
      )
      const userJson = await getUserJSON(newUser)
      if (userJson) {
        const resetJwtExpirationTime = process.env.VERIFIKATION_JWT_EXPIRATION_MINUTES || 30
        const token = generateTokenValidForMinutes(newUser.id, resetJwtExpirationTime)
        await sendVerifactionEmail(token, newUser)
        userJson['access_token'] = generateToken(newUser.id)
        res.json(userJson)
      } else {
        throw new Error(ERROR_UNEXPECTED)
      }
    } catch (e) {
      res.status(422).json({
        errors: [{ location: 'body', msg: e.message, param: '' }]
      })
    }
  }
}

const resetPassword = async (req, res, next) => {
  const { password } = req.body
  var user = req.user
  user.password = password
  await updateUser(user)
  res.json({ success: true })
}

const verifyEmail = async (req, res, next) => {
  var user = req.user
  user.isVerified = true
  await updateUser(user)
  const updatedUser = await getUserJSON(user)
  updatedUser['access_token'] = generateToken(updatedUser._id)
  await enrollUser(user)
  res.json(updatedUser)
}

const sendNewVerificationEmail = async (req, res, next) => {
  var user = req.user
  const resetJwtExpirationTime = process.env.VERIFIKATION_JWT_EXPIRATION_MINUTES || 30
  const token = generateTokenValidForMinutes(user.id, resetJwtExpirationTime)
  await sendVerifactionEmail(token, user)
  res.json({ success: true })
}

module.exports = {
  login,
  register,
  changeProfile,
  requestNewPassword,
  resetPassword,
  verifyEmail,
  sendNewVerificationEmail
}
