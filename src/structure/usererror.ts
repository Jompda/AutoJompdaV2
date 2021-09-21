import { MessageEmbed, ReplyMessageOptions } from "discord.js";

export default class UserError extends Error {
    embed?: MessageEmbed
    constructor(msg: string | MessageEmbed) {
        super()
        if (typeof msg === 'string') this.message = msg
        else this.embed = msg
    }
    toMessage(): string | ReplyMessageOptions {
        return this.embed ? { embeds: [this.embed] } : this.message
    }
}