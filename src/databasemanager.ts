import * as sqlite from 'sqlite3'
import bot from '.'


const db = new (sqlite.verbose()).Database('database.sqlite3')


interface DBGuild {
    guildId: string
    prefix: string
}


function serializeDB(cb: (err: Error | null) => any) {
    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS guild (guildId TEXT, prefix TEXT)')
        synchronizeGuilds(cb)
    })
}


function closeDB(cb: (err: Error | null) => any) {
    db.close(cb)
}


function synchronizeGuilds(cb: (err: Error | null) => any) {
    console.log('Synchronizing guilds with the database ..')
    db.all('SELECT guildId, prefix FROM guild', (err, rows) => {
        if (err) cb(err)
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
                cb(null)
            })
            .catch(cb)
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
    serializeDB,
    closeDB,
    getGuild
}

