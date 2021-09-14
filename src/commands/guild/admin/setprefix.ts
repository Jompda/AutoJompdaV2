import { Message, Permissions } from 'discord.js'
import Command from '../../structure/command'
import * as db from '../../databasemanager'
import SafeError from '../../structure/safeerror'


class SetPrefix extends Command {
    constructor() {
        super({
            commandName: 'setprefix',
            usage: 'setprefix <prefix>',
            description: 'Sets the command prefix used on the server.',
            contexts: ['guild'],
            memberPermissions: [Permissions.FLAGS.ADMINISTRATOR]
        })
    }
    run(msg: Message, param: Array<string>) {
        // TODO: Parameter error automatisation
        if (param.length < 1 || param[0] === '') throw new SafeError(`Missing prefix parameter!\nUsage: ${this.usage}`)
        const dbGuild = db.cache.getGuild(msg.guildId as string)
        if (param[0] === dbGuild.prefix) return msg.reply(`That's the old one m8!`)
        dbGuild.prefix = param[0]
        dbGuild.update()
            .then(() => msg.reply(`Successfully updated the command prefix for the server!`))
            .catch((err) => {
                msg.reply(`Something went wrong while updating the command prefix for the server!`)
                console.error('SetPrefix:', err.message, err.stack)
            })
    }
}


export default new SetPrefix()