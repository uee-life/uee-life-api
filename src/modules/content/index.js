const { cache, checkJwt } = require('../helper')
const router = require('express').Router()

const {
    getContent
} = require('./model');

router.get('/content/:tag', async (req, res) => {
    res.send(await getContent(req.params.tag));
})

router.put('/content/:tag', checkJwt, async (req, res) => {
    if(req.user.permissions.includes('write:site_content')) {
        res.send(req.user)
    } else {
        res.sendStatus(401)
    }
})

module.exports = router