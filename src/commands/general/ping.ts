import { Message } from 'discord.js'
import { Command } from '../../structure/command'


class Ping extends Command {
    constructor() {
        super({
            commandName: 'ping',
            description: 'Measures the delay between the end-user and the Bot.',
            contexts: ['guild', 'private']
        })
    }
    run(msg: Message) {
        msg.reply('Pinging ..')
            .then(replyMsg => replyMsg.edit(`Ping **${replyMsg.createdTimestamp - msg.createdTimestamp}ms**`))
            .catch(console.error)
    }
}


export default new Ping()