import { Message } from "discord.js"


export default abstract class Command {
    commandName: string
    usage: string
    description: string
    guildCommand: boolean
    privateCommand: boolean
    memberPermissions: Array<bigint>
    botPermissions: Array<bigint>
    constructor(options: {
        commandName: string,
        usage: string,
        description: string,
        guildCommand?: boolean,
        privateCommand?: boolean,
        memberPermissions?: Array<bigint>,
        botPermissions?: Array<bigint>
    }) {
        this.commandName = options.commandName
        this.usage = options.usage
        this.description = options.description
        this.guildCommand = options.guildCommand || false
        this.privateCommand = options.privateCommand || false
        this.memberPermissions = options.memberPermissions || []
        this.botPermissions = options.botPermissions || []
    }
    abstract run(msg: Message): any
}