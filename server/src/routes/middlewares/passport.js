import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt'
import { User } from '../../models'
import { ERROR_LOGIN, ERROR_NOT_AUTHENTICATED } from '../../util/errorMessages'

// Local authentication with user and password
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email'
    },
    async (email, password, done) => {
      User.findOne({ email }, function (err, user) {
        if (err) {
          return done(err)
        }
        if (!user) {
          return done(null, false)
        }
        user.comparePassword(password, function (err, isMatch) {
          if (err) {
            return done(err)
          }
          if (!isMatch) {
            return done(null, false)
          }
          return done(null, user)
        })
      })
    }
  )
)

// API authentication with JWT-Token
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'LS5&t9l['
    },
    async (payload, done) => {
      try {
        User.findById(payload.sub, function (err, user) {
          if (err) {
            return done(err, false)
          }
          if (!user) {
            return done(null, false)
          }
          return done(null, user)
        })
      } catch (err) {
        done(err, false)
      }
    }
  )
)

const localAuthentication = (req, res, next) => {
  passport.authenticate('local', { session: false }, function (err, user, info) {
    if (err || !user) {
      return res.status(401).json({
        errors: [{ location: 'body', msg: ERROR_LOGIN, param: '' }]
      })
    } else {
      req.user = user
    }
    return next()
  })(req, res, next)
}

const jwtAuthentication = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, function (err, user, info) {
    if (err || !user) {
      if (info && info.name === 'TokenExpiredError') {
        return res.status(401).json({ info: info.name })
      }
      return res.status(403).json({
        errors: [{ location: 'body', msg: ERROR_NOT_AUTHENTICATED, param: '' }]
      })
    } else {
      req.user = user
    }
    return next()
  })(req, res, next)
}

const roleAuthentication = roles => {
  return function (req, res, next) {
    if (
      !req.user ||
      !req.user.roles ||
      !roles.some(role => req.user.roles.includes(role))
    ) {
      return res.status(403).json({
        errors: [{ location: 'body', msg: ERROR_NOT_AUTHENTICATED, param: '' }]
      })
    }
    return next()
  }
}

module.exports = {
  localAuthentication,
  jwtAuthentication,
  roleAuthentication
}
