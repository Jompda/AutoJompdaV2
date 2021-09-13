import { Guild } from 'discord.js'
import * as sqlite from 'sqlite3'
import bot from '.'


const db = new (sqlite.verbose()).Database('database.sqlite3')


interface DBGuild extends Guild {
    prefix: string
}


const cache = {
    guilds: new Map<string, DBGuild>()
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
                        const dbGuild = guild as unknown as DBGuild
                        cache.guilds.set(guildId, dbGuild)
                        const row = rows.find(row => row.guildId === guildId)
                        if (row) {
                            dbGuild.prefix = row.prefix
                            continue
                        }
                        db.run('INSERT INTO guild VALUES (?, ?)', [
                            guildId,
                            dbGuild.prefix = bot.defaultPrefix
                        ])
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


export {
    DBGuild,
    serialize,
    close,
    cache
}

