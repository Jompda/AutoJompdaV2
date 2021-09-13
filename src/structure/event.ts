export default abstract class Event {
    eventName: string
    runOnce: boolean
    constructor(options: {
        eventName: string,
        runOnce?: boolean
    }) {
        this.eventName = options.eventName
        this.runOnce = options.runOnce ?? false
    }
    abstract run(...args: any): any
}