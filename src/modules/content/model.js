const {executeSQL} = require('../mariadb')

async function getContent(tag) {
    const rows = await executeSQL('SELECT title, content, updated FROM site_content WHERE tag=?', [tag])
    if(rows.length > 0) {
        return rows[0]
    } else {
        return {
            title: null,
            content: 'Content not found.',
            updated: null
        }
    }
}

async function updateContent(tag, data) {
    sql = "UPDATE site_content SET title=?, content=? WHERE tag=?"
    await executeSQL(sql, [data.title, data.content, tag]).then(() => {
        return {success: true}
    }).catch((err) => {
        console.log(err)
    })
}

module.exports = {
    getContent,
    updateContent
}