import { Message } from 'discord.js'
import { Command } from '../../structure/command'


class EchoParsed extends Command {
    constructor() {
        super({
            commandName: 'echoparsed',
            switches: [
                { switchName: 'a', description: '1st testswitch' },
                { switchName: 'b', description: '2nd testswitch', expectedValueType: 'string' }
            ],
            description: 'Echoes the parsed parameters and switches back.',
            contexts: ['guild', 'private'],
            debug: true
        })
    }
    onMessage(msg: Message, parameters: Array<string>, switches: Map<string, string>) {
        return new Promise<any>((resolve, reject) => {
            const switchObj = {} as any
            switches.forEach((value, key) => switchObj[key] = value)
            resolve(msg.reply('```json\n' + JSON.stringify({ parameters, switches: switchObj }, undefined, 2) + '```'))
        })
    }
}


export default new EchoParsed()