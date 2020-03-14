const axios = require('axios')
const cheerio = require('cheerio')
const { format, formatDistance, subDays, isAfter } = require('date-fns')

async function loadRSS(link, earliest) {
    return await axios({
        url: link,
        method: 'GET'
    }).then(async (res) => {
        let items = []
        const $ = cheerio.load(res.data, { xmlMode: true })
        const source_img = $('image').find('url').text()
        $('item').each((i, el) => {
            const item = {}
            item.source = 'impgeo'
            item.source_img = source_img
            item.id = $(el).find('guid').text().split('?p=')[1]
            item.title = $(el).find('title').text()
            item.image = 'https://www.imperialgeographic-official.org/wp-content/uploads/2019/11/Bivaly_ScreenShot10.jpg'
            item.link = $(el).find('link').text()
            item.posted_date = $(el).find('pubDate').text()
            item.posted = formatDistance(new Date(item.posted_date), new Date()) + " ago"
            if(isAfter(item.posted_date, earliest)) {
                items.push(item)
            }
        })
        //items = await addImages(items)

        return items
    }).catch((err) => {
        console.error(err)
    })
}

async function addImages(items) {
    for(i in items) {
        console.log(i)
        items[i].image = await getArticleImage(items[i].link)
    }
    return items
}

async function getArticleImage(link) {
    return axios({
        url: link,
        method: 'GET'
    }).then((res) => {
        const $ = cheerio.load(res.data)
        const image = $('article').find('img.wp-post-image').attr('src')
        return image
    }).catch((err) => {
        console.error(err)
    })
}

async function getFeed(earliest) {
    return await loadRSS('https://www.imperialgeographic-official.org/feed/', earliest)
}

module.exports = {
    getFeed
}