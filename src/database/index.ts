import * as sqlite from 'sqlite3'
import bot from '..'
import { botModules } from '../botmodules'
import DBGuild from '../structure/dbguild'
import { asyncOperation } from '../util'
import defaultDBGuild from './defaultdbguild.json'


const db = new (sqlite.verbose()).Database('database.sqlite3')


const cache = {
    guilds: new Map<string, DBGuild>(),
    getGuild: (guildId: string) => {
        const guild = cache.guilds.get(guildId)
        if (!guild) throw new Error(`Guild(${guildId}) doesn't exist in the database`)
        return guild
    }
}


function serialize() {
    return new Promise<void>((resolve, reject) => {
        db.serialize(() => {
            console.log('Serializing the database ..')
            db.run('CREATE TABLE IF NOT EXISTS guild (guildId TEXT, prefix TEXT, botModulesData TEXT)')
            for (const botModule of botModules)
                if (botModule.databaseInitializer)
                    db.run(botModule.databaseInitializer)
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
        db.all('SELECT guildId, prefix, botModulesData FROM guild', (err, rows) => {
            if (err) return reject(err)
            bot.client.guilds.fetch()
                .then(guilds => {
                    const check = asyncOperation(guilds.size, () => {
                        console.log('Synchronization finished.')
                        resolve()
                    })
                    for (const [guildId, guild] of guilds) {
                        const row = rows.find(row => row.guildId === guildId)
                        if (row) {
                            cache.guilds.set(guildId, new DBGuild(row))
                            check()
                        }
                        else {
                            cache.guilds.set(guildId, new DBGuild({ ...{ guildId }, ...defaultDBGuild }))
                            db.run('INSERT INTO guild VALUES (?, ?, ?)', [
                                guildId,
                                defaultDBGuild.prefix,
                                JSON.stringify(defaultDBGuild.botModulesData)
                            ], (err) => {
                                if (err) return reject(err) // TODO: Work around reject getting called multiple times.
                                console.log(`Added guild ${guild.name}(${guildId}) to the database.`)
                                check()
                            })
                        }
                    }
                })
                .catch(reject)
        })
    })
}


function query(query: string, params?: any) {
    return new Promise<Array<object>>((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) return reject(err)
            resolve(rows)
        })
    })
}


export default {
    defaultDBGuild,
    DBGuild,
    serialize,
    close,
    cache,
    query
}

