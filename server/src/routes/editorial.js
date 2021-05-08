import express from 'express'
import { body } from 'express-validator'
import { jwtAuthentication, roleAuthentication } from './middlewares/passport'
import { editorialController } from '../controllers'
import {
  validationMiddleware,
  singleImageUploadCover,
  singleImageUploadParagraph
} from './middlewares'
import {
  PARAM_REQUIRED,
  PARAM_HAS_TO_BE_NUMBERTEXT,
  PARAM_HAS_TO_BE_NUMBER,
  PARAM_WRONG_FORMAT,
  PARAM_HAS_TO_BE_BOOL
} from '../util/errorMessages'

const editorial = express.Router()

const validateArticleParams = validationMiddleware([
  body('headline', PARAM_REQUIRED)
    .exists()
    .not()
    .isEmpty()
    .withMessage(PARAM_HAS_TO_BE_NUMBERTEXT),
  body('authorName', PARAM_REQUIRED)
    .exists()
    .not()
    .isEmpty()
    .withMessage(PARAM_HAS_TO_BE_NUMBERTEXT),
  body('readingTime', PARAM_REQUIRED)
    .exists()
    .not()
    .isEmpty()
    .isInt()
    .withMessage(PARAM_HAS_TO_BE_NUMBER),
  body('articleType', PARAM_WRONG_FORMAT)
    .optional()
    .custom(value => {
      return editorialController.articleTypes.includes(value)
    })
])

const validatePatchBasicArticleParams = validationMiddleware([
  body('headline', PARAM_REQUIRED).optional(),
  body('authorName', PARAM_REQUIRED).optional(),
  body('readingTime', PARAM_REQUIRED)
    .optional()
    .not()
    .isEmpty()
    .isInt()
    .withMessage(PARAM_HAS_TO_BE_NUMBER),
  body('isPublic', PARAM_REQUIRED)
    .optional()
    .isBoolean()
    .withMessage(PARAM_HAS_TO_BE_BOOL),
  body('articleType', PARAM_WRONG_FORMAT)
    .optional()
    .custom(value => {
      return editorialController.articleTypes.includes(value)
    })
])

const validatePatchParagraph = validationMiddleware([
  body('headline', PARAM_REQUIRED).optional(),
  body('text', PARAM_REQUIRED).optional(),
  body('imageType', PARAM_WRONG_FORMAT)
    .optional()
    .custom(value => {
      return editorialController.imageTypes.includes(value)
    })
])

/**
 * @api {get} /api/v1/editorial/articlesOverview/:articleType Get a list of all articles with a specific article type (id, headline, author, date, isPublic)
 * @apiName Get ArticleList
 * @apiPermission admin, editor
 *
 * @apiSuccess (200) {json} Json object of all articles
 * @apiError (422) {json} Unexpected error
 */
editorial.get(
  '/articlesOverview/:articleType',
  jwtAuthentication,
  roleAuthentication(['admin', 'editor']),
  editorialController.getArticleTypeOverviewList
)

/**
 * @api {post} /api/v1/editorial/article/:articleType Create an article with initial data and a specific type (example, news)
 * @apiName Create Initial Article
 * @apiPermission admin, editor
 *
 * @apiParam {String} [headline] Headline of the Article
 * @apiParam {String} [authorName] Name of the Author
 * @apiParam {Integer} [readingTime] Time to read the Article
 *
 * @apiSuccess (200) {json} Json of the Article
 * @apiError (422) {json} Parameter do not have the correct format
 */
editorial.post(
  '/article/:articleType',
  jwtAuthentication,
  roleAuthentication(['admin', 'editor']),
  validateArticleParams,
  editorialController.createArticleWithType
)

/**
 * @api {delete} /api/v1/editorial/article/:id Delete a specific article
 * @apiName delete Article
 * @apiPermission admin, editor
 *
 * @apiSuccess (200) {json} Json { success: true }
 * @apiError (422) {json} Unexpected error or user not found
 */
editorial.delete(
  '/article/:id',
  jwtAuthentication,
  roleAuthentication(['admin', 'editor']),
  editorialController.deleteArticle
)

