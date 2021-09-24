import { Command } from './command'


interface BotModuleOptions {
    name: string
    commands?: Array<Command>
    databaseInitializer?: string
}


export default abstract class BotModule {
    name: string
    commands?: Array<Command>
    databaseInitializer?: string
    constructor(options: BotModuleOptions) {
        this.name = options.name
        this.commands = options.commands
        this.databaseInitializer = options.databaseInitializer
    }
}