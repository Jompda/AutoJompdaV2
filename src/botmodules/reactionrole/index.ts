import BotModule from '../../structure/botmodule'
import AssignReactionRole from './commands/assignreactionrole'


class ReactionRoles extends BotModule {
    constructor() {
        super({
            name: 'reaction_roles',
            commands: [
                AssignReactionRole
            ]
        })
    }
}


export default new ReactionRoles()