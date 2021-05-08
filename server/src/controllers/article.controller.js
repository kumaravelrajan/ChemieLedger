import {
  getAllPublicArticlesOfSpecificType,
  getPublicArticle
} from '../services/article.service'
import { ERROR_NO_ARTICLE_FOUND } from '../util/errorMessages'

const getPublicArticles = async (req, res, next) => {
  const articles = await getAllPublicArticlesOfSpecificType(
    req.params.articleType
  )
  return res.json({ articles })
}

const getArticle = async (req, res, next) => {
  const article = await getPublicArticle(req.params.id)
  if (article) {
    res.json({ article })
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_NO_ARTICLE_FOUND, param: 'id' }]
    })
  }
}

module.exports = {
  getPublicArticles,
  getArticle
}
