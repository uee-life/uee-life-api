const { cache, checkJwt } = require('../helper')
const router = require('express').Router()

const { 
    getGroup,
    addGroup,
    removeGroup,
    updateGroup,
    getSubgroups,
    getShips,
    getShip,
    addShip,
    removeShip,
    getAllCrew,
    getShipCrew,
    addCrew,
    updateCrew,
    removeCrew,
    getCommanders
} = require('./model')

router.get('/fleets/:groupID', async (req, res) => {
    res.send(await getGroup(req.params.groupID))
})

router.put('/fleets/:groupID', checkJwt, async (req, res) => {
    res.send(await updateGroup(req.user, req.params.groupID, req.body))
})

router.delete('/fleets/:groupID', checkJwt, async (req, res) => {
    res.send(await removeGroup(req.user, req.params.groupID))
})

router.get('/fleets/:fleetID/commanders', async (req, res) => {
    res.send(await getCommanders(req.params.fleetID))
})

router.get('/fleets/:fleetID/crew', async (req, res) => {
    res.send(await getAllCrew(req.params.fleetID))
})

router.get('/fleets/:fleetID/groups', async (req, res) => {
    res.send(await getSubgroups(req.params.fleetID))
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

router.get('/fleets/:fleetID/ships/:shipID', async (req, res) => {
    res.send(await getShip(req.params.fleetID, req.params.shipID))
})

// Get crew
router.get('/fleets/:fleetID/ships/:shipID/crew', async (req, res) => {
    res.send(await getShipCrew(req.params.fleetID, req.params.shipID))
})

// Add crewmember
router.post('/fleets/:fleetID/ships/:shipID/crew', checkJwt, async (req, res) => {
    console.log('adding crewmen')
    res.send(await addCrew(req.user, req.params.fleetID, req.params.shipID, req.body))
})

// update crewmember
router.put('/fleets/:fleetID/ships/:shipID/crew/:crewID', checkJwt, async (req, res) => {
    res.send(await updateCrew(req.user, req.params.fleetID, req.params.shipID, req.params.crewID, req.body))
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