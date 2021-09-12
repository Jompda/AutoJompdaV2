import * as dcjs from 'discord.js'
import dotenv from 'dotenv'
dotenv.config()


import * as config from './config.json'


const bot = {
    client: new dcjs.Client({
        intents: [
            dcjs.Intents.FLAGS.GUILDS,
            dcjs.Intents.FLAGS.GUILD_MESSAGES,
            dcjs.Intents.FLAGS.DIRECT_MESSAGES
        ],
        partials: [
            'CHANNEL'
        ]
    }),
    defaultPrefix: config.defaultPrefix
}


export default bot
import './commands'
import './events'


console.log('Connecting ..')
bot.client.login(process.env.DISCORD_TOKEN)


process.on('SIGINT', () => {
    console.log('Received SIGINT! Closing client ..')
    bot.client.destroy()
})

