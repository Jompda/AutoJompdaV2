import { Message } from "discord.js"


export default abstract class Command {
    commandName: string
    usage: string
    description: string
    guildCommand: boolean
    privateCommand: boolean
    constructor(options: {
        commandName: string,
        usage: string,
        description: string,
        guildCommand?: boolean,
        privateCommand?: boolean
    }) {
        this.commandName = options.commandName
        this.usage = options.usage
        this.description = options.description
        this.guildCommand = options.guildCommand || false
        this.privateCommand = options.privateCommand || false
    }
    abstract run(msg: Message): any
}