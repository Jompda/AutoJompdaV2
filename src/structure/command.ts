import { CommandInteraction, Message } from 'discord.js'


const optionTypes = new Map<string, number>([
    ['boolean', 5],
    ['channel', 7],
    ['integer', 4],
    ['mentionable', 9],
    ['number', 10],
    ['role', 8],
    ['string', 3],
    ['user', 6]
])


type Context = 'guild' | 'private'


interface CommandParameter {
    // TODO: Add support for choices.
    parameterName: string
    valueType: 'boolean' | 'channel' | 'integer' | 'mentionable' | 'number' | 'role' | 'string' | 'user'
    description: string
    required?: boolean
}


interface CommandSwitch {
    switchName: string
    description: string
    expectedValueType?: string
}


interface CommandOptions {
    commandName: string,
    parameters?: Array<CommandParameter>
    switches?: Array<CommandSwitch>
    usageDescription?: string,
    description: string,
    contexts: Array<Context>
    memberPermissions?: Array<bigint>,
    botPermissions?: Array<bigint>,
    slash?: boolean
    defer?: boolean
    debug?: boolean
}


abstract class Command {
    commandName: string
    parameters?: Array<CommandParameter>
    requiredParameters: number
    switches?: Array<CommandSwitch>
    usage: string
    usageDescription?: string
    description: string
    contexts: Array<Context>
    memberPermissions: Array<bigint>
    botPermissions: Array<bigint>
    slash: boolean
    defer: boolean
    debug: boolean
    constructor(options: CommandOptions) {
        this.commandName = options.commandName
        this.parameters = options.parameters
        this.requiredParameters = 0
        let lastWasOptional = false
        if (options.parameters)
            for (let i = 0; i < options.parameters.length; i++)
                if (!options.parameters[i].required) lastWasOptional = true
                else {
                    if (lastWasOptional)
                        throw new Error(`Required parameters cannot come after optional parameters!`)
                    this.requiredParameters++
                }
        this.switches = options.switches
        this.usage = constructUsage(options)
        this.usageDescription = options.usageDescription
        this.description = options.description
        this.contexts = options.contexts
        this.memberPermissions = options.memberPermissions ?? []
        this.botPermissions = options.botPermissions ?? []
        this.slash = options.slash ?? false
        this.defer = options.defer ?? false
        this.debug = options.debug ?? false
    }
    hasContext(context: Context) {
        return Boolean(this.contexts?.find(temp => temp === context))
    }
    get slashCommand() {
        const command = {
            name: this.commandName,
            description: this.description,
            options: new Array<any>(),
            defaultPermission: undefined
        }
        if (this.parameters) for (const parameter of this.parameters) {
            command.options.push({
                name: parameter.parameterName,
                description: parameter.description,
                required: parameter.required,
                type: optionTypes.get(parameter.valueType)
            })
        }
        return command
    }
    abstract onMessage(msg: Message, parameters: Array<string>, switches: Map<string, string | null>): Promise<void>
    onInteraction(interaction: CommandInteraction) { return new Promise<void>(() => { }) }
}


function constructUsage(options: CommandOptions) {
    return options.commandName + (options.parameters
        ? options.parameters.map(temp =>
            ' ' + (!temp.required ? '[' : '<') +
            temp.parameterName + (temp.valueType ? ': ' + temp.valueType : '') +
            (!temp.required ? ']' : '>')
        ).join('')
        : ''
    ) + (options.switches
        ? '\n' + options.switches.map(temp =>
            '-' + temp.switchName +
            (temp.expectedValueType ? ` <${temp.expectedValueType}>` : '') +
            (temp.description ? ' ' + temp.description : '')
        ).join('\n')
        : ''
        )
}


export {
    Command,
    CommandOptions,
    CommandParameter,
    CommandSwitch
}