import express from 'express'
import { callChainCode } from '../fabric/chaincode.service'

const fabric = express.Router()

const queryProductHistory = async (req, res, next) => {
    console.log(req.params.sourceId)
    try {
        const response = await callChainCode(
            'queryProductHistory',
            req.params.sourceId
        );
        return res.json(response)
    } catch (e) {
        res.status(400)
        res.send(e.message)
    }
}

fabric.get(
    '/:sourceId',
    queryProductHistory
)

module.exports = fabric