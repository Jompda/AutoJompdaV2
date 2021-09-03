import { Message } from 'discord.js'
import bot from '..'
import Command from '../structure/command'
import { forEachFile } from '../util'


const commands = new Map<string, Command>()


forEachFile(
    __dirname,
    (filepath, filename) => filename.endsWith('.js') && filename !== 'index.js',
    filepath => {
        try {
            const jsfile = require(filepath)
            if (!('default' in jsfile) || !(jsfile.default instanceof Command))
                throw new Error(`Non-Command script file "${filepath}" under commands folder!`)

            const command = jsfile.default
            commands.set(command.commandName, command)
        } catch (err) {
            console.error(err)
        }
    }
)
console.log(commands)


function interpret(msg: Message) {
    const content = msg.content.slice(bot.defaultPrefix.length)
    const param = content.split(/\s/)
    const commandName = param.shift()
    if (!commandName) return msg.reply('Unspecified command.').catch(console.error)
    const command = commands.get(commandName)
    if (!command) return msg.reply(`Unrecognized command "${commandName}".`).catch(console.error)
    command.run(msg)
}


export {
    commands,
    interpret
}