/**
 * @api {get} /api/v1/editorial/article/edit/:id Get all information about an article
 * @apiName get All article information
 * @apiPermission admin, editor
 *
 * @apiSuccess (200) {json} Json { article }
 * @apiError (422) {json} Unexpected error or article not found
 */
editorial.get(
  '/article/edit/:id',
  jwtAuthentication,
  roleAuthentication(['admin', 'editor']),
  editorialController.getAllArticleInformation
)

/**
 * @api {patch} /api/v1/editorial/article/edit/basicInformation/:id Patch basic article information
 * @apiName patch basic article information
 * @apiPermission admin, editor
 *
 * @apiSuccess (200) {json} Json object of the patched article
 * @apiError (422) {json} Unexpected error or article not found
 */
editorial.patch(
  '/article/edit/basicInformation/:id',
  jwtAuthentication,
  roleAuthentication(['admin', 'editor']),
  validatePatchBasicArticleParams,
  editorialController.patchBasicArticleInformation
)

/**
 * @api {post} /api/v1/editorial/article/edit/uploadcover/:id Upload cover image for an article
 * @apiName post upload cover image
 * @apiPermission admin, editor
 *
 * @apiSuccess (200) {json} updated article
 * @apiError (422) {json} Unexpected error or article not found
 */
editorial.post(
  '/article/edit/uploadcover/:id',
  jwtAuthentication,
  roleAuthentication(['admin', 'editor']),
  singleImageUploadCover,
  editorialController.uploadImageToArticle
)

/**
 * @api {delete} /api/v1/editorial/article/edit/deletecover/:id Delete cover image for an article
 * @apiName post upload cover image
 * @apiPermission admin, editor
 *
 * @apiSuccess (200) {json} updated article
 * @apiError (422) {json} Unexpected error or article not found
 */
editorial.delete(
  '/article/edit/deletecover/:id',
  jwtAuthentication,
  roleAuthentication(['admin', 'editor']),
  editorialController.deleteImageFromArticle
)

/**
 * @api {post} /api/v1/editorial/article/edit/paragraph/uploadimage/:articleId/:paragraphId Upload image for a paragraph of an article
 * @apiName post upload paragraph image
 * @apiPermission admin, editor
 *
 * @apiSuccess (200) {json} updated paragraph
 * @apiError (422) {json} Unexpected error or article/paragraph not found
 */
editorial.post(
  '/article/edit/paragraph/uploadimage/:articleId/:paragraphId',
  jwtAuthentication,
  roleAuthentication(['admin', 'editor']),
  singleImageUploadParagraph,
  editorialController.uploadParagraphImage
)

/**
 * @api {post} /api/v1/editorial/article/edit/addparagraph/:id Add an empty paragraph to an article
 * @apiName post add paragraph
 * @apiPermission admin, editor
 *
 * @apiSuccess (200) {json} Object of the added paragraph
 * @apiError (422) {json} Unexpected error or article not found
 */
editorial.post(
  '/article/edit/addparagraph/:id',
  jwtAuthentication,
  roleAuthentication(['admin', 'editor']),
  editorialController.addParagraph
)

/**
 * @api {delete} /api/v1/editorial/article/edit/deleteparagraph/:articleId/:paragraphId Delete a specific paragraph within a specific article
 * @apiName delete Paragraph from article
 * @apiPermission admin, editor
 *
 * @apiSuccess (200) {json} Json { article: newArticle }
 * @apiError (422) {json} Unexpected error or article/paragraph not found
 */
editorial.delete(
  '/article/edit/deleteparagraph/:articleId/:paragraphId',
  jwtAuthentication,
  roleAuthentication(['admin', 'editor']),
  editorialController.deleteParagraph
)

/**
 * @api {patch} /api/v1/editorial/article/edit/paragraph/:articleId/:paragraphId Patch a specific paragraph within a specific article
 * @apiName patch Paragraph update
 * @apiPermission admin, editor
 *
 * @apiSuccess (200) {json} Json of the paragraph
 * @apiError (422) {json} Unexpected error or article/paragraph not found
 */
editorial.patch(
  '/article/edit/paragraph/:articleId/:paragraphId',
  jwtAuthentication,
  roleAuthentication(['admin', 'editor']),
  validatePatchParagraph,
  editorialController.patchParagraph
)

module.exports = editorial
