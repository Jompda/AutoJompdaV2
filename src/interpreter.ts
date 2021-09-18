import { CommandParameter, CommandSwitch } from "./structure/command"
import UserError from "./structure/usererror"


function parseParametersAndSwitches(
    parameters: Array<CommandParameter> | undefined,
    switches: Array<CommandSwitch> | undefined,
    args: Array<string>
) {
    const parsedParameters = new Array<string>()
    const parsedSwitches = new Map<string, string | null>()
    if (parameters || switches) {
        for (let i = 0; i < args.length; i++) {
            if (!args[i].startsWith('-')) parsedParameters.push(args[i])
            else {
                if (!switches) throw new UserError(`There are no switches defined for the command so why did you define one?`)
                const switchName = args[i].slice(1)
                const match = switches.find(temp => temp.switchName === switchName)
                if (!match) throw new UserError(`Unknown switch **${switchName}**`)
                parsedSwitches.set(switchName, match.expectedValueType ? args[++i] : null)
            }
        }
    }

    return { parsedParameters, parsedSwitches }
}


export {
    parseParametersAndSwitches
}