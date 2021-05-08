import {
  getAllArticlesOfSpecificType,
  createInitialArticle,
  articleTypes,
  deleteSpecificArticle,
  getArticle,
  updateArticle,
  addEmptyParagraph,
  getParagraph,
  deleteParagraphFromArticle,
  imageTypes
} from '../services/article.service'
import { deleteFile } from '../services/file.service'
import {
  ERROR_ARTICLETYPE_NOT_VALID,
  ERROR_UNEXPECTED,
  ERROR_NO_ARTICLE_FOUND,
  ERROR_ARTICLE_NOT_UPDATED,
  ERROR_OLD_IMAGE_NOT_DELETED,
  ERROR_FILE_UPLOAD,
  ERROR_NO_PARAGRAPH_FOUND
} from '../util/errorMessages'

const getArticleTypeOverviewList = async (req, res, next) => {
  const articles = await getAllArticlesOfSpecificType(req.params.articleType)
  return res.json({ articles })
}

const createArticleWithType = async (req, res, nest) => {
  const articleType = req.params.articleType
  if (!articleTypes.includes(articleType)) {
    return res.status(422).json({
      errors: [
        {
          location: 'params',
          msg: ERROR_ARTICLETYPE_NOT_VALID,
          param: 'articleType'
        }
      ]
    })
  }
  const { headline, authorName, readingTime } = req.body
  const initialArticle = await createInitialArticle(
    headline,
    authorName,
    readingTime,
    articleType
  )
  return res.json({ article: initialArticle })
}

const deleteArticle = async (req, res, next) => {
  const article = await getArticle(req.params.id)
  if (!article) {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_NO_ARTICLE_FOUND, param: 'id' }]
    })
  } else {
    if (article.coverImagePath) {
      await deleteFile('.' + article.coverImagePath)
    }
    for (var i = 0; i < article.paragraphs.length; i++) {
      if (article.paragraphs[i].imagePath) {
        await deleteFile('.' + article.paragraphs[i].imagePath)
      }
    }
    const isDeleted = await deleteSpecificArticle(article._id)
    if (isDeleted.deletedCount > 0) {
      return res.json({ success: true })
    } else {
      return res.status(422).json({
        errors: [{ location: 'params', msg: ERROR_UNEXPECTED, param: 'id' }]
      })
    }
  }
}

const getAllArticleInformation = async (req, res, next) => {
  const article = await getArticle(req.params.id)
  if (!article) {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_NO_ARTICLE_FOUND, param: 'id' }]
    })
  } else {
    return res.json({ article: article })
  }
}

const patchBasicArticleInformation = async (req, res, next) => {
  var article = await getArticle(req.params.id)
  if (article) {
    for (var changeParam in req.body) {
      if (changeParam !== '_id') {
        article[changeParam] = req.body[changeParam]
      }
    }
    const updatedArticle = await updateArticle(article)
    if (!updatedArticle) {
      return res.status(422).json({
        errors: [
          { location: 'params', msg: ERROR_ARTICLE_NOT_UPDATED, param: '' }
        ]
      })
    } else {
      return res.json({ article: updatedArticle })
    }
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_NO_ARTICLE_FOUND, param: 'id' }]
    })
  }
}

const uploadParagraphImage = async (req, res, next) => {
  if (req.file) {
    const filePath = req.file.destination.slice(1) + '/' + req.file.filename
    var article = await getArticle(req.params.articleId)
    if (article) {
      var paragraph = await getParagraph(article, req.params.paragraphId)
      if (paragraph) {
        if (paragraph.imagePath) {
          const fileDeleted = await deleteFile('.' + article.coverImagePath)
          if (!fileDeleted) {
            return res.status(422).json({
              errors: [
                {
                  location: 'params',
                  msg: ERROR_OLD_IMAGE_NOT_DELETED,
                  param: 'id'
                }
              ]
            })
          } else {
            paragraph.imagePath = ''
          }
        }
      } else {
        await deleteFile('.' + filePath)
        return res.status(422).json({
          errors: [
            { location: 'params', msg: ERROR_NO_PARAGRAPH_FOUND, param: 'id' }
          ]
        })
      }
    } else {
      await deleteFile('.' + filePath)
      return res.status(422).json({
        errors: [
          { location: 'params', msg: ERROR_NO_ARTICLE_FOUND, param: 'id' }
        ]
      })
    }

    paragraph.imagePath = filePath
    article = await updateArticle(article)
    res.json({ paragraph: paragraph })
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_FILE_UPLOAD, param: 'id' }]
    })
  }
}

