import { Client, Intents } from 'discord.js'
import dotenv from 'dotenv'
dotenv.config()


import * as config from './config.json'


const bot = {
    client: new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.DIRECT_MESSAGES
        ],
        partials: [
            'CHANNEL'
        ]
    }),
    defaultPrefix: config.defaultPrefix,
    exit,
    exiting: false,
    debugMode: true
}


export default bot
import './commands'
import { initializeEvents } from './events'
import * as db from './database'


console.log('Connecting to Discord API ..')
bot.client.once('ready', () => {
    if (!bot.client.user) return console.log(`Couldn't log in!`)
    console.log(`Successfully logged in as ${bot.client.user.tag}!`)
    db.serialize()
        .then(initializeEvents)
        .catch((err) => {
            console.error(`Fatal database error: ${err.message}\n${err.stack || ''}`)
            exit()
        })
})
bot.client.login(process.env.DISCORD_TOKEN)


process.on('SIGINT', () => {
    console.log(!bot.exiting ? 'Received SIGINT! Shutting down ..' : 'SIGINT already received. Shutting down ..')
    exit()
})


function exit() {
    if (bot.exiting) return
    bot.exiting = true
    bot.client.destroy()
    db.close().catch((err) => console.error(err))
}

