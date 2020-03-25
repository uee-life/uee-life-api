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

        $('entry').each((i, el) => {
            const item = {}
            item.source = feed.source
            item.source_img = feed.image
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
        return sortItems(items)
    }).catch((err) => {
        console.error(err)
    })
}

async function sortItems(items) {
    return items.sort((a, b) => (isAfter(new Date(a.posted_date), new Date(b.posted_date))) ? 1 : -1)
}

async function getYTFeed(feed, earliest) {
    return await loadRSS(feed, earliest)
}

module.exports = {
    getYTFeed
}