const uploadImageToArticle = async (req, res, next) => {
  if (req.file) {
    const filePath = req.file.destination.slice(1) + '/' + req.file.filename
    var article = await getArticle(req.params.id)
    if (article) {
      if (article.coverImagePath) {
        const fileDeleted = await deleteFile('.' + article.coverImagePath)
        if (!fileDeleted) {
          return res.status(422).json({
            errors: [
              {
                location: 'params',
                msg: ERROR_OLD_IMAGE_NOT_DELETED,
                param: 'id'
              }
            ]
          })
        } else {
          article.coverImagePath = ''
        }
      }
    } else {
      await deleteFile('.' + filePath)
      return res.status(422).json({
        errors: [
          { location: 'params', msg: ERROR_NO_ARTICLE_FOUND, param: 'id' }
        ]
      })
    }

    article.coverImagePath = filePath
    article = await updateArticle(article)
    res.json({ article: article })
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_FILE_UPLOAD, param: 'id' }]
    })
  }
}

const deleteImageFromArticle = async (req, res, next) => {
  var article = await getArticle(req.params.id)
  if (article) {
    if (article.coverImagePath) {
      const fileDeleted = await deleteFile('.' + article.coverImagePath)
      if (!fileDeleted) {
        return res.status(422).json({
          errors: [
            {
              location: 'params',
              msg: ERROR_OLD_IMAGE_NOT_DELETED,
              param: 'id'
            }
          ]
        })
      }
    }
    article.coverImagePath = ''
    article = await updateArticle(article)
    res.json({ article: article })
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_NO_ARTICLE_FOUND, param: 'id' }]
    })
  }
}

const addParagraph = async (req, res, next) => {
  var article = await getArticle(req.params.id)
  if (article) {
    const paragraph = await addEmptyParagraph(article)
    console.log(paragraph)
    res.json({ paragraph: paragraph })
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_NO_ARTICLE_FOUND, param: 'id' }]
    })
  }
}

const deleteParagraph = async (req, res, next) => {
  var article = await getArticle(req.params.articleId)
  if (article) {
    const paragraph = await getParagraph(article, req.params.paragraphId)
    if (paragraph) {
      if (paragraph.imagePath) {
        const fileDeleted = await deleteFile('.' + paragraph.imagePath)
        if (!fileDeleted) {
          return res.status(422).json({
            errors: [
              {
                location: 'params',
                msg: ERROR_OLD_IMAGE_NOT_DELETED,
                param: 'id'
              }
            ]
          })
        }
      }
      var newArticle = await deleteParagraphFromArticle(article, paragraph)
      if (newArticle) {
        res.json({ article: newArticle })
      } else {
        return res.status(422).json({
          errors: [
            { location: 'params', msg: ERROR_ARTICLE_NOT_UPDATED, param: '' }
          ]
        })
      }
    } else {
      return res.status(422).json({
        errors: [
          { location: 'params', msg: ERROR_NO_PARAGRAPH_FOUND, param: 'id' }
        ]
      })
    }
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_NO_ARTICLE_FOUND, param: 'id' }]
    })
  }
}

const patchParagraph = async (req, res, next) => {
  var article = await getArticle(req.params.articleId)
  if (article) {
    var paragraph = await getParagraph(article, req.params.paragraphId)
    for (var changeParam in req.body) {
      if (changeParam !== '_id') {
        paragraph[changeParam] = req.body[changeParam]
      }
    }
    const updatedArticle = await updateArticle(article)
    if (!updatedArticle) {
      return res.status(422).json({
        errors: [
          { location: 'params', msg: ERROR_ARTICLE_NOT_UPDATED, param: '' }
        ]
      })
    } else {
      return res.json({ paragraph: paragraph })
    }
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_NO_ARTICLE_FOUND, param: 'id' }]
    })
  }
}

module.exports = {
  getArticleTypeOverviewList,
  createArticleWithType,
  articleTypes,
  deleteArticle,
  getAllArticleInformation,
  patchBasicArticleInformation,
  uploadImageToArticle,
  addParagraph,
  deleteParagraph,
  patchParagraph,
  imageTypes,
  uploadParagraphImage,
  deleteImageFromArticle
}
