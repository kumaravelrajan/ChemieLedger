import express from 'express'
import { articleController } from '../controllers'

const article = express.Router()

/**
 * @api {get} /api/v1/article/overview/:articleType Get a list of all articles with a specific article type (id, headline, author, date, isPublic)
 * @apiName Get ArticleList
 * @apiPermission -
 *
 * @apiSuccess (200) {json} Json object of all public articles
 * @apiError (422) {json} Unexpected error
 */
article.get('/overview/:articleType', articleController.getPublicArticles)

/**
 * @api {get} /api/v1/article/:id Get a specific article
 * @apiName Get Article
 * @apiPermission -
 *
 * @apiSuccess (200) {json} Json object of the article
 * @apiError (422) {json} Unexpected error or article not found
 */
article.get('/:id', articleController.getArticle)

module.exports = article
