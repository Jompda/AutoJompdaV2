import BotModule from '../../structure/botmodule'
import AssignReactionRole from './commands/assignreactionrole'
import db from '../../database'


interface ReactionRoleOptions {
    rowId?: number
    guildId: string
    channelId: string
    messageId: string
    reaction: string
    roleId: string
}


class ReactionRole {
    rowId?: number
    guildId: string
    channelId: string
    messageId: string
    reaction: string
    roleId: string
    constructor(options: ReactionRoleOptions) {
        this.rowId = options.rowId
        this.guildId = options.guildId
        this.channelId = options.channelId
        this.messageId = options.messageId
        this.reaction = options.reaction
        this.roleId = options.roleId
    }
    create() {
        return new Promise<void>((resolve, reject) => {
            db.query(`INSERT INTO reactionRole VALUES (?, ?, ?, ?, ?)`,
                [
                    this.guildId,
                    this.channelId,
                    this.messageId,
                    this.reaction,
                    this.roleId
                ]
            )
                .then((rows) => {
                    console.log('added', this, rows)
                    db.query(`SELECT ROWID FROM reactionRole`)
                        .then(console.log)
                    resolve()
                })
                .catch(err => {
                    console.error(err)
                    reject(err)
                })
        })
    }
    remove() {
        throw new Error('Unimplemented method!')
        /*db.query(`DELETE FROM reactionRoles WHERE guildId = ?, messageId`,
            [

            ]
        )*/
    }
}


function reactionRoleExists() {
    return false // TODO: reactionRoleExists()
}


class ReactionRoles extends BotModule {
    constructor() {
        super({
            commands: [
                AssignReactionRole
            ],
            databaseInitializer:
                `CREATE TABLE IF NOT EXISTS reactionRole` +
                `(guildId TEXT, channelId TEXT, messageId TEXT, reaction TEXT, roleId TEXT)`
        })
    }
}
const botModule = new ReactionRoles()


export {
    ReactionRole,
    reactionRoleExists,
    botModule
}