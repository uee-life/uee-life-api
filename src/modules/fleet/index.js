const { cache, checkJwt } = require('../helper')
const router = require('express').Router()

const { 
    getFleets,
    addFleet,
    getFleet
} = require('./model')

router.get('/orgs/:orgID/fleets', async (req, res) => {
    res.send(await getFleets(req.params.orgID))
})

// protected
router.post('/orgs/:orgID/fleets', checkJwt, async (req, res) => {
    res.send(await addFleet(req.user, req.params.orgID, req.body))
})

router.get('/fleets/:fleetID', async (req, res) => {
    res.send(await getFleet(req.params.fleetID))
})
