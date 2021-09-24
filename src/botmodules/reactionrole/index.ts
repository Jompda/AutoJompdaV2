import BotModule from '../../structure/botmodule'
import AssignReactionRole from './commands/assignreactionrole'


class ReactionRoles extends BotModule {
    constructor() {
        super({
            name: 'reaction_roles',
            commands: [
                AssignReactionRole
            ],
            databaseInitializer: `CREATE TABLE IF NOT EXISTS reactionRole (guildId TEXT, channelId TEXT, messageId TEXT, reaction TEXT, roleId TEXT)`
        })
    }
}


export default new ReactionRoles()