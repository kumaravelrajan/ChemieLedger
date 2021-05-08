import { Article, articleTypes, imageTypes } from '../models'

const getAllArticlesOfSpecificType = async articleType => {
  var allArticles = await Article.find({ articleType: articleType })
  var resArticleJson = await allArticles.map(function (article) {
    return article.toJSON({ hide: 'coverImagePath paragraphs' })
  })
  return resArticleJson
}

const getAllPublicArticlesOfSpecificType = async articleType => {
  var allArticles = await Article.find({
    articleType: articleType,
    isPublic: true
  })
  var resArticleJson = await allArticles.map(function (article) {
    return article.toJSON({
      hide: 'createdAt updatedAt paragraphs authorName readingTime isPublic'
    })
  })
  return resArticleJson
}

const getPublicArticle = async articleId => {
  const article = await Article.findById(articleId)
  if (article && article.isPublic) {
    return article.toJSON()
  } else {
    return null
  }
}

const createInitialArticle = async (
  headline,
  authorName,
  readingTime,
  articleType
) => {
  const newArticle = new Article({
    headline,
    authorName,
    readingTime,
    articleType
  })
  await newArticle.save()
  return newArticle.toJSON({ hide: 'coverImagePath paragraphs' })
}

const getArticle = async id => {
  try {
    const article = await Article.findById(id)
    if (article) {
      return article
    }
  } catch (e) {
    return null
  }
  return null
}

const deleteSpecificArticle = async articleId => {
  return Article.deleteOne({ _id: articleId })
}

const updateArticle = async article => {
  try {
    await article.save()
    return article
  } catch (e) {
    console.log(e)
    return null
  }
}

const addEmptyParagraph = async article => {
  var newParagraph = article.paragraphs.create({
    order: article.paragraphs.length
  })
  article.paragraphs.push(newParagraph)
  await article.save()
  return article.paragraphs.id(newParagraph._id)
}

const getParagraph = async (article, paragraphId) => {
  var paragraph = article.paragraphs.id(paragraphId)
  if (paragraph) {
    return paragraph
  }
  return null
}

const deleteParagraphFromArticle = async (article, paragraph) => {
  for (var i = 0; i < article.paragraphs.length; i++) {
    if (article.paragraphs[i].order > paragraph.order) {
      article.paragraphs[i].order = article.paragraphs[i].order - 1
    }
  }
  article.paragraphs.id(paragraph._id).remove()
  await article.save()
  return article
}

module.exports = {
  getAllArticlesOfSpecificType,
  createInitialArticle,
  articleTypes,
  deleteSpecificArticle,
  getArticle,
  updateArticle,
  addEmptyParagraph,
  getParagraph,
  deleteParagraphFromArticle,
  imageTypes,
  getAllPublicArticlesOfSpecificType,
  getPublicArticle
}
