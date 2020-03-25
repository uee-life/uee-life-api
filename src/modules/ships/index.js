const { cache, checkJwt } = require('../helper')
const router = require('express').Router()

const { 
    syncShips,
    getShips,
    getShip,
    saveShip
} = require('./model')

router.get('/ships/sync', async (req, res) => {
    res.send(await syncShips())
})

router.get('/ships', async (req, res) => {
    res.send(await getShips())
})

router.get('/ships/:id', async (req, res) => {
    res.send(await getShip(req.params.id))
})

router.get('/ships/:id/crew', async (req, res) => {
    res.send(await getCrew(req.params.id))
})

// Add a crewmember to a ship
// protected
router.put('/ships/:id/crew', checkJwt, async (req, res) => {
    res.send(await addCrew(req.user, req.params.id, req.body))
})

// Delete a crewmember (or yourself from a crew)
router.delete('/crew/:crew_id', checkJwt, async (req, res) => {
    res.send(await removeCrew(req.user, req.params.ship_id, req.params.crew_id))
})

/*
*   Protected APIs
*/

router.post('/ships', checkJwt, async (req, res) => {
    if(req.user.permissions.includes('admin:all')) {
        res.send(await saveShip(req.body))
    } else {
        res.sendStatus(401)
    }
})

module.exports = router