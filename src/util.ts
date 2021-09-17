import { GuildMember, Message, Permissions } from 'discord.js'
import fs from 'fs'
import path from 'path'
import UserError from './structure/usererror'


function forEachFile(currentPath: string, filter = (filepath: string, filename: string) => true, predicate: (filepath: string) => any) {
    for (let tempFile of fs.readdirSync(currentPath)) {
        const tempPath = path.resolve(currentPath, tempFile)
        if (fs.statSync(tempPath).isDirectory()) forEachFile(tempPath, filter, predicate)
        else if (filter(tempPath, tempFile)) predicate(tempPath)
    }
}


function resolveMember(msg: Message, start = 0) {
    return new Promise<GuildMember | null>((resolve, reject) => {
        if (!msg.guild) return reject(new Error(`Cannot resolve member without a guild!`))
        const userId = resolveTagId(msg.content, start)
        if (!userId) return reject(new UserError(`Unresolvable id!`))
        msg.guild.members.fetch(userId)
            .then(resolve)
            .catch(() => reject(new UserError(`Member doesn't exist!`)))
    })
}


function resolveTagId(text: string, start = 0) {
    const results = /<(@!|@&|#)(\d{18})>/.exec(start ? text.slice(start) : text)
    return results && 2 in results ? results[2] : undefined
}


function stringifyPermission(value: bigint) {
    return Object.getOwnPropertyNames(Permissions.FLAGS)
        .find(flag => (Permissions.FLAGS as any)[flag] === value) as string
}


export {
    forEachFile,
    resolveMember,
    resolveTagId,
    stringifyPermission
}
