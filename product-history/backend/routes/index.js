import express from 'express'
import cors from 'cors'
import fabric from './fabric'

const router = express.Router()

router.use('/', cors({ methods: 'GET' }), fabric)

module.exports = router
