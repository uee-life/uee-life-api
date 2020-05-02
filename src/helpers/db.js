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

async function getCitizen(id) {
    const rows = await executeSQL("SELECT a.*, b.name FROM citizen a left join citizen_sync b on a.handle = b.handle WHERE a.id=?", [id])
    if(rows.length > 0) {
        return rows[0]
    } else {
        return null
    }
}

async function getID(handle) {
    sql = "SELECT id FROM citizen WHERE handle=?"
    rows = await executeSQL(sql, [handle])
    if(rows.length === 0) {
        // not found
        return 0
    } else {
        return rows[0].id
    }
}

async function getHandle(id) {
    const citizen = await getCitizen(id)
    if (citizen) {
        return citizen.handle
    } else {
        return null
    }
}

async function getOrg(id) {

}

async function getOrgID(tag) {
    const sql = "SELECT id FROM org WHERE tag=?"
    let rows = await executeSQL(sql, [tag])
    if(rows.length === 0) {
        //TODO: check org tag is actually a valid org
        console.log(`Adding: ${tag}`)
        // not found, add to org table
        await executeSQL("INSERT INTO org (tag) values (?)", [tag])
        rows = await executeSQL(sql, [tag])
        if (rows.length === 0) {
            return null
        }
        console.log(`found: ${rows[0].id}`)
        return rows[0].id
    } else {
        console.log(`Found: ${rows[0].id}`)
        return rows[0].id
    }
}

async function getFeeds() {
    const rows = await executeSQL('SELECT * FROM news_feeds')
    return rows
}

module.exports = {
    createCitizen,
    getCitizen,
    getID,
    getHandle,
    getOrg,
    getOrgID,
    getFeeds
}