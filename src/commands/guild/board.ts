import { GuildEmoji, Message, MessageActionRow, MessageButton, MessageComponentInteraction } from 'discord.js'
import { Command } from '../../structure/command'
import crypto from 'crypto'
import interactionCreate from '../../events/interactioncreate'
import bot from '../..'


class Board extends Command {
    constructor() {
        super({
            commandName: 'board',
            description: 'Board testing.',
            contexts: ['guild']
        })
    }
    onMessage(msg: Message) {
        return new Promise<void>((resolve, reject) => {
            const buttons = new Map<string, MessageButton>()
            function createRow() {
                return new MessageActionRow()
                    .addComponents(
                        createButton(),
                        createButton(),
                        createButton()
                    )
            }
            function createButton() {
                const id = crypto.randomUUID()
                const button = new MessageButton()
                    .setLabel('\u2B1C')
                    .setCustomId(id)
                    .setStyle(2)
                buttons.set(id, button)
                return button
            }
            const board = [
                createRow(),
                createRow(),
                createRow()
            ]
            msg.reply({
                content: 'Test starting!',
                components: board
            })
                .then(boardMsg => {
                    for (const [id, button] of buttons) interactionCreate.class.eventEmitter.on(id, handle)
                    function handle(interaction: MessageComponentInteraction) {
                        if (!interaction.isButton()) return
                        interaction.reply('Component: ' + interaction.customId)
                        const button = buttons.get(interaction.customId)?.setLabel('\uD83D\uDFE9') as MessageButton
                        console.log(buttons)
                        interaction.update({ content: 'yes', components: [] })
                    }
                    resolve()
                })
                .catch(reject)
        })
    }
}


export default new Board()