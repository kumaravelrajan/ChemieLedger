import express from 'express'
import { body } from 'express-validator'
import { communicationController } from '../controllers'
import { jwtAuthentication } from './middlewares/passport'
import { validationMiddleware } from './middlewares'
import { PARAM_REQUIRED } from '../util/errorMessages'

const communication = express.Router()

const validatePostCommunication = validationMiddleware([
  body('message', PARAM_REQUIRED)
    .exists()
    .not()
    .isEmpty()
])

/**
 * @api {get} /api/v1/communication/request/:id Get a list of all communications related to the requestor for a request
 * @apiName Get List of communications
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json object of all related communications
 * @apiError (422) {json} Unexpected error
 */
communication.get(
  '/request/:id',
  jwtAuthentication,
  communicationController.getRequestAndUserRelatedCommunications
)

communication.get(
  '/initiated',
  jwtAuthentication,
  communicationController.getInitiatedRequestCommunications
)

communication.get(
  '/requested',
  jwtAuthentication,
  communicationController.getRequestCommunicationsAsOwner
)

communication.get(
  '/neworupdated',
  jwtAuthentication,
  communicationController.getNewOrUpdatedCommunications
)

communication.post(
  '/messageread/:communicationId',
  jwtAuthentication,
  communicationController.setCommunicationRead
)

/**
 * @api {post} /api/v1/communication/new/:requestId Create a new communication
 * @apiName Create Initial Communication
 * @apiPermission admin, editor, regular
 *
 * @apiParam {String} [message] First communication message
 *
 * @apiSuccess (200) {json} {success: true}
 * @apiError (422) {json} Unexpected error or parameter error
 */
communication.post(
  '/new/:requestId',
  jwtAuthentication,
  validatePostCommunication,
  communicationController.postNewCommunicationFromUser
)

communication.post(
  '/request/addmessage/:communicationId',
  jwtAuthentication,
  validatePostCommunication,
  communicationController.addNewMessageToCommunication
)

module.exports = communication
