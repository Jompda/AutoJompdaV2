import { Message, Permissions } from 'discord.js'
import { Command } from '../../../structure/command'
import * as db from '../../../database'


class SetPrefix extends Command {
    constructor() {
        super({
            commandName: 'setprefix',
            parameters: [{ parameterName: 'prefix', value: 'string', required: true }],
            description: 'Sets the command prefix used on the server.',
            contexts: ['guild'],
            memberPermissions: [Permissions.FLAGS.ADMINISTRATOR]
        })
    }
    run(msg: Message, parameters: Array<string>) {
        const dbGuild = db.cache.getGuild(msg.guildId as string)
        const parsedPrefix = parameters[0] as string
        if (parsedPrefix === dbGuild.prefix) return msg.reply(`That's the old one m8!`)
        dbGuild.prefix = parsedPrefix
        dbGuild.update()
            .then(() => msg.reply(`Successfully updated the command prefix for the server!`))
            .catch((err) => {
                msg.reply(`Something went wrong while updating the command prefix for the server!`)
                console.error('SetPrefix:', err.message, err.stack)
            })
    }
}


export default new SetPrefix()