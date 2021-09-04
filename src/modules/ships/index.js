const { cache, checkJwt } = require('../helper')
const router = require('express').Router()

const { 
    syncShips,
    testShips,
    getShips,
    getShipsRaw,
    getShip,
    updateShip,
    updateShipName,
    getCrew,
    addCrew,
    removeCrew,
    updateCrew,
    addShip
} = require('./model')

router.get('/ships/sync', async (req, res) => {
    res.send(await syncShips())
})

router.get('/ships/test', async (req, res) => {
    res.send(await testShips())
})

router.get('/ships', async (req, res) => {
    res.send(await getShips())
})

router.get('/ships/extra', async (req, res) => {
    res.send(await getShips(true))
})

router.get('/ships/:id', async (req, res) => {
    res.send(await getShip(req.params.id))
})

// protected
// update ship name
router.put('/ships/:id/name', checkJwt, async (req, res) => {
    res.send(await updateShipName(req.user, req.params.id, req.body))
})

router.get('/ships/:id/crew', async (req, res) => {
    res.send(await getCrew(req.params.id))
})

// Add a crewmember to a ship
// protected
router.post('/ships/:id/crew', checkJwt, async (req, res) => {
    res.send(await addCrew(req.user, req.params.id, req.body))
})

router.put('/crew/:crew_id', checkJwt, async (req, res) => {
    res.send(await updateCrew(req.user, req.params.crew_id, req.body))
})
// Delete a crewmember (or yourself from a crew)
router.delete('/crew/:crew_id', checkJwt, async (req, res) => {
    res.send(await removeCrew(req.user, req.params.crew_id))
})

/*
*   Protected APIs
*/

router.post('/ships', checkJwt, async (req, res) => {
    if(req.user.permissions.includes('admin:all')) {
        res.send(await addShip(req.body))
    } else {
        res.sendStatus(401)
    }
})

router.put('/ships/:id', checkJwt, async(req, res) => {
    if (req.user.permissions.includes('admin:all')) {
        res.send(await updateShip(req.params.id, req.body))
    } else {
        res.sendStatus(401)
    }
})


module.exports = router