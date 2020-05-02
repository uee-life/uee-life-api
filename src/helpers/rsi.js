const axios = require('axios')
const cheerio = require('cheerio')

const { convertToMarkdown } = require('../modules/helper')
const { getID } = require('./db')

async function validCitizen(handle) {
    const res = await fetchCitizen(handle)
    console.log(res)
    if (res) {
        return true
    } else {
        return false
    }
}

async function fetchCitizen(handle) {
    console.log('fetching citizen...')

    const baseURI = 'https://robertsspaceindustries.com'
    const res = await axios({
        url: `${baseURI}/citizens/${handle}`,
        method: 'GET'
    }).then(async (resp) => {
        const $ = cheerio.load(resp.data)
        info = {}
        info.handle = handle
        info.record = $('span:contains("UEE Citizen Record")', '#public-profile').next().text()
        info.name = $('div.profile.left-col', '#public-profile').find('div.info').find('p.entry').find('strong.value').html()
        info.bio = $('span:contains("Bio")', '#public-profile').next().text()
        info.enlisted = $("span:contains('Enlisted')", '#public-profile').next().text()
        info.portrait = 'https://robertsspaceindustries.com/rsi/static/images/account/avatar_default_big.jpg'
        let image = $('div.thumb', '#public-profile').children()[0]
        if (image && image.attribs.src) {
            info.portrait = `${baseURI}${image.attribs.src}`
        }
        info.org = $('span:contains("Spectrum Identification (SID)")', '#public-profile').next().text()
        info.orgTitle = $('span:contains("Organization rank")', '#public-profile').next().text()
        info.orgRank = await fetchOrgRank(org, handle)
        info.website = $('span:contains("Website")', '#public-profile').next().attr('href') || ''
        info.verified = 0
        return info
    }).catch((error) => {
        console.error("fetchCitizen - Error retrieving citizen: ", error)
        return null
    })
    return res
}

async function fetchOrg(org) {
    const baseURI = "https://robertsspaceindustries.com"
    const resp = await axios({
        url: baseURI + '/orgs/' + org,
        method: 'GET'
    }).then(async (resp) => {
        const $ = cheerio.load(resp.data)
        info = {}
        info.name = $('h1', '#organization').text().split("/")[0].trim()
        info.banner = baseURI + $('div.banner', '#organization').find('img').attr('src')
        info.logo = baseURI + $('div.logo', '#organization').find('img').attr('src')
        info.count = $('div.logo', '#organization').find('span').text().split(" ")[0]
        info.model = $('ul.tags', '#organization').find('li.model').text()
        info.roles = {}
        info.roles.primary = $('ul.focus', '#organization').find('li.primary').find('img').attr('alt')
        info.roles.secondary = $('ul.focus', '#organization').find('li.secondary').find('img').attr('alt')
        info.intro = await convertToMarkdown($('div.join-us', '#organization').find('div.markitup-text').html())
        info.history = await convertToMarkdown($('h2:contains("History")', '#organization').next().html())
        info.manifesto = await convertToMarkdown($('h2:contains("Manifesto")', '#organization').next().html())
        info.charter = await convertToMarkdown($('h2:contains("Charter")', '#organization').next().html())
        info.founders = await fetchOrgFounders(org)
        
        info.tag = org

        return info
    }).catch((err) => {
        console.error(error)
        return {error: "Org Not found!"}
    })
    return resp
}

async function fetchOrgFounders(org) {
    try {
        const url = 'https://robertsspaceindustries.com/api/orgs/getOrgMembers'
        const data = `{"symbol": "${org}", "rank":1}`
        const resp = await axios({
            url: url,
            method: 'POST',
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const $ = cheerio.load(resp.data.data.html)
        founders = []
        $('li.member-item').each(function (i, el) {
            let handle = $(el).find('span.nick').text()
            let name = $(el).find('span.name').text()
            founders[i] = {}
            founders[i]['name'] = name
            founders[i]['handle'] = handle
        })
        return founders
    } catch (error) {
        console.error(error)
        return {error: "Org not found!"}
    }
}

async function checkCitizens(members) {
    for(i in members) {
        if(members[i].handle !== 'Redacted') {
            const id = await getID(members[i].handle)
            if(id !== 0) {
                members[i].verified = true
            }
        }
    }
    return members
}

function computeRank(stars) {
    let rank = 0

    if (stars) {
        starsize = parseInt(stars.match(/width\:\ (.*)\%/)[1])
        if(starsize) {
            rank = starsize / 20
        }

    } else {
        rank = 0
    }

    return rank
}

async function fetchMembers(org, page=1, isMain=true, handle='') {
    let res = {
        count: 0,
        members: []
    }

    console.log("isMain: ", isMain)

    try {
        const url = "https://robertsspaceindustries.com/api/orgs/getOrgMembers"
        let i = 0
        data = {
            symbol: org,
            search: handle,
            pagesize: 32,
            main_org: isMain == true ? "1" : "0",
            page: page
        }

        console.log(data)

        res = await axios({
            url: url,
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            data: data
        }).then((res) => {
            let members = []
            const totalMembers = res.data.data.totalrows
            const html = res.data.data.html
            const $ = cheerio.load(html)

            $('li.member-item').each(function (i, el) {
                let handle = $(el).find('span.nick').text()
                let name = $(el).find('span.name').text()

                let thumb = 'https://robertsspaceindustries.com/rsi/static/images/account/avatar_default_big.jpg'
                thumbimg = $(el).find('span.thumb').find('img')[0]
                if(thumbimg && thumbimg.attribs.src) {
                    thumb = `https://robertsspaceindustries.com${thumbimg.attribs.src}`
                }

                let rank = computeRank($(el).find('span.stars').attr('style'))
                let stars = 0

                if(handle.trim() != '') {
                    member = {
                        name: name,
                        handle: handle,
                        rank: rank,
                        thumb: thumb,
                        verified: false
                    }
                    members.push(member)
                } else {
                    member = {
                        name: 'Redacted',
                        handle: 'Redacted',
                        rank: rank,
                        thumb: thumb,
                        verified: false
                    }
                    members.push(member)
                }
            })

            result = {
                count: totalMembers,
                members: members
            }
            
            return result
        }).catch((err) => {
            console.error(err)
        })
        res.members = await checkCitizens(res.members)
    } catch (error) {
        console.error(error)
        return {error: "Couldn't grab org members!"}
    }
    return res
}

async function fetchOrgRank(org, handle) {
    const res = await fetchMembers(org, undefined, undefined, handle=handle)
    const member = res.members[0]

    return parseInt(member.rank)
}

module.exports = {
    validCitizen,
    fetchCitizen,
    fetchOrg,
    fetchOrgFounders,
    fetchMembers,
    fetchOrgRank
}