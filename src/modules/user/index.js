const { cache, checkJwt } = require('../helper')
const router = require('express').Router()

const {
    getUser,
    updateHandle,
    verify,
    sync,
    randomActiveUser
} = require('./model');

// Protected
router.get("/user", checkJwt, async (req, res) => {
    res.send(await getUser(req.user).catch(err => {
        console.error(err)
        return err
    }))
})

// Protected
router.put('/user', checkJwt, async (req, res) => {
    res.send(await updateHandle(req.user, req.body.handle))
})


// Protected
// @deprecated
router.get("/user/verify", checkJwt, async (req, res) => {
    res.send(await verify(req.user));
})

// Protected
router.post("/user/verify", checkJwt, async (req, res) => {
    res.send(await verify(req.user));
})

// Protected
// @deprecated
router.get("/user/sync", checkJwt, async (req, res) => {
    res.send(await sync(req.user))
})

// Protected
router.get("/user/sync", checkJwt, async (req, res) => {
    res.send(await sync(req.user))
})

router.get("/user/random", async (req, res) => {
    res.send(await randomActiveUser())
})

module.exports = router