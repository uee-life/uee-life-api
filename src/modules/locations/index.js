const { cache, checkJwt } = require('../helper')
const router = require('express').Router()

const {
    addLocation,
    getLocationSpec,
    getLocation,
    updateLocation,
    getLocationData,
    updateLocationData,
    getLocations,
    getPOIs
} = require('./model');

router.post('/locations', checkJwt, async (req, res) => {
    res.send(await addLocation(req.user, req.body))
})

router.get('/locations/spec', cache(60), async (req, res) => {
    res.send(await getLocationSpec())
})

router.get('/locations/:id', cache(60), async (req, res) => {
    res.send(await getLocation(req.params.id))
})

router.put('/locations/:id', checkJwt, async (req, res) => {
    res.send(await updateLocation(req.params.id, req.body))
})

router.get('/locations/:id/data', cache(60), async (req, res) => {
    res.send(await getLocationData(req.params.id))
})

router.put('/locations/:id/data', checkJwt, async (req, res) => {
    res.send(await updateLocationData(req.params.id, req.body))
})

router.get('/locations/:id/locations', cache(60), async (req, res) => {
    res.send(await getLocations(req.params.id))
})

router.get('/locations/:id/pois', cache(60), async (req, res) => {
    res.send(await getPOIs(req.params.id))
    // test
})

module.exports = router