const axios = require("axios")
const {executeSQL} = require('../mariadb')

const { getID } = require('../../helpers/db')
const { validCitizen } = require('../../helpers/rsi')
const { getUser } = require('../user/model')

const manufacturers = {
    'Origin Jumpworks': 1,
    'Origin': 1,
    'Anvil Aerospace': 2,
    'Roberts Space Industries': 3,
    'RSI': 3,
    'Aegis Dynamics': 4,
    'Esperia': 5,
    'Drake Interplanetary': 6,
    'Tumbril Land Systems': 7,
    'Tumbril': 7,
    'Banu': 8,
    'Musashi Industrial & Starflight Concern': 9,
    'MISC': 9,
    'Aopoa': 10,
    'Argo Astronautics': 11,
    'Consolidated Outland': 12,
    'Kruger Intergalactic': 13,
    'Vanduul': 14,
    'Greycat Industrial': 15,
    'Crusader Industries': 16
}

const sizes = {
    'vehicle': 1,
    'snub': 2,
    'small': 3,
    'medium': 4,
    'large': 5,
    'capital': 6
}

const types = {
    'Exploration': 1,
    'Competition': 2,
    'Combat': 3,
    'Transport': 4,
    'Multi': 5,
    'Ground': 6,
    'Industrial': 7,
    'Support': 8
}

const focus = {
    'Touring': 1,
    'Expedition': 2,
    'Racing': 3,
    'Pathfinder': 4,
    'Light Fighter': 5,
    'Light Freight': 6,
    'Interdiction': 7,
    'Military': 8,
    'Snub Fighter': 9,
    'Transport':10,
    'Medium Freight':11,
    'Recon':12,
    'Medical':13,
    'Militia':14,
    'Stealth Bomber':15,
    'Medium Fighter':16,
    'Stealth Fighter':17,
    'Bomber':18,
    'Heavy Fighter':19,
    'Medium Data':20,
    'Heavy Gun Ship':21,
    'Mining':22,
    'Stealth':23,
    'Luxury':24,
    'Reporting':25,
    'Heavy Salvage':26,
    'Light Science':27,
    'Heavy Bomber':28,
    'Heavy Refuelling':29,
    'Exploration':30,
    'Dropship':31,
    'Passenger': 32
}

async function addShip(data) {
    ship_template = {
        name: '',
        make: 0,
        model: 0,
        size: 0,
        crew: 0,
        cargo: 0,
        type: 0,
        focus: 0,
        equipment: {
            weapons: {},
            turrets: {},
            missiles: {},
            shields: {}
        },
        performance: {}
    }
    ship = {
        ...ship_template,
        ...data
    }
    sql = 'INSERT INTO ships (short_name, manufacturer, model, size, max_crew, cargo, type, focus, equipment, performance) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    args = [ship.name, ship.make, ship.model, ship.size, ship.crew, ship.cargo, ship.type, ship.focus, JSON.stringify(ship.equipment), JSON.stringify(ship.performance)]
    res = await executeSQL(sql, args)
}

async function updateShip(shipID, data) {
    ship_template = {
        name: '',
        make: 0,
        model: 0,
        size: 0,
        crew: 0,
        cargo: 0,
        type: 0,
        focus: 0,
        equipment: {
            weapons: {},
            turrets: {},
            missiles: {},
            shields: {}
        },
        performance: {}
    }
    ship = {
        ...ship_template,
        ...data
    }
    // make this an update statement
    sql = 'INSERT INTO ships (short_name, manufacturer, model, size, max_crew, cargo, type, focus, equipment, performance) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    args = [ship.name, ship.make, ship.model, ship.size, ship.crew, ship.cargo, ship.type, ship.focus, JSON.stringify(ship.equipment), JSON.stringify(ship.performance)]
    res = await executeSQL(sql, args)
}

async function getToken() {
    token = await axios({
        url: 'https://api.erkul.games/informations',
        method: 'GET',
        headers: {
            authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MDU1MTE0NjF9.AY0nDZUrI0oH4-E61f1R4W-4--d5Dy4OuqqDKgBFMpA'
        }
    }).then((res) => {
        console.log("Token: ", res.data[1])
        data = res.data[1]
        return data.sessionToken
    }).catch((err) => {
        console.error(err)
        return ""
    })
    return token
}

async function testShips() {
    current_ships = getShips().ships
    if (current_ships == undefined) {
        current_ships = []
    }
    token = await getToken()
    console.log("Token", token)
    new_ships = await axios({
        url: 'https://api.erkul.games/ships/live',
        method: 'GET',
        headers: {
            authorization: 'Bearer ' + token
        }
    }).then((res) => {
        ships = []
        for (i in res.data) {
            const item = res.data[i]
            ship = {}
            ship.short_name = item.localName
            ship.manufacturer = manufacturers[item.data.manufacturer]
            ship.model = item.data.name
            ship.size = item.data.size
            ship.max_crew = item.crewSize // will have to compute this ourselves based on turret slots.
            ship.cargo = item.cargoCapacity // get from /cargos/live
            ship.type = types[item.type]
            ship.focus = focus[item.focus]
            ships += ship
            console.log(ship.short_name, ship.manufacturer)
        }
        return ships
    }).catch((err) => {
        console.error(err)
        return {success: false}
    })
    console.log(current_ships)
    console.log(new_ships)
    return {success: true, old: current_ships.length, new: new_ships.length}
}

