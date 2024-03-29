import { CommandInteraction, Message, MessageEmbed } from 'discord.js'
import { commands, guildCommands, privateCommands } from '..'
import { Command } from '../../structure/command'
import db from '../../database'
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
            contexts: ['guild', 'private'],
            slash: true,
            defer: true
        })
    }
    onMessage(msg: Message, parameters: Array<string>) {
        return new Promise<any>((resolve, reject) => {
            const parsedParameter = parameters[0] as string
            const page = parseInt(parsedParameter ?? '1')
            resolve(
                msg.reply(isNaN(page)
                    ? Help.constructCommandUsage(Boolean(msg.guild), parsedParameter)
                    : Help.constructHelpMenu(Boolean(msg.guild), page))
            )
        })
    }
    onInteraction(interaction: CommandInteraction) {
        return new Promise<any>((resolve, reject) => {
            const option = interaction.options.get('option')?.value as string ?? ''
            const page = parseInt(option || '1')
            resolve(
                interaction.editReply(isNaN(page)
                    ? Help.constructCommandUsage(Boolean(interaction.guild), option)
                    : Help.constructHelpMenu(Boolean(interaction.guild), page))
            )
        })
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

        const embed = new MessageEmbed()
            .setTitle(`Help - page ${page} of ${pages}`)
            .setTimestamp()
        embed.setDescription('**Bot commands:**\n' +
            pageCommands.map(command =>
                (command.slash ? '/' : '') +
                (command.debug ? `_**${command.commandName}**_` : `**${command.commandName}**`) +
                ` - ${command.description}`
            ).join('\n')
        )
        if (bot.developerUser) embed.addField('Developer', bot.developerUser.tag)

        return { embeds: [embed] }
    }
    static constructCommandUsage(isGuild: boolean, commandName: string) {
        const command = (isGuild ? guildCommands : privateCommands).get(commandName)
        if (!command) return `Unrecognized command name **${commandName}**.`
        const embed = new MessageEmbed()
            .setTitle(commandName)
            .addField('Description', command.description + (command.usageDescription ? '\n' + command.usageDescription : ''))
            .addField('Usage', db.defaultDBGuild.prefix + command.usage)
            .setTimestamp()

        if (bot.developerUser) embed.addField('Developer', bot.developerUser.tag)

        return { embeds: [embed] }
    }
}


export default new Help()