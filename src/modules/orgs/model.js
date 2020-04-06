const axios = require('axios')
const cheerio = require('cheerio')
const { convertToMarkdown } = require('../helper')
const { executeSQL } = require('../mariadb')
const { getCitizen, getOrgID } = require('../../helpers/db')
const { fetchOrgFounders, fetchOrg, fetchMembers } = require("../../helpers/rsi")


async function test() {
    return convertToMarkdown()
}


async function getOrgFounders(org) {
    return await fetchOrgFounders(org)
}

async function getOrganization(tag) {
    const org = await fetchOrg(tag)
    const orgID = await getOrgID(tag)
    org.id = orgID
    return org
}


async function getOrgMembers(org, page=1, isMain=true) {
    if(!parseInt(page)) {
        page = 1
    }
    members = await fetchMembers(org, page, isMain)

    return members
}

async function getOrgShips(org, fleet) {
    let rows = []
    if (fleet) {
        const sql = "select * from v_ship_map where tag=? and not exists (select * from fleet_ships where fleet_ships.fleet=? and  fleet_ships.ship = v_ship_map.id)"
        rows = await executeSQL(sql, [org, fleet])
    } else {
        const sql = 'select * from v_ship_map where tag=?'
        rows = await executeSQL(sql, [org])
    }
    
    let ships = []
    if (rows.length > 0) {
        for (i in [...Array(rows.length).keys()]) {
            ship = rows[i]
            ship.owner = await getCitizen(ship.citizen)
            ships.push(ship)
        }
        return ships
    } else {
        return []
    }
}
 
 const rows = await executeSQL(sql, [org_tag, fleet])
 if (rows.length > 0) {
     return rows
 } else {
     return []
 }
}


module.exports = {
    getOrganization,
    getOrgFounders,
    getOrgMembers,
    getOrgShips,
    getOrgShipPool,
    test
};
