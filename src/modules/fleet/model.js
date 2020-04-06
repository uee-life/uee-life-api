const axios = require("axios")
const {executeSQL} = require('../mariadb')

const { getID } = require('../../helpers/db')
const { validCitizen } = require('../../helpers/rsi')
const { getUser } = require('../user/model')

async function getFleets(orgID) {
    return await executeSQL('SELECT * FROM v_fleet_groups WHERE org=? AND parent=0', [orgID])
}

// fleet functions

async function addFleet(usr, orgID, data) {
    // TODO: check user CAN add to this orgID

    const sql = "INSERT INTO fleet_groups ('parent', 'org', 'name', 'description') VALUES (?,?,?,?)"
    const params = [0, orgID, data.name, data.description]
    const res = await executeSQL(sql, params)
    return res
}

async function removeFleet(usr, groupID) {
    // check usr owns org that owns the fleet

    // remove all ships in the fleet group
    await executeSQL('DELETE FROM fleet_ships WHERE parent=?', [groupID])

    // delete the fleet group
    await executeSQL('DELETE FROM fleet_groups WHERE id=?', [groupID])

    return {success: 1, msg: 'Group Removed!'}
}

async function getFleet(fleetID) {
    // use a recursive query to retrieve all squadrons (groups) for given fleet
    const sql = "SELECT * FROM v_fleet_groups WHERE id=?"
    const rows = await executeSQL(sql, [fleetID])
    return rows[0]
}

async function updateFleet(usr, fleetID, data) {
    // TODO: Check permission
    const sql = "UPDATE fleet_groups SET cmdr=? WHERE id=?"
    await executeSQL(sql, [data.cmdr, fleetID])
    return {success: 1, msg: 'Commander Updated!'}
}

async function getGroups(parent) {
    const rows = await executeSQL("SELECT * FROM v_fleet_groups WHERE parent=?", [parent])
    if (rows.length > 0) {
        return rows
    } else {
        return []
    }
}

async function addGroup (usr, fleetID, data) {
    const sql = "INSERT INTO fleet_groups (parent, org, name, title) values (?, ?, ?, ?)"
    await executeSQL(sql, [fleetID, data.org, data.name, data.title])
    return {success: 1, msg: 'Group added!'}
}

async function getShips (fleetID) {
    return executeSQL('SELECT * FROM fleet_ships WHERE parent=?', [fleetID])
}

async function addShip (usr, fleetID, data) {
    
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
    removeFleet,
    getFleet,
    updateFleet,
    getGroups,
    addGroup,
    getShips,
    addShip
}