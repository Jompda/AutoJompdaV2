import { CommandInteraction, Message, Permissions } from 'discord.js'
import { Command } from '../../../structure/command'
import db from '../../../database'
import UserError from '../../../structure/usererror'


class SetPrefix extends Command {
    constructor() {
        super({
            commandName: 'setprefix',
            parameters: [{
                parameterName: 'prefix',
                description: 'The new prefix.',
                valueType: 'string',
                required: true
            }],
            description: 'Sets the command prefix used on the server.',
            contexts: ['guild'],
            memberPermissions: [Permissions.FLAGS.ADMINISTRATOR],
            slash: true,
            defer: true
        })
    }
    onMessage(msg: Message, parameters: Array<string>) {
        return new Promise<any>((resolve, reject) => {
            const prefix = parameters[0] as string
            this.updatePrefix(msg.guildId as string, prefix)
                .then(() => resolve(msg.reply(`Successfully updated the command prefix for the server!`)))
                .catch(reject)
        })
    }
    onInteraction(interaction: CommandInteraction) {
        // Could be optimized by deferring and updating the prefix at the same time.
        return new Promise<any>((resolve, reject) => {
            const prefix = interaction.options.get('prefix')?.value as string
            this.updatePrefix(interaction.guildId as string, prefix)
                .then(() => resolve(interaction.editReply(`Successfully updated the command prefix for the server!`)))
                .catch(reject)
        })
    }
    private updatePrefix(guildId: string, prefix: string) {
        return new Promise<void>((resolve, reject) => {
            const dbGuild = db.cache.getGuild(guildId)
            if (prefix === dbGuild.prefix) return reject(new UserError(`That's the old one m8!`))
            dbGuild.prefix = prefix
            dbGuild.update()
                .then(resolve)
                .catch((err) => {
                    console.error('SetPrefix:', err.message, err.stack)
                    reject(new UserError(`Something went wrong while updating the command prefix for the server!`))
                })
        })
    }
}


export default new SetPrefix()