const axios = require("axios")
const {executeSQL} = require('../mariadb')

const { getID } = require('../../helpers/db')
const { validCitizen } = require('../../helpers/rsi')
const { getUser } = require('../user/model')

async function getFleets(orgID) {
    return await executeSQL('SELECT * FROM fleet_groups WHERE org=? AND parent=0', [orgID])
}

// fleet functions

async function addFleet(usr, orgID, data) {
    // TODO: check user CAN add to this orgID

    const sql = "INSERT INTO fleet_groups ('parent', 'org', 'name', 'description') VALUES (?,?,?,?)"
    const params = [0, orgID, data.name, data.description]
    const res = await executeSQL(sql, params)
    return res
}

async function removeFleet(usr, fleetID) {
    // check usr owns org that owns the fleet

    // delete the fleet
}

async function getFleet(fleetID) {
    // use a recursive query to retrieve all squadrons (groups) for given fleet
    const sql = "SELECT * FROM fleet_groups WHERE id=?"
    return await executeSQL(sql, [fleetID])
}

// crew functions

async function getCrew(shipID) {
    // retrieve the crew compliment for the provided fleet ship
}

async function addCrew(shipID) {
    // add a crewmen to the specified fleet ship
}

async function removeCrew(crewID) {
    // remove the specified crewmember
}

module.exports = {
    getFleets,
    addFleet,
    getFleet
}