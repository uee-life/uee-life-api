const { executeSQL } = require('../modules/mariadb')

async function createCitizen(handle) {
    console.log("Creating citizen: " + handle)
    // try to load citizen from DB
    const rows = await executeSQL("SELECT * FROM citizen WHERE handle=?", [handle])

    if(rows.length === 0) {
        // if no record, add new record
        await executeSQL("INSERT INTO citizen (handle) values (?)", [handle])
        await syncCitizen(handle)
    }
}

function getID(handle) {
    sql = "SELECT id FROM citizen WHERE handle=?"
    rows = await executeSQL(sql, [handle])
    if(rows.length === 0) {
        // not found
        return 0
    } else {
        return rows[0].id
    }
}

module.exports = {
    createCitizen,
    getID
}