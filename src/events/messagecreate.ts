import { Message } from 'discord.js'
import Event from '../structure/event'
import bot from '..'
import { interpret } from '../commands'
import { resolveTagId } from '../util'
import SafeError from '../structure/safeerror'
import * as dbManager from '../databasemanager'


class MessageCreate extends Event {
    constructor() {
        super({ eventName: 'messageCreate', runOnce: false })
    }
    run(msg: Message) {
        if (msg.author === bot.client.user) return;
        //console.log(`${msg.author.tag}@${msg.guild?.name}:${msg.channel}: ${msg.content}`)
        if (!msg.guild) return msg.reply(
            `Hi there! My command prefix is **${bot.defaultPrefix}**\n` +
            `Type **${bot.defaultPrefix}}help** for more information.`
        )
        const guild = dbManager.cache.guilds.get(msg.guild.id)
        if (msg.content.startsWith(guild?.prefix ?? bot.defaultPrefix))
            try {
                interpret(msg)
            } catch (err) {
                if (err instanceof SafeError) msg.reply(err.message)
                else throw err
            }
        const mentionedUserId = resolveTagId(msg.content)
        if (mentionedUserId === bot.client.user?.id) msg.reply(
            `Hi there! My command prefix is **${guild?.prefix}**\n` +
            `Type **${guild?.prefix}help** for more information.`
        )
    }
}


export default new MessageCreate()