import express from 'express'
import { callChainCode } from '../fabric/chaincode.service'
import { jwtAuthentication } from './middlewares/passport'
import { getUser } from '../services/user.service'

const fabric = express.Router()

const addProduct = async (req, res, next) => {
    let p = req.body.product
    const user = await getUser(req.user._id)
    try {
        const response = await callChainCode(
            user,
            'addProduct',
            `${p.productName}`,
            p.producedAmount,
            p.unit,
            p.dateOfProduction,
            JSON.stringify(p.locationOfProduction),
            JSON.stringify(p.certificates),
            JSON.stringify(p.productMaterial)
        )
        return res.json(response)
    } catch (e) {
        res.status(400)
        res.send(e.message)
    }
}

const getProduct = async (req, res, next) => {
    const user = await getUser(req.user._id)
    try {
        const response = await callChainCode(
            user,
            'getProduct',
            req.params.id);
        return res.json(response)
    } catch (e) {
        res.status(400)
        res.send(e.message)
    }
}

const setRemainingSource = async (req, res, next) => {
    console.log('+++++++++++++++++')
    const user = await getUser(req.user._id)
    console.log(req.params)
    try {
        const response = await callChainCode(
            user,
            'setRemainingSource',
            req.params.sourceId,
            req.params.newAmount
        );
        return res.json(response)
    } catch (e) {
        res.status(400)
        res.send(e.message)
    }
}

const addTrade = async (req, res, next) => {
    const user = await getUser(req.user._id)
    console.log(req.body)
    const trade = req.body.trade
    try {
        const response = await callChainCode(
            user,
            'addTrade',
            trade.sourceId,
            trade.buyer,
            trade.amountTransferred
        );
        return res.json(response)
    } catch (e) {
        res.status(400)
        res.send(e.message)
    }
}

const queryProductHistory = async (req, res, next) => {
    const user = await getUser(req.user._id)
    try {
        const response = await callChainCode(
            user,
            'queryProductHistory',
            req.params.sourceId
        );
        return res.json(response)
    } catch (e) {
        res.status(400)
        res.send(e.message)
    }
}

const queryWalletGroup = async (req, res, next) => {
    const user = await getUser(req.user._id)
    try {
        const response = await callChainCode(
            user,
            'queryWalletGroup'
        );
        return res.json(response)
    } catch (e) {
        res.status(400)
        res.send(e.message)
    }
}

const registerLinkProposal = async (req, res, next) => {
    const user = await getUser(req.user._id)
    try {
        const response = await callChainCode(
            user,
            'registerLinkProposal',
            req.params.userId
        );
        return res.json(response)
    } catch (e) {
        res.status(400)
        res.send(e.message)
    }
}

const confirmLinkTo = async (req, res, next) => {
    const user = await getUser(req.user._id)
    try {
        const response = await callChainCode(
            user,
            'confirmLinkTo',
            req.params.userId,
            req.params.linkProposalID
        );
        return res.json(response)
    } catch (e) {
        res.status(400)
        res.send(e.message)
    }
}

const removeUserFromWalletGroup = async (req, res, next) => {
    const user = await getUser(req.user._id)
    try {
        const response = await callChainCode(
            user,
            'removeUserFromWalletGroup',
            req.params.userId,
        );
        return res.json(response)
    } catch (e) {
        res.status(400)
        res.send(e.message)
    }
}

const getUserID = async (req, res, next) => {
    const user = await getUser(req.user._id)
    try {
        const response = await callChainCode(
            user,
            'getUserID'
        );
        return res.json(response)
    } catch (e) {
        res.status(400)
        res.send(e.message)
    }
}


fabric.post(
    '/addProduct',
    jwtAuthentication,
    addProduct
)

fabric.get(
    '/getProduct/:id',
    jwtAuthentication,
    getProduct
)

fabric.patch(
    '/setRemainingSource/:sourceId/:newAmount',
    jwtAuthentication,
    setRemainingSource
)

fabric.post(
    '/addTrade',
    jwtAuthentication,
    addTrade
)

fabric.get(
    '/queryProductHistory/:sourceId',
    jwtAuthentication,
    queryProductHistory
)

fabric.get(
    '/queryWalletGroup',
    jwtAuthentication,
    queryWalletGroup
)

fabric.post(
    '/registerLinkProposal/:userId',
    jwtAuthentication,
    registerLinkProposal
)

fabric.post(
    '/confirmLinkTo/:userId/:linkProposalID',
    jwtAuthentication,
    confirmLinkTo
)

fabric.delete(
    '/removeUserFromWalletGroup/:userId',
    jwtAuthentication,
    removeUserFromWalletGroup
)

fabric.get(
    '/getUserID',
    jwtAuthentication,
    getUserID
)

module.exports = fabric