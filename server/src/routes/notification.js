import express from 'express'
import { notificationController } from '../controllers'
import { jwtAuthentication } from './middlewares/passport'

const notification = express.Router()

/**
 * @api {get} /api/v1/notification/:type Check, if there is a notification of a specific type
 * @apiName Get Notification
 * @apiPermission regular, admin, editor
 *
 * @apiSuccess (200) {json} Json true/false
 * @apiError (422) {json} Unexpected error
 */
notification.get(
  '/:type',
  jwtAuthentication,
  notificationController.checkNewNotification
)

module.exports = notification