async function syncShips() {
    let result = await axios({
        url: 'https://api.erkul.games/ships/live',
        method: 'GET'
    }).then((res) => {
        for (i in res.data) {
            const item = res.data[i]
            ship = {}
            ship.short_name = item.data.localName
            ship.manufacturer = manufacturers[item.data.manufacturer]
            ship.model = item.data.name
            ship.size = sizes[item.data.size]
            ship.max_crew = item.data.maxCrew
            ship.cargo = item.data.cargoCapacity
            ship.type = types[item.data.type]
            ship.focus = focus[item.data.focus]
            saveShip(ship)
        }
        return {success: true, count: res.data.length}
    }).catch((err) => {
        console.error(err)
        return {success: false}
    })
    return result
}

async function getShips(extraData=false) {
    if (extraData) {
        sql = 'select * from ship_view_extra order by make, model'
    } else {
        sql = 'select * from ship_view order by make, model'
    }
    
    const ships = await executeSQL(sql)

    if (extraData) {
        for(var s in ships) {
            console.log(ships[s].performance)
            ships[s].performance = JSON.parse(ships[s].performance)
            console.log(ships[s].equipment)
            ships[s].equipment = JSON.parse(ships[s].equipment)
        }
    }
    const makes = await executeSQL('select * from ship_make')
    const types = await executeSQL('select * from ship_type')
    const focus = await executeSQL('select * from ship_focus')
    const sizes = await executeSQL('select * from ship_size')
    return {
        ships: ships,
        types: types,
        focus: focus,
        makes: makes,
        sizes: sizes
    }
}

async function getShipsRaw() {
    sql = 'select * from ships order by make, model'
    const ships = await executeSQL(sql)
    const makes = await executeSQL('select * from ship_make')
    const types = await executeSQL('select * from ship_type')
    const focus = await executeSQL('select * from ship_focus')
    const sizes = await executeSQL('select * from ship_size')
    return {
        ships: ships,
        types: types,
        focus: focus,
        makes: makes,
        sizes: sizes
    }
}

async function getShip(id) {
    let ship = {}
    sql = 'select * from ship_info where id=?'
    const rows =  await executeSQL(sql, [id])
    if (rows.length !== 0) {
        ship = rows[0]
    }
    
    return ship
}

async function updateShipName(usr, ship_id, data) {
    const user = await getUser(usr)
    if (isOwner(user, ship_id) && data.name != null) {
        const res = await executeSQL('UPDATE ship_map SET name=? WHERE id=?', [data.name, ship_id])
        if (res) {
            return {success: 1, msg: 'Ship updated!'}
        } else {
            return {success: 0, msg: 'Unable to update ship'}
        }
        return 
    } else {
        return {success: 0, msg: 'Unable t0 update ship'}
    }
}

async function getCrew(id) {
    const rows = await executeSQL("SELECT id, citizen, role, joined FROM ship_crew WHERE ship=? order by role", [id])
    if (rows.length !== 0) {
        return rows
    } else {
        return []
    }
}

async function addCrew(usr, ship_id, data) {
    const user = await getUser(usr)

    if (isOwner(user, ship_id) && data.handle && data.role) {
        if (await validCitizen(data.handle)) {
            await executeSQL('INSERT INTO ship_crew (ship, citizen, role) values (?, ?, ?)', [ship_id, data.handle, data.role])
            return {success: 1, msg: 'Crewmen added!'}
        } else {
            return {success: 0, msg: 'Sorry, that citizen is invalid. Please check you are picking the right person!'}
        }
    } else {
        return {success: 0, msg: 'You don\'t own that ship!'}
    }
}

async function removeCrew(usr, crew_id) {
    const user = await getUser(usr)
    const res = await executeSQL('SELECT ship, citizen from ship_crew where id=?', [crew_id])

    if (isOwner(user, res.ship) || res.crew === user.app_metadata.handle) {
        await executeSQL('DELETE FROM ship_crew WHERE id=?', [crew_id])
        return {success: 1, msg: 'crew removed'}
    } else {
        return {success: 0, msg: 'you do not have permission to remove this crewmen'}
    }
}

async function updateCrew(usr, crew_id, data) {
    const user = await getUser(usr)
    const res = await executeSQL('SELECT ship, citizen from ship_crew where id=?', [crew_id])

    if (data.role && isOwner(user, res.ship)) {
        await executeSQL('UPDATE ship_crew SET role=? WHERE id=?', [data.role, crew_id])
        return {success: 1, msg: 'Crewmen updated'}
    } else {
        return {success: 0, msg: 'You do not have permission to update this crewmen'}
    }
}

async function isOwner(user, ship) {
    const user_id = await getID(user.app_metadata.handle)
    const rows = await executeSQL('SELECT * FROM ship_map WHERE id=? and citizen=?', [ship, user_id])
    if (rows.length > 0) {
        return true
    }
    return false
}

module.exports = {
    syncShips,
    testShips,
    getShips,
    getShipsRaw,
    updateShip,
    updateShipName,
    getShip,
    getCrew,
    addCrew,
    removeCrew,
    updateCrew,
    addShip
}
