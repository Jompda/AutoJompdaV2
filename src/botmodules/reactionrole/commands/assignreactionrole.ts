import { CommandInteraction, Message, Permissions, TextBasedChannels } from 'discord.js'
import { Command } from '../../../structure/command'
import * as db from '../../../database'
import UserError from '../../../structure/usererror'
import { asyncOperation } from '../../../util'


class AssignReactionRole extends Command {
    constructor() {
        super({
            commandName: 'assignreactionrole',
            parameters: [
                {
                    parameterName: 'message_id',
                    description: 'The message to assign the reaction to.',
                    valueType: 'string',
                    required: true
                },
                {
                    parameterName: 'reaction',
                    description: 'The reaction.',
                    valueType: 'string',
                    required: true
                },
                {
                    parameterName: 'role',
                    description: 'The role to assign.',
                    valueType: 'role',
                    required: true
                }
            ],
            description: 'Assigns a reaction role button to the specified message on the channel.',
            contexts: ['guild'],
            memberPermissions: [Permissions.FLAGS.ADMINISTRATOR],
            botPermissions: [
                Permissions.FLAGS.ADD_REACTIONS,
                Permissions.FLAGS.READ_MESSAGE_HISTORY,
                Permissions.FLAGS.VIEW_CHANNEL
            ],
            slash: true,
            defer: true
        })
    }
    onMessage(msg: Message, parameters: Array<string>) {
        return new Promise<any>((resolve, reject) => {
            resolve(msg.reply('Use the slash command please.'))
        })
    }
    onInteraction(interaction: CommandInteraction) {
        return new Promise<void>((resolve, reject) => {
            let message: Message = null as unknown as Message
            let reaction: string = null as unknown as string
            const role = interaction.options.getRole('role', true)
            const check = asyncOperation(2, postResolve);
            (interaction.channel as TextBasedChannels).messages.fetch(interaction.options.getString('message_id', true))
                .then((msg) => {
                    message = msg
                    check()
                })
                .catch(reject)
            reaction = interaction.options.getString('reaction', true); check() // Currently only works with unicode emojis

            function postResolve() {
                if (!message || !reaction) return reject(new Error('wtf'))
                message.react(reaction)
                    .then(() => {
                        message.createReactionCollector()
                            .on('collect', (r, u) => console.log(r, u))
                    })
                    .catch(reject)

                const dbGuild = db.cache.getGuild(interaction.guildId as string)
                /*dbGuild.addReactionRole({
                    channelId: interaction.channelId,
                    messageId: message.id,
                    reaction: reaction,
                    roleId: role.id
                })
                .then(resolve)
                .catch(() => reject(new UserError('Something went wrong while assigning the reaction role to the database!')))*/
            }
        })
    }
}


export default new AssignReactionRole()