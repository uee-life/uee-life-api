const {executeSQL} = require('../mariadb')


async function getSystems() {
    const systems = ['stanton','pyro']
    const systems = await executeSQL("SELECT * FROM v_systems where code in ('stanton','pyro')")
    console.log(systems)
    return systems
}

async function getSystem(id) {
    system = {}
    const rows = await executeSQL("SELECT * from system_view where id = ?", [id])
    if(rows.length > 0) { // rows + meta info
        system = rows[0]
    }
    return system;
}

async function getLocations(id) {
    return await executeSQL('SELECT * locs where parent_id = ?', [id])
}

async function getPOIs(id) {
    return await executeSQL("SELECT * FROM poi_view where system_id = ?", [id])
}

module.exports = {
    getSystems,
    getSystem, 
    getLocations, 
    getPOIs
}