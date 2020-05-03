const {executeSQL} = require('../mariadb')

const { getHandle, getOrgTag } = require('../../helpers/db')
const { getCitizen } = require ('../citizen/model')

// fleet functions

async function addFleet(usr, data) {
    // TODO: check user CAN add to this owner

    const sql = "INSERT INTO fleet_groups (type, owner, parent, name, purpose) VALUES (?,?,?,?)"
    const params = [data.type, data.owner, 0, data.name, data.purpose]
    const res = await executeSQL(sql, params)
    // TODO: check the sql result
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
    const sql = "SELECT * FROM fleet_groups WHERE id=?"
    const rows = await executeSQL(sql, [fleetID])
    if (rows.length > 0) {
        const fleet = rows[0]
        if (fleet.type === 1) {
            fleet.org_tag = await getOrgTag(fleet.owner)
        } else if (fleet.type === 2) {
            fleet.handle = await getHandle(fleet.owner)
        }
        return fleet
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
    const rows = await executeSQL("SELECT * FROM fleet_groups WHERE parent=?", [parent])
    if (rows.length > 0) {
        return rows
    } else {
        return []
    }
}

async function addGroup (usr, fleetID, data) {
    const sql = "INSERT INTO fleet_groups (parent, owner, name, purpose) values (?, ?, ?, ?)"
    await executeSQL(sql, [fleetID, data.owner, data.name, data.purpose])
    return {success: 1, msg: 'Group added!'}
}

async function getShips (fleetID) {
    const rows = await executeSQL('SELECT * FROM fleet_ships LEFT JOIN v_ship_map ON fleet_ships.ship = v_ship_map.id WHERE parent=?', [fleetID])

    let ships = []

    if (rows.length > 0) {
        for (i in [...Array(rows.length).keys()]) {
            ship = rows[i]
            const owner = await getCitizen(await getHandle(ship.citizen))
            ship.owner = owner.info
            ships.push(ship)
        }
        return ships
    } else {
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

async function getCrew(fleetID, shipID) {
    // retrieve the crew compliment for the provided fleet ship
    const crew = await executeSQL('SELECT * FROM fleet_personnel WHERE fleet=? AND ship=?', [fleetID, shipID])
    return crew
}

async function addCrew(fleetID, shipID, data) {
    // add a crewmen to the specified fleet ship
    await executeSQL('INSERT INTO fleet_personnel (fleet, ship, citizen, role) VALUES (?, ?, ?, ?)', [fleetID, shipID, data.citizen, data.role])
    return {success: 1, msg: 'Successfully added crewmember!'}
}

async function removeCrew(fleetID, shipID, crewID) {
    // remove the specified crewmember
    await executeSQL('DELETE FROM fleet_personnel WHERE fleet=? AND ship=? AND citizen=?')
    return {success: 1, msg: 'Successfully removed crewmember!'}
}

module.exports = {
    addFleet,
    removeFleet,
    getFleet,
    updateFleet,
    getGroups,
    addGroup,
    getShips,
    addShip,
    removeShip,
    getCrew,
    addCrew,
    removeCrew
}