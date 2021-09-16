import { Client, Intents, User } from 'discord.js'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import dotenv from 'dotenv'
dotenv.config()




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
    rest: new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN as string),
    exit,
    exiting: false,
    debugMode: true
}


export default bot
import { initializeCommands, commands, guildCommands, privateCommands } from './commands'
import { initializeEvents } from './events'
import * as db from './database'


initializeCommands()


console.log('Connecting to the Discord API ..')
bot.client.once('ready', () => {
    if (!bot.client.user) return console.log(`Couldn't log in!`)
    console.log(`Successfully logged in as ${bot.client.user.tag}!`)
    bot.client.guilds.fetch().then(guilds => {
        const guildSlashCommands = new Array<object>()
        for (const [commandName, command] of guildCommands)
            guildSlashCommands.push(command.toSlashCommand())
        const privateSlashCommands = new Array<object>()
        for (const [commandName, command] of privateCommands)
            privateSlashCommands.push(command.toSlashCommand())

        bot.rest.put(
            Routes.applicationCommands((bot.client.user as User).id),
            { body: privateSlashCommands }
        )
        for (const [guildId] of guilds)
            bot.rest.put(
                Routes.applicationGuildCommands((bot.client.user as User).id, guildId),
                { body: guildSlashCommands }
            )
        db.serialize()
            .then(initializeEvents)
            .catch((err) => {
                console.error(`Fatal database error: ${err.message}\n${err.stack || ''}`)
                exit()
            })
    }).catch(console.error)
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

