import { Message } from "discord.js"


export default abstract class Command {
    commandName: string
    usage: string
    description: string
    constructor(options: { commandName: string, usage: string, description: string }) {
        this.commandName = options.commandName
        this.usage = options.usage
        this.description = options.description
    }
    abstract run(msg: Message): any
}