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
    defaultPrefix: config.defaultPrefix,
    close
}


export default bot
import './commands'
import { initializeEvents } from './events'
import * as db from './databasemanager'


console.log('Connecting to Discord API ..')
bot.client.on('ready', () => {
    if (!bot.client.user) return console.log(`Couldn't log in!`)
    console.log(`Successfully logged in as ${bot.client.user.tag}!`)
    db.serialize()
        .then(initializeEvents)
        .catch((err) => {
            console.error(`Fatal database error: ${err.message}\n${err.stack || ''}`)
            close()
        })
})
bot.client.login(process.env.DISCORD_TOKEN)


process.on('SIGINT', () => {
    console.log('Received SIGINT! Shutting down ..')
    close()
})


function close() {
    bot.client.destroy()
    db.close().catch((err) => console.error(err))
}

