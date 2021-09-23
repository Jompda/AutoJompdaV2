import * as sqlite from 'sqlite3'
import bot from '..'
import { asyncOperation } from '../util'
import defaultDBGuild from './defaultdbguild.json'


const db = new (sqlite.verbose()).Database('database.sqlite3')


/*interface ReactionRole {
    channelId: string
    messageId: string
    reaction: string
    roleId: string
}*/


class DBGuild {
    guildId: string
    prefix: string
    botModulesData: Array<any> // Map would be better?
    //reactionRoles: Array<ReactionRole>
    constructor(dbGuildResolvable: any) {
        this.guildId = dbGuildResolvable.guildId
        this.prefix = dbGuildResolvable.prefix
        this.botModulesData = JSON.parse(dbGuildResolvable.botModulesData)
        console.log(this)
        //this.reactionRoles = []
    }
    /*addReactionRole(reactionRole: ReactionRole) { // Moving this to a module
        return new Promise<void>((resolve, reject) => {
            db.run(`INSERT INTO reactionRole VALUES (?, ?, ?, ?, ?)`,
                [
                    this.guildId,
                    reactionRole.channelId,
                    reactionRole.messageId,
                    reactionRole.reaction,
                    reactionRole.roleId
                ],
                err => {
                    console.log('added', reactionRole)
                    if (err) return reject(err)
                    resolve()
                })
        })
    }*/
    update() {
        return new Promise<void>((resolve, reject) => {
            db.run(`UPDATE guild SET prefix = ?, botModulesData = ? WHERE guildId = '${this.guildId}'`,
                [
                    this.prefix,
                    JSON.stringify(this.botModulesData)
                ],
                err => {
                    if (err) return reject(err)
                    resolve()
                })
        })
    }
}


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
            //db.run('CREATE TABLE IF NOT EXISTS reactionRole (guildId TEXT, channelId TEXT, messageId TEXT, reaction TEXT, roleId TEXT)')
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


export {
    defaultDBGuild,
    DBGuild,
    serialize,
    close,
    cache
}

