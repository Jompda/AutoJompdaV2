import { Message, MessageEmbed } from 'discord.js'
import { commands, guildCommands, privateCommands } from '..'
import bot from '../..'
import { Command } from '../../structure/command'


const commandsPerPage = 10


class Help extends Command {
    constructor() {
        super({
            commandName: 'help',
            parameters: [{ parameterName: 'page|command', optional: true }],
            description: 'Displays a help menu.',
            contexts: ['guild', 'private']
        })
    }
    run(msg: Message, parsedParameters: Map<string, string>) {
        const parsedParameter = parsedParameters.get('page|command') as string
        const page = parseInt(parsedParameter ?? '1')
        return isNaN(page)
            ? Help.printCommandUsage(msg, parsedParameter)
            : Help.printHelpMenu(msg, page)
    }
    static printHelpMenu(msg: Message, page: number) {
        const commandMap = msg.guild ? guildCommands : privateCommands
        const pages = Math.floor(commands.size / commandsPerPage) + (commands.size % commandsPerPage > 0 ? 1 : 0)
        if (page < 1 || page > pages) return msg.reply('Page index out of bounds.')
        const startIndex = (page - 1) * commandsPerPage
        let pageCommands = new Array<Command>()
        for (const command of commandMap)
            pageCommands.push(command[1])
        pageCommands = pageCommands.slice(startIndex, startIndex + commandsPerPage)

        const embed = new MessageEmbed().setTitle(`Help - page ${page} of ${pages}`)
        for (const command of pageCommands) embed.addField(command.commandName, command.description)

        msg.reply({ embeds: [embed] })
    }
    static printCommandUsage(msg: Message, commandName: string) {
        const command = (msg.guild ? guildCommands : privateCommands).get(commandName)
        if (!command) return msg.reply(`Unrecognized command name **${commandName}**.`)
        msg.reply({
            embeds: [new MessageEmbed()
                .setTitle(commandName)
                .addField('Description', command.description)
                .addField('Usage', bot.defaultPrefix + command.usage)
            ]
        })
    }
}


export default new Help()