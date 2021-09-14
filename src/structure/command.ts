import { Message } from "discord.js"


type context = 'guild' | 'private'


export default abstract class Command {
    commandName: string
    usage: string
    description: string
    contexts: Array<context>
    memberPermissions: Array<bigint>
    botPermissions: Array<bigint>
    constructor(options: {
        commandName: string,
        usage: string,
        description: string,
        contexts: Array<context>
        memberPermissions?: Array<bigint>,
        botPermissions?: Array<bigint>
    }) {
        this.commandName = options.commandName
        this.usage = options.usage
        this.description = options.description
        this.contexts = options.contexts
        this.memberPermissions = options.memberPermissions ?? []
        this.botPermissions = options.botPermissions ?? []
    }
    abstract run(msg: Message, param: Array<string>): any
    hasContext(context: context) {
        return this.contexts.find(temp => temp === context)
    }
}