import { Message, MessageEmbed, Permissions } from 'discord.js'
import { Command } from '../../../structure/command'
import UserError from '../../../structure/usererror'


class CreateEmbed extends Command {
    constructor() {
        super({
            commandName: 'createembed',
            description: 'Creates a Embed from a json file.',
            usageDescription: '[Embed object guide](https://discordjs.guide/popular-topics/embeds.html#using-an-embed-object)\n' +
                'Note: (timestamp: true) gets resolved to the current timestamp.',
            parameters: [{
                parameterName: 'json_code_block',
                description: 'A JSON code block containing the Embed object. Note that if this parameter is not filled then a JSON file must be embedded.',
                valueType: 'string'
            }],
            contexts: ['guild'],
            botPermissions: [
                Permissions.FLAGS.EMBED_LINKS,
                Permissions.FLAGS.MANAGE_MESSAGES
            ],
            memberPermissions: [Permissions.FLAGS.ADMINISTRATOR]
        })
    }
    onMessage(msg: Message) {
        return new Promise<any>((resolve, reject) => {
            this.createEmbed(msg)
                .then(result => {
                    msg.channel.send({
                        embeds: [result]
                    })
                        .then(() =>
                            msg.delete()
                                .then(resolve)
                                .catch(reject)
                        )
                        .catch((err) => reject(new UserError(err.message)))
                })
                .catch(reject)
        })
    }
    createEmbed(msg: Message) {
        // TODO: Support for uploading a *.json file.
        // Actually resolves to a object which contains the needed embed elements.
        return new Promise<MessageEmbed>((resolve, reject) => {
            const jsonContent = (/`{3}json((.|\n)+)`{3}$/.exec(msg.content) ?? [])[1]
            if (!jsonContent) reject(new UserError('JSON file missing!'))
            try {
                const parsed = JSON.parse(jsonContent)
                if ('timestamp' in parsed && parsed.timestamp === true) parsed.timestamp = Date.now()
                resolve(parsed)
            } catch (err) {
                reject(new UserError((err as Error).message))
            }
        })
    }
    get class() {
        return CreateEmbed
    }
}


export default new CreateEmbed()