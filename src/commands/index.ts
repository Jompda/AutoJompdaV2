import { GuildMember, Message, User } from 'discord.js'
import bot from '..'
import { Command } from '../structure/command'
import UserError from '../structure/usererror'
import { forEachFile, stringifyPermission } from '../util'
import * as db from '../databasemanager'


const commands = new Map<string, Command>()
const guildCommands = new Map<string, Command>()
const privateCommands = new Map<string, Command>()


forEachFile(
    __dirname,
    (filepath, filename) => filename.endsWith('.js') && filename !== 'index.js',
    filepath => {
        try {
            const jsfile = require(filepath)
            if (!('default' in jsfile) || !(jsfile.default instanceof Command))
                throw new Error(`Non-Command script file "${filepath}" under commands folder!`)

            const command = jsfile.default as Command
            commands.set(command.commandName, command)
            if (command.hasContext('guild')) guildCommands.set(command.commandName, command)
            if (command.hasContext('private')) privateCommands.set(command.commandName, command)
        } catch (err) {
            console.error(err)
        }
    }
)


function interpret(msg: Message) { // TODO: Quotation marks "" can be used to mark a single value over spaces.
    const content = msg.content.slice(msg.guild ? db.cache.getGuild(msg.guildId as string).prefix.length : bot.defaultPrefix.length)
    const rawParam = content.split(/\s/)
    const commandName = rawParam.shift()?.toLowerCase()
    if (!commandName) return msg.reply(`Yup.. That's the prefix..`).catch(console.error)
    const command = (msg.guild ? guildCommands : privateCommands).get(commandName)
    if (!command) return msg.reply(`Unrecognized command **${commandName}**`).catch(console.error)

    if (msg.guild) {
        checkPermissions(msg.member, command.memberPermissions)
        checkPermissions(msg.guild.members.resolve((bot.client.user as User).id), command.botPermissions)
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
                parsedSwitches.set(switchName, match.expectedValue ? rawParam[++i] : null)
            }
        }
    }
    if (parsedParameters.length < command.requiredParameters) throw new UserError(`Not enough parameters!`)

    command.run(msg, parsedParameters, parsedSwitches)
}


function checkPermissions(member: GuildMember | null, permissions: Array<bigint>) {
    if (!member) throw new Error('Member undefined')
    let pass = true, errMsg = `Member can't run this command due to not having the following permissions:`
    for (let permission of permissions)
        if (!member.permissions.has(permission)) {
            pass = false
            errMsg += '\n' + stringifyPermission(permission)
        }
    if (!pass) throw new UserError(errMsg)
    return true
}


export {
    commands,
    guildCommands,
    privateCommands,
    interpret
}