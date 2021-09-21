import { Guild, Message, MessageAttachment, Permissions } from 'discord.js'
import { Command } from '../../structure/command'
import UserError from '../../structure/usererror'


class Steal extends Command {
    constructor() {
        super({
            commandName: 'steal',
            parameters: [
                {
                    parameterName: 'emoji_name',
                    description: 'The name for the emoji',
                    valueType: 'string',
                    required: true
                },
                {
                    parameterName: 'link',
                    description: 'Link to the emoji',
                    valueType: 'string'
                }
            ],
            usageDescription: 'Attach the emoji or paste the link at the end of the command.',
            description: 'Yoinks the emoji and adds it to the server.',
            contexts: ['guild'],
            memberPermissions: [Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS],
            botPermissions: [Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS]
        })
    }
    // TODO: Check the attachment file type before creating the emoji.
    onMessage(msg: Message, parameters: Array<string>) {
        // Bug: Sometimes the emoji doesn't show to the bot even though it exists. fetch maybe?
        return new Promise<any>((resolve, reject) => {
            if (msg.attachments.size + msg.embeds.length < 1) return reject(new UserError('No emoji defined!'))
            if (msg.attachments.size + msg.embeds.length > 1) return reject(new UserError('Too many emojis defined!'))
            if (msg.attachments.size > 0) {
                const emoji = msg.attachments.first() as MessageAttachment
                addEmoji(emoji.url, parameters[0])
            }
            else {
                if (parameters.length < 2) return reject(new UserError('No emoji name defined! Check the usage.'))
                const emoji = msg.embeds[0]
                let url = null as any
                if (emoji.image) url = emoji.image.url
                else if (emoji.video) url = emoji.video.url
                else url = emoji.url
                addEmoji(url, parameters[0])
            }
            function addEmoji(url: string, name: string) {
                (msg.guild as Guild).emojis.create(url, name)
                    .then(() => resolve(msg.reply('Added emoji to the server!')))
                    .catch(reject) // Could be a security hazard
            }
        })
    }
}


export default new Steal()