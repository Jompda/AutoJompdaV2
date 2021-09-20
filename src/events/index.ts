import bot from '..'
import Event from '../structure/event'
import { forEachFile } from '../util'


function initializeEvents() {
    return new Promise<void>((resolve, reject) => {
        const errors = new Array<Error>()
        forEachFile(
            __dirname,
            (filepath, filename) => filename.endsWith('.js') && filename !== 'index.js',
            filepath => {
                try {
                    const jsfile = require(filepath)
                    if (!('default' in jsfile) || !(jsfile.default instanceof Event))
                        throw new Error(`Non-Event script file "${filepath}" under events folder!`)

                    const event = jsfile.default as Event
                    (event.runOnce ? bot.client.once : bot.client.on).apply(bot.client, [event.eventName, (...args: any) => event.run(...args)])

                } catch (err) {
                    errors.push(err as Error)
                }
            }
        )
        if (errors.length) return reject(errors)
        resolve()
    })
}


export {
    initializeEvents
}