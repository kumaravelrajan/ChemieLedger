import express from 'express'
import { body } from 'express-validator'
import { jwtAuthentication } from './middlewares/passport'
import { validationMiddleware } from './middlewares'
import { PARAM_REQUIRED } from '../util/errorMessages'
import { requestController } from '../controllers'
import { singleImageUploadRequest } from './middlewares/imageUpload'

const request = express.Router()

const validatePostRequest = validationMiddleware([
  body('isOffer', PARAM_REQUIRED).exists().not().isEmpty().isBoolean(),
  body('productId').optional()
])

const validateCloseRequest = validationMiddleware([
  body('price', PARAM_REQUIRED).exists().not().isEmpty(),
  body('amount', PARAM_REQUIRED).exists().not().isEmpty()
])

const validatePatchRequest = validationMiddleware([
  body('title').optional(),
  body('plz').optional().isInt(),
  body('amount').optional().isDecimal(),
  body('availableTo').optional(),
  body('usage').optional(),
  body('features').optional(),
  body('delivery').optional().isBoolean(),
  body('description').optional(),
  body('isDraft').optional().isBoolean(),
  body('negotiation').optional().isBoolean(),
  body('price').optional().isDecimal(),
  body('product').optional(),
  body('usage').optional(),
  body('origin').optional(),
  body('subOrigin').optional()
])

request.post(
  '/deleterequest/:requestId',
  jwtAuthentication,
  validateCloseRequest,
  requestController.closeRequestWithLastPrice
)

request.post(
  '/deleterequestwithoutdeal/:requestId',
  jwtAuthentication,
  requestController.closeRequestWithoutDeal
)

/**
 * @api {get} /api/v1/request/offers Get all public offers
 * @apiName Get public offers
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json of all public offers
 * @apiError (422) {json} Unexpected error
 */
request.get('/offers', jwtAuthentication, requestController.getAvailableOffers)

/**
 * @api {get} /api/v1/request/requests Get all public requests
 * @apiName Get public requests
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json of all public requests
 * @apiError (422) {json} Unexpected error
 */
request.get(
  '/requests',
  jwtAuthentication,
  requestController.getAvailableRequests
)

/**
 * @api {get} /api/v1/request/all Get all requests and offers
 * @apiName Get public requests and offers
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json of all public requests and offers
 * @apiError (422) {json} Unexpected error
 */
request.get('/all', jwtAuthentication, requestController.getAllAvailableData)

/**
 * @api {get} /api/v1/request/ownoffers Get all own offers
 * @apiName Get own offers
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json of all own offers
 * @apiError (422) {json} Unexpected error
 */
request.get('/ownoffers', jwtAuthentication, requestController.getOwnOffers)

/**
 * @api {get} /api/v1/request/ownrequests Get all own requests
 * @apiName Get own requests
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json of all own requests
 * @apiError (422) {json} Unexpected error
 */
request.get(
  '/ownrequests',
  jwtAuthentication,
  requestController.getOwnRequests
)

/**
 * @api {get} /api/v1/request/ownoffers Get all own offers in draft
 * @apiName Get own offers in draft
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json of all own offers in draft
 * @apiError (422) {json} Unexpected error
 */
request.get(
  '/ownoffers/draft',
  jwtAuthentication,
  requestController.getOwnDraftOffers
)

request.get(
  '/ownoffers/archive',
  jwtAuthentication,
  requestController.getOwnArchiveOffers
)

request.get(
  '/own/all',
  jwtAuthentication,
  requestController.getOwnOffersAndRequests
)

request.get(
  '/own/draft',
  jwtAuthentication,
  requestController.getOwnDraftOffersAndRequests
)

request.get(
  '/own/archive',
  jwtAuthentication,
  requestController.getOwnArchiveOffersAndRequests
)

/**
 * @api {get} /api/v1/request/ownrequests Get all own requests in draft
 * @apiName Get own requests in draft
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json of all own requests in draft
 * @apiError (422) {json} Unexpected error
 */
request.get(
  '/ownrequests/draft',
  jwtAuthentication,
  requestController.getOwnDraftRequests
)

request.get(
  '/ownrequests/archive',
  jwtAuthentication,
  requestController.getOwnArchiveRequests
)

/**
 * @api {get} /api/v1/request/offers/:id Get all public offers of a product
 * @apiName Get public offers of a product
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json of all public offers of a product
 * @apiError (422) {json} Unexpected error
 */
request.get(
  '/offers/:id',
  jwtAuthentication,
  requestController.getAvailableProductOffers
)

/**
 * @api {get} /api/v1/request/requests Get all public requests of a product
 * @apiName Get public requests of a product
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json of all public requests of a product
 * @apiError (422) {json} Unexpected error
 */
request.get(
  '/requests/:id',
  jwtAuthentication,
  requestController.getAvailableProductRequests
)

/**
 * @api {get} /api/v1/request/parentorigin Get available parent origins
 * @apiName Get Origins
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json of origins
 * @apiError (422) {json} Unexpected error
 */
request.get(
  '/parentorigin',
  jwtAuthentication,
  requestController.getAvailableParentOrigins
)

/**
 * @api {get} /api/v1/request/parentorigin Get available parent origins
 * @apiName Get Origins
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json of origins
 * @apiError (422) {json} Unexpected error
 */
request.get(
  '/origin/:parentId',
  jwtAuthentication,
  requestController.getAvailableOriginsWithParent
)

/**
 * @api {post} /api/v1/request Create a new request
 * @apiName Create Initial Request
 * @apiPermission admin, editor, regular
 *
 * @apiParam {String} [productTitle] Title of the product
 * @apiParam {String} [productUnit] Unit
 * @apiParam {Integer} [productUnitSymbol] Short unit symbol
 *
 * @apiSuccess (200) {json} Json of the Product
 * @apiError (422) {json} Unexpected error or parameter error
 */
request.post(
  '',
  jwtAuthentication,
  validatePostRequest,
  requestController.generateRequest
)

/**
 * @api {delete} /api/v1/request/:id Delete specific request
 * @apiName Delete Request
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json { success: true }
 * @apiError (422) {json} Unexpected error or request not found
 */
request.delete('/:id', jwtAuthentication, requestController.deleteRequest)

/**
 * @api {get} /api/v1/request/:id Get specific request
 * @apiName Get Request
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json of the request
 * @apiError (422) {json} Unexpected error or request not found
 */
request.get('/:id', jwtAuthentication, requestController.getSpecificRequest)

/**
 * @api {patch} /api/v1/request/:id Get specific request
 * @apiName Patch Request
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} Json { success: true }
 * @apiError (422) {json} Unexpected error or request not found
 */
request.patch(
  '/:id',
  jwtAuthentication,
  validatePatchRequest,
  requestController.patchSpecificRequest
)

/**
 * @api {post} /api/v1/request/addimage/:id Upload image for an request
 * @apiName post upload cover image
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} { imgPaths }
 * @apiError (422) {json} Unexpected error or article not found
 */
request.post(
  '/addimage/:id',
  jwtAuthentication,
  singleImageUploadRequest,
  requestController.uploadImageToRequest
)

/**
 * @api {post} /api/v1/request/deleteimage/:id Delete image from request
 * @apiName post delete image
 * @apiPermission admin, editor, regular
 *
 * @apiSuccess (200) {json} { imgPaths }
 * @apiError (422) {json} Unexpected error or article not found
 */
request.post(
  '/deleteimage/:id',
  jwtAuthentication,
  requestController.deleteImageFromRequest
)

module.exports = request
