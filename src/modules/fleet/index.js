const { cache, checkJwt } = require('../helper')
const router = require('express').Router()

const { 
    addFleet,
    getFleet,
    updateFleet,
    getGroups,
    addGroup,
    removeFleet,
    getShips,
    addShip,
    removeShip,
    getCrew,
    addCrew,
    removeCrew
} = require('./model')

// protected
router.post('/fleets', checkJwt, async (req, res) => {
    res.send(await addFleet(req.user, req.params.orgID, req.body))
})

router.get('/fleets/:fleetID', async (req, res) => {
    res.send(await getFleet(req.params.fleetID))
})

router.put('/fleets/:fleetID', checkJwt, async (req, res) => {
    res.send(await updateFleet(req.user, req.params.fleetID, req.body))
})

router.delete('/fleets/:fleetID', checkJwt, async (req, res) => {
    res.send(await removeFleet(req.user, req.params.fleetID))
})

router.get('/fleets/:fleetID/groups', async (req, res) => {
    res.send(await getGroups(req.params.fleetID))
})

router.post('/fleets/:fleetID/groups', checkJwt, async (req, res) => {
    res.send(await addGroup(req.user, req.params.fleetID, req.body))
})

router.get('/fleets/:fleetID/ships', async (req, res) => {
    res.send(await getShips(req.params.fleetID))
})

router.post('/fleets/:fleetID/ships', checkJwt, async (req, res) => {
    res.send(await addShip(req.user, req.params.fleetID, req.body))
})

// Get crew
router.get('/fleets/:fleetID/ships/:shipID/crew', async (req, res) => {
    res.send(await getCrew(req.params.fleetID, req.params.shipID))
})

// Add crewmember
router.post('/fleets/:fleetID/ships/:shipID/crew', checkJwt, async (req, res) => {
    res.send(await addCrew(req.user, req.params.fleetID, req.params.shipID, req.body))
})

// Remove crewmember
router.delete('/fleets/:fleetID/ships/:shipID/crew/:crewID', checkJwt, async (req, res) => {
    res.send(await removeCrew(req.user, req.params.fleetID, req.params.shipID, req.params.crewID))
})

// Remove ship
router.delete('/fleets/:fleetID/ships/:shipID', checkJwt, async (req, res) => {
    res.send(await removeShip(req.user, req.params.fleetID, req.params.shipID))
})

module.exports = router