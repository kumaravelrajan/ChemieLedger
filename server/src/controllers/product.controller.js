import {
  getAllVerifiedProducts,
  getAllUnverifiedProducts,
  getAllVerifiedUnits,
  getAllVerifiedProductTitles,
  addOrGetProductTitle,
  addOrGetProductUnit,
  getProductFromTitleAndUnit,
  addProductByIds,
  getProduct,
  getProductsFromUnit,
  getProductsFromTitle,
  verifyProduct,
  verifyTitle,
  verifyUnit,
  deleteSpecificProduct,
  deleteTitle,
  deleteUnit,
  addProductTitleAfterDelete,
  addUnitAfterDelete
} from '../services/product.service'
import {
  ERROR_NO_PRODUCT_FOUND,
  ERROR_PRODUCT_NOT_UPDATED,
  ERROR_UNEXPECTED,
  ERROR_TITLE_NOT_UPDATED,
  ERROR_UNIT_NOT_UPDATED
} from '../util/errorMessages'

const getPublicProductInformation = async (req, res, next) => {
  var products = await getAllVerifiedProducts()
  var units = await getAllVerifiedUnits()
  var productTitles = await getAllVerifiedProductTitles()
  return res.json({ products, units, productTitles })
}

const addProduct = async (req, res, next) => {
  var { productTitle, productUnit, productUnitSymbol } = req.body
  var newProductTitle = await addOrGetProductTitle(productTitle)
  var newProductUnit = await addOrGetProductUnit(productUnit, productUnitSymbol)

  var product = await getProductFromTitleAndUnit(
    newProductTitle._id,
    newProductUnit._id
  )

  if (product) {
    return res.json({})
  } else {
    product = await addProductByIds(newProductTitle._id, newProductUnit._id)
    return res.json({ product })
  }
}

const getProductInformation = async (req, res, next) => {
  var product = await getProduct(req.params.id)
  if (product) {
    return res.json({ product })
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_NO_PRODUCT_FOUND, param: 'id' }]
    })
  }
}

const getUnverifiedProducts = async (req, res, next) => {
  var products = await getAllUnverifiedProducts()
  return res.json({ products })
}

const updateUnverifiedProduct = async (req, res, next) => {
  var product = await getProduct(req.params.id)
  if (product) {
    product.isVerified = true
    var verifiedProduct = await verifyProduct(product)
    if (verifiedProduct) {
      if (!product.title.isVerified) {
        product.title.isVerified = true
        var verifiedTitle = await verifyTitle(product.title)
        if (!verifiedTitle) {
          return res.status(422).json({
            errors: [{ location: 'params', msg: ERROR_TITLE_NOT_UPDATED, param: '' }]
          })
        }
      }
      if (!product.unit.isVerified) {
        product.unit.isVerified = true
        var verifiedUnit = await verifyUnit(product.unit)
        if (!verifiedUnit) {
          return res.status(422).json({
            errors: [{ location: 'params', msg: ERROR_UNIT_NOT_UPDATED, param: '' }]
          })
        }
      }
      return res.json({ success: true })
    } else {
      return res.status(422).json({
        errors: [{ location: 'params', msg: ERROR_PRODUCT_NOT_UPDATED, param: '' }]
      })
    }
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_NO_PRODUCT_FOUND, param: 'id' }]
    })
  }
}

const deleteProduct = async (req, res, next) => {
  var productToDelete = await getProduct(req.params.id)
  if (productToDelete) {
    var productTitleToDelete = productToDelete.title
    var unitToDelete = productToDelete.unit
    if (!productTitleToDelete.isVerified) {
      var productsWithTitle = await getProductsFromTitle(productTitleToDelete._id)
      if (!productsWithTitle.length > 1) {
        const isTitleDeleted = await deleteTitle(productTitleToDelete._id)
        if (!isTitleDeleted.deletedCount) {
          return res.status(422).json({
            errors: [{ location: 'params', msg: ERROR_UNEXPECTED, param: '' }]
          })
        }
      }
    }
    if (!unitToDelete.isVerified) {
      var unitsWithTitle = await getProductsFromUnit(unitToDelete._id)
      if (!unitsWithTitle.length > 1) {
        const isUnitDeleted = await deleteUnit(unitToDelete._id)
        if (!isUnitDeleted.deletedCount) {
          // revert the deletion of the title
          await addProductTitleAfterDelete(productTitleToDelete)
          return res.status(422).json({
            errors: [{ location: 'params', msg: ERROR_UNEXPECTED, param: '' }]
          })
        }
      }
    }

    const isDeleted = await deleteSpecificProduct(req.params.id)
    if (isDeleted.deletedCount > 0) {
      return res.json({ success: true })
    } else {
      // revert the deletion of the title and unit
      if (!productTitleToDelete.isVerified) {
        await addProductTitleAfterDelete(productTitleToDelete)
      }
      if (!unitToDelete.isVerified) {
        await addUnitAfterDelete(unitToDelete)
      }
      return res.status(422).json({
        errors: [{ location: 'params', msg: ERROR_UNEXPECTED, param: '' }]
      })
    }
  } else {
    return res.status(422).json({
      errors: [{ location: 'params', msg: ERROR_NO_PRODUCT_FOUND, param: 'id' }]
    })
  }
}

module.exports = {
  getPublicProductInformation,
  addProduct,
  getProductInformation,
  getUnverifiedProducts,
  updateUnverifiedProduct,
  deleteProduct
}
