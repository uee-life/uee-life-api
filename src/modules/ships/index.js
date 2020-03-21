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