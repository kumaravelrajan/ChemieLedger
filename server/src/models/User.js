import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { dbHideTransformation } from '../util/dbHideTransformation'
const Schema = mongoose.Schema

const availableUserRoles = ['regular', 'editor', 'admin']

// Create the schema
const userSchema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      index: true
    },
    nickname: String,
    name: String,
    surname: String,
    password: String,
    x509Identity: {
      type: String,
      default: null
    },
    x509IdentityIV: {
      type: String,
      default: null
    },
    origin: {
      type: Schema.Types.ObjectId,
      ref: 'Origin',
      default: null
    },
    roles: {
      type: [String],
      enum: availableUserRoles,
      default: ['regular']
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

// Before save: change password to encrypted password
userSchema.pre('save', function (next) {
  var user = this

  if (!user.isModified('password')) {
    return next()
  }

  bcrypt.genSalt(10, function (error, salt) {
    if (error) {
      return next(error)
    }

    bcrypt.hash(user.password, salt, function (error, hash) {
      if (error) {
        return next(error)
      }
      user.password = hash
      next()
    })
  })
})

// Check, if the not encrypted password matches the stored one
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err)
    cb(null, isMatch)
  })
}

userSchema.options.toJSON = {
  transform: dbHideTransformation,
  virtuals: false,
  alwaysHide: '__v password x509Identity x509IdentityIV',
  hide: 'createdAt updatedAt'
}

// Create the model
const User = mongoose.model('User', userSchema)

// Export the model
module.exports = {
  User,
  availableUserRoles
}
