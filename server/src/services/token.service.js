import JWT from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const jwtSecret = process.env.JWT_SECRET || 'LS5&t9l['
const jwtExpirationTime = process.env.JWT_EXPIRATION_HOURS || 1

const generateToken = userId => {
  const tokenTemplate = {
    iss: 'Rohstoffboerse',
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + jwtExpirationTime * (60 * 60)
  }

  return JWT.sign(tokenTemplate, jwtSecret)
}

const generateTokenValidForMinutes = (userId, minutes) => {
  const tokenTemplate = {
    iss: 'Rohstoffboerse',
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + minutes * (60)
  }
  return JWT.sign(tokenTemplate, jwtSecret)
}

module.exports = {
  generateToken,
  generateTokenValidForMinutes
}
