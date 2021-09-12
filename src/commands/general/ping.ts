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
        const receiveTime = Date.now()
        let userToBot = msg.createdTimestamp - receiveTime, botToGateway
        msg.reply('Pinging ..')
            .then(replyMsg => replyMsg.edit(
                `User -> Bot :: **${userToBot}ms**\n` +
                `Bot -> Gateway :: **${botToGateway = replyMsg.createdTimestamp - receiveTime}ms**\n` +
                `Total :: **${userToBot + botToGateway}ms**`
            ))
            .catch(console.error)
    }
}


export default new Ping()