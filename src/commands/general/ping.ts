import { Message, Permissions } from 'discord.js'
import Command from '../../structure/command'


class Ping extends Command {
    constructor() {
        super({
            commandName: 'ping',
            usage: 'ping',
            description: 'Measures the delay between the end-user and the Bot.',
            guildCommand: true,
            privateCommand: true
        })
    }
    run(msg: Message) {
        msg.reply('Pinging ..')
            .then(replyMsg => replyMsg.edit(`Ping **${replyMsg.createdTimestamp - msg.createdTimestamp}ms**`))
            .catch(console.error)
    }
}


export default new Ping()