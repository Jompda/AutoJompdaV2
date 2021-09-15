import { MessageEmbed } from "discord.js";

export default class UserError extends Error {
    embed: MessageEmbed | null
    constructor(msg: string | MessageEmbed) {
        let isEmbed = typeof msg === 'string'
        super(isEmbed ? msg as string : '')
        this.embed = isEmbed ? null : msg as MessageEmbed
    }
    toMessage() {
        return this.embed ? { embeds: [this.embed as MessageEmbed] } : this.message
    }
}