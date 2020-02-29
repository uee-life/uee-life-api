const { cache } = require('../helper')
const router = require('express').Router()

const {
    getContent
} = require('./model');

router.get('/content/:tag', async (req, res) => {
    res.send(await getContent(req.params.tag));
})

module.exports = router