import * as sqlite from 'sqlite3'
import bot from '.'


const db = new (sqlite.verbose()).Database('database.sqlite3')


interface DBGuild {
    guildId: string
    prefix: string
}


function serializeDB(cb: Function) {
    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS guild (guildId TEXT, prefix TEXT)')
        synchronizeGuilds(cb)
    })
}


function synchronizeGuilds(cb: Function) {
    console.log('Synchronizing guilds with the database ..')
    db.all('SELECT guildId, prefix FROM guild', (err, rows) => {
        if (err) throw err
        bot.client.guilds.fetch().then(guilds => {
            for (const [guildId, guild] of guilds) {
                if (rows.find(row => row.guildId === guildId)) continue
                db.prepare(`INSERT INTO guild VALUES (?, ?)`)
                    .run([guildId, bot.defaultPrefix])
                    .finalize()
                console.log(`Added guild ${guild.name}(${guild.id}) to the database.`)
            }
            console.log('Synchronization finished.')
            cb()
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
    serializeDB,
    getGuild
}

