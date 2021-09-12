import * as sqlite from 'sqlite3'
import bot from '.'


const db = new (sqlite.verbose()).Database('database.sqlite3')


function serializeDB() {
    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS guild (guild_id TEXT, prefix TEXT)')
        synchronizeGuilds()


        /*const statement = db.prepare("INSERT INTO guild VALUES (?, ?)")
        for (let i = 0; i < 10; i++)
            statement.run(['123' + i, '456' + i])
        statement.finalize()
    
        db.each("SELECT rowid AS id, guild_id, prefix FROM guild", function (err, row) {
            console.log(row.id + ": " + row.guild_id, row.prefix)
        })*/
    })
}


function synchronizeGuilds() {
    db.all('SELECT guild_id, prefix FROM guild', (err, rows) => {
        if (err) throw err
        bot.client.guilds.fetch().then(guilds => {
            for (const [guildId] of guilds) {
                if (rows.find(row => row.guild_id === guildId)) continue
                db.prepare(`INSERT INTO guild VALUES (?, ?)`)
                    .run([guildId, bot.defaultPrefix])
                    .finalize()
            }
        })
    })
}


export {
    serializeDB
}

