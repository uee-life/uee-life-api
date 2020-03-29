const {executeSQL} = require('../mariadb')


async function addLocation(user, data) {
    // add location
}

async function getLocationSpec() {
    const spec = {
        types: await executeSQL('SELECT * from location_types'),
        subtypes: await executeSQL('SELECT * from location_subtypes'),
        affiliations: await executeSQL('SELECT * from affiliation')
    }
    return spec
}

async function getLocation(id) {
    res = {};
    rows = await executeSQL("SELECT * FROM locs_view WHERE id = ?", [id]);
    if(rows.length > 0) {
        res = rows[0]
    }
    return res
}

async function updateLocation(id, data) {
    // update location
}

async function getLocationData(id) {
    res = {}
    rows = await executeSQL('SELECT * FROM location_data where id = ?', [id])
    if(rows.length > 0) {
        res = rows[0]
    }
    return res
}

async function updateLocationData(id, data) {
    // update location data
}

async function getLocations(id) {
    locations = []
    rows = await executeSQL('SELECT * from locs_view WHERE parent_id = ?', [id])
    if(rows.length > 0) {
        locations = rows
    }
    return locations
}

async function getPOIs(id) {
    sql = "SELECT * FROM poi_view where parent_id=? or system_id=?"
    rows = await executeSQL(sql, [id, id])
    return rows
}

module.exports = {
    addLocation,
    getLocationSpec,
    getLocation,
    updateLocation,
    getLocationData,
    updateLocationData,
    getLocations,
    getPOIs
}