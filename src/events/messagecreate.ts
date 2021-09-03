import Event from '../structure/event'
import bot from '..'
import { Message } from 'discord.js'
import { interpret } from '../commands'


class MessageCreate extends Event {
    constructor() {
        super({ eventName: 'messageCreate', runOnce: false })
    }
    run(msg: Message) {
        if (msg.author === bot.client.user) return;
        console.log(`${msg.author.tag}: ${msg.content}`)
        if (!msg.content.startsWith(bot.defaultPrefix)) return;
        interpret(msg)
    }
}


export default new MessageCreate()