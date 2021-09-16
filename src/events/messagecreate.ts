import { Message, User } from 'discord.js'
import Event from '../structure/event'
import bot from '..'
import { interpret } from '../commands'
import { resolveTagId } from '../util'
import UserError from '../structure/usererror'
import * as db from '../database'


class MessageCreate extends Event {
    constructor() {
        super({ eventName: 'messageCreate' })
    }
    run(msg: Message) {
        if (msg.author === bot.client.user) return
        const prefix = msg.guild ? db.cache.getGuild(msg.guild.id).prefix : bot.defaultPrefix
        if (msg.content.startsWith(prefix))
            try { return interpret(msg) }
            catch (err) {
                if (err instanceof UserError)
                    msg.reply(err.toMessage()).catch(console.error)
                else throw err
            }
        if (!(msg.guild) || resolveTagId(msg.content) === (bot.client.user as User).id) msg.reply(
            `Hi there! My command prefix is **${prefix}**\n` +
            `Type **${prefix}help** for more information.`
        )
    }
}


export default new MessageCreate()