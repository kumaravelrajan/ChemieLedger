import express from 'express'
import cors from 'cors'
import fabric from './fabric'

const router = express.Router()

router.use('/fabric', cors({ methods: 'GET, POST' }), fabric)

module.exports = router
