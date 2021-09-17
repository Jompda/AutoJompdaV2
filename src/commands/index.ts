import { Guild, GuildMember, Message, MessageEmbed, User } from 'discord.js'
import bot from '..'
import { Command } from '../structure/command'
import UserError from '../structure/usererror'
import { forEachFile, stringifyPermission } from '../util'
import * as db from '../database'
import { Routes } from 'discord-api-types/v9'


const commands = new Map<string, Command>()
const guildCommands = new Map<string, Command>()
const guildSlashCommands = new Array<object>()
const privateCommands = new Map<string, Command>()
const privateSlashCommands = new Array<object>()


function initializeCommands() {
    forEachFile(
        __dirname,
        (filepath, filename) => filename.endsWith('.js') && filename !== 'index.js',
        filepath => {
            try {
                const jsfile = require(filepath)
                if (!('default' in jsfile) || !(jsfile.default instanceof Command))
                    throw new Error(`Non-Command script file "${filepath}" under commands folder!`)

                const command = jsfile.default as Command
                if (command.debug && !bot.debugMode) return
                commands.set(command.commandName, command)
                if (command.hasContext('guild')) guildCommands.set(command.commandName, command)
                if (command.hasContext('private')) privateCommands.set(command.commandName, command)
            } catch (err) {
                console.error(err)
            }
        }
    )


    for (const iter of privateCommands)
        privateSlashCommands.push(iter[1].toSlashCommand())
    bot.rest.put(
        Routes.applicationCommands((bot.client.user as User).id),
        { body: privateSlashCommands }
    )

    for (const iter of guildCommands)
        if (!privateCommands.has(iter[1].commandName))
            guildSlashCommands.push(iter[1].toSlashCommand())
    for (const [guildId] of bot.client.guilds.cache)
        initializeGuild(guildId)
}


function initializeGuild(guildId: string) {
    bot.rest.put(
        Routes.applicationGuildCommands((bot.client.user as User).id, guildId),
        { body: guildSlashCommands }
    )
}


function interpret(msg: Message) {
    const content = msg.content.slice(msg.guild ? db.cache.getGuild(msg.guildId as string).prefix.length : db.defaultDBGuild.prefix.length)
    const rawParam = content.match(/"[^"]+"|[^\s]+/g)?.map(part => part.replace(/"(.+)"/, "$1")) ?? []
    const commandName = rawParam.shift()?.toLowerCase()
    if (!commandName) throw new UserError(`Yup.. That's the prefix..`)
    const command = (msg.guild ? guildCommands : privateCommands).get(commandName)
    if (!command) throw new UserError(`Unrecognized command **${commandName}**`)
    if (command.debug && msg.author.id !== process.env.DEVELOPER_DISCORD_CLIENT_ID) throw new UserError(`This command is only available to developers.`)

    if (msg.guild) {
        const missingBotPermissions = checkPermissions(msg.guild.members.resolve((bot.client.user as User).id), command.botPermissions)
        const missingMemberPermissions = checkPermissions(msg.member, command.memberPermissions)
        if (missingBotPermissions || missingMemberPermissions) {
            const embed = new MessageEmbed().setTitle(`Cannot run this command due to:`).setColor('#ff0000')
            if (missingBotPermissions) {
                embed.addField(`Bot not having the following permissions:`, missingBotPermissions.join(`\n`))
            }
            if (missingMemberPermissions) {
                embed.addField(`Member not having the following permissions:`, missingMemberPermissions.join(`\n`))
            }
            throw new UserError(embed)
        }
    }

    const parsedParameters = new Array<string>()
    const parsedSwitches = new Map<string, string | null>()
    if (command.parameters || command.switches) {
        let parameterIndex = 0
        for (let i = 0; i < rawParam.length; i++) {
            if (!rawParam[i].startsWith('-')) {
                parameterIndex++
                parsedParameters.push(rawParam[i])
            } else {
                if (!command.switches) return msg.reply(`Command doesn't have any switches so why did you define one?`)
                const switchName = rawParam[i].slice(1)
                const match = command.switches.find(temp => temp.switchName === switchName)
                if (!match) return msg.reply(`Unknown switch **${switchName}**`)
                parsedSwitches.set(switchName, match.expectedValueType ? rawParam[++i] : null)
            }
        }
    }
    if (parsedParameters.length < command.requiredParameters) throw new UserError(`Not enough parameters!`)

    command.onMessage(msg, parsedParameters, parsedSwitches)
}


function checkPermissions(member: GuildMember | null, permissions: Array<bigint>) {
    if (!member) throw new Error('Member undefined')
    const missingPermissions = new Array<string>()
    for (let permission of permissions)
        if (!member.permissions.has(permission))
            missingPermissions.push(stringifyPermission(permission))
    return missingPermissions.length ? missingPermissions : null
}


export {
    commands,
    guildCommands,
    privateCommands,
    initializeCommands,
    initializeGuild,
    interpret
}