import { Message } from "discord.js"


type context = 'guild' | 'private'
interface CommandParameter {
    paramName: string
    value?: string
    optional?: boolean
}


interface CommandSwitch {
    switchName: string
    description: string
    expectedValue?: string
}


interface CommandOptions {
    commandName: string,
    param?: Array<CommandParameter>
    switches?: Array<CommandSwitch>
    usage?: string,
    description: string,
    contexts: Array<context>
    memberPermissions?: Array<bigint>,
    botPermissions?: Array<bigint>
}


export default abstract class Command {
    commandName: string
    param?: Array<CommandParameter>
    switches?: Array<CommandSwitch>
    usage: string
    description: string
    contexts: Array<context>
    memberPermissions: Array<bigint>
    botPermissions: Array<bigint>
    constructor(options: CommandOptions) {
        this.commandName = options.commandName
        this.param = options.param
        this.switches = options.switches
        this.usage = options.usage ?? constructUsage(options)
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


function constructUsage(options: CommandOptions) {
    if (!options.param) throw new Error(`param not defined`)
    let result = options.commandName
    let parameterSwitches = new Array<string>()
    for (const temp of options.param) {
        result += ` ${temp.optional ? '[' : '<'}${temp.paramName}${temp.optional ? ']' : '>'}${temp.value ? ': ' + temp.value : ''}`
    }
    if (options.switches) for (const temp of options.switches) {
        parameterSwitches.push(`-${temp.switchName}${temp.expectedValue ? ` <${temp.expectedValue}>` : ''}${temp.description ? ' ' + temp.description : ''}`)
    }
    return result + (parameterSwitches.length > 0 ? '\nSwitches:\n' + parameterSwitches.join('\n') : '')
}