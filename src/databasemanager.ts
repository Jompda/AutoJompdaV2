import * as sqlite from 'sqlite3'
import bot from '.'


const db = new (sqlite.verbose()).Database('database.sqlite3')


interface DBGuild {
    guildId: string
    prefix: string
}


function serialize() {
    return new Promise<void>((resolve, reject) => {
        db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS guild (guildId TEXT, prefix TEXT)')
            synchronizeGuilds()
                .then(resolve)
                .catch(reject)
        })
    })
}


function close() {
    return new Promise<void>((resolve, reject) => {
        db.close((err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}


function synchronizeGuilds() {
    return new Promise<void>((resolve, reject) => {
        console.log('Synchronizing guilds with the database ..')
        db.all('SELECT guildId, prefix FROM guild', (err, rows) => {
            if (err) return reject(err)
            bot.client.guilds.fetch()
                .then(guilds => {
                    for (const [guildId, guild] of guilds) {
                        if (rows.find(row => row.guildId === guildId)) continue
                        db.prepare(`INSERT INTO guild VALUES (?, ?)`)
                            .run([guildId, bot.defaultPrefix])
                            .finalize()
                        console.log(`Added guild ${guild.name}(${guild.id}) to the database.`)
                    }
                    // Lazy af
                    console.log('Synchronization finished.')
                    resolve()
                })
                .catch(reject)
        })
    })
}


function getGuild(guildId: string) {
    return new Promise<DBGuild>((resolve, reject) => {
        db.get(`SELECT guildId, prefix FROM guild WHERE guildId=${guildId} LIMIT 1`, (err, row) => {
            if (err) return reject(err)
            resolve(row)
        })
    })
}


export {
    DBGuild,
    serialize,
    close,
    getGuild
}

