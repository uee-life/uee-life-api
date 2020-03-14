const axios = require('axios')
const cheerio = require('cheerio')

async function loadRSS(link) {
    await axios({
        url: link,
        method: 'GET'
    }).then((res) => {
        const $ = cheerio.load(res.data)
        console.log($('image.url'))
        return $('image')
    })
}

async function getFeed() {
    return loadRSS('https://www.imperialgeographic-official.org/feed/')
}

module.exports = {
    getFeed
}