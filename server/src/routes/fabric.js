import express, { response } from 'express'
import { callChainCode } from '../fabric/chaincode.service'
import { jwtAuthentication } from './middlewares/passport'
import { getUser } from '../services/user.service'

const fabric = express.Router()

const addProduct = async (req, res, next) => {
    let { user } = req.body
    user = await getUser(user._id)
    try {
        response = await callChainCode(user, 'addProduct', 'ABC', 50.2, 'kg', 0, '{}', '[]', '{}')
        return res.json(response)
    } catch (e) {
        return res.status(500)
    }
}

fabric.post(
    '',
    jwtAuthentication,
    addProduct
)

module.exports = fabric