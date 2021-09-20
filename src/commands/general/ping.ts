import { CommandInteraction, Message } from 'discord.js'
import { Command } from '../../structure/command'


class Ping extends Command {
    constructor() {
        super({
            commandName: 'ping',
            description: 'Measures the delay between the end-user and the Bot.',
            contexts: ['guild', 'private']
        })
    }
    onMessage(msg: Message) {
        return new Promise<any>((resolve, reject) => {
            msg.reply('Pinging ..')
                .then(replyMsg => resolve(replyMsg.edit(`Ping **${replyMsg.createdTimestamp - msg.createdTimestamp}ms**`)))
                .catch(reject)
        })
    }
    /*onInteraction(interaction: CommandInteraction) {
        interaction.reply(`Slash command not implemented yet!`)
    }*/
}


export default new Ping()