const { fetchCitizen, fetchOrgFounders } = require('../../helpers/rsi')
const { createCitizen, getID, getOrgID } = require('../../helpers/db')
const { getVerificationCode, setVerificationCode, setVerified } = require('../verification')
const { executeSQL } = require('../mariadb')
const uuid = require('uuid/v4')

const{ manager } = require('../manager')


async function getUser(usr) {

    var params = {
        id: usr.sub
    }
    const user = await manager.getUser(params).then((res) => {
        return res
    }).catch((err) => {
        console.error(err)
        return null
    });

    user.verificationCode = await getVerificationCode(user)

    //TODO: filter to just wanted user fields.
    return user
}

async function handleExists(handle) {
    const rows = await executeSQL('SELECT handle FROM citizen WHERE handle=?', [handle])
    if(rows.length === 0) {
        return false
    } else {
        return true
    }
}

async function updateHandle(usr, handle) {
    // get current users handle for removal
    const old_user = await getUser(usr)
    const old_handle = old_user.app_metadata.handle
    const new_handle = handle.trim()
    // if a record for the old handle exists, but the current user isn't verified. This isn't the owner, so don't delete old data.
    let should_delete = false
    if(old_user.app_metadata.handle_verified) {
        should_delete = true
    }
    // check if handle already exists and is verified
    if(old_handle === new_handle) {
        console.log('Handles match, not changing')
        return {error: 'No change necessary. Old and new handles match.'}
    } else if(await handleExists(new_handle)) {
        console.log('Handle exists, not changing')
        return {error: 'Handle belongs to another citizen. Contact Flint if you think this is in error!'}
    } else {
        console.log('handle ok, changing!')
        var params = {
            id: usr.sub
        }
        var metadata = {
            handle: new_handle,
            handle_verified: false
        }
        manager.updateAppMetadata(params, metadata).then(function(user) {
            console.log('Done. Should delete:', should_delete)
            if(should_delete) {
                removeCitizen(old_handle)
            }
            return user
        }).catch(function(err) {
            console.error(err)
        });
    }
}

async function removeCitizen(handle) {
    const citizen_id = getID(handle)
    // remove sync data
    await executeSQL("DELETE FROM citizen_sync WHERE handle=?", [handle])
    // remove citizen record
    await executeSQL("DELETE FROM citizen WHERE handle=?", [handle])
    // remove recorded ships
    await executeSQL('DELETE FROM ship_map WHERE citizen=?', [citizen_id])

    // remove recorded locations

    // remove linked orgs

}

// Sync code

async function sync(usr) {
    const user = await getUser(usr)

    if(user.app_metadata.handle_verified) {
        const result = await syncCitizen(user.app_metadata.handle).then((citizen) => {
            return {success: true, citizen: citizen}
        }).catch((err) => {
            return {success: false, error: `Sync failed. Flint probably broke something :( - ${err}`}
        })
        return result
    } else {
        return {success: false, error: 'Your account is not yet verified! Please verify and try again.'}
    }
}

async function syncCitizen(handle) {
    console.log('syncing...')
    // get citizen data from RSI
    const citizen = await fetchCitizen(handle)

    // store org affiliation
    setOrg(citizen)

    // update citizen data
    if(citizen) {
        sql = "REPLACE INTO citizen_sync (handle, record, name, bio, enlisted, portrait, org, orgrank, website) VALUES (?,?,?,?,?,?,?,?,?)"
        data = [
            citizen.handle,
            citizen.record,
            citizen.name,
            citizen.bio,
            citizen.enlisted,
            citizen.portrait,
            citizen.org,
            citizen.orgRank,
            citizen.website
        ]
        await executeSQL(sql, data)
        return citizen
    } else {
        return null
    }
}

async function setOrg(citizen) {
    if(citizen.org) {
        const citizenID = await getID(citizen.handle)
        const orgID = await getOrgID(citizen.org)
        if(orgID) {
            let founder = 0
            const founders = await fetchOrgFounders(citizen.org)
            founders.forEach((item) => {
                if (item.handle === citizen.handle) {
                    founder = 1
                }
            })
            let rows = await executeSQL('SELECT * FROM org_map WHERE citizen=? AND org=?', [citizenID, orgID])
            if (rows.length === 0) {
                // clear up old org mapping
                await executeSQL('DELETE FROM org_map WHERE citizen=?', [citizen.id])
                // map to new org
                await executeSQL('INSERT INTO org_map (citizen, org, founder, type) values (?, ?, ?, ?)', [citizen.id, orgID, founder, 1])
            } else {
                // already exists
                // need to add logic to update if founder flag changes, or type changes (member/affiliate)
                console.log('citizen already registered to org...')
            }
        } else {
            // failed to get org ID for some reason...
        }
    }
}

// Verification

async function verify (usr) {
    const user = await getUser(usr)
    const validCode = await getVerificationCode(user)
    const code = await getBioCode(user.app_metadata.handle)

    if(code == `[ueelife:${validCode}]`) {
        const res = setVerified(user)
        setVerificationCode(user, uuid());
        createCitizen(user.app_metadata.handle)
        return {
            success: true,
            msg: "Successfully verified citizen!",
            user: res   // user with verified flag set
        }
    } else {
        return {
            success: false,
            msg: "Code missing or doesn't match. Did you copy the code to your bio?",
            user: user
        }
    }
}

async function getBioCode(handle) {
    code = await fetchCitizen(handle).then((citizen) => {
        return citizen.bio.match(/\[ueelife\:[A-Za-z0-9\-]+\]/i)
    }).catch(function (err) {
        console.error(err)
        return ""
    })
    return code
}

async function randomActiveUser() {
    //TODO: do a check first to get active user count, then retrieve that many users.
    const d = new Date
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    console.log(year, month)
    const params = {
        q: `last_login: ${year}-${month}`,
        per_page: 100
    }
    const user = manager.getUsers(params).then((res) => {
        const i = Math.random() * res.length
        console.log(res.length, i, res.data[i])
        return res.data[i]
    })
    return user
}


module.exports = {
    getUser,
    updateHandle,
    sync,
    syncCitizen,
    verify,
    randomActiveUser
}