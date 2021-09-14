import { Message } from "discord.js"


type context = 'guild' | 'private'


interface CommandParameter {
    parameterName: string
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
    parameters?: Array<CommandParameter>
    switches?: Array<CommandSwitch>
    usage?: string,
    description: string,
    contexts: Array<context>
    memberPermissions?: Array<bigint>,
    botPermissions?: Array<bigint>
}


abstract class Command {
    commandName: string
    parameters?: Array<CommandParameter>
    requiredParameters: number
    switches?: Array<CommandSwitch>
    usage: string
    description: string
    contexts: Array<context>
    memberPermissions: Array<bigint>
    botPermissions: Array<bigint>
    constructor(options: CommandOptions) {
        this.commandName = options.commandName
        this.parameters = options.parameters
        this.requiredParameters = 0
        if (options.parameters)
            for (const temp of options.parameters)
                if (!temp.optional) this.requiredParameters++
        this.switches = options.switches
        this.usage = options.usage ?? constructUsage(options)
        this.description = options.description
        this.contexts = options.contexts
        this.memberPermissions = options.memberPermissions ?? []
        this.botPermissions = options.botPermissions ?? []
    }
    hasContext(context: context) {
        return this.contexts.find(temp => temp === context)
    }
    abstract run(msg: Message, parsedParameters: Map<string, string>, parsedSwitches: Map<string, string>): any
}


function constructUsage(options: CommandOptions) {
    if (!options.parameters) throw new Error(`Parameters not defined`)
    let result = options.commandName
    let parameterSwitches = new Array<string>()
    for (const temp of options.parameters) {
        result += ` ${temp.optional ? '[' : '<'}${temp.parameterName}${temp.optional ? ']' : '>'}${temp.value ? ': ' + temp.value : ''}`
    }
    if (options.switches) for (const temp of options.switches) {
        parameterSwitches.push(`-${temp.switchName}${temp.expectedValue ? ` <${temp.expectedValue}>` : ''}${temp.description ? ' ' + temp.description : ''}`)
    }
    return result + (parameterSwitches.length > 0 ? '\nSwitches:\n' + parameterSwitches.join('\n') : '')
}


export {
    Command,
    CommandOptions,
    CommandParameter,
    CommandSwitch
}