import { Interaction, User } from 'discord.js'
import Event from '../structure/event'
import bot from '..'
import { guildCommands, privateCommands } from '../commands'
import UserError from '../structure/usererror'


class InteractionCreate extends Event {
    constructor() {
        super({ eventName: 'interactionCreate' })
    }
    run(interaction: Interaction) {
        if (!interaction.isCommand()) return
        if (interaction.user.id === (bot.client.user as User).id) return
        const command = (interaction.guild ? guildCommands : privateCommands).get(interaction.commandName)
        if (!command) return interaction.reply(`Unknown slash command! (idk how)`)
        try {
            command.onInteraction(interaction)
        }
        catch (err) {
            if (err instanceof UserError)
                interaction.reply(err.toMessage()).catch(console.error)
            else throw err
        }
    }
}


export default new InteractionCreate()