const {executeSQL} = require('../mariadb')

const { getHandle } = require('../../helpers/db')
const { getCitizen } = require ('../citizen/model')

async function getFleets(orgID) {
    return await executeSQL('SELECT * FROM v_fleets WHERE org=?', [orgID])
}

// fleet functions

async function addFleet(usr, orgID, data) {
    // TODO: check user CAN add to this orgID

    const sql = "INSERT INTO fleet_groups (parent, org, name, purpose) VALUES (?,?,?,?)"
    const params = [0, orgID, data.name, data.purpose]
    const res = await executeSQL(sql, params)
    return {success: 1, msg: 'Fleet Added!'}
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
    if (rows.length > 0) {
        return rows[0]
    } else {
        return {}
    }
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
    const sql = "INSERT INTO fleet_groups (parent, org, name, purpose) values (?, ?, ?, ?)"
    await executeSQL(sql, [fleetID, data.org, data.name, data.purpose])
    return {success: 1, msg: 'Group added!'}
}

async function getShips (fleetID) {
    const rows = await executeSQL('SELECT * FROM fleet_ships LEFT JOIN v_ship_map ON fleet_ships.ship = v_ship_map.id WHERE parent=?', [fleetID])

    let ships = []

    if (rows.length > 0) {
        console.log('got ships')
        for (i in [...Array(rows.length).keys()]) {
            ship = rows[i]
            const owner = await getCitizen(await getHandle(ship.citizen))
            ship.owner = owner.info
            ships.push(ship)
        }
        return ships
    } else {
        console.log('no got ships')
        return []
    }
}

async function addShip (usr, fleetID, data) {
    console.log('adding ship', data)
    const sql = "INSERT INTO fleet_ships (fleet, parent, ship) values (?, ?, ?)"
    await executeSQL(sql, [fleetID, data.group, data.ship])
    return {success: 1, msg: 'Ship added!'}
}

async function removeShip (usr, fleetID, shipID) {
    const sql = "DELETE FROM fleet_ships WHERE fleet=? AND ship=?"
    await executeSQL(sql, [fleetID, shipID])
    return {success: 1, msg: 'Ship removed!'}
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
    addShip,
    removeShip
}