import { CommandInteraction, Interaction, Message, MessageEmbed, User } from 'discord.js'
import { commands, guildCommands, privateCommands } from '..'
import { Command } from '../../structure/command'
import * as db from '../../database'
import bot from '../..'


const commandsPerPage = 10


class Help extends Command {
    constructor() {
        super({
            commandName: 'help',
            parameters: [{
                parameterName: 'option',
                description: 'Page number or name of a command.',
                valueType: 'string'
            }],
            description: 'Displays a help menu.',
            contexts: ['guild', 'private']
        })
    }
    onMessage(msg: Message, parameters: Array<string>) {
        const parsedParameter = parameters[0] as string
        const page = parseInt(parsedParameter ?? '1')
        msg.reply(isNaN(page)
            ? Help.constructCommandUsage(Boolean(msg.guild), parsedParameter)
            : Help.constructHelpMenu(Boolean(msg.guild), page))
    }
    onInteraction(interaction: CommandInteraction) {
        const parsedParameter = interaction.options.get('option')?.value as string ?? ''
        const page = parseInt(parsedParameter || '1')
        interaction.reply(isNaN(page)
            ? Help.constructCommandUsage(Boolean(interaction.guild), parsedParameter)
            : Help.constructHelpMenu(Boolean(interaction.guild), page))
    }
    static constructHelpMenu(isGuild: boolean, page: number) {
        const commandMap = isGuild ? guildCommands : privateCommands
        const pages = Math.floor(commands.size / commandsPerPage) + (commands.size % commandsPerPage > 0 ? 1 : 0)
        if (page < 1 || page > pages) return 'Page index out of bounds.'
        const startIndex = (page - 1) * commandsPerPage
        let pageCommands = new Array<Command>()
        for (const command of commandMap)
            pageCommands.push(command[1])
        pageCommands = pageCommands.slice(startIndex, startIndex + commandsPerPage)

        const embed = new MessageEmbed().setTitle(`Help - page ${page} of ${pages}`)
        embed.setDescription('**Bot commands:**\n' +
            pageCommands.map(command =>
                `**${command.commandName}** - ${command.description}`
            ).join('\n')
        )
        if (bot.developerUser) embed.addField('Developer', bot.developerUser.tag)
        embed.setTimestamp()

        return { embeds: [embed] }
    }
    static constructCommandUsage(isGuild: boolean, commandName: string) {
        const command = (isGuild ? guildCommands : privateCommands).get(commandName)
        if (!command) return `Unrecognized command name **${commandName}**.`
        return {
            embeds: [new MessageEmbed()
                .setTitle(commandName)
                .addField('Description', command.description)
                .addField('Usage', db.defaultDBGuild.prefix + command.usage)
            ]
        }
    }
}


export default new Help()