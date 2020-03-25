const axios = require('axios')
const cheerio = require('cheerio')
const { format, formatDistance, subDays, isAfter, differenceInMilliseconds } = require('date-fns')

async function loadRSS(link, earliest) {
    return await axios({
        url: link,
        method: 'GET'
    }).then(async (res) => {
        console.log(res)
        let items = []
        const $ = cheerio.load(res.data, { xmlMode: true })
        const source_img = ""
        $('entry').each((i, el) => {
            const item = {}
            item.source = 'Galactic-Historian'
            item.source_img = source_img
            item.id = $(el).find('id').text()
            item.title = $(el).find('title').text()
            item.image = $(el).find('group').find('thumbnail').attr('url')
            item.link = $(el).find('group').find('content').attr('url')
            item.posted_date = $(el).find('published').text()
            item.posted = formatDistance(new Date(item.posted_date), new Date()) + " ago"
            if(isAfter(new Date(item.posted_date), new Date(earliest))) {
                items.push(item)
            }
        })
        return items
    }).catch((err) => {
        console.error(err)
    })
}

async function getYTFeed(earliest) {
    return await loadRSS('https://www.youtube.com/feeds/videos.xml?playlist_id=PLeBcPM4MDA6TYa5WSKlxeZv6htnJWJybc', earliest)
}

module.exports = {
    getYTFeed
}