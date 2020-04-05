const { cache, checkJwt } = require('../helper')
const router = require('express').Router()

const { 
    getFleets,
    addFleet,
    getFleet,
    getGroups,
    addGroup,
    removeFleet
} = require('./model')

router.get('/orgs/:orgID/fleets', async (req, res) => {
    res.send(await getFleets(req.params.orgID))
})

// protected
router.post('/orgs/:orgID/fleets', checkJwt, async (req, res) => {
    res.send(await addFleet(req.user, req.params.orgID, req.body))
})

router.get('/fleet/:fleetID', async (req, res) => {
    res.send(await getFleet(req.params.fleetID))
})

router.get('/fleet/:fleetID/groups', async (req, res) => {
    res.send(await getGroups(req.params.fleetID))
})

router.post('/fleet/:fleetID/groups', checkJwt, async (req, res) => {
    res.send(await addGroup(req.user, req.params.fleetID, req.body))
})

module.exports = router