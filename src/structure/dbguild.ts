import db from '../database'


export default class DBGuild {
    guildId: string
    prefix: string
    botModulesData: Array<any> // Map would be better?
    constructor(dbGuildResolvable: any) {
        this.guildId = dbGuildResolvable.guildId
        this.prefix = dbGuildResolvable.prefix
        this.botModulesData = typeof dbGuildResolvable.botModulesData === 'string'
            ? JSON.parse(dbGuildResolvable.botModulesData)
            : dbGuildResolvable.botModulesData
        console.log(this)
    }
    update() {
        return new Promise<any>((resolve, reject) => {
            db.query(`UPDATE guild SET prefix = ?, botModulesData = ? WHERE guildId = '${this.guildId}'`,
                [
                    this.prefix,
                    JSON.stringify(this.botModulesData)
                ]
            )
                .then(resolve)
                .catch(reject)
        })
    }
}