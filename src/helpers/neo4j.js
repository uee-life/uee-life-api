const neo4j = require('neo4j');
const {uri, user, password} = require('../config/db_config')

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function writeQuery(query, params) {
    const session = driver.session({ database: 'neo4j' });
    try {
        const result = await session.executeWrite(tx => 
            tx.run(query, params)
        );

        // put in a check here to make sure the write was successful
        result.records.forEach(record => {
            const node1 = record.get('field1');
            const node2 = record.get('field2');
            console.info(`Doing something with ${node1} and ${node2}`)
        })
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await session.close();
    }
}

// return the full record set?
async function readQuery(query, params) {
    const session = driver.session({ database: 'neo4j' });
    records = [];
    try {
        const result = await session.executeRead(tx =>
            tx.run(query, params)
        );

        records = result.records;

        result.records.forEach(record => {
            console.log(`Found record: ${record.get('field')}`)
        })
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await session.close()
    }
    return records
}

module.exports = {
    writeQuery,
    readQuery
}