import { CommandInteraction, Interaction, MessageComponentInteraction, User } from 'discord.js'
import Event from '../structure/event'
import bot from '..'
import { guildCommands, privateCommands } from '../commands'
import UserError from '../structure/usererror'
import { Command } from '../structure/command'
import { EventEmitter } from 'stream'


class InteractionCreate extends Event {
    static eventEmitter: EventEmitter
    constructor() {
        super({ eventName: 'interactionCreate' })
        InteractionCreate.eventEmitter = new EventEmitter()
    }
    run(interaction: Interaction) {
        if (!interaction.isCommand()) return InteractionCreate.nonCommandInteraction(interaction as MessageComponentInteraction)
        if (interaction.user.id === (bot.client.user as User).id) return
        const command = (interaction.guild ? guildCommands : privateCommands).get(interaction.commandName) as Command
        if (!command) return interaction.reply(`Unknown slash command! (idk how)`)

        if (!command.defer) finalize()
        else interaction.deferReply()
            .then(finalize)
            .catch(console.error)

        function finalize() {
            command.onInteraction(interaction as CommandInteraction)
                .catch((err) => {
                    if (err instanceof UserError)
                        (interaction as CommandInteraction)[command.defer ? 'editReply' : 'reply'](err.toMessage())
                    else throw err
                })
        }
    }
    static nonCommandInteraction(interaction: MessageComponentInteraction) {
        InteractionCreate.eventEmitter.emit(interaction.customId, interaction)
    }
    getClass() {
        return InteractionCreate
    }
}


export default new InteractionCreate()