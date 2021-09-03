import { Message } from 'discord.js'
import Command from '../structure/command'


class Ping extends Command {
    constructor() {
        super({
            commandName: 'ping',
            usage: 'ping',
            description: 'Measures the delay between the end-user and the Bot.'
        })
    }
    run(msg: Message) {
        const receiveTime = Date.now()
        msg.reply('Pinging ..')
            .then(replyMsg => replyMsg.edit(
                `User -> Bot :: **${receiveTime - msg.createdTimestamp}ms**\n` +
                `Bot -> Gateway :: **${replyMsg.createdTimestamp - receiveTime}ms**`
            ))
            .catch(console.error)
    }
}


export default new Ping()