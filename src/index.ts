import { Client, Intents, User } from 'discord.js'
import { REST } from '@discordjs/rest'
import dotenv from 'dotenv'
dotenv.config()


import { parseParametersAndSwitches } from './interpreter'


const bot = {
    client: new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.DIRECT_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS
        ],
        partials: [
            'CHANNEL'
        ]
    }),
    rest: new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN as string),
    exit,
    exiting: false,
    debugMode: false,
    developerUser: null as unknown as User | null,
    launchOptions: parseParametersAndSwitches(undefined, [
        { switchName: 'debug', description: 'Enables the debug mode.' },
        { switchName: '-update-slash-commands', description: 'Updates the slash commands.' }
    ], process.argv.slice(2))
}
if (bot.launchOptions.parsedSwitches.has('debug')) {
    bot.debugMode = true
    console.log('Debug mode enabled!')
}


export default bot
import { initializeCommands } from './commands'
import { initializeEvents } from './events'
import db from './database'
import { asyncOperation } from './util'


console.log('Connecting to the Discord API ..')
bot.client.once('ready', () => {
    if (!bot.client.user) return console.log(`Couldn't log in!`)
    console.log(`Successfully logged in as ${bot.client.user.tag}!`)

    if (process.env.DEVELOPER_DISCORD_CLIENT_ID)
        bot.client.users.fetch(process.env.DEVELOPER_DISCORD_CLIENT_ID as string)
            .then(developerUser => bot.developerUser = developerUser)
            .catch(console.error)

    const check = asyncOperation(2, () => console.log(`Bot is ready! Listening on ${db.cache.guilds.size} servers ..`))
    bot.client.guilds.fetch()
        .then(() => {
            initializeCommands()
                .then(check)
                .catch(err => {
                    console.error(`Fatal initialization error: ${JSON.stringify(err.message)}\n${err.stack || ''}`)
                    exit()
                })
            db.serialize()
                .then(() => {
                    initializeEvents()
                        .then(check)
                        .catch(err => {
                            console.error(`Fatal initialization error: ${JSON.stringify(err.message)}\n${err.stack || ''}`)
                            exit()
                        })
                })
                .catch(err => {
                    console.error(`Fatal database error: ${err.message}\n${err.stack || ''}`)
                    exit()
                })
        })
        .catch(console.error)
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

