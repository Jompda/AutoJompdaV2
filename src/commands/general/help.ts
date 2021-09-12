import { Message } from 'discord.js'
import Command from '../../structure/command'


class Help extends Command {
    constructor() {
        super({
            commandName: 'help',
            usage: 'help',
            description: 'Displays a help menu.',
            guildCommand: true,
            privateCommand: true
        })
    }
    run(msg: Message) {
        msg.reply('Help command is not implemented yet ..')
    }
}


export default new Help()