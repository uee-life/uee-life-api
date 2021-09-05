const { cache, checkJwt } = require('../helper')
const router = require('express').Router()

const { 
    syncShips,
    testShips,
    updateShip,
    addShip
} = require('./model')

router.get('/admin/ships/sync', async (req, res) => {
    res.send(await syncShips())
})

router.get('/admin/ships/test', async (req, res) => {
    res.send(await testShips())
})

/*
*   Protected APIs
*/

router.post('/admin/ships', checkJwt, async (req, res) => {
    if(req.user.permissions.includes('admin:all')) {
        res.send(await addShip(req.body))
    } else {
        res.sendStatus(401)
    }
})

router.put('/admin/ships/:id', checkJwt, async(req, res) => {
    if (req.user.permissions.includes('admin:all')) {
        res.send(await updateShip(req.params.id, req.body))
    } else {
        res.sendStatus(401)
    }
})

router.delete('/admin/ships/:id', checkJwt, async (req, res) => {
    if (req.user.permissions.includes('admin:all')) {
        res.send(await deleteShip(req.params.id, req.body))
    } else {
        res.sendStatus(401)
    }
})


module.exports = router