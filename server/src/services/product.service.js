import { Product, ProductTitle, Unit } from '../models'

const getAllVerifiedProducts = async () => {
  var products = await Product.find({ isVerified: true })
    .populate('title')
    .populate('unit')
  return products
}

const getAllUnverifiedProducts = async () => {
  var products = await Product.find({ isVerified: false })
    .populate('title')
    .populate('unit')
  return products
}

const getProduct = async id => {
  var product = null
  try {
    product = await Product.findById(id)
      .populate('title')
      .populate('unit')
    return product
  } catch (e) {
    return null
  }
}

const getAllVerifiedProductTitles = async () => {
  var productTitles = await ProductTitle.find({ isVerified: true })
  return productTitles
}

const getAllVerifiedUnits = async () => {
  var units = await Unit.find({ isVerified: true })
  return units
}

const addOrGetProductTitle = async description => {
  var title = await ProductTitle.findOne({ description })
  if (title) {
    return title
  } else {
    title = new ProductTitle({ description })
    await title.save()
    return title
  }
}

const addProductTitleAfterDelete = async title => {
  await title.save()
  return title
}

const addUnitAfterDelete = async unit => {
  await unit.save()
  return unit
}

const addOrGetProductUnit = async (description, symbol) => {
  var unit = await Unit.findOne({ description, symbol })
  if (unit) {
    return unit
  } else {
    unit = new Unit({ description, symbol })
    await unit.save()
    return unit
  }
}

const getProductFromTitleAndUnit = async (titleId, unitId) => {
  return Product.findOne({ title: titleId, unit: unitId })
}

const getProductsFromUnit = async (unitId) => {
  return Product.find({ unit: unitId })
}

const getProductsFromTitle = async (titleId) => {
  return Product.find({ title: titleId })
}

const addProductByIds = async (titleId, unitId) => {
  var product = new Product({ title: titleId, unit: unitId })
  await product.save()
  return product
}

const verifyProduct = async product => {
  try {
    await product.save()
    return product
  } catch (e) {
    console.log(e)
    return null
  }
}

const verifyTitle = async title => {
  try {
    await title.save()
    return title
  } catch (e) {
    console.log(e)
    return null
  }
}

const verifyUnit = async unit => {
  try {
    await unit.save()
    return unit
  } catch (e) {
    console.log(e)
    return null
  }
}

const deleteSpecificProduct = async productId => {
  return Product.deleteOne({ _id: productId })
}

const deleteTitle = async titleId => {
  return ProductTitle.deleteOne({ _id: titleId })
}

const deleteUnit = async unitId => {
  return Unit.deleteOne({ _id: unitId })
}

module.exports = {
  getAllVerifiedProducts,
  getAllVerifiedProductTitles,
  getAllVerifiedUnits,
  addOrGetProductTitle,
  addProductTitleAfterDelete,
  addUnitAfterDelete,
  addOrGetProductUnit,
  getProductFromTitleAndUnit,
  getProductsFromUnit,
  getProductsFromTitle,
  addProductByIds,
  getProduct,
  getAllUnverifiedProducts,
  verifyProduct,
  verifyTitle,
  verifyUnit,
  deleteSpecificProduct,
  deleteTitle,
  deleteUnit
}
