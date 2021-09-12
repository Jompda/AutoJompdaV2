import Event from '../structure/event'
import bot from '..'
import { Message } from 'discord.js'
import { interpret } from '../commands'
import { resolveTagId } from '../util'
import SafeError from '../structure/safeerror'


class MessageCreate extends Event {
    constructor() {
        super({ eventName: 'messageCreate', runOnce: false })
    }
    run(msg: Message) {
        if (msg.author === bot.client.user) return;
        console.log(`${msg.author.tag}@${msg.guild?.name}:${msg.channel}: ${msg.content}`)
        if (msg.content.startsWith(bot.defaultPrefix /*TODO: Custom prefix for guilds.*/))
            try {
                interpret(msg)
            } catch (err) {
                if (err instanceof SafeError) msg.reply(err.message)
                else throw err
            }

        const hiMsg = `Hi there! My command prefix is **${bot.defaultPrefix}**\n` +
            `Type **${bot.defaultPrefix}help** for more information.`
        if (!msg.guild) return msg.reply(hiMsg)
        const mentionedUserId = resolveTagId(msg.content)
        if (mentionedUserId === bot.client.user?.id) msg.reply(hiMsg)
    }
}


export default new MessageCreate()