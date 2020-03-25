const axios = require("axios")
const cheerio = require('cheerio')
const { sub, isBefore, formatDistance, differenceInMilliseconds } = require('date-fns')

const { getFeed } = require('./ImpGeoRSS')
const { getYTFeed } = require('./youtubeRSS')
const { getFeeds } = require('../../helpers/db')

async function fetchNews(data) {
    try {
        const baseURI = "https://robertsspaceindustries.com"
        const resp = await axios.post(baseURI + '/api/hub/getCommlinkItems', data)
        const $ = cheerio.load(resp.data.data)

        news = []

        $('a').each(function (n, el) {
            if($(el).attr('href')) {
                art = {}
                art.source = 'spectrum'
                art.source_img = '/images/spectrum.png'
                art.title = $(el).find('div.title').text()
                art.link = baseURI + $(el).attr('href')
                art.id = art.link.split('/').slice(-1)[0].split('-')[0]
                bg = $(el).find('div.background')
                if(bg.attr('style')) {
                    art.image = bg.attr('style').split("'")[1]
                } else {
                    art.image = baseURI + "/media/jkfgas4ihmfghr/channel_item_full/BookReport_FI_2.jpg"
                }
                if(!art.image.startsWith('http')) {
                    art.image = baseURI + art.image
                }

                art.posted = $(el).find('div.time_ago').find('span.value').text()
                if(art.posted.includes('ago')) {
                    art.posted_date = computeDate(art.posted)
                } else {
                    art.posted_date = new Date(art.posted).toUTCString()
                    art.posted = formatDistance(new Date(art.posted_date), new Date()) + " ago"
                }
                news.push(art)
            }
        })
        return news
    } catch (error) {
        console.error(error)
        return null
    }
}

function computeDate(posted) {
    if(posted.startsWith('about')) {
        posted = posted.substring(6)
    }
    const [count, unit] = posted.split(' ')
    let date = null
    if (unit.startsWith('second')) {
        date = sub(new Date(), {seconds: count})
    } else if (unit.startsWith('minute')) {
        date = sub(new Date(), {minutes: count})
    } else if (unit.startsWith('hour')) {
        date = sub(new Date(), {hours: count})
    } else if (unit.startsWith('day')) {
        date = sub(new Date(), {days: count})
    } else if (unit.startsWith('week')) {
        date = sub(new Date(), {weeks: count})
    } else if (unit.startsWith('month')) {
        date = sub(new Date(), {months: count})
    } else if (unit.startsWith('year')) {
        date = sub(new Date(), {years: count})
    }
    return date.toUTCString()
}

function mergeNews(first, second) {
    let result = []
    start = new Date()
    while (first.length + second.length > 0) {
        if(first.length === 0) {
            second = []
        } else if (second.length === 0) {
            result = result.concat(first)
            first = []
        } else if (isBefore(new Date(first[0].posted_date), new Date(second[0].posted_date))) {
            result.push(second.shift())
        } else {
            result.push(first.shift())
        }
    }
    console.log('data merged: ' + differenceInMilliseconds(new Date(), start))
    return result
}

async function getNews(data) {
    start = new Date()
    let news = await fetchNews(data)
    const earliest = news[news.length - 1].posted_date

    const feeds = await getFeeds()
    console.log("series", data.series)
    if (data.series === 'news-updates') {
        for (f in feeds) {
            const feed = feeds[f]
            console.log("feed", feed)
            if (feed.type == 1) {
                d = await getYTFeed(feed, earliest)
                news = mergeNews(news, d)
            } else {
                // placeholder. This should pass in the feed object for generic wordpress RSS feeds
                d = await getFeed(earliest)
                news = mergeNews(news, d)
            }
        }
    } else {
        return news
    }
    
    return news
}

module.exports = {
    getNews,
};