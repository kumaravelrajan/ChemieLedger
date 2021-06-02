import express from 'express'
import { body } from 'express-validator'
import { authenticationController } from '../controllers'
import {
  PARAM_REQUIRED,
  PARAM_EMAIL_FORMAT,
  PARAM_PASSWORD_LENGTH
} from '../util/errorMessages'
import { validationMiddleware, localAuthentication } from './middlewares'
import { jwtAuthentication } from './middlewares/passport'

const authentication = express.Router()

const validateLoginParams = validationMiddleware([
  body('email', PARAM_EMAIL_FORMAT).normalizeEmail({"gmail_remove_dots": false }).isEmail(),
  body('password', PARAM_REQUIRED).exists().not().isEmpty()
])
const validateRegisterParams = validationMiddleware([
  body('nickname', PARAM_REQUIRED).exists().not().isEmpty(),
  body('name', PARAM_REQUIRED).exists().not().isEmpty(),
  body('surname', PARAM_REQUIRED).exists().not().isEmpty(),
  body('email', PARAM_EMAIL_FORMAT).isEmail().normalizeEmail({"gmail_remove_dots": false }),
  body('password', PARAM_REQUIRED)
    .exists()
    .not()
    .isEmpty()
    .isLength({ min: 5 })
    .withMessage(PARAM_PASSWORD_LENGTH)
])
const validateProfileParams = validationMiddleware([
  body('nickname', PARAM_REQUIRED).exists().not().isEmpty(),
  body('name', PARAM_REQUIRED).exists().not().isEmpty(),
  body('surname', PARAM_REQUIRED).exists().not().isEmpty(),
  body('origin').optional()
])
const validateEmailParams = validationMiddleware([
  body('email', PARAM_EMAIL_FORMAT).normalizeEmail({"gmail_remove_dots": false }).isEmail()
])
const validateResetPassword = validationMiddleware([
  body('password', PARAM_REQUIRED).exists().not().isEmpty()
])

/**
 * @api {post} /api/v1/auth/login Login a user
 * @apiName Login existing user
 * @apiPermission guest
 *
 * @apiParam {String} [email] User email
 * @apiParam {String} [password] password
 *
 * @apiSuccess (200) {json} Json of the User extended with the generated access_token
 * @apiError (422) {json} Parameter do not have the correct format
 * @apiError (401) {json} Login failed
 */
authentication.post(
  '/login',
  validateLoginParams,
  localAuthentication,
  authenticationController.login
)

authentication.post(
  '/resetRequest',
  validateEmailParams,
  authenticationController.requestNewPassword
)

authentication.post(
  '/resetPassword',
  jwtAuthentication,
  validateResetPassword,
  authenticationController.resetPassword
)

authentication.get(
  '/verifyEmail',
  jwtAuthentication,
  authenticationController.verifyEmail
)

authentication.get(
  '/sendNewVerificationEmail',
  jwtAuthentication,
  authenticationController.sendNewVerificationEmail
)

/**
 * @api {post} /api/v1/auth/register Register a new user
 * @apiName Register a new user
 * @apiPermission guest
 *
 * @apiParam {String} [nickname] Nickname
 * @apiParam {String} [name] User name
 * @apiParam {String} [surname] User surname
 * @apiParam {String} [email] User email
 * @apiParam {String} [password] password
 *
 * @apiSuccess (200) {json} Json of the new created User
 * @apiError (422) {json} Parameter do not have the correct format
 * @apiError (422) {json} User exist
 */
authentication.post(
  '/register',
  validateRegisterParams,
  authenticationController.register
)

/**
 * @api {post} /api/v1/auth/profile Change a users profile
 * @apiName Change a users profile
 * @apiPermission regular, editor, admin
 *
 * @apiParam {String} [nickname] Nickname
 * @apiParam {String} [name] User name
 * @apiParam {String} [surname] User surname
 *
 * @apiSuccess (200) {json} Json of the new created User
 * @apiError (422) {json} Parameter do not have the correct format or unexpected error
 */
authentication.patch(
  '/profile',
  jwtAuthentication,
  validateProfileParams,
  authenticationController.changeProfile
)

module.exports = authentication
