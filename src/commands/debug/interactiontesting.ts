import { Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageSelectMenu, Permissions } from 'discord.js'
import { Command } from '../../structure/command'
import crypto from 'crypto'
import interactionCreate from '../../events/interactioncreate'


class InteractionTesting extends Command {
    constructor() {
        super({
            commandName: 'test',
            description: 'Interaction testing.',
            contexts: ['guild'],
            debug: true
        })
    }
    onMessage(msg: Message) {
        return new Promise<void>((resolve, reject) => {
            const ids = new Array<string>()
            msg.reply({
                content: 'Test starting!',
                components: [
                    new MessageActionRow()
                        .addComponents(new MessageButton()
                            .setLabel('Nappi')
                            .setCustomId(ids[ids.length] = crypto.randomUUID())
                            .setStyle(1)
                        )
                        .addComponents(new MessageButton()
                            .setLabel('Nappi2')
                            .setCustomId(ids[ids.length] = crypto.randomUUID())
                            .setStyle(2)
                        ),
                    new MessageActionRow()
                        .addComponents(new MessageSelectMenu()
                            .setCustomId(ids[ids.length] = crypto.randomUUID())
                            .addOptions([
                                {
                                    label: 'First',
                                    description: 'desci1',
                                    value: 'first'
                                },
                                {
                                    label: 'Second',
                                    description: 'desci2',
                                    value: 'second'
                                }
                            ])
                            .setPlaceholder('Select a value ..')
                        )
                ]
            })
                .then(msg => {
                    for (const id of ids) interactionCreate.getClass().eventEmitter.on(id, handle)
                    function handle(interaction: MessageComponentInteraction) {
                        if (interaction.isButton()) interaction.reply('Button: ' + interaction.customId)
                        else if (interaction.isSelectMenu()) interaction.reply('Select menu: ' + interaction.customId + ' ' + interaction.values)
                    }
                    resolve()
                })
                .catch(reject)
        })
    }
}


export default new InteractionTesting()