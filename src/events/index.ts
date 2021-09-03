import bot from '..'
import Event from '../structure/event'
import { forEachFile } from '../util'


forEachFile(
    __dirname,
    (filepath, filename) => filename.endsWith('.js') && filename !== 'index.js',
    filepath => {
        try {
            const jsfile = require(filepath)
            if (!('default' in jsfile) || !(jsfile.default instanceof Event))
                throw new Error(`Non-Event script file "${filepath}" under events folder!`)

            const event = jsfile.default;
            (event.runOnce ? bot.client.once : bot.client.on).apply(bot.client, [event.eventName, event.run])

        } catch (err) {
            console.error(err)
        }
    }
)