const axios = require("axios")
const { executeSQL } = require('../mariadb')

const { getID } = require('../../helpers/db')
const { validCitizen } = require('../../helpers/rsi')
const { getUser } = require('../user/model')

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

async function addShip(data) {
    ship_template = {
        name: '',
        make: 0,
        model: 0,
        size: 0,
        max_crew: 0,
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
    /*sql = 'INSERT INTO ships (short_name, make, model, size, max_crew, cargo, type, focus, equipment, performance, modifier) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    args = [ship.name, ship.make, ship.model, ship.size, ship.max_crew, ship.cargo, ship.type, ship.focus, JSON.stringify(ship.equipment), JSON.stringify(ship.performance), ship.modifier]
    res = await executeSQL(sql, args)*/
    
    query = "MERGE {ship:Ship " +
        "{ name: $name, make: $make, model: $model, size: $size, max_crew: $max_crew, cargo: $cargo, type: $type, focus: $focus}} " +
        "RETURN ship"
}

async function updateShip(shipID, data) {
    ship_template = {
        name: '',
        make: 0,
        model: 0,
        size: 0,
        max_crew: 0,
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
    //sql = 'INSERT INTO ships (short_name, make, model, size, max_crew, cargo, type, focus, equipment, performance) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    sql = 'UPDATE ships SET short_name=?, make=?, model=?, size=?, max_crew=?, cargo=?, type=?, focus=?, equipment=?, performance=?, modifier=? WHERE id=?'
    args = [ship.name, ship.make, ship.model, ship.size, ship.max_crew, ship.cargo, ship.type, ship.focus, JSON.stringify(ship.equipment), JSON.stringify(ship.performance), ship.modifier, shipID]
    res = await executeSQL(sql, args)
}

async function deleteShip(shipID) {
    sql = 'DELETE FROM ships WHERE id=?'
    res = await executeSQL(sql, [shipID])
}

module.exports = { 
    syncShips,
    testShips,
    updateShip,
    addShip,
    deleteShip
}