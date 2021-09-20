import { GuildMember, Message, MessageEmbed, User } from 'discord.js'
import bot from '..'
import { Command } from '../structure/command'
import { asyncOperation, forEachFile, stringifyPermission } from '../util'
import * as db from '../database'
import { Routes } from 'discord-api-types/v9'
import { parseParametersAndSwitches } from '../interpreter'
import UserError from '../structure/usererror'


const commands = new Map<string, Command>()
const guildCommands = new Map<string, Command>()
const privateCommands = new Map<string, Command>()


function initializeCommands() {
    return new Promise<void>((resolve, reject) => {
        const errors = new Array<Error>()
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
                    errors.push(err as Error)
                }
            }
        )
        if (errors.length) return reject(errors)

        if (bot.launchOptions.parsedSwitches.has('-update-slash-commands')) {
            console.log('Updating slash commands ..')
            const privateSlashCommands = new Array<object>()
            for (const iter of privateCommands)
                if (iter[1].slash)
                    privateSlashCommands.push(iter[1].slashCommand)

            const guildSlashCommands = new Array<object>()
            for (const iter of guildCommands)
                if (!privateCommands.has(iter[1].commandName) && iter[1].slash)
                    guildSlashCommands.push(iter[1].slashCommand)

            const check = asyncOperation(1 + bot.client.guilds.cache.size, resolve)

            bot.rest.put(
                Routes.applicationCommands((bot.client.user as User).id),
                { body: privateSlashCommands }
            ).then(check).catch(err => errors.push(err))

            for (const [guildId] of bot.client.guilds.cache)
                updateGuildCommands(guildId, guildSlashCommands)
                    .then(check)
                    .catch(err => errors.push(err))
        }
        else resolve()
    })
}


function updateGuildCommands(guildId: string, guildSlashCommands: Array<object>) {
    return bot.rest.put(
        Routes.applicationGuildCommands((bot.client.user as User).id, guildId),
        { body: guildSlashCommands }
    )
}


function runCommandFromMessage(msg: Message) {
    return new Promise((resolve, reject) => {
        const content = msg.content.slice(msg.guild ? db.cache.getGuild(msg.guildId as string).prefix.length : db.defaultDBGuild.prefix.length)
        const rawParam = content.match(/"[^"]+"|[^\s]+/g)?.map(part => part.replace(/"(.+)"/, "$1")) ?? []
        const commandName = rawParam.shift()?.toLowerCase()
        if (!commandName) return reject(new UserError(`Yup.. That's the prefix..`))
        const command = (msg.guild ? guildCommands : privateCommands).get(commandName) as Command
        if (!command) return reject(new UserError('Unrecognized command **${commandName}**'))
        if (command.debug && msg.author.id !== process.env.DEVELOPER_DISCORD_CLIENT_ID)
            return reject(new UserError('This command is only available to developers.'))

        if (msg.guild) {
            const check = asyncOperation(2, postPermissionCheck)

            let missingBotPermissions: string[] | null
            let missingMemberPermissions: string[] | null
            checkPermissions(msg.guild.members.resolve((bot.client.user as User).id), command.botPermissions)
                .then(result => check(missingBotPermissions = result))
                .catch(reject)
            checkPermissions(msg.member, command.memberPermissions)
                .then(result => check(missingBotPermissions = result))
                .catch(reject)

            function postPermissionCheck() {
                if (missingBotPermissions || missingMemberPermissions) {
                    const embed = new MessageEmbed().setTitle('Cannot run this command due to:').setColor('#ff0000')
                    if (missingBotPermissions) {
                        embed.addField('Bot not having the following permissions:', missingBotPermissions.join('\n'))
                    }
                    if (missingMemberPermissions) {
                        embed.addField('Member not having the following permissions:', missingMemberPermissions.join('\n'))
                    }
                    return reject(new UserError(embed))
                }
                finalize()
            }
        }
        else finalize()

        function finalize() {
            const parsed = parseParametersAndSwitches(command.parameters, command.switches, rawParam)
            if (parsed.parsedParameters.length < command.requiredParameters) return reject(new UserError('Not enough parameters!'))

            command.onMessage(msg, parsed.parsedParameters, parsed.parsedSwitches)
                .then(resolve)
                .catch(reject)
        }
    })
}


function checkPermissions(member: GuildMember | null, permissions: Array<bigint>) {
    return new Promise<Array<string> | null>((resolve, reject) => {
        if (!member) return reject(new Error('Member undefined!'))
        member.fetch()
            .then(fetchedMember => {
                const missingPermissions = new Array<string>()
                for (let permission of permissions)
                    if (!fetchedMember.permissions.has(permission))
                        missingPermissions.push(stringifyPermission(permission))
                resolve(missingPermissions.length ? missingPermissions : null)
            })
            .catch(reject)
    })
}


export {
    commands,
    guildCommands,
    privateCommands,
    initializeCommands,
    updateGuildCommands,
    runCommandFromMessage
}