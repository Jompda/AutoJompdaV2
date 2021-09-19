# AutoJompdaV2
A multipurpose Discord bot developed by Joni Rapo.


## .env
Variable | Value | Description
---------|-------|------------
`DISCORD_TOKEN`* | `token` | Get it from the discord developer portal.
`DEVELOPER_DISCORD_CLIENT_ID` | `Snowflake ID` | Only used when debug mode is enabled.


## Launch options
Option | Expected value | Description
-------|----------------|------------
`-debug` | `None` | Enables the debug mode.
`--update-slash-commands` | `None` | Sends the slash commands to the Discord API. Note that this usually causes some slash commands not to work for a while.


## TODO
- [x] Add support for slash commands
- [ ] Events use promises
- [ ] Persistent logging
- [ ] Support for a dedicated database
- [ ] Somewhat error resistant so the bot doesn't go offline on uncaughtException

