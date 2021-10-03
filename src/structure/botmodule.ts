import { Command } from './command'


interface BotModuleOptions {
    commands?: Array<Command>
    databaseInitializer?: string
}


export default abstract class BotModule {
    name: string
    commands?: Array<Command>
    databaseInitializer?: string
    constructor(options: BotModuleOptions) {
        this.name = this.constructor.name
        this.commands = options.commands
        this.databaseInitializer = options.databaseInitializer
    }
    initialize() { }
}