import express from 'express'
import { body } from 'express-validator'
import { userController } from '../controllers'
import { jwtAuthentication, roleAuthentication } from './middlewares/passport'
import {
  PARAM_REQUIRED,
  PARAM_EMAIL_FORMAT,
  PARAM_PASSWORD_LENGTH,
  PARAM_WRONG_FORMAT
} from '../util/errorMessages'
import { validationMiddleware } from './middlewares'

const user = express.Router()

const validatePatchUserWhatchlistParams = validationMiddleware([
  body('requestId')
    .not()
    .isEmpty()
    .withMessage(PARAM_REQUIRED)
])

const validatePatchUserParams = validationMiddleware([
  body('name')
    .optional()
    .not()
    .isEmpty()
    .withMessage(PARAM_REQUIRED),
  body('surname', PARAM_REQUIRED)
    .optional()
    .not()
    .isEmpty(),
  body('email', PARAM_EMAIL_FORMAT)
    .optional()
    .isEmail()
    .normalizeEmail(),
  body('password', PARAM_REQUIRED)
    .optional()
    .not()
    .isEmpty()
    .isLength({ min: 5 })
    .withMessage(PARAM_PASSWORD_LENGTH),
  body('roles', PARAM_WRONG_FORMAT)
    .optional()
    .isArray()
    .custom(value => {
      return value.every(role =>
        userController.availableUserRoles.includes(role)
      )
    })
])

/**
 * @api {get} /api/v1/user Get a list of all users
 * @apiName Get Userlist
 * @apiPermission admin
 *
 * @apiSuccess (200) {json} Json object of all users
 * @apiError (422) {json} Unexpected error
 */
user.get(
  '/',
  jwtAuthentication,
  roleAuthentication(['admin']),
  userController.getUsers
)

/**
 * @api {patch} /api/v1/user/:id Patch all parameters of a specific user
 * @apiName patch User
 * @apiPermission admin
 *
 * @apiSuccess (200) {json} Json object of the patched user
 * @apiError (422) {json} Unexpected error or user not found
 */
user.patch(
  '/:id',
  jwtAuthentication,
  roleAuthentication(['admin']),
  validatePatchUserParams,
  userController.patchUser
)

/**
 * @api {delete} /api/v1/user/:id Delete a specific user
 * @apiName delete User
 * @apiPermission admin
 *
 * @apiSuccess (200) {json} Json { success: true }
 * @apiError (422) {json} Unexpected error or user not found
 */
user.delete(
  '/:id',
  jwtAuthentication,
  roleAuthentication(['admin']),
  userController.deleteUser
)

/**
 * @api {get} /api/v1/user/nickname/:id Get Nickname of specific user
 * @apiName get User nickname
 * @apiPermission regular, editor, admin
 *
 * @apiSuccess (200) {json} Json { nickname: xyz }
 * @apiError (422) {json} Unexpected error or user not found
 */
user.get('/nickname/:id', jwtAuthentication, userController.getNickname)

/**
 * @api {get} /api/v1/user/whatchlist/ids Get request ids in whatchlist
 * @apiName get Users request ids in whatchlist
 * @apiPermission regular, editor, admin
 *
 * @apiSuccess (200) {json} Json { ids: [xyz, xyz] }
 * @apiError (422) {json} Unexpected error
 */
user.get('/whatchlist/ids', jwtAuthentication, userController.getWhatchlistIds)

user.get(
  '/whatchlist/requests',
  jwtAuthentication,
  userController.getWhatchlistRequests
)

user.post(
  '/whatchlist/add',
  jwtAuthentication,
  validatePatchUserWhatchlistParams,
  userController.addItemToWhatchlist
)

user.post(
  '/whatchlist/remove',
  jwtAuthentication,
  validatePatchUserWhatchlistParams,
  userController.removeItemFromWhatchlist
)

module.exports = user
