import express from 'express'
import cors from 'cors'
import authentication from './authentication'
import user from './user'
import editorial from './editorial'
import article from './article'
import product from './product'
import request from './request'
import communication from './communication'
import notification from './notification'
import pricehistory from './pricehistory'
import video from './video'

const router = express.Router()
router.use('/auth', cors({ methods: 'POST, PATCH' }), authentication)
router.use('/user', cors({ methods: 'GET, PATCH, DELETE' }), user)
router.use(
  '/editorial',
  cors({ methods: 'GET, POST, DELETE, PATCH' }),
  editorial
)
router.use('/article', cors({ methods: 'GET' }), article)
router.use('/product', cors({ methods: 'GET, POST, DELETE' }), product)
router.use('/request', cors({ methods: 'GET, POST, DELETE, PATCH' }), request)
router.use('/communication', cors({ methods: 'GET, POST' }), communication)
router.use('/notification', cors({ methods: 'GET' }), notification)
router.use('/pricehistory', cors({ mothods: 'GET' }), pricehistory)
router.use('/video', cors({ mothods: 'GET' }), video)

module.exports = router
