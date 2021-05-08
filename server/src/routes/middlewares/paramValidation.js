import { validationResult, matchedData } from 'express-validator'

const validationMiddleware = validations => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)))
    const mappedErrors = validationResult(req).mapped()
    if (Object.getOwnPropertyNames(mappedErrors).length === 0) {
      const data = matchedData(req, { locations: ['body'] })
      req.body = data
      return next()
    }
    let errors = []
    Object.keys(mappedErrors).forEach(key => errors.push(mappedErrors[key]))
    res.status(422).json({ errors })
  }
}

module.exports = validationMiddleware
