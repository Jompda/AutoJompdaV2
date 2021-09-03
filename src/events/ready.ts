import Event from '../structure/event'
import bot from '..'


class Ready extends Event {
    constructor() {
        super({ eventName: 'ready', runOnce: true })
    }
    run() {
        if (!bot.client.user) return console.log(`Couldn't log in!`)
        console.log(`Successfully logged in as ${bot.client.user.tag}!`)
    }
}


export default new Ready()