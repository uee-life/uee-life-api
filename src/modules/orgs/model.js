const axios = require('axios')
const cheerio = require('cheerio')
const { convertToMarkdown } = require('../helper')
const { executeSQL } = require('../mariadb')
const { getCitizen } = require('../../helpers/db')
const { fetchOrgFounders, fetchOrg, fetchMembers } = require("../../helpers/rsi")


async function test() {
    return convertToMarkdown()
}


async function getOrgFounders(org) {
    return await fetchOrgFounders(org)
}

async function getOrganization(org) {
    return await fetchOrg(org)
} 

async function getOrgMembers(org, page=1, isMain=true) {
    if(!parseInt(page)) {
        page = 1
    }
    members = await fetchMembers(org, page, isMain)

    console.log({org: org, isMain: isMain})

    return members
}

async function getOrgShips(org) {
    const sql = 'select m.id, m.name, s.short_name, s.make, s.make_abbr, s.model, s.size, s.max_crew, s.cargo, s.type, s.focus, c.* from ship_map m left join ship_view s on m.ship = s.id left join (select citizen, org, tag from org_map a left join org b on a.org = b.id) c on m.citizen = c.citizen where tag=?'
    const rows = await executeSQL(sql, [org])
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


module.exports = {
    getOrganization,
    getOrgFounders,
    getOrgMembers,
    getOrgShips,
    test
};
