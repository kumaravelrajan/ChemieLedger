import express, { response } from 'express'
import { callChainCode } from '../fabric/chaincode.service'
// import { jwtAuthentication } from './middlewares/passport'
// import { getUser } from '../services/user.service'

const fabric = express.Router()

const queryProductHistory = async (req, res, next) => {
    // const user = await getUser(req.user._id)
    try {
        const response = await callChainCode(
            user,
            'queryProductHistory',
            req.params.productID
        );
        return res.json(response)
    } catch (e) {
        res.status(400)
        res.send(e.message)
    }
}

fabric.get(
    '/:productID',
    // jwtAuthentication,
    queryProductHistory
)

module.exports = fabric