const axios = require('axios')
const cheerio = require('cheerio')
const { format, formatDistance, subDays, isAfter, differenceInMilliseconds } = require('date-fns')

async function loadRSS(feed, earliest) {
    const link = `https://www.youtube.com/feeds/videos.xml?playlist_id=${feed.link}`
    console.log(link)
    return await axios({
        url: link,
        method: 'GET'
    }).then(async (res) => {
        let items = []
        const $ = cheerio.load(res.data, { xmlMode: true })
        const source_img = feed.logo
        $('entry').each((i, el) => {
            const item = {}
            item.source = feed.source
            item.source_img = source_img
            item.id = $(el).find('id').text()
            item.title = $(el).find('title').text()
            item.image = $(el).find('media\\:group').find('media\\:thumbnail').attr('url')
            item.link = $(el).find('media\\:group').find('media\\:content').attr('url')
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

async function getYTFeed(feed, earliest) {
    return await loadRSS(feed, earliest)
}

module.exports = {
    getYTFeed
}