import express from 'express'
import { body } from 'express-validator'
import { productController } from '../controllers'
import { jwtAuthentication, roleAuthentication } from './middlewares/passport'
import { validationMiddleware } from './middlewares'
import { PARAM_REQUIRED } from '../util/errorMessages'

const product = express.Router()

const validatePostProduct = validationMiddleware([
  body('productTitle', PARAM_REQUIRED)
    .exists()
    .not()
    .isEmpty(),
  body('productUnit', PARAM_REQUIRED)
    .exists()
    .not()
    .isEmpty(),
  body('productUnitSymbol', PARAM_REQUIRED).optional()
])

/**
 * @api {get} /api/v1/product Get a list of all verified products
 * @apiName Get verified ProductList
 * @apiPermission -
 *
 * @apiSuccess (200) {json} Json object of all products
 * @apiError (422) {json} Unexpected error
 */
product.get('', productController.getPublicProductInformation)

/**
 * @api {get} /api/v1/product Get a list of all unverified products
 * @apiName Get unverified ProductList
 * @apiPermission admin
 *
 * @apiSuccess (200) {json} Json object of all products
 * @apiError (422) {json} Unexpected error
 */
product.get(
  '/unverifiedproducts',
  jwtAuthentication,
  roleAuthentication(['admin']),
  productController.getUnverifiedProducts
)

product.post(
  '/verifyproduct/:id',
  jwtAuthentication,
  roleAuthentication(['admin']),
  productController.updateUnverifiedProduct
)

product.delete(
  '/:id',
  jwtAuthentication,
  roleAuthentication(['admin']),
  productController.deleteProduct
)

/**
 * @api {post} /api/v1/product Create a new product category
 * @apiName Create Initial Product
 * @apiPermission admin, editor
 *
 * @apiParam {String} [productTitle] Title of the product
 * @apiParam {String} [productUnit] Unit
 * @apiParam {Integer} [productUnitSymbol] Short unit symbol
 *
 * @apiSuccess (200) {json} Json of the Product
 * @apiError (422) {json} Unexpected error or parameter error
 */
product.post(
  '',
  jwtAuthentication,
  validatePostProduct,
  productController.addProduct
)

/**
 * @api {get} /api/v1/product/:id Get a specific product
 * @apiName Get ProductList
 * @apiPermission -
 *
 * @apiSuccess (200) {json} Json object the requested Product
 * @apiError (422) {json} Unexpected error
 */
product.get('/:id', jwtAuthentication, productController.getProductInformation)

module.exports = product
