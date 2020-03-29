const { cache, checkJwt } = require('../helper')
const router = require('express').Router()

const {
    getSystems,
    getSystem, 
    getLocations, 
    getPOIs
} = require('./model');

router.get('/systems', cache(600), async (req, res) => {
    res.send(await getSystems())
})

router.get('/systems/:id', cache(60), async (req, res) => {
    res.send(await getSystem(req.params.id));
});

router.get('/systems/:id/locations', cache(60), async (req, res) => {
    res.send(await getLocations(req.params.id));
})

router.get('/systems/:id/pois', cache(60), async (req, res) => {
    res.send(await getPOIs(req.params.id));
})

module.exports = router
