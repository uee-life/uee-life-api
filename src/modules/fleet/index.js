const { cache, checkJwt } = require('../helper')
const router = require('express').Router()

const { 
    getFleets,
    addFleet,
    getFleet,
    updateFleet,
    getGroups,
    addGroup,
    removeFleet,
    getShips,
    addShip
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

router.put('/fleet/:fleetID', checkJwt, async (req, res) => {
    res.send(await updateFleet(req.user, req.params.fleetID, req.body))
})

router.delete('/fleet/:fleetID', checkJwt, async (req, res) => {
    res.send(await removeFleet(req.user, req.params.fleetID))
})

router.get('/fleet/:fleetID/groups', async (req, res) => {
    res.send(await getGroups(req.params.fleetID))
})

router.post('/fleet/:fleetID/groups', checkJwt, async (req, res) => {
    res.send(await addGroup(req.user, req.params.fleetID, req.body))
})

router.get('/fleet/:fleetID/ships', async (req, res) => {
    res.send(await getShips(req.params.fleetID))
})

router.post('/fleet/:fleetID/ships', checkJwt, async (req, res) => {
    res.send(await addShip(req.user, req.params.fleetID, req.body))
})

module.exports